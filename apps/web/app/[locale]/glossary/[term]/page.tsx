import { type Locale, isLocale } from "@/i18n/config";
import { getGlossaryTerm, listGlossaryIds } from "@/lib/content/loader/glossary-loader";
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

export default async function GlossaryDetail({ params }: GlossaryDetailProps) {
  const { locale, term } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const entry = getGlossaryTerm(term, locale as Locale);
  if (!entry) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--accent)]">
        {entry.category}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{entry.label}</h1>
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
