"use client";

import { useReadingHistory } from "@/lib/engagement/reading-store";
import type { OfflineLocale } from "@/lib/offline/types";
import { ArrowRight } from "lucide-react";
import { OfflineAwareLink } from "../offline/offline-aware-link";

export interface ContinueReadingItem {
  locale: OfflineLocale;
  slug: string;
  title: string;
  href: string;
}

export function ContinueReadingCard({
  items,
  label = "Continue reading",
}: { items: ContinueReadingItem[]; label?: string }) {
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

  return (
    <div className="min-h-20">
      {match && item ? (
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-xl border border-cyan/25 bg-surface/55 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="min-w-0">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-cyan">
              {label}
            </p>
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
      ) : null}
    </div>
  );
}
