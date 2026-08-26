"use client";

import { cn } from "@/lib/utils";

interface LegendItem {
  // Any CSS color string — pass a token like "var(--cyan)" to stay on-palette.
  color: string;
  label: string;
}

interface LegendProps {
  items: ReadonlyArray<LegendItem>;
  // Lay items out in a column instead of wrapping inline.
  vertical?: boolean;
  className?: string;
}

// Color-key legend (dot + label rows) shared by every graph/diagram figure.
export function Legend({ items, vertical = false, className }: LegendProps) {
  return (
    <div
      className={cn(
        "flex gap-x-3 gap-y-1 rounded-lg border border-border/40 bg-void/70 px-2.5 py-1.5 backdrop-blur-md",
        vertical ? "flex-col" : "flex-row flex-wrap items-center",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full"
            style={{
              background: item.color,
              boxShadow: `0 0 8px -1px ${item.color}`,
            }}
          />
          <span className="font-mono text-[10px] tracking-wide text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
