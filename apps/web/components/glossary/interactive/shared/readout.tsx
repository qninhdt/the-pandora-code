"use client";

import { cn } from "@/lib/utils";

interface ReadoutProps {
  label?: string;
  value: string | number;
  unit?: string;
  // Token color for the value text; defaults to cyan.
  accent?: "cyan" | "teal" | "magenta" | "amber" | "foreground";
  className?: string;
}

const accentClass: Record<NonNullable<ReadoutProps["accent"]>, string> = {
  cyan: "text-cyan",
  teal: "text-teal",
  magenta: "text-magenta",
  amber: "text-amber",
  foreground: "text-foreground",
};

// Monospace HUD chip for live numeric readouts (a value + unit, optional label).
// Shared so every figure's telemetry reads in one consistent voice.
export function Readout({ label, value, unit, accent = "cyan", className }: ReadoutProps) {
  return (
    <div
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded-lg border border-border/40 bg-void/70 px-2.5 py-1 backdrop-blur-md",
        className,
      )}
    >
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</span>
      )}
      <span className={cn("font-mono text-sm font-semibold tabular-nums", accentClass[accent])}>
        {value}
      </span>
      {unit && <span className="font-mono text-[10px] tracking-wide text-muted">{unit}</span>}
    </div>
  );
}
