import manifest from "./image-manifest.json";

// Resolve a chapter's full-bleed background image from the pre-built manifest.
export function getChapterBackgroundImage(slug: string): string | undefined {
  const backgrounds = manifest.chapterBackgrounds as Record<string, string>;
  return backgrounds[slug];
}
