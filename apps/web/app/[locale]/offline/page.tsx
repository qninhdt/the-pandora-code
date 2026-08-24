import { OfflineLibrary } from "@/components/offline/offline-library";
import { JsonLd } from "@/components/seo/json-ld";
import { type Locale, isLocale } from "@/i18n/config";
import { listPublishedChapters } from "@/lib/content/loader/chapter-loader";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { createBreadcrumbListSchema } from "@/lib/seo/structured-data";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface OfflinePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: OfflinePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/offline",
    title: t("offline.libraryTitle"),
    description: t("offline.librarySubtitle"),
  });
}

export default async function OfflinePage({ params }: OfflinePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const chapters = listPublishedChapters(locale as Locale).map((chapter) => ({
    slug: chapter.meta.slug,
    title: chapter.title,
  }));
  const breadcrumb = createBreadcrumbListSchema([
    { name: t("nav.home"), item: `/${locale}` },
    { name: t("offline.libraryTitle"), item: `/${locale}/offline` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <nav aria-label="Breadcrumb" className="mb-8 font-sans text-xs text-subtle">
          <a href={`/${locale}`} className="hover:text-cyan">
            {t("nav.home")}
          </a>
          <span aria-hidden className="px-2">
            /
          </span>
          <span className="text-muted">{t("offline.libraryTitle")}</span>
        </nav>
        <h1 className="font-display text-4xl font-700 tracking-tight text-foreground sm:text-5xl">
          {t("offline.libraryTitle")}
        </h1>
        <p className="mt-3 max-w-2xl font-serif text-base leading-relaxed text-muted">
          {t("offline.librarySubtitle")}
        </p>
        <section className="mt-10" aria-label={t("offline.libraryTitle")}>
          <OfflineLibrary locale={locale} chapters={chapters} />
        </section>
      </main>
    </>
  );
}
