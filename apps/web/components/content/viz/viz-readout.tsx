"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface VizReadoutProps {
  /** Small uppercase caption. */
  label: string;
  /** Primary value — string, number, or a small node (swatch + text). */
  value: ReactNode;
  /** Optional fine-print note under the value. */
  note?: string;
  /** CSS color (var or hex) for the value + tinted frame. Defaults to cyan. */
  tone?: string;
  /** Tint the box border/background with the tone (used for "result" readouts). */
  tinted?: boolean;
  className?: string;
}

// A single label→value readout box. Replaces the ~12 inline readout rows that
// HalfLife, Isochron, Superconductor, Whittaker, Froude, SquareCube, etc. each
// hand-rolled. `tinted` gives the highlighted "answer" treatment (glowing frame
// in the tone); the default is the quiet bordered box.
export function VizReadout({
  label,
  value,
  note,
  tone = "var(--cyan)",
  tinted = false,
  className,
}: VizReadoutProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-lg border px-3 py-2", className)}
      style={
        tinted
          ? {
              borderColor: `color-mix(in oklab, ${tone} 45%, transparent)`,
              background: `color-mix(in oklab, ${tone} 10%, var(--void))`,
              boxShadow: `inset 0 1px 0 0 color-mix(in oklab, ${tone} 25%, transparent), 0 4px 18px -10px color-mix(in oklab, ${tone} 70%, transparent)`,
            }
          : {
              borderColor: "var(--border)",
              background: "color-mix(in oklab, var(--void) 30%, transparent)",
              boxShadow: "inset 0 1px 0 0 color-mix(in oklab, var(--foreground) 6%, transparent)",
            }
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-sans text-xs text-muted">{label}</span>
        <span
          className="font-display text-lg font-700 tabular-nums leading-none"
          style={{ color: tone }}
        >
          {value}
        </span>
      </div>
      {note ? (
        <span className="mt-1 block font-sans text-[0.7rem] uppercase tracking-wider text-subtle">
          {note}
        </span>
      ) : null}
    </div>
  );
}
