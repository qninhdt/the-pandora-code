"use client";

import { useId } from "react";

interface VizSliderProps {
  label: string;
  /** Formatted value shown on the right (e.g. "27 °C", "2.4 m"). */
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  /** CSS color (var or hex) for the value text + filled track. Defaults to cyan. */
  tone?: string;
  className?: string;
}

// Labelled range control: caption + tabular value above a gradient-filled track.
// Replaces the per-component `Slider` locals that Whittaker, Habitable, Froude,
// SquareCube, and others each re-rolled. Keyboard-accessible via the native
// range input; the filled portion tracks the value so the affordance reads at a
// glance.
export function VizSlider({
  label,
  display,
  min,
  max,
  step,
  value,
  onChange,
  tone = "var(--cyan)",
  className,
}: VizSliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-sans text-xs text-muted">
          {label}
        </label>
        <span className="font-display text-sm font-700 tabular-nums" style={{ color: tone }}>
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="viz-range w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        style={{
          background: `linear-gradient(to right, ${tone} ${pct}%, var(--border) ${pct}%)`,
          ["--viz-thumb" as string]: tone,
        }}
      />
    </div>
  );
}
