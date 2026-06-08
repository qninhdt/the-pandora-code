#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import "dotenv/config";
import yaml from "js-yaml";
import { GlossaryTerm } from "../apps/web/lib/content/schemas/glossary-term";
import { generateImage } from "./lib/openai-image-client";
import { loadStyleBible } from "./lib/style-bible-loader";

// Render glossary cover images from committed per-term prompts. Mirrors
// gen-images.ts: STYLE BIBLE governs the look, the glossary YAML supplies the
// literal subject. Output: apps/web/public/images/glossary/{id}.png.

const ROOT = process.cwd();
const GLOSSARY_DIR = path.join(ROOT, "content", "glossary");
const OUT_DIR = path.join(ROOT, "apps/web/public/images/glossary");
const ANCHORS_DIR = path.join(ROOT, "content", "art-direction", "anchors");

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
  console.error(`\n[gen-glossary-covers] ${message}\n`);
  process.exit(1);
}

function parseConcurrency(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    fail(`Invalid --concurrency value "${value ?? ""}". Use a positive integer.`);
  }
  return parsed;
}

// Compose the STYLE BIBLE invariants with a term's literal cover prompt. Cover
// images are square (1:1) - they sit in the term card/hero.
function composeCoverPrompt(coverPrompt: string, styleBible: string): string {
  return [
    styleBible,
    "",
    "--- THIS GLOSSARY COVER IMAGE ---",
    coverPrompt,
    "Square composition. No text, letters, numbers, or labels in the image.",
  ].join("\n");
}

interface CoverJob {
  id: string;
  coverPrompt: string;
}

function formatSchemaIssues(
  file: string,
  issues: { path: (string | number)[]; message: string }[],
) {
  const lines = issues.map((issue) => {
    const field = issue.path.length > 0 ? issue.path.join(".") : "<root>";
    return `    - ${field}: ${issue.message}`;
  });
  return [`  - ${file}`, ...lines].join("\n");
}

// Read every glossary YAML and require each file to validate, including its
// committed cover_prompt. Invalid files fail the run instead of being skipped.
function collectJobs(filterId?: string): CoverJob[] {
  if (!existsSync(GLOSSARY_DIR)) fail(`No glossary directory at ${GLOSSARY_DIR}`);
  if (filterId) {
    const requested = path.join(GLOSSARY_DIR, `${filterId}.yaml`);
    if (!existsSync(requested)) return [];
  }

  const jobs: CoverJob[] = [];
  const errors: string[] = [];

  for (const file of readdirSync(GLOSSARY_DIR).sort()) {
    if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
    const filePath = path.join(GLOSSARY_DIR, file);
    let raw: unknown;
    try {
      raw = yaml.load(readFileSync(filePath, "utf8"));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`  - ${file}\n    - yaml: ${message}`);
      continue;
    }

    const parsed = GlossaryTerm.safeParse(raw);
    if (!parsed.success) {
      errors.push(formatSchemaIssues(file, parsed.error.issues));
      continue;
    }

    const term = parsed.data;
    if (filterId && term.id !== filterId) continue;
    jobs.push({
      id: term.id,
      coverPrompt: term.cover_prompt,
    });
  }

  if (errors.length > 0) {
    fail(`Invalid glossary term file(s):\n${errors.join("\n")}`);
  }

  return jobs;
}

async function generateOne(job: CoverJob, styleBible: string, force: boolean): Promise<void> {
  const outPath = path.join(OUT_DIR, `${job.id}.png`);
  if (!force && existsSync(outPath)) {
    console.log(`[gen-glossary-covers] skip ${job.id} (image exists; use --force)`);
    return;
  }

  // A shared style anchor keeps glossary covers visually consistent with the
  // rest of the book when one is present.
  const anchor = path.join(ANCHORS_DIR, "pandora-establishing.png");
  const referencePaths = existsSync(anchor) ? [anchor] : undefined;

  console.log(`[gen-glossary-covers] generating ${job.id}...`);
  const result = await generateImage({
    prompt: composeCoverPrompt(job.coverPrompt, styleBible),
    aspect: "1:1",
    referencePaths,
  });

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(outPath, result.bytes);
  console.log(`[gen-glossary-covers] wrote ${path.relative(ROOT, outPath)}`);
}

async function generateMany(
  jobs: CoverJob[],
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
      `Failed to generate ${errors.length} glossary cover(s):\n${errors.map((e) => `  - ${e}`).join("\n")}`,
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
        ? `[gen-glossary-covers] glossary term "${args.id}" was not found.`
        : "[gen-glossary-covers] no glossary terms found.",
    );
    return;
  }

  const styleBible = loadStyleBible();
  console.log(
    `[gen-glossary-covers] processing ${jobs.length} cover(s) with concurrency ${args.concurrency}...`,
  );
  await generateMany(jobs, styleBible, args.force, args.concurrency);
  console.log(`[gen-glossary-covers] done. ${jobs.length} cover(s) processed.`);
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
});
