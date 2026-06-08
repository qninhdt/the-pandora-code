#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import "dotenv/config";
import yaml from "js-yaml";
import { FigurePrompt } from "../apps/web/lib/content/schemas/figure-prompt";
import {
  chapterFiguresDir,
  chapterImagesDir,
  chapterMetaPath,
  figureImagePath,
  resolveReferencePath,
} from "./lib/figure-paths";
import { generateImage } from "./lib/openai-image-client";
import { composePrompt, loadStyleBible } from "./lib/style-bible-loader";

interface Args {
  chapter?: string;
  figure?: string;
  force: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--chapter") args.chapter = argv[++i];
    else if (a === "--figure") args.figure = argv[++i];
    else if (a === "--force") args.force = true;
  }
  return args;
}

function fail(message: string): never {
  console.error(`\n[gen-images] ${message}\n`);
  process.exit(1);
}

// Read a figure JSON, validate against the schema, return the parsed prompt.
function loadFigure(filePath: string): FigurePrompt {
  const raw = JSON.parse(readFileSync(filePath, "utf8"));
  const result = FigurePrompt.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((iss) => `  - ${iss.path.join(".") || "<root>"}: ${iss.message}`)
      .join("\n");
    fail(`Invalid figure JSON ${path.basename(filePath)}:\n${issues}`);
  }
  return result.data;
}

// Persist seed/response_id back into the figure JSON without touching any other
// field. Re-serialize the original object so prompt fields stay byte-stable.
function persistGenerationMeta(filePath: string, responseId?: string): void {
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
  if (responseId && raw.response_id !== responseId) {
    raw.response_id = responseId;
    writeFileSync(filePath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
  }
}

// Flip asset_status to "ready" for a figure id inside the chapter meta.yaml.
function markAssetReady(slug: string, figureId: string): void {
  const metaPath = chapterMetaPath(slug);
  if (!existsSync(metaPath)) return; // meta is optional during smoke tests
  const meta = yaml.load(readFileSync(metaPath, "utf8")) as {
    figures?: Array<{ id: string; asset_status?: string }>;
  };
  const ref = meta.figures?.find((f) => f.id === figureId);
  if (ref && ref.asset_status !== "ready") {
    ref.asset_status = "ready";
    writeFileSync(metaPath, yaml.dump(meta, { lineWidth: 100 }), "utf8");
  }
}

async function generateOne(filePath: string, force: boolean): Promise<void> {
  const figure = loadFigure(filePath);
  const outPath = figureImagePath(figure.chapter_slug, figure.id);

  if (!force && existsSync(outPath)) {
    console.log(`[gen-images] skip ${figure.id} (image exists; use --force to regenerate)`);
    return;
  }

  const styleBible = loadStyleBible();
  const prompt = composePrompt(figure, styleBible);

  const referencePaths = [...figure.style_refs, ...figure.character_refs]
    .map(resolveReferencePath)
    .filter((p) => existsSync(p));

  console.log(`[gen-images] generating ${figure.id} (${figure.aspect_ratio})...`);
  const result = await generateImage({
    prompt,
    aspect: figure.aspect_ratio,
    referencePaths: referencePaths.length > 0 ? referencePaths : undefined,
  });

  mkdirSync(chapterImagesDir(figure.chapter_slug), { recursive: true });
  writeFileSync(outPath, result.bytes);
  persistGenerationMeta(filePath, result.responseId);
  markAssetReady(figure.chapter_slug, figure.id);
  console.log(`[gen-images] wrote ${path.relative(process.cwd(), outPath)}`);
}

// Find a single figure JSON by id by scanning chapter figure dirs.
function findFigureFile(figureId: string): string {
  const chaptersRoot = path.join(process.cwd(), "content", "chapters");
  if (!existsSync(chaptersRoot)) fail("No content/chapters directory found.");
  for (const slug of readdirSync(chaptersRoot)) {
    const candidate = path.join(chapterFiguresDir(slug), `${figureId}.json`);
    if (existsSync(candidate)) return candidate;
  }
  fail(`Figure JSON for "${figureId}" not found under any chapter's figures/.`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!args.chapter && !args.figure) {
    fail("Usage: gen-images --chapter <slug> | --figure <fig-NN-...> [--force]");
  }

  // Surface a missing key early with a clear message (not a stack trace).
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
    fail("OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.");
  }

  if (args.figure) {
    await generateOne(findFigureFile(args.figure), args.force);
    console.log("[gen-images] done.");
    return;
  }

  const figuresDir = chapterFiguresDir(args.chapter as string);
  if (!existsSync(figuresDir)) {
    fail(`No figures directory for chapter "${args.chapter}" at ${figuresDir}`);
  }
  const files = readdirSync(figuresDir)
    .filter((f) => f.endsWith(".json"))
    .sort();
  if (files.length === 0) fail(`No figure JSON files in ${figuresDir}`);

  // Generate sequentially so reference images and rate limits behave.
  for (const file of files) {
    await generateOne(path.join(figuresDir, file), args.force);
  }
  console.log(`[gen-images] done. ${files.length} figure(s) processed.`);
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
});
