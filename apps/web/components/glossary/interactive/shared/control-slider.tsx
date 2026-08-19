"use client";

import { cn } from "@/lib/utils";
import type React from "react";

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  // Display string for the current value (e.g. "1.4 AU"); defaults to the raw value.
  display?: string;
  // Token color name driving the thumb glow. Maps to a CSS var.
  thumb?: "cyan" | "teal" | "magenta" | "amber";
  disabled?: boolean;
  className?: string;
  id?: string;
}

const THUMB_VAR: Record<NonNullable<ControlSliderProps["thumb"]>, string> = {
  cyan: "var(--cyan)",
  teal: "var(--teal)",
  magenta: "var(--magenta)",
  amber: "var(--amber)",
};

// Labeled range slider in the Pandora palette. Reuses the global `.viz-range`
// thumb styling (see globals.css) and fills the track up to the current value
// with the chosen token color. The workhorse control for the dozens of
// "adjust one parameter and watch it change" figures.
export function ControlSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  display,
  thumb = "cyan",
  disabled = false,
  className,
  id,
}: ControlSliderProps) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const thumbColor = THUMB_VAR[thumb];

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[10px] font-mono uppercase tracking-wider text-muted"
        >
          {label}
        </label>
        <span className="text-[11px] font-mono tabular-nums text-foreground">
          {display ?? value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="viz-range w-full"
        style={
          {
            "--viz-thumb": thumbColor,
            background: `linear-gradient(90deg, color-mix(in oklab, ${thumbColor} 70%, transparent) ${pct}%, var(--border-strong) ${pct}%)`,
            borderRadius: "999px",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
