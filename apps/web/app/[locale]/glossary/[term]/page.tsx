import { type Locale, isLocale, locales } from "@/i18n/config";
import { getGlossaryCoverImage } from "@/lib/content/loader/glossary-cover";
import { getGlossaryTerm, listGlossaryIds } from "@/lib/content/loader/glossary-loader";
import { glossaryTagLabel } from "@/lib/content/schemas/glossary-tags";
import { buildPageMetadata, clampDescription } from "@/lib/seo/page-metadata";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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
  return buildPageMetadata({
    locale: loc,
    path: `/glossary/${term}`,
    title: entry.label,
    description: clampDescription(entry.definition),
    availableLocales: locales,
  });
}

export default async function GlossaryDetail({ params }: GlossaryDetailProps) {
  const { locale, term } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const entry = getGlossaryTerm(term, locale as Locale);
  if (!entry) notFound();
  const cover = getGlossaryCoverImage(term);

  return (
    <main className="mx-auto max-w-3xl px-6 pb-12 pt-32 space-y-6">
      {cover && (
        <div className="relative mb-2 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[color:var(--border)]">
          <img src={cover} alt="" className="size-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, var(--background) 4%, transparent 55%)" }}
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
      {entry.see_also.length > 0 ? (
        <section className="border-t border-[color:var(--border)] pt-6">
          <h2 className="text-xs font-mono uppercase tracking-wide text-[color:var(--muted)] mb-3">
            {locale === "vi" ? "Xem thêm" : "See also"}
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
        ← {locale === "vi" ? "Tất cả thuật ngữ" : "All terms"}
      </Link>
    </main>
  );
}
