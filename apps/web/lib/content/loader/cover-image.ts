import manifest from "./image-manifest.json";

// Resolve a chapter's representative ("cover") image from the pre-built manifest.
// This eliminates runtime `fs` operations on public/images during page rendering,
// preventing Node File Tracing (NFT) from bundling 1.4GB of images into Serverless Functions.
export function getChapterCoverImage(slug: string): string | undefined {
  const covers = manifest.chapterCovers as Record<string, string>;
  return covers[slug];
}
