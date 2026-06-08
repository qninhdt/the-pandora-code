import fs from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/config";
import { ChapterMeta, type LocalizedChapter } from "../schemas/chapter-meta";
import { CONTENT_ROOT, chapterDir, chapterMdxPath, chapterMetaPath } from "./content-paths";
import { fileExists, listSubdirectories, parseYaml } from "./yaml-utils";

export function listChapterSlugs(): string[] {
  return listSubdirectories(path.join(CONTENT_ROOT, "chapters"));
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
  return chapters.sort((a, b) => {
    if (a.meta.part !== b.meta.part) {
      return a.meta.part.localeCompare(b.meta.part);
    }
    return a.meta.order - b.meta.order;
  });
}

export function listPublishedChapters(locale: Locale): LocalizedChapter[] {
  return listChapters(locale).filter((c) => c.meta.status === "published");
}

export function chapterMdxRelativePath(slug: string, locale: Locale): string {
  return path.relative(chapterDir(slug), chapterMdxPath(slug, locale));
}
