import { CanonBadge } from "@/components/classification/canon-badge";
import { OfflineAwareLink } from "@/components/offline/offline-aware-link";
import { JsonLd } from "@/components/seo/json-ld";
import { type Locale, isLocale, locales } from "@/i18n/config";
import { listPublishedChapters } from "@/lib/content/loader/chapter-loader";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { createBreadcrumbListSchema } from "@/lib/seo/structured-data";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface TopicPageProps {
  params: Promise<{ locale: string; tag: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { locale, tag } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return buildPageMetadata({
    locale: locale as Locale,
    path: `/topics/${tag}`,
    title: t("page.topics.title", { tag }),
    description: t("page.topics.subtitle"),
    availableLocales: locales.filter((candidate) => collectTags(candidate).includes(tag)),
  });
}

function collectTags(locale: Locale): string[] {
  const tags = new Set<string>();
  for (const chapter of listPublishedChapters(locale)) {
    for (const tag of chapter.meta.tags ?? []) tags.add(tag);
  }
  return Array.from(tags);
}

export function generateStaticParams() {
  return locales.flatMap((locale) => collectTags(locale).map((tag) => ({ locale, tag })));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { locale, tag } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("page.topics");
  const tRoot = await getTranslations({ locale });
  const breadcrumb = createBreadcrumbListSchema([
    { name: tRoot("nav.home"), item: `/${locale}` },
    { name: tRoot("page.topics.title", { tag }), item: `/${locale}/topics/${tag}` },
  ]);

  const chapters = listPublishedChapters(locale as Locale).filter((chapter) =>
    (chapter.meta.tags ?? []).includes(tag),
  );

  return (
    <>
      <JsonLd data={breadcrumb} />
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
        <header>
          <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--muted)]">
            {t("topicKicker")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">#{tag}</h1>
        </header>

        {chapters.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">{t("empty")}</p>
        ) : (
          <ul className="space-y-3">
            {chapters.map((c) => (
              <li
                key={c.meta.slug}
                className="rounded-[var(--radius-md)] border border-[color:var(--border)] p-4"
              >
                <OfflineAwareLink
                  href={`/${locale}/chapters/${c.meta.slug}`}
                  locale={locale as Locale}
                  slug={c.meta.slug}
                  className="no-underline text-[color:var(--foreground)]"
                >
                  <h2 className="text-lg font-semibold">{c.title}</h2>
                  <div className="mt-2">
                    <CanonBadge kind="canon">
                      {`Canon ${c.meta.classification.canon_pct}%`}
                    </CanonBadge>
                  </div>
                </OfflineAwareLink>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
