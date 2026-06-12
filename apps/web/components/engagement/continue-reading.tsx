"use client";

import { useReadingHistory } from "@/lib/engagement/use-engagement";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ContinueReadingProps {
  locale: "vi" | "en";
  labels: { heading: string; resume: string };
  /** Max cards to show. */
  limit?: number;
}

// "Continue reading" surface: shows the most recently-read chapters that aren't
// finished (scrollPct < 0.95) for the current locale. Renders nothing until
// mounted + history exists, so it never causes a hydration mismatch or an
// empty placeholder on a first visit.
export function ContinueReading({ locale, labels, limit = 3 }: ContinueReadingProps) {
  const history = useReadingHistory();
  const items = history.filter((e) => e.locale === locale && e.scrollPct < 0.95).slice(0, limit);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-subtle">
        {labels.heading}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <Link
            key={e.slug}
            href={`/${locale}/chapters/${e.slug}`}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface/50 p-4 transition-colors hover:border-cyan/50 hover:bg-surface"
          >
            <span className="font-display text-base font-700 leading-snug text-foreground">
              {e.title}
            </span>
            <span className="mt-auto flex items-center justify-between gap-2">
              <span
                aria-hidden
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-border"
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${Math.round(e.scrollPct * 100)}%`,
                    background: "linear-gradient(90deg, var(--cyan), var(--teal))",
                  }}
                />
              </span>
              <span className="flex items-center gap-1 font-sans text-xs text-cyan">
                {labels.resume}
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
