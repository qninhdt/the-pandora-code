import fs from "node:fs";
import path from "node:path";
import { staticUrl } from "../lib/static-url";

// Build-time image manifest: scans public/images to build a static lookup table
// for chapter covers, chapter backgrounds, and glossary covers.
// This prevents Next.js / Turbopack from tracing 1.4GB of public/images into
// the Serverless Function bundle during Node File Tracing (NFT).

const PUBLIC_IMAGES = path.resolve(process.cwd(), "public/images");
const MANIFEST_PATH = path.resolve(process.cwd(), "lib/content/loader/image-manifest.json");

interface ImageManifest {
  chapterCovers: Record<string, string>;
  chapterBackgrounds: Record<string, string>;
  glossaryCovers: Record<string, string>;
  pageBackgrounds: Record<string, string>;
}

const PAGE_BACKGROUND_IDS = ["chapters", "glossary", "authors", "parts", "timeline"] as const;

function prefixedRecord(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, asset]) => [key, staticUrl(asset)]),
  );
}

function readExistingManifest(): ImageManifest {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { chapterCovers: {}, chapterBackgrounds: {}, glossaryCovers: {}, pageBackgrounds: {} };
  }
  try {
    const value = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as Record<string, unknown>;
    return {
      chapterCovers: prefixedRecord(value.chapterCovers),
      chapterBackgrounds: prefixedRecord(value.chapterBackgrounds),
      glossaryCovers: prefixedRecord(value.glossaryCovers),
      pageBackgrounds: prefixedRecord(value.pageBackgrounds),
    };
  } catch {
    return { chapterCovers: {}, chapterBackgrounds: {}, glossaryCovers: {}, pageBackgrounds: {} };
  }
}

export function buildImageManifest(): ImageManifest {
  const manifest = readExistingManifest();

  const chaptersDir = path.join(PUBLIC_IMAGES, "chapters");
  if (fs.existsSync(chaptersDir)) {
    for (const entry of fs.readdirSync(chaptersDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const slug = entry.name;
      const dir = path.join(chaptersDir, slug);

      // Background check
      const bgFile = path.join(dir, "fig-99-background.png");
      if (fs.existsSync(bgFile)) {
        manifest.chapterBackgrounds[slug] = staticUrl(
          `/images/chapters/${slug}/fig-99-background.png`,
        );
      }

      // Cover check in priority order
      const candidates = ["cover.webp", "cover.png", "fig-00-cover.webp", "fig-00-cover.png"];
      let foundCover = false;
      for (const candidate of candidates) {
        if (fs.existsSync(path.join(dir, candidate))) {
          manifest.chapterCovers[slug] = staticUrl(`/images/chapters/${slug}/${candidate}`);
          foundCover = true;
          break;
        }
      }

      if (!foundCover) {
        const figures = fs
          .readdirSync(dir)
          .filter((f) => /^fig-\d{2}-.+\.(webp|png)$/.test(f))
          .sort();
        const webpFig = figures.find((f) => f.endsWith(".webp"));
        if (webpFig) {
          manifest.chapterCovers[slug] = staticUrl(`/images/chapters/${slug}/${webpFig}`);
        } else if (figures.length > 0) {
          manifest.chapterCovers[slug] = staticUrl(`/images/chapters/${slug}/${figures[0]}`);
        }
      }
    }
  }

  const glossaryDir = path.join(PUBLIC_IMAGES, "glossary");
  if (fs.existsSync(glossaryDir)) {
    for (const file of fs.readdirSync(glossaryDir)) {
      if (file.endsWith(".webp")) {
        const id = file.slice(0, -5);
        manifest.glossaryCovers[id] = staticUrl(`/images/glossary/${id}.webp`);
      } else if (file.endsWith(".png")) {
        const id = file.slice(0, -4);
        if (!manifest.glossaryCovers[id]) {
          manifest.glossaryCovers[id] = staticUrl(`/images/glossary/${id}.png`);
        }
      }
    }
  }

  const pagesDir = path.join(PUBLIC_IMAGES, "pages");
  for (const id of PAGE_BACKGROUND_IDS) {
    const file = path.join(pagesDir, `${id}.png`);
    if (fs.existsSync(file)) manifest.pageBackgrounds[id] = staticUrl(`/images/pages/${id}.png`);
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

if (process.argv[1] === import.meta.filename) {
  const result = buildImageManifest();
  console.log(
    `[image-manifest] Built: ${Object.keys(result.chapterCovers).length} chapter covers, ${Object.keys(result.chapterBackgrounds).length} chapter backgrounds, ${Object.keys(result.glossaryCovers).length} glossary covers.`,
  );
}
