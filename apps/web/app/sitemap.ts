import { locales } from "@/i18n/config";
import { getChapter, listChapterSlugs } from "@/lib/content/loader/chapter-loader";
import { listGlossaryIds } from "@/lib/content/loader/glossary-loader";
import { listPartIds } from "@/lib/content/loader/part-loader";
import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pandora.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const chapters = listChapterSlugs();
  const glossary = listGlossaryIds();
  const parts = listPartIds();

  const tags = new Set<string>();
  for (const slug of chapters) {
    const ch = getChapter(slug, "vi");
    for (const tag of ch?.meta.tags ?? []) tags.add(tag);
  }

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    entries.push({ url: `${BASE}/${locale}` });
    entries.push({ url: `${BASE}/${locale}/chapters` });
    entries.push({ url: `${BASE}/${locale}/glossary` });
    entries.push({ url: `${BASE}/${locale}/author` });
    entries.push({ url: `${BASE}/${locale}/timeline` });
    entries.push({ url: `${BASE}/${locale}/parts` });
    for (const slug of chapters) entries.push({ url: `${BASE}/${locale}/chapters/${slug}` });
    for (const id of glossary) entries.push({ url: `${BASE}/${locale}/glossary/${id}` });
    for (const id of parts) entries.push({ url: `${BASE}/${locale}/parts/${id}` });
    for (const tag of tags) entries.push({ url: `${BASE}/${locale}/topics/${tag}` });
  }
  return entries;
}
