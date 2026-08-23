import manifest from "./image-manifest.json";

// Resolve a glossary term's cover image from the pre-built manifest.
export function getGlossaryCoverImage(id: string): string | undefined {
  const covers = manifest.glossaryCovers as Record<string, string>;
  return covers[id];
}
