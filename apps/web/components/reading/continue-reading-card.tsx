"use client";

import { useReadingHistory } from "@/lib/engagement/reading-store";
import type { OfflineLocale } from "@/lib/offline/types";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { OfflineAwareLink } from "../offline/offline-aware-link";

export interface ContinueReadingItem {
  locale: OfflineLocale;
  slug: string;
  title: string;
  href: string;
}

/**
 * "Pick up where you left off" bar. Renders nothing until reading history is
 * hydrated and actually matches this page's chapters — an always-present
 * placeholder box left an unexplained gap under the header for every reader who
 * had not started a chapter yet. The caller supplies the container, so the bar
 * lines up with the page's own content width.
 */
export function ContinueReadingCard({
  items,
  label = "Continue reading",
  className,
}: { items: ContinueReadingItem[]; label?: string; className?: string }) {
  const history = useReadingHistory();
  const item = history.find(
    (location) =>
      !location.completed &&
      items.some(
        (candidate) => candidate.locale === location.locale && candidate.slug === location.slug,
      ),
  );
  const match = item
    ? items.find((candidate) => candidate.locale === item.locale && candidate.slug === item.slug)
    : undefined;

  if (!match || !item) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border border-cyan/25 bg-surface/55 px-4 py-3 backdrop-blur-sm sm:px-6",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-cyan">{label}</p>
        <p className="mt-1 truncate font-display text-base text-foreground">{match.title}</p>
      </div>
      <OfflineAwareLink
        href={match.href}
        locale={match.locale}
        slug={match.slug}
        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cyan/40 px-3 py-1.5 font-sans text-xs text-cyan no-underline hover:bg-cyan/10"
      >
        {Math.round(item.progress * 100)}%
        <ArrowRight size={14} aria-hidden />
      </OfflineAwareLink>
    </div>
  );
}
