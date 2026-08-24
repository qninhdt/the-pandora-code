import { GLOSSARY_VISUALIZATION_IDS } from "@/components/glossary/interactive/registry";
import { GlossaryVisualizer } from "@/components/glossary/interactive/visualizer";
import { JsonLd } from "@/components/seo/json-ld";
import { type Locale, isLocale, locales } from "@/i18n/config";
import { getGlossaryCoverImage } from "@/lib/content/loader/glossary-cover";
import { getGlossaryTerm, listGlossaryIds } from "@/lib/content/loader/glossary-loader";
import { glossaryTagLabel } from "@/lib/content/schemas/glossary-tags";
import { buildPageMetadata, clampDescription } from "@/lib/seo/page-metadata";
import { createBreadcrumbListSchema } from "@/lib/seo/structured-data";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface GlossaryDetailProps {
  params: Promise<{ locale: string; term: string }>;
}

export function generateStaticParams() {
  const ids = listGlossaryIds();
  return ["vi", "en"].flatMap((locale) => ids.map((term) => ({ locale, term })));
}

export async function generateMetadata({ params }: GlossaryDetailProps): Promise<Metadata> {
  const { locale, term } = await params;
  if (!isLocale(locale)) return {};
  const loc = locale as Locale;
  const entry = getGlossaryTerm(term, loc);
  if (!entry) return {};
  const cover = getGlossaryCoverImage(term);
  const available = locales.filter((candidate) => getGlossaryTerm(term, candidate) !== null);
  return buildPageMetadata({
    locale: loc,
    path: `/glossary/${term}`,
    title: entry.label,
    description: clampDescription(entry.definition),
    availableLocales: available,
    ogImage: cover,
  });
}

export default async function GlossaryDetail({ params }: GlossaryDetailProps) {
  const { locale, term } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const entry = getGlossaryTerm(term, locale as Locale);
  if (!entry) notFound();
  const cover = getGlossaryCoverImage(term);
  const hasVisualizer = (GLOSSARY_VISUALIZATION_IDS as readonly string[]).includes(term);
  const t = await getTranslations("page.glossary");
  const tRoot = await getTranslations({ locale });
  const breadcrumb = createBreadcrumbListSchema([
    { name: tRoot("nav.home"), item: `/${locale}` },
    { name: tRoot("nav.glossary"), item: `/${locale}/glossary` },
    { name: entry.label, item: `/${locale}/glossary/${term}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <main className="mx-auto max-w-3xl space-y-6 px-6 pb-12 pt-32">
        <nav aria-label="Breadcrumb" className="font-sans text-xs text-subtle">
          <a href={`/${locale}`} className="hover:text-cyan">
            {tRoot("nav.home")}
          </a>
          <span aria-hidden className="px-2">
            /
          </span>
          <a href={`/${locale}/glossary`} className="hover:text-cyan">
            {tRoot("nav.glossary")}
          </a>
          <span aria-hidden className="px-2">
            /
          </span>
          <span className="text-muted">{entry.label}</span>
        </nav>
        {cover && (
          <div className="relative mb-2 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[color:var(--border)]">
            <img src={cover} alt="" className="size-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, var(--background) 4%, transparent 55%)",
              }}
            />
          </div>
        )}
        <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--accent)]">
          {entry.category}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{entry.label}</h1>
        {entry.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-overlay)] px-2.5 py-0.5 text-xs font-medium text-[color:var(--muted)]"
              >
                {glossaryTagLabel(tag, locale as Locale)}
              </span>
            ))}
          </div>
        ) : null}
        <p className="text-base leading-relaxed">{entry.definition}</p>
        {hasVisualizer && (
          <div className="relative mb-2 w-full">
            <GlossaryVisualizer term={term} />
          </div>
        )}
        {entry.see_also.length > 0 ? (
          <section className="border-t border-[color:var(--border)] pt-6">
            <h2 className="text-xs font-mono uppercase tracking-wide text-[color:var(--muted)] mb-3">
              {t("seeAlso")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {entry.see_also.map((id) => (
                <li key={id}>
                  <Link
                    href={`/${locale}/glossary/${id}`}
                    className="text-sm rounded border border-[color:var(--border)] px-2 py-1 no-underline hover:bg-[color:var(--accent)]/10"
                  >
                    {id}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <Link
          href={`/${locale}/glossary`}
          className="text-sm text-[color:var(--accent)] no-underline"
        >
          ← {t("allTerms")}
        </Link>
      </main>
    </>
  );
}
