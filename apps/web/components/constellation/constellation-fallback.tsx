import { type Locale } from "@/i18n/config";
import { listPublishedChapters } from "@/lib/content/loader/chapter-loader";
import { listGlossaryTerms } from "@/lib/content/loader/glossary-loader";
import { getOutlineWithStatus } from "@/lib/content/outline";
import Link from "next/link";

interface ConstellationFallbackProps {
  locale: Locale;
}

// Accessible, no-JS navigation of the same graph the 3D scene shows: every
// published chapter grouped by Part, plus the full glossary. This is the
// canonical reachability path — the constellation must never be the ONLY way to
// reach content — and also what renders on low-power / reduced-motion devices.
export function ConstellationFallback({ locale }: ConstellationFallbackProps) {
  const publishedSlugs = new Set(listPublishedChapters(locale).map((c) => c.meta.slug));
  const outline = getOutlineWithStatus(locale).filter((p) =>
    p.chapters.some((c) => publishedSlugs.has(c.slug)),
  );
  const terms = listGlossaryTerms(locale);

  return (
    <div className="space-y-10">
      <nav aria-label={locale === "vi" ? "Chương theo phần" : "Chapters by part"}>
        {outline.map((part) => {
          const chapters = part.chapters.filter((c) => publishedSlugs.has(c.slug));
          if (chapters.length === 0) return null;
          return (
            <section key={part.id} className="mb-6">
              <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[color:var(--accent)]">
                {part.label[locale]}
              </h2>
              <ul className="flex flex-col gap-1">
                {chapters.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/${locale}/chapters/${c.slug}`}
                      className="text-sm text-foreground no-underline hover:text-cyan"
                    >
                      {c.title[locale]}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </nav>

      <section>
        <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-[color:var(--accent)]">
          {locale === "vi" ? "Thuật ngữ" : "Glossary"}
        </h2>
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {terms.map((t) => (
            <li key={t.id}>
              <Link
                href={`/${locale}/glossary/${t.id}`}
                className="text-sm text-muted no-underline hover:text-cyan"
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
