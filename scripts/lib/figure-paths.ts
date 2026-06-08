import path from "node:path";

// Repo-root-relative paths. The image pipeline runs from the workspace root
// (where content/ and apps/web/ live), unlike the web app's content-paths
// helper which assumes an apps/web cwd.
const ROOT = process.cwd();

export const CONTENT_ROOT = path.join(ROOT, "content");
export const PUBLIC_IMAGES_ROOT = path.join(ROOT, "apps/web/public/images");
export const ANCHORS_DIR = path.join(CONTENT_ROOT, "art-direction", "anchors");

export function chapterFiguresDir(slug: string): string {
  return path.join(CONTENT_ROOT, "chapters", slug, "figures");
}

export function chapterMetaPath(slug: string): string {
  return path.join(CONTENT_ROOT, "chapters", slug, "meta.yaml");
}

export function chapterImagesDir(slug: string): string {
  return path.join(PUBLIC_IMAGES_ROOT, "chapters", slug);
}

export function figureImagePath(slug: string, figureId: string): string {
  return path.join(chapterImagesDir(slug), `${figureId}.png`);
}

// Resolve a reference image path stored in figure JSON. Bare names resolve
// against the anchors dir; explicit relative paths resolve against the root.
export function resolveReferencePath(ref: string): string {
  if (ref.includes("/")) return path.resolve(ROOT, ref);
  return path.join(ANCHORS_DIR, ref);
}
