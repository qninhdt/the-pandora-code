import fs from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/config";
import { ChapterMeta, type LocalizedChapter } from "../schemas/chapter-meta";
import { chapterOrderPrefix, listChapterSlugsFromIndex } from "./chapter-index";
import { chapterDir, chapterMdxPath, chapterMetaPath } from "./content-paths";
import { fileExists, parseYaml } from "./yaml-utils";

// Returns clean slugs (URL params), resolved from each meta.yaml via the index -
// the on-disk folders carry an "N-M-" order prefix that never appears in URLs.
export function listChapterSlugs(): string[] {
  return listChapterSlugsFromIndex();
}

export function loadChapterMeta(slug: string): ChapterMeta {
  return parseYaml(ChapterMeta, chapterMetaPath(slug));
}

export function getChapter(slug: string, locale: Locale): LocalizedChapter | null {
  const metaPath = chapterMetaPath(slug);
  if (!fs.existsSync(metaPath)) return null;
  const meta = loadChapterMeta(slug);
  const mdxPath = chapterMdxPath(slug, locale);
  if (!fileExists(mdxPath)) return null;
  return {
    meta,
    locale,
    title: meta.title[locale],
    subtitle: meta.subtitle?.[locale],
    hook: meta.hook[locale],
    mdxPath,
  };
}

export function listChapters(locale: Locale): LocalizedChapter[] {
  const chapters: LocalizedChapter[] = [];
  for (const slug of listChapterSlugs()) {
    const chapter = getChapter(slug, locale);
    if (chapter) chapters.push(chapter);
  }
  // Sort by the on-disk "N-M-" folder prefix (part N, order M) - the
  // authoritative book order. meta.part is a string id and meta.order is
  // inconsistent across chapters, so neither can be trusted for sequencing.
  return chapters.sort((a, b) => {
    const pa = chapterOrderPrefix(a.meta.slug);
    const pb = chapterOrderPrefix(b.meta.slug);
    if (pa && pb) {
      return pa.part - pb.part || pa.order - pb.order;
    }
    if (pa) return -1;
    if (pb) return 1;
    return a.meta.slug.localeCompare(b.meta.slug);
  });
}

export function listPublishedChapters(locale: Locale): LocalizedChapter[] {
  return listChapters(locale).filter((c) => c.meta.status === "published");
}

export function chapterMdxRelativePath(slug: string, locale: Locale): string {
  return path.relative(chapterDir(slug), chapterMdxPath(slug, locale));
}
