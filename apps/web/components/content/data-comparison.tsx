import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  /** Optional secondary comparison value. */
  vs?: string;
  tone?: "cyan" | "teal" | "magenta" | "amber";
}

interface DataComparisonProps {
  stats: Stat[];
  className?: string;
}

// Quantitative stat grid — big glowing numbers with a label and optional
// comparison value (e.g. Pandora vs Earth gravity). Used for at-a-glance data.
export function DataComparison({ stats, className }: DataComparisonProps) {
  return (
    <div className={cn("my-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {stats.map((s, i) => {
        const c = `var(--${s.tone ?? "cyan"})`;
        return (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface/60 p-4 backdrop-blur-sm"
          >
            <p className="font-sans text-[0.65rem] uppercase tracking-wider text-subtle">
              {s.label}
            </p>
            <p
              className="mt-1 font-display text-3xl font-800 tabular-nums"
              style={{
                color: c,
                textShadow: `0 0 18px color-mix(in oklab, ${c} 45%, transparent)`,
              }}
            >
              {s.value}
            </p>
            {s.vs && (
              <p className="mt-1 font-sans text-xs text-muted">
                vs <span className="text-foreground">{s.vs}</span>
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
