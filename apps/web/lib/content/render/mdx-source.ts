import { docs } from "@/.source";
import type { Locale } from "@/i18n/config";
import { loader } from "fumadocs-core/source";
import { chapterDirname } from "../loader/chapter-index";

export const chapterSource = loader({
  baseUrl: "/chapters",
  source: docs.toFumadocsSource(),
});

export function getChapterMDX(slug: string, locale: Locale) {
  // Fumadocs derives its page path from the on-disk folder ("N-M-<slug>"), so
  // resolve the clean slug to that prefixed folder before looking it up.
  return chapterSource.getPage([chapterDirname(slug), locale]);
}
