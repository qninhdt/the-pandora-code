import { locales } from "@/i18n/config";
import { getChapter, listChapterSlugs } from "@/lib/content/loader/chapter-loader";
import { listGlossaryIds } from "@/lib/content/loader/glossary-loader";
import { getSiteUrl } from "@/lib/seo/site-url";
import type { MetadataRoute } from "next";

// Map a path-builder to a hreflang alternates record across the given locales.
// Next emits these as <xhtml:link rel="alternate" hreflang="..."> entries so
// Google serves the right language and treats en/vi as one canonical document.
function languageAlternates(path: (loc: string) => string, locs: readonly string[]) {
  const base = getSiteUrl();
  const languages: Record<string, string> = {};
  for (const loc of locs) languages[loc] = `${base}${path(loc)}`;
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const chapters = listChapterSlugs();
  const glossary = listGlossaryIds();

  const tags = new Set<string>();
  for (const slug of chapters) {
    const ch = getChapter(slug, "vi");
    for (const tag of ch?.meta.tags ?? []) tags.add(tag);
  }

  const entries: MetadataRoute.Sitemap = [];

  // Static routes present in every locale.
  const staticPaths = ["", "/chapters", "/glossary", "/author", "/timeline"];
  for (const p of staticPaths) {
    for (const loc of locales) {
      entries.push({
        url: `${base}/${loc}${p}`,
        alternates: { languages: languageAlternates((l) => `/${l}${p}`, locales) },
      });
    }
  }

  // Published chapters: emit a per-locale entry only when that locale's MDX
  // exists, and cross-link hreflang only to the locales that actually have it.
  for (const slug of chapters) {
    const available = locales.filter((loc) => {
      const c = getChapter(slug, loc);
      return c !== null && c.meta.status === "published";
    });
    for (const loc of available) {
      entries.push({
        url: `${base}/${loc}/chapters/${slug}`,
        alternates: { languages: languageAlternates((l) => `/${l}/chapters/${slug}`, available) },
      });
    }
  }

  // Glossary terms: one YAML with localized fields → present in both locales.
  for (const id of glossary) {
    entries.push(
      ...locales.map((loc) => ({
        url: `${base}/${loc}/glossary/${id}`,
        alternates: { languages: languageAlternates((l) => `/${l}/glossary/${id}`, locales) },
      })),
    );
  }

  // Topic tag pages.
  for (const tag of tags) {
    entries.push(
      ...locales.map((loc) => ({
        url: `${base}/${loc}/topics/${tag}`,
        alternates: { languages: languageAlternates((l) => `/${l}/topics/${tag}`, locales) },
      })),
    );
  }

  return entries;
}
