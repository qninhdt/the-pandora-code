import fs from "node:fs";
import path from "node:path";

// Build-time image manifest: scans public/images to build a static lookup table
// for chapter covers, chapter backgrounds, and glossary covers.
// This prevents Next.js / Turbopack from tracing 1.4GB of public/images into
// the Serverless Function bundle during Node File Tracing (NFT).

const PUBLIC_IMAGES = path.resolve(process.cwd(), "public/images");
const MANIFEST_PATH = path.resolve(
  process.cwd(),
  "lib/content/loader/image-manifest.json",
);

interface ImageManifest {
  chapterCovers: Record<string, string>;
  chapterBackgrounds: Record<string, string>;
  glossaryCovers: Record<string, string>;
}

export function buildImageManifest(): ImageManifest {
  const manifest: ImageManifest = {
    chapterCovers: {},
    chapterBackgrounds: {},
    glossaryCovers: {},
  };

  const chaptersDir = path.join(PUBLIC_IMAGES, "chapters");
  if (fs.existsSync(chaptersDir)) {
    for (const entry of fs.readdirSync(chaptersDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const slug = entry.name;
      const dir = path.join(chaptersDir, slug);

      // Background check
      const bgFile = path.join(dir, "fig-99-background.png");
      if (fs.existsSync(bgFile)) {
        manifest.chapterBackgrounds[slug] =
          `/images/chapters/${slug}/fig-99-background.png`;
      }

      // Cover check in priority order
      const candidates = [
        "cover.webp",
        "cover.png",
        "fig-00-cover.webp",
        "fig-00-cover.png",
      ];
      let foundCover = false;
      for (const candidate of candidates) {
        if (fs.existsSync(path.join(dir, candidate))) {
          manifest.chapterCovers[slug] = `/images/chapters/${slug}/${candidate}`;
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
          manifest.chapterCovers[slug] = `/images/chapters/${slug}/${webpFig}`;
        } else if (figures.length > 0) {
          manifest.chapterCovers[slug] = `/images/chapters/${slug}/${figures[0]}`;
        }
      }
    }
  }

  const glossaryDir = path.join(PUBLIC_IMAGES, "glossary");
  if (fs.existsSync(glossaryDir)) {
    for (const file of fs.readdirSync(glossaryDir)) {
      if (file.endsWith(".webp")) {
        const id = file.slice(0, -5);
        manifest.glossaryCovers[id] = `/images/glossary/${id}.webp`;
      } else if (file.endsWith(".png")) {
        const id = file.slice(0, -4);
        if (!manifest.glossaryCovers[id]) {
          manifest.glossaryCovers[id] = `/images/glossary/${id}.png`;
        }
      }
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
  return manifest;
}

if (process.argv[1] === import.meta.filename) {
  const result = buildImageManifest();
  console.log(
    `[image-manifest] Built: ${Object.keys(result.chapterCovers).length} chapter covers, ${Object.keys(result.chapterBackgrounds).length} chapter backgrounds, ${Object.keys(result.glossaryCovers).length} glossary covers.`,
  );
}
