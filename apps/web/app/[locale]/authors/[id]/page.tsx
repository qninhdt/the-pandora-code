import { type Locale, isLocale } from "@/i18n/config";
import { getAuthor, listAuthorIds } from "@/lib/content/loader/author-loader";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface AuthorDetailProps {
  params: Promise<{ locale: string; id: string }>;
}

export function generateStaticParams() {
  const ids = listAuthorIds();
  return ["vi", "en"].flatMap((locale) => ids.map((id) => ({ locale, id })));
}

export default async function AuthorDetail({ params }: AuthorDetailProps) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const author = getAuthor(id, locale as Locale);
  if (!author) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header>
        <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--accent)]">
          {author.domain}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{author.name}</h1>
        <p className="mt-2 text-base text-[color:var(--muted)]">
          {author.title} · {author.institution}
        </p>
      </header>

      <section>
        <h2 className="text-xs font-mono uppercase tracking-wide text-[color:var(--muted)] mb-2">
          {locale === "vi" ? "Giới thiệu" : "Bio"}
        </h2>
        <p className="text-base leading-relaxed">{author.bio}</p>
      </section>

      {author.voice_traits.length > 0 ? (
        <section>
          <h2 className="text-xs font-mono uppercase tracking-wide text-[color:var(--muted)] mb-2">
            {locale === "vi" ? "Đặc trưng giọng văn" : "Voice traits"}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {author.voice_traits.map((trait) => (
              <li
                key={trait}
                className="text-xs px-2 py-1 rounded border border-[color:var(--border)] text-[color:var(--muted)]"
              >
                {trait}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {author.reader_contract ? (
        <section className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--accent)]/5 p-5">
          <h2 className="text-xs font-mono uppercase tracking-wide text-[color:var(--accent)] mb-2">
            {locale === "vi" ? "Cam kết với độc giả" : "Reader contract"}
          </h2>
          <p className="text-sm leading-relaxed">{author.reader_contract}</p>
        </section>
      ) : null}

      <Link href={`/${locale}/authors`} className="text-sm text-[color:var(--accent)] no-underline">
        ← {locale === "vi" ? "Tất cả tác giả" : "All authors"}
      </Link>
    </main>
  );
}
