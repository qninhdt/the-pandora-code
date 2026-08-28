import fs from "node:fs";
import path from "node:path";
import { CONTENT_ROOT } from "./content-paths";

// Chapter folders are named for their slug and nothing else. Book order lives in
// one place only - the array order of `OUTLINE` in ../outline.ts - so resequencing
// the book is a single-file edit and never touches the filesystem.

let cache: string[] | null = null;

function scan(): string[] {
  const dir = path.join(CONTENT_ROOT, "chapters");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("."))
    .filter((e) => fs.existsSync(path.join(dir, e.name, "meta.yaml")))
    .map((e) => e.name)
    .sort();
}

// Clean slugs of every chapter folder, in slug order. Drives URL params and nav.
export function listChapterSlugsFromIndex(): string[] {
  if (!cache) cache = scan();
  return cache;
}
