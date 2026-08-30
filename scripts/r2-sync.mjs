#!/usr/bin/env node
// r2-sync.mjs — upload static images or chapter audio to Cloudflare R2.
//
// Uses R2's S3 API with SigV4 (see lib/r2-client.mjs) so it runs on any machine
// or CI runner holding the R2_* env vars, with no interactive Cloudflare login.
// An object whose remote size already matches the local file is left untouched.
//
// Usage:
//   node --env-file=.env scripts/r2-sync.mjs --images
//   node --env-file=.env scripts/r2-sync.mjs --audio [--bucket the-pandora-code]

import fs from "node:fs";
import path from "node:path";
import { putFileIfChanged, publicUrl, readR2Config } from "./lib/r2-client.mjs";

const REPO_ROOT = path.resolve(new URL("..", import.meta.url).pathname);

function parseArgs(args) {
  const opts = { images: false, audio: false, bucket: null, jobs: 6, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--images") opts.images = true;
    else if (arg === "--audio") opts.audio = true;
    else if (arg === "--bucket") opts.bucket = args[++index];
    else if (arg === "--jobs") opts.jobs = Number.parseInt(args[++index], 10);
    else if (arg === "--help" || arg === "-h") opts.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (!Number.isInteger(opts.jobs) || opts.jobs < 1) {
    throw new Error("--jobs must be a positive integer");
  }
  return opts;
}

function filesUnder(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(file));
    else if (entry.isFile()) files.push(file);
  }
  return files;
}

function imageObjects() {
  const root = path.join(REPO_ROOT, "apps/web/public/images");
  return filesUnder(root).map((file) => ({
    file,
    key: `images/${path.relative(root, file).split(path.sep).join("/")}`,
  }));
}

// Chapter delivery is one MP3 per chapter/locale plus its section-marker
// sidecar. The intermediate WAV stays local: it is the render source, far too
// large to serve, and the marker offsets are derived from it at build time.
function audioObjects() {
  const root = path.join(REPO_ROOT, "tts-out");
  return filesUnder(root).flatMap((file) => {
    const relative = path.relative(root, file).split(path.sep).join("/");
    const match = /^(.+)\.(en|vi)\/\1\.\2(\.sections\.json|\.mp3)$/i.exec(relative);
    if (!match) return [];
    return [{ file, key: `audio/chapters/${match[1]}/${match[2]}/${path.basename(file)}` }];
  });
}

function printUsage() {
  console.log(
    "Usage: node --env-file=.env scripts/r2-sync.mjs --images|--audio [--bucket name] [--jobs 6]",
  );
}

// Uploads are network-bound and independent, so a small worker pool turns a
// multi-gigabyte image sync from serial minutes into a parallel one.
async function pool(items, jobs, run) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(jobs, items.length)) }, async () => {
      while (next < items.length) await run(items[next++]);
    }),
  );
}

try {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || (!opts.images && !opts.audio)) {
    printUsage();
    process.exit(opts.help ? 0 : 1);
  }
  if (opts.images && opts.audio) throw new Error("Choose one sync mode: --images or --audio");

  const config = readR2Config();
  if (opts.bucket) config.bucket = opts.bucket;
  const objects = opts.images ? imageObjects() : audioObjects();
  if (objects.length === 0) console.log("Nothing to sync.");

  let uploaded = 0;
  let skipped = 0;
  let done = 0;
  await pool(objects, opts.jobs, async (object) => {
    const result = await putFileIfChanged(config, object.key, object.file);
    if (result.uploaded) uploaded += 1;
    else skipped += 1;
    done += 1;
    console.log(
      `[${done}/${objects.length}] ${result.uploaded ? "upload" : "skip"} ${object.key} (${result.localSize} bytes)`,
    );
  });
  const base = publicUrl(config, "");
  console.log(
    `Done: ${uploaded} uploaded, ${skipped} unchanged, bucket ${config.bucket}${base ? ` (public ${base})` : ""}.`,
  );
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
