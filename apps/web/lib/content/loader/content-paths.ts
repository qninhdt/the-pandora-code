import path from "node:path";
import { chapterDirname } from "./chapter-index";

export const CONTENT_ROOT = path.resolve(process.cwd(), "../../content");

export const PUBLIC_IMAGES_ROOT = path.resolve(process.cwd(), "public/images");

// Folder is named "N-M-<slug>"; resolve the clean slug to that prefixed folder.
export function chapterDir(slug: string): string {
  return path.join(CONTENT_ROOT, "chapters", chapterDirname(slug));
}

export function chapterMetaPath(slug: string): string {
  return path.join(chapterDir(slug), "meta.yaml");
}

export function chapterMdxPath(slug: string, locale: "vi" | "en"): string {
  return path.join(chapterDir(slug), `${locale}.mdx`);
}

export function chapterFiguresDir(slug: string): string {
  return path.join(chapterDir(slug), "figures");
}

export function chapterImagesDir(slug: string): string {
  return path.join(PUBLIC_IMAGES_ROOT, "chapters", slug);
}

export function glossaryDir(): string {
  return path.join(CONTENT_ROOT, "glossary");
}

export function authorsDir(): string {
  return path.join(CONTENT_ROOT, "authors");
}

export function partsDir(): string {
  return path.join(CONTENT_ROOT, "parts");
}

export function glossaryTermPath(termId: string): string {
  return path.join(glossaryDir(), `${termId}.yaml`);
}

export function authorPath(authorId: string): string {
  return path.join(authorsDir(), `${authorId}.yaml`);
}

export function partPath(partId: string): string {
  return path.join(partsDir(), `${partId}.yaml`);
}
