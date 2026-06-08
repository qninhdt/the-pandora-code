import fs from "node:fs";
import path from "node:path";
import { chapterImagesDir } from "./content-paths";

// Resolve a chapter's representative ("cover") image - the one shown on the
// landing plate and as the chapter's social/hero thumbnail. Preference order:
//   1. cover.png            (an explicit hand-placed cover)
//   2. fig-00-cover.png     (the cover figure the pipeline authors per chapter)
//   3. the lowest-numbered fig-NN-*.png that exists (graceful fallback)
// Returns a public URL path (/images/chapters/{slug}/{file}) or undefined when
// no image has been generated yet, so the plate can fall back to its gradient.

function publicPath(slug: string, file: string): string {
  return `/images/chapters/${slug}/${file}`;
}

export function getChapterCoverImage(slug: string): string | undefined {
  const dir = chapterImagesDir(slug);
  if (!fs.existsSync(dir)) return undefined;

  if (fs.existsSync(path.join(dir, "cover.png"))) {
    return publicPath(slug, "cover.png");
  }
  if (fs.existsSync(path.join(dir, "fig-00-cover.png"))) {
    return publicPath(slug, "fig-00-cover.png");
  }

  // Fallback: the first figure image in sequential order.
  const figures = fs
    .readdirSync(dir)
    .filter((f) => /^fig-\d{2}-.+\.png$/.test(f))
    .sort();
  return figures.length > 0 ? publicPath(slug, figures[0]) : undefined;
}
