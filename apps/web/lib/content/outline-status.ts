import type { Locale } from "@/i18n/config";
import { listPublishedChapters } from "./loader/chapter-loader";
import { OUTLINE, type OutlineChapter } from "./outline";

export interface OutlineChapterWithStatus extends OutlineChapter {
  plateNo: string;
  published: boolean;
}

export interface OutlinePartWithStatus {
  id: string;
  label: { vi: string; en: string };
  chapters: OutlineChapterWithStatus[];
}

// Merge the static outline with which chapters are actually published, so the
// browser renders the full map with published entries clickable. Plate numbers
// run sequentially across the whole book.
export function getOutlineWithStatus(locale: Locale): OutlinePartWithStatus[] {
  const published = new Set(listPublishedChapters(locale).map((c) => c.meta.slug));
  let n = 0;
  return OUTLINE.map((part) => ({
    id: part.id,
    label: part.label,
    chapters: part.chapters.map((ch) => {
      n += 1;
      return {
        ...ch,
        plateNo: String(n).padStart(2, "0"),
        published: published.has(ch.slug),
      };
    }),
  }));
}
