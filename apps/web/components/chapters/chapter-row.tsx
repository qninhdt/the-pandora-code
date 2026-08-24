"use client";

import { CanonBadge } from "@/components/classification/canon-badge";
import { OfflineAwareLink } from "@/components/offline/offline-aware-link";
import type { ClassificationKind } from "@/lib/content/schemas/shared";
import type { OfflineLocale } from "@/lib/offline/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export interface ChapterRowData {
  slug: string;
  href: string;
  locale?: OfflineLocale;
  title: string;
  payload: string;
  plateNo: string;
  published: boolean;
  coverSrc?: string | null;
  readingMin?: number | null;
  tier?: ClassificationKind | null;
}

interface ChapterRowProps {
  chapter: ChapterRowData;
  comingLabel: string;
  readingUnit: string;
}

// A single compact, uniform chapter row for the library index — deliberately
// flat and scannable (thumbnail + title + one-line payload + meta), unlike the
// landing's tall poster plates. Published rows link out; coming rows are dimmed
// and inert.
export function ChapterRow({ chapter, comingLabel, readingUnit }: ChapterRowProps) {
  const { published, coverSrc, plateNo, title, payload, readingMin, tier } = chapter;

  const inner = (
    <>
      {/* plate marginalia */}
      <span className="hidden w-10 shrink-0 self-start pt-1 font-sans text-[0.65rem] uppercase tracking-[0.22em] text-subtle sm:block">
        № {plateNo}
      </span>

      {/* thumbnail */}
      <div className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-lg border border-border sm:w-28">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden
            className="size-full"
            style={{
              background:
                "radial-gradient(120% 120% at 30% 20%, color-mix(in oklab, var(--cyan) 22%, transparent), transparent 60%), radial-gradient(120% 120% at 80% 90%, color-mix(in oklab, var(--magenta) 18%, transparent), var(--surface))",
            }}
          />
        )}
      </div>

      {/* title + payload + meta — single column so the description always has
          full width on every breakpoint (no right-side meta column to starve it) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-display text-base font-700 leading-snug tracking-tight text-foreground sm:text-lg">
          {title}
        </h3>
        <p className="mt-1 line-clamp-2 font-serif text-sm leading-relaxed text-muted">{payload}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {published ? (
            <>
              {tier ? <CanonBadge kind={tier} /> : null}
              {readingMin ? (
                <span className="font-sans text-xs tabular-nums text-subtle">
                  {readingMin} {readingUnit}
                </span>
              ) : null}
            </>
          ) : (
            <span className="rounded-full border border-border px-2.5 py-0.5 font-sans text-[0.6875rem] uppercase tracking-wider text-subtle">
              {comingLabel}
            </span>
          )}
        </div>
      </div>

      {published ? (
        <ArrowUpRight
          aria-hidden
          size={16}
          className="absolute right-3 top-3 text-cyan opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
      ) : null}
    </>
  );

  const shell = cn(
    "group relative flex items-stretch gap-4 rounded-xl border border-border bg-surface/40 p-3 transition-all duration-300 sm:gap-5 sm:p-4",
  );

  if (!published) {
    return <div className={cn(shell, "cursor-default opacity-55")}>{inner}</div>;
  }

  return (
    <OfflineAwareLink
      href={chapter.href}
      locale={chapter.locale}
      slug={chapter.slug}
      className={cn(
        shell,
        "no-underline hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface/70",
      )}
    >
      {inner}
    </OfflineAwareLink>
  );
}
