"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Stat {
  label: string;
  value: string;
  /** Optional secondary comparison value. */
  vs?: string;
  /** Optional note when this is not a direct versus comparison. */
  note?: string;
  tone?: "cyan" | "teal" | "magenta" | "amber";
}

interface LegacyStatItem {
  label: string;
  value: string;
  note?: string;
  tone?: "cyan" | "teal" | "magenta" | "amber";
}

interface DataComparisonProps {
  stats?: Stat[];
  /** Legacy MDX shape kept for backward compatibility. */
  items?: LegacyStatItem[];
  className?: string;
}

// Quantitative stat grid - big glowing numbers with a label and optional
// comparison value (e.g. Pandora vs Earth gravity). Used for at-a-glance data.
export function DataComparison({ stats, items, className }: DataComparisonProps) {
  const t = useTranslations("viz.dataComparison");
  const normalizedStats: Stat[] =
    stats ??
    items?.map((item) => ({
      label: item.label,
      value: item.value,
      note: item.note,
      tone: item.tone,
    })) ??
    [];

  if (normalizedStats.length === 0) return null;

  return (
    <div className={cn("my-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {normalizedStats.map((s, i) => {
        const c = `var(--${s.tone ?? "cyan"})`;
        return (
          <div
            key={i}
            className="group/stat relative overflow-hidden rounded-xl border bg-surface/60 p-4 backdrop-blur-sm transition-colors"
            style={{
              borderColor: `color-mix(in oklab, ${c} 20%, var(--border))`,
              boxShadow: `inset 0 1px 0 0 color-mix(in oklab, ${c} 14%, transparent), 0 6px 28px -18px color-mix(in oklab, ${c} 60%, transparent)`,
            }}
          >
            {/* tone accent bleeding in from the top edge */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, color-mix(in oklab, ${c} 65%, transparent), transparent)`,
              }}
            />
            <p className="font-sans text-xs uppercase tracking-wider text-subtle">{s.label}</p>
            <p
              className="mt-1 font-display text-3xl font-800 tabular-nums leading-none"
              style={{
                color: c,
                textShadow: `0 0 18px color-mix(in oklab, ${c} 45%, transparent)`,
              }}
            >
              {s.value}
            </p>
            {s.note && <p className="mt-2 font-sans text-xs text-muted">{s.note}</p>}
            {!s.note && s.vs && (
              <p className="mt-2 font-sans text-xs text-muted">
                {t("vs")} <span className="font-600 text-foreground tabular-nums">{s.vs}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Alias for text-only stat grids.
export const StatGrid = DataComparison;
