import { SourceList } from "@/components/sources/source-list";
import type { Source } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { type RelatedChapterCard, RelatedChapters } from "./related-chapters";

export interface RelatedGlossaryChip {
  id: string;
  label: string;
}

interface RelatedMaterialsLabels {
  /** Section heading, e.g. "Related materials". */
  section: string;
  /** Sub-heading for the related chapters block. */
  relatedChapters: string;
  /** Sub-heading for the glossary chips block. */
  glossary: string;
  /** Sub-heading for the sources block. */
  sources: string;
}

interface RelatedMaterialsProps {
  locale: "vi" | "en";
  chapters: RelatedChapterCard[];
  glossary: RelatedGlossaryChip[];
  sources: Source[];
  labels: RelatedMaterialsLabels;
  className?: string;
}

/**
 * Aggregates the "further reading" surface for a chapter: cross-linked
 * chapters, the glossary terms it leans on, and its sources - all resolved
 * server-side from meta.yaml. Each sub-section hides itself when empty, and the
 * whole section disappears if there is nothing to show.
 */
export function RelatedMaterials({
  locale,
  chapters,
  glossary,
  sources,
  labels,
  className,
}: RelatedMaterialsProps) {
  const hasContent = chapters.length > 0 || glossary.length > 0 || sources.length > 0;
  if (!hasContent) return null;

  return (
    <section
      className={cn("reading-column mt-16 border-t border-border pt-8", className)}
      aria-label={labels.section}
    >
      <h2 className="mb-2 font-sans text-xs uppercase tracking-wider text-subtle">
        {labels.section}
      </h2>

      {chapters.length > 0 ? (
        <RelatedChapters
          chapters={chapters}
          locale={locale}
          heading={labels.relatedChapters}
          className="my-6"
        />
      ) : null}

      {glossary.length > 0 ? (
        <div className="my-6">
          <h3 className="mb-4 font-mono text-xs uppercase tracking-wide text-[color:var(--muted)]">
            {labels.glossary}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {glossary.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/${locale}/glossary/${g.id}`}
                  className="inline-flex rounded-full border border-[color:var(--border)] px-3 py-1 text-sm text-[color:var(--foreground)] no-underline transition-colors hover:bg-[color:var(--accent)]/10"
                >
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {sources.length > 0 ? (
        <SourceList
          sources={sources}
          locale={locale}
          heading={labels.sources}
          className="my-6 border-t-0 pt-0"
        />
      ) : null}
    </section>
  );
}
