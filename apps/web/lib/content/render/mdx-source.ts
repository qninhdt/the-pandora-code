import { docs } from "@/.source";
import type { Locale } from "@/i18n/config";
import { loader } from "fumadocs-core/source";

export const chapterSource = loader({
  baseUrl: "/chapters",
  source: docs.toFumadocsSource(),
});

export function getChapterMDX(slug: string, locale: Locale) {
  return chapterSource.getPage([slug, locale]);
}
