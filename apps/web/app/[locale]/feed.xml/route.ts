import { type Locale, isLocale } from "@/i18n/config";
import { listPublishedChapters } from "@/lib/content/loader/chapter-loader";
import { getSiteUrl } from "@/lib/seo/site-url";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "vi" }];
}

// Escape the five XML predefined entities so chapter titles/hooks with &, <, >,
// quotes can't break the feed document.
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : "en";
  const base = getSiteUrl();
  const feedUrl = `${base}/${loc}/feed.xml`;
  const siteUrl = `${base}/${loc}`;

  const t = await getTranslations({ locale: loc });
  const title = t("feed.title");
  const description = t("feed.description");

  const items = listPublishedChapters(loc)
    .map((c) => {
      const link = `${base}/${loc}/chapters/${c.meta.slug}`;
      return `    <item>
      <title>${xmlEscape(c.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${xmlEscape(c.hook)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${siteUrl}</link>
    <description>${xmlEscape(description)}</description>
    <language>${loc}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
