import { locales } from "@/i18n/config";
import {
  getPublishedChapter,
  listChapterSlugs,
  listPublishedChapters,
} from "@/lib/content/loader/chapter-loader";
import { listGlossaryIds } from "@/lib/content/loader/glossary-loader";
import { buildLocalizedUrls } from "@/lib/seo/localized-urls";
import { getSiteUrl } from "@/lib/seo/site-url";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const chapters = listChapterSlugs();
  const glossary = listGlossaryIds();

  const publishedByLocale = new Map(
    locales.map((locale) => [locale, listPublishedChapters(locale)]),
  );
  const topicLocales = new Map<string, Set<(typeof locales)[number]>>();
  for (const [locale, localizedChapters] of publishedByLocale) {
    for (const chapter of localizedChapters) {
      for (const tag of chapter.meta.tags ?? []) {
        const available = topicLocales.get(tag) ?? new Set<(typeof locales)[number]>();
        available.add(locale);
        topicLocales.set(tag, available);
      }
    }
  }

  const entries: MetadataRoute.Sitemap = [];

  // Static routes present in every locale.
  const staticPaths = ["", "/chapters", "/glossary", "/author", "/timeline"];
  for (const p of staticPaths) {
    for (const loc of locales) {
      entries.push({
        url: buildLocalizedUrls({ locale: loc, path: p }).canonical,
        alternates: { languages: buildLocalizedUrls({ locale: loc, path: p }).languages },
      });
    }
  }

  // Published chapters: emit a per-locale entry only when that locale's MDX
  // exists, and cross-link hreflang only to the locales that actually have it.
  for (const slug of chapters) {
    const available = locales.filter((loc) => {
      return getPublishedChapter(slug, loc) !== null;
    });
    for (const loc of available) {
      entries.push({
        url: `${base}/${loc}/chapters/${slug}`,
        alternates: {
          languages: buildLocalizedUrls({
            locale: loc,
            path: `/chapters/${slug}`,
            availableLocales: available,
          }).languages,
        },
      });
    }
  }

  // Glossary terms: one YAML with localized fields → present in both locales.
  for (const id of glossary) {
    entries.push(
      ...locales.map((loc) => ({
        url: `${base}/${loc}/glossary/${id}`,
        alternates: {
          languages: buildLocalizedUrls({ locale: loc, path: `/glossary/${id}` }).languages,
        },
      })),
    );
  }

  // Topic tag pages.
  for (const [tag, availableSet] of topicLocales) {
    const available = [...availableSet];
    entries.push(
      ...available.map((loc) => ({
        url: `${base}/${loc}/topics/${tag}`,
        alternates: {
          languages: buildLocalizedUrls({
            locale: loc,
            path: `/topics/${tag}`,
            availableLocales: available,
          }).languages,
        },
      })),
    );
  }

  return entries;
}
