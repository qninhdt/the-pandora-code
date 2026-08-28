import fs from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/config";
import { chapterPosition } from "../outline";
import { estimateReadingTimeCached } from "../reading-time";
import { ChapterMeta, type LocalizedChapter } from "../schemas/chapter-meta";
import { listChapterSlugsFromIndex } from "./chapter-index";
import { chapterDir, chapterMdxPath, chapterMetaPath } from "./content-paths";
import { fileExists, parseYaml } from "./yaml-utils";

// Returns clean slugs (URL params) from the chapter index. The on-disk folders
// use the same slug; book order is owned by OUTLINE, not by directory names.
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
  const source = fs.readFileSync(mdxPath, "utf8");
  const readingTime = estimateReadingTimeCached(mdxPath, source, locale, {
    figureCount: meta.figures.length,
    override: meta.reading_time_override?.[locale],
  });
  return {
    meta,
    locale,
    title: meta.title[locale],
    subtitle: meta.subtitle?.[locale],
    hook: meta.hook[locale],
    mdxPath,
    readingTimeMin: readingTime.minutes,
    readingTimeDiagnostics: readingTime.diagnostics,
  };
}

/** Public route resolver. Tooling and preview code should continue using getChapter. */
export function getPublishedChapter(slug: string, locale: Locale): LocalizedChapter | null {
  const chapter = getChapter(slug, locale);
  return chapter?.meta.status === "published" ? chapter : null;
}

export function listChapters(locale: Locale): LocalizedChapter[] {
  const chapters: LocalizedChapter[] = [];
  for (const slug of listChapterSlugs()) {
    const chapter = getChapter(slug, locale);
    if (chapter) chapters.push(chapter);
  }
  // Book order is the array order of OUTLINE, the single source of sequence.
  // A chapter absent from the outline sorts last; the content validator fails
  // the build on that case, so it only ever shows up mid-authoring.
  return chapters.sort((a, b) => {
    const pa = chapterPosition(a.meta.slug);
    const pb = chapterPosition(b.meta.slug);
    if (pa && pb) {
      return pa.partIndex - pb.partIndex || pa.chapterIndex - pb.chapterIndex;
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
