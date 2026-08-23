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
  all?: boolean;
  chapter?: string;
  figure?: string;
  force: boolean;
  concurrency: number;
}

interface GeneratedFigure {
  slug: string;
  figureId: string;
}

interface GenerationTask {
  key: string;
  filePath: string;
  figure: FigurePrompt;
  dependencies: string[];
}

const DEFAULT_CONCURRENCY = 4;

function parseArgs(argv: string[]): Args {
  const args: Args = { force: false, concurrency: DEFAULT_CONCURRENCY };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--chapter") args.chapter = argv[++i];
    else if (a === "--figure") args.figure = argv[++i];
    else if (a === "--force") args.force = true;
    else if (a === "--all") args.all = true;
    else if (a === "--concurrency") args.concurrency = parseConcurrency(argv[++i]);
  }
  return args;
}

function fail(message: string): never {
  console.error(`\n[gen-images] ${message}\n`);
  process.exit(1);
}

function parseConcurrency(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    fail(`Invalid --concurrency value "${value ?? ""}". Use a positive integer.`);
  }
  return parsed;
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

async function generateOne(filePath: string, force: boolean): Promise<GeneratedFigure | null> {
  const figure = loadFigure(filePath);
  const outPath = figureImagePath(figure.chapter_slug, figure.id);

  if (!force && existsSync(outPath)) {
    console.log(`[gen-images] skip ${figure.id} (image exists; use --force to regenerate)`);
    return null;
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
  console.log(`[gen-images] wrote ${path.relative(process.cwd(), outPath)}`);
  return { slug: figure.chapter_slug, figureId: figure.id };
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

function listAllFigureFiles(): string[] {
  const chaptersRoot = path.join(process.cwd(), "content", "chapters");
  if (!existsSync(chaptersRoot)) fail("No content/chapters directory found.");
  const files: string[] = [];
  const entries = readdirSync(chaptersRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const figDir = path.join(chaptersRoot, entry.name, "figures");
    if (!existsSync(figDir)) continue;
    const jsonFiles = readdirSync(figDir)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => path.join(figDir, f));
    files.push(...jsonFiles);
  }
  return files;
}

async function generateMany(
  filePaths: string[],
  force: boolean,
  concurrency: number,
): Promise<GeneratedFigure[]> {
  const tasks = buildGenerationTasks(filePaths, force);
  const results: GeneratedFigure[] = [];
  const completed = new Set<string>(
    tasks
      .filter(
        (task) =>
          !force && existsSync(figureImagePath(task.figure.chapter_slug, task.figure.id)),
      )
      .map((task) => task.key),
  );
  const remaining = new Map(tasks.map((task) => [task.key, task]));

  while (remaining.size > 0) {
    const runnable = [...remaining.values()].filter((task) =>
      task.dependencies.every((dependency) => completed.has(dependency)),
    );

    if (runnable.length === 0) {
      const blocked = [...remaining.values()]
        .map((task) => `${task.key} waits for ${task.dependencies.join(", ")}`)
        .join("\n  - ");
      fail(`No runnable figures; check reference dependencies:\n  - ${blocked}`);
    }

    const generated = await runTaskBatch(runnable, force, concurrency);
    for (const task of runnable) {
      remaining.delete(task.key);
      completed.add(task.key);
    }
    results.push(...generated);
  }

  return results;
}

function buildGenerationTasks(filePaths: string[], force: boolean): GenerationTask[] {
  const figuresByPath = filePaths.map((filePath) => ({
    filePath,
    figure: loadFigure(filePath),
  }));
  const taskKeyByOutputPath = new Map(
    figuresByPath.map(({ figure }) => [
      figureImagePath(figure.chapter_slug, figure.id),
      `${figure.chapter_slug}/${figure.id}`,
    ]),
  );

  return figuresByPath.map(({ filePath, figure }) => {
    const taskKey = `${figure.chapter_slug}/${figure.id}`;
    const dependencies = [...figure.style_refs, ...figure.character_refs]
      .map(resolveReferencePath)
      .map((refPath) => taskKeyByOutputPath.get(refPath))
      .filter((depKey): depKey is string => Boolean(depKey))
      .filter((depKey) => depKey !== taskKey)
      .filter((depKey) => {
        const [depSlug, depId] = depKey.split("/");
        return force || !existsSync(figureImagePath(depSlug, depId));
      });

    return { key: taskKey, filePath, figure, dependencies };
  });
}

async function runTaskBatch(
  tasks: GenerationTask[],
  force: boolean,
  concurrency: number,
): Promise<GeneratedFigure[]> {
  const results: GeneratedFigure[] = [];
  const errors: string[] = [];
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < tasks.length) {
      const task = tasks[nextIndex++];
      try {
        const generated = await generateOne(task.filePath, force);
        if (generated) results.push(generated);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${path.basename(task.filePath)}: ${message}`);
      }
    }
  }

  const workerCount = Math.min(concurrency, tasks.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  if (errors.length > 0) {
    fail(
      `Failed to generate ${errors.length} figure(s):\n` +
        errors.map((e) => `  - ${e}`).join("\n"),
    );
  }

  return results;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // Surface a missing key early with a clear message (not a stack trace).
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
    fail("OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.");
  }

  if (args.figure) {
    const filePath = args.chapter
      ? path.join(chapterFiguresDir(args.chapter), `${args.figure}.json`)
      : findFigureFile(args.figure);
    const generated = await generateOne(filePath, args.force);
    if (generated) markAssetReady(generated.slug, generated.figureId);
    console.log("[gen-images] done.");
    return;
  }

  let filePaths: string[] = [];

  if (args.chapter) {
    const figuresDir = chapterFiguresDir(args.chapter);
    if (!existsSync(figuresDir)) {
      fail(`No figures directory for chapter "${args.chapter}" at ${figuresDir}`);
    }
    const files = readdirSync(figuresDir)
      .filter((f) => f.endsWith(".json"))
      .sort();
    if (files.length === 0) fail(`No figure JSON files in ${figuresDir}`);
    filePaths = files.map((file) => path.join(figuresDir, file));
    console.log(
      `[gen-images] processing chapter "${args.chapter}" (${filePaths.length} figure(s)) with concurrency ${args.concurrency}...`,
    );
  } else {
    filePaths = listAllFigureFiles();
    if (filePaths.length === 0) {
      fail("No figure JSON files found under content/chapters/*/figures");
    }
    console.log(
      `[gen-images] processing all chapters (${filePaths.length} figure(s)) with concurrency ${args.concurrency}...`,
    );
  }

  const generatedFigures = await generateMany(
    filePaths,
    args.force,
    args.concurrency,
  );
  for (const generated of generatedFigures) {
    markAssetReady(generated.slug, generated.figureId);
  }
  console.log(`[gen-images] done. ${filePaths.length} figure(s) processed.`);
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
});
