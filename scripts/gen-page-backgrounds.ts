#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import "dotenv/config";
import yaml from "js-yaml";
import { z } from "zod";
import { generateImage } from "./lib/openai-image-client";
import { loadStyleBible } from "./lib/style-bible-loader";

// Render full-bleed page background images from committed prompts. Mirrors
// gen-glossary-covers.ts: the STYLE BIBLE governs the look, the manifest YAML
// supplies the literal subject, and the shared Pandora establishing anchor is
// fed as a reference so backdrops read as one world with the rest of the book.
// Output: apps/web/public/images/pages/{id}.png.

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "content", "art-direction", "page-backgrounds.yaml");
const OUT_DIR = path.join(ROOT, "apps/web/public/images/pages");
const ANCHORS_DIR = path.join(ROOT, "content", "art-direction", "anchors");

const BackgroundSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "id must be kebab-case (a-z, 0-9, hyphen)"),
  aspect: z.enum(["16:9", "9:16", "1:1", "4:3", "3:2"]).default("16:9"),
  prompt: z.string().min(1),
});

const ManifestSchema = z.object({
  backgrounds: z.array(BackgroundSchema).min(1),
});

type Background = z.infer<typeof BackgroundSchema>;

interface Args {
  id?: string;
  force: boolean;
  concurrency: number;
}

const DEFAULT_CONCURRENCY = 4;

function parseArgs(argv: string[]): Args {
  const args: Args = { force: false, concurrency: DEFAULT_CONCURRENCY };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") args.id = argv[++i];
    else if (a === "--force") args.force = true;
    else if (a === "--concurrency") args.concurrency = parseConcurrency(argv[++i]);
  }
  return args;
}

function fail(message: string): never {
  console.error(`\n[gen-page-backgrounds] ${message}\n`);
  process.exit(1);
}

function parseConcurrency(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    fail(`Invalid --concurrency value "${value ?? ""}". Use a positive integer.`);
  }
  return parsed;
}

// Compose the STYLE BIBLE invariants with a background's literal prompt. These
// are wide backdrops, so reinforce the "no text / hold up under an overlay"
// intent on top of the global exclusions.
function composeBackgroundPrompt(prompt: string, styleBible: string): string {
  return [
    styleBible,
    "",
    "--- THIS PAGE BACKGROUND IMAGE ---",
    prompt,
    "Full-bleed cinematic background. The composition must remain legible when a " +
      "dark gradient and headline text are laid over it; keep the busiest detail " +
      "away from the dead center. No text, letters, numbers, labels, or UI in the image.",
  ].join("\n");
}

function collectJobs(filterId?: string): Background[] {
  if (!existsSync(MANIFEST)) fail(`No manifest at ${MANIFEST}`);
  let raw: unknown;
  try {
    raw = yaml.load(readFileSync(MANIFEST, "utf8"));
  } catch (err) {
    fail(`Failed to parse ${path.basename(MANIFEST)}: ${err instanceof Error ? err.message : err}`);
  }

  const parsed = ManifestSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((iss) => `  - ${iss.path.join(".") || "<root>"}: ${iss.message}`)
      .join("\n");
    fail(`Invalid page-backgrounds.yaml:\n${issues}`);
  }

  const seen = new Set<string>();
  for (const bg of parsed.data.backgrounds) {
    if (seen.has(bg.id)) fail(`Duplicate background id "${bg.id}" in manifest.`);
    seen.add(bg.id);
  }

  return filterId
    ? parsed.data.backgrounds.filter((bg) => bg.id === filterId)
    : parsed.data.backgrounds;
}

async function generateOne(job: Background, styleBible: string, force: boolean): Promise<void> {
  const outPath = path.join(OUT_DIR, `${job.id}.png`);
  if (!force && existsSync(outPath)) {
    console.log(`[gen-page-backgrounds] skip ${job.id} (image exists; use --force)`);
    return;
  }

  // The shared establishing anchor keeps backdrops consistent with the book.
  const anchor = path.join(ANCHORS_DIR, "pandora-establishing.png");
  const referencePaths = existsSync(anchor) ? [anchor] : undefined;

  console.log(`[gen-page-backgrounds] generating ${job.id} (${job.aspect})...`);
  const result = await generateImage({
    prompt: composeBackgroundPrompt(job.prompt, styleBible),
    aspect: job.aspect,
    referencePaths,
  });

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(outPath, result.bytes);
  console.log(`[gen-page-backgrounds] wrote ${path.relative(ROOT, outPath)}`);
}

async function generateMany(
  jobs: Background[],
  styleBible: string,
  force: boolean,
  concurrency: number,
): Promise<void> {
  const errors: string[] = [];
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < jobs.length) {
      const job = jobs[nextIndex++];
      try {
        await generateOne(job, styleBible, force);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${job.id}: ${message}`);
      }
    }
  }

  const workerCount = Math.min(concurrency, jobs.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  if (errors.length > 0) {
    fail(
      `Failed to generate ${errors.length} background(s):\n${errors
        .map((e) => `  - ${e}`)
        .join("\n")}`,
    );
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
    fail("OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.");
  }

  const jobs = collectJobs(args.id);
  if (jobs.length === 0) {
    console.log(
      args.id
        ? `[gen-page-backgrounds] background "${args.id}" was not found.`
        : "[gen-page-backgrounds] no backgrounds found.",
    );
    return;
  }

  const styleBible = loadStyleBible();
  console.log(
    `[gen-page-backgrounds] processing ${jobs.length} background(s) with concurrency ${args.concurrency}...`,
  );
  await generateMany(jobs, styleBible, args.force, args.concurrency);
  console.log(`[gen-page-backgrounds] done. ${jobs.length} background(s) processed.`);
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
});
