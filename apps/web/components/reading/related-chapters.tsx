import type { LocalizedString } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface RelatedChapterCard {
  slug: string;
  title: LocalizedString;
  hook?: LocalizedString;
  reading_time_min?: number;
}

interface RelatedChaptersProps {
  chapters: RelatedChapterCard[];
  locale: "vi" | "en";
  heading?: string;
  className?: string;
}

export function RelatedChapters({ chapters, locale, heading, className }: RelatedChaptersProps) {
  if (chapters.length === 0) return null;
  return (
    <section className={cn("my-12", className)} aria-label={heading ?? "Related chapters"}>
      <h3 className="text-xs uppercase tracking-wide font-mono mb-4 text-[color:var(--muted)]">
        {heading ?? (locale === "vi" ? "Đọc tiếp" : "Read next")}
      </h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {chapters.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/${locale}/chapters/${c.slug}`}
              className="block rounded-[var(--radius-md)] border border-[color:var(--border)] p-4 transition-colors hover:bg-[color:var(--accent)]/5 no-underline"
            >
              <h4 className="text-base font-semibold text-[color:var(--foreground)] mb-1">
                {c.title[locale]}
              </h4>
              {c.hook ? (
                <p className="text-sm text-[color:var(--muted)] line-clamp-2">{c.hook[locale]}</p>
              ) : null}
              {c.reading_time_min ? (
                <p className="mt-2 text-xs font-mono text-[color:var(--muted)]">
                  {c.reading_time_min} {locale === "vi" ? "phút đọc" : "min read"}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
