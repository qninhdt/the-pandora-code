import { GlassPanel } from "@/components/codex/glass-panel";
import { GlossaryBrowser } from "@/components/glossary/glossary-browser";
import { PageBackground } from "@/components/layout/page-background";
import { type Locale, isLocale } from "@/i18n/config";
import { getGlossaryCoverImage } from "@/lib/content/loader/glossary-cover";
import { listGlossaryTerms } from "@/lib/content/loader/glossary-loader";
import { getPageBackground } from "@/lib/content/loader/page-background";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface GlossaryIndexProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: GlossaryIndexProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/glossary",
    title: t("page.glossary.title"),
    description: t("page.glossary.subtitle"),
  });
}

export default async function GlossaryIndex({ params }: GlossaryIndexProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations({ locale });
  const terms = listGlossaryTerms(loc);
  const bg = getPageBackground("glossary");
  const covers: Record<string, string | null> = {};
  for (const term of terms) covers[term.id] = getGlossaryCoverImage(term.id) ?? null;

  return (
    <>
      {bg && <PageBackground src={bg} />}
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pt-32">
        <header className="mb-8">
          <h1 className="font-display text-4xl font-700 tracking-tight text-foreground sm:text-5xl">
            {t("page.glossary.title")}
          </h1>
          <p className="mt-3 max-w-2xl font-serif text-base leading-relaxed text-muted">
            {t("page.glossary.subtitle")}
          </p>
        </header>

        {terms.length === 0 ? (
          <GlassPanel depth={2} className="grid min-h-48 place-items-center p-10 text-center">
            <p className="font-serif text-lg text-muted">{t("common.noResults")}</p>
          </GlassPanel>
        ) : (
          <GlossaryBrowser
            terms={terms}
            locale={loc}
            covers={covers}
            labels={{
              searchPlaceholder: t("page.glossary.searchPlaceholder"),
              allTags: t("page.glossary.allTags"),
              noResults: t("common.noResults"),
              resultCount: t.raw("page.glossary.resultCount"),
              untagged: t("page.glossary.untagged"),
            }}
          />
        )}
      </main>
    </>
  );
}
