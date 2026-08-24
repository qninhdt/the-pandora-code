import { OfflineAwareLink } from "@/components/offline/offline-aware-link";
import type { LocalizedString } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export interface RelatedChapterCard {
  slug: string;
  title: LocalizedString;
  hook?: LocalizedString;
  readingTimeMin?: number;
}

interface RelatedChaptersProps {
  chapters: RelatedChapterCard[];
  heading?: string;
  className?: string;
}

export function RelatedChapters({ chapters = [], heading, className }: RelatedChaptersProps) {
  const locale = useLocale() as "vi" | "en";
  const t = useTranslations("chapter");
  const tCommon = useTranslations("common");

  if (chapters.length === 0) return null;
  return (
    <section className={cn("my-12", className)} aria-label={heading ?? "Related chapters"}>
      <h3 className="text-xs uppercase tracking-wide font-mono mb-4 text-[color:var(--muted)]">
        {heading ?? t("readNext")}
      </h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {chapters.map((c) => (
          <li key={c.slug}>
            <OfflineAwareLink
              href={`/${locale}/chapters/${c.slug}`}
              locale={locale}
              slug={c.slug}
              className="block rounded-[var(--radius-md)] border border-[color:var(--border)] p-4 transition-colors hover:bg-[color:var(--accent)]/5 no-underline"
            >
              <h4 className="text-base font-semibold text-[color:var(--foreground)] mb-1">
                {c.title[locale]}
              </h4>
              {c.hook ? (
                <p className="text-sm text-[color:var(--muted)] line-clamp-2">{c.hook[locale]}</p>
              ) : null}
              {c.readingTimeMin ? (
                <p className="mt-2 text-xs font-mono text-[color:var(--muted)]">
                  {tCommon("readingTime", { minutes: c.readingTimeMin })}
                </p>
              ) : null}
            </OfflineAwareLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
