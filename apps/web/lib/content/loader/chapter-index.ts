import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { CONTENT_ROOT } from "./content-paths";

// Chapter folders are named "N-M-<slug>" (part N, order M within the part) so
// they sort and read in book order on disk. The public slug, URL, image path
// and cross-references all stay clean (the "<slug>" part only). This index maps
// clean slug -> on-disk folder name by reading each meta.yaml's slug field, so
// the loader and fumadocs can resolve a clean slug back to its prefixed folder.

let cache: Map<string, string> | null = null;

function buildIndex(): Map<string, string> {
  const dir = path.join(CONTENT_ROOT, "chapters");
  const map = new Map<string, string>();
  if (!fs.existsSync(dir)) return map;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_") || entry.name.startsWith(".")) {
      continue;
    }
    const metaPath = path.join(dir, entry.name, "meta.yaml");
    if (!fs.existsSync(metaPath)) continue;
    const meta = yaml.load(fs.readFileSync(metaPath, "utf8")) as { slug?: string };
    const slug = meta?.slug ?? entry.name;
    map.set(slug, entry.name);
  }
  return map;
}

function index(): Map<string, string> {
  if (!cache) cache = buildIndex();
  return cache;
}

// Resolve a clean slug to its on-disk folder name. Falls back to the slug itself
// for unknown slugs so callers still build a (non-existent) path that fails the
// usual existsSync checks rather than throwing here.
export function chapterDirname(slug: string): string {
  return index().get(slug) ?? slug;
}

// Clean slugs of every chapter folder, in slug order. Drives URL params and nav.
export function listChapterSlugsFromIndex(): string[] {
  return [...index().keys()].sort();
}

// Parse the "N-M-" folder prefix into its part (N) and order (M) numbers - the
// authoritative book order. The meta.yaml `order` field is unreliable, so this
// on-disk prefix is the single source of truth for sequencing chapters.
export function chapterOrderPrefix(slug: string): { part: number; order: number } | null {
  const match = chapterDirname(slug).match(/^(\d+)-(\d+)-/);
  if (!match) return null;
  return { part: Number(match[1]), order: Number(match[2]) };
}
