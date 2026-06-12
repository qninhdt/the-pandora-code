import { type Locale, locales } from "@/i18n/config";
import type { Metadata } from "next";
import { getSiteUrl } from "./site-url";

// Truncate a definition/hook to a search-snippet length for meta descriptions
// without cutting mid-word.
export function clampDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 40 ? lastSpace : max).trimEnd()}…`;
}

interface PageMetaInput {
  locale: Locale;
  path: string; // locale-relative, e.g. "/chapters/where-is-pandora"
  title: string;
  description: string;
  /** Locales that actually have this page (for hreflang). Defaults to all. */
  availableLocales?: readonly Locale[];
  /** Absolute or root-relative OG image URL. Defaults to the route's OG image. */
  ogImage?: string;
}

// Build canonical + hreflang + OpenGraph/Twitter metadata for a localized page.
// Canonical points at the current locale; alternates cross-link the languages
// that genuinely exist so Google doesn't index a 404 alternate.
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  availableLocales = locales,
  ogImage,
}: PageMetaInput): Metadata {
  const base = getSiteUrl();
  const canonical = `${base}/${locale}${path}`;
  const languages: Record<string, string> = {};
  for (const loc of availableLocales) languages[loc] = `${base}/${loc}${path}`;

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "The Pandora Code",
      locale,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
