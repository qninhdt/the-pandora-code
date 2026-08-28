import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

// Repo-root-relative paths. The image pipeline runs from the workspace root
// (where content/ and apps/web/ live), unlike the web app's content-paths
// helper which assumes an apps/web cwd.
const ROOT = process.cwd();

export const CONTENT_ROOT = path.join(ROOT, "content");
export const PUBLIC_IMAGES_ROOT = path.join(ROOT, "apps/web/public/images");
export const ANCHORS_DIR = path.join(CONTENT_ROOT, "art-direction", "anchors");

// Figure JSON, URLs, public image folders, and chapter folders all use the
// clean metadata slug. The metadata fallback keeps image tooling tolerant of a
// legacy prefixed workspace while a migration is in progress.
export function resolveChapterContentDir(contentRoot: string, slug: string): string {
  const chaptersRoot = path.join(contentRoot, "chapters");
  const direct = path.join(chaptersRoot, slug);
  if (existsSync(direct)) return direct;

  if (!existsSync(chaptersRoot)) return direct;
  for (const entry of readdirSync(chaptersRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(chaptersRoot, entry.name);
    const metaPath = path.join(candidate, "meta.yaml");
    if (!existsSync(metaPath)) continue;
    try {
      const meta = yaml.load(readFileSync(metaPath, "utf8")) as { slug?: unknown } | null;
      if (meta?.slug === slug) return candidate;
    } catch {
      // Content validation owns malformed YAML errors. Path lookup simply
      // ignores an unreadable candidate and keeps searching.
    }
  }

  return direct;
}

export function chapterFiguresDir(slug: string): string {
  return path.join(resolveChapterContentDir(CONTENT_ROOT, slug), "figures");
}

export function chapterMetaPath(slug: string): string {
  return path.join(resolveChapterContentDir(CONTENT_ROOT, slug), "meta.yaml");
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
