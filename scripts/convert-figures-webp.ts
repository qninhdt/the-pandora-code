#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

// Convert chapter figure + glossary cover PNGs to .webp for deploy. The web app
// references inline figures and glossary covers as .webp (smaller, shipped to
// Vercel; the .png sources are vercelignored). PNGs stay in the repo as the
// lossless source. Cover (fig-00) and background (fig-99) are still served as
// PNG, but we generate their .webp too so the set is complete.
//
// Usage:
//   pnpm tsx scripts/convert-figures-webp.ts                 # all chapters + glossary
//   pnpm tsx scripts/convert-figures-webp.ts --chapter slug  # one chapter
//   pnpm tsx scripts/convert-figures-webp.ts --force         # re-encode existing

const QUALITY = 82;
const IMAGES_ROOT = path.resolve(
  process.cwd(),
  "apps/web/public/images/chapters",
);
const GLOSSARY_ROOT = path.resolve(
  process.cwd(),
  "apps/web/public/images/glossary",
);

interface Args {
  chapter?: string;
  force: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--chapter") args.chapter = argv[++i];
    else if (a === "--force") args.force = true;
  }
  return args;
}

function listChapterDirs(root: string, only?: string): string[] {
  if (!existsSync(root)) return [];
  if (only) {
    const dir = path.join(root, only);
    return existsSync(dir) ? [dir] : [];
  }
  return readdirSync(root)
    .map((name) => path.join(root, name))
    .filter((p) => statSync(p).isDirectory());
}

function listFigurePngs(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => /^fig-\d+.*\.png$/i.test(name))
    .map((name) => path.join(dir, name))
    .sort();
}

// Glossary covers are flat {id}.png files, not fig-numbered.
function listGlossaryPngs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => /\.png$/i.test(name))
    .map((name) => path.join(dir, name))
    .sort();
}

function convertToWebp(pngPath: string, force: boolean): "wrote" | "skipped" {
  const webpPath = pngPath.replace(/\.png$/i, ".webp");
  if (!force && existsSync(webpPath)) return "skipped";
  // ImageMagick: keep native dimensions, just re-encode as webp.
  execFileSync("convert", [pngPath, "-quality", String(QUALITY), webpPath]);
  return "wrote";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dirs = listChapterDirs(IMAGES_ROOT, args.chapter);

  let wrote = 0;
  let skipped = 0;

  for (const dir of dirs) {
    const slug = path.basename(dir);
    for (const png of listFigurePngs(dir)) {
      const result = convertToWebp(png, args.force);
      if (result === "wrote") {
        wrote++;
        console.log(`[convert-webp] ${slug}/${path.basename(png)} -> .webp`);
      } else {
        skipped++;
      }
    }
  }

  // Glossary covers are flat {id}.png files alongside the chapters. They share
  // the same deploy story (PNG vercelignored, .webp shipped), so convert them
  // too — unless a single --chapter was requested.
  if (!args.chapter) {
    for (const png of listGlossaryPngs(GLOSSARY_ROOT)) {
      const result = convertToWebp(png, args.force);
      if (result === "wrote") {
        wrote++;
        console.log(`[convert-webp] glossary/${path.basename(png)} -> .webp`);
      } else {
        skipped++;
      }
    }
  }

  console.log(
    `[convert-webp] done. ${wrote} written, ${skipped} skipped (already existed; use --force to re-encode).`,
  );
}

main();
