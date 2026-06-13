"use client";

import type { CSSProperties, ReactNode } from "react";

// Standardized SVG text scale. Replaces the raw `fontSize: 8/9/10` and
// `text-[0.6rem]` values that were scattered, inconsistent, and too small on
// mobile across every figure. One ladder, used everywhere.
const SCALE = {
  micro: 7.5, // ticks, dense annotations
  small: 8.5, // axis labels, in-figure captions
  base: 10, // primary values / headings inside SVG
  xlarge: 14, // hero readouts (e.g. the confidence percentage)
} as const;

export type VizTextSize = keyof typeof SCALE;

interface VizTextProps {
  x: number;
  y: number;
  children: ReactNode;
  size?: VizTextSize;
  /** Token hue name (cyan/teal/…) or full CSS color. Defaults to subtle. */
  tone?: string;
  anchor?: "start" | "middle" | "end";
  /** Tabular numbers for aligned readouts. */
  numeric?: boolean;
  weight?: number;
  transform?: string;
  style?: CSSProperties;
  className?: string;
}

function resolveTone(tone?: string): string {
  if (!tone) return "var(--subtle)";
  // bare token name → CSS var; anything else (var(...), #hex) passes through.
  return /^[a-z-]+$/.test(tone) ? `var(--${tone})` : tone;
}

// A token-styled SVG <text>. Use for any label/value/annotation inside a figure.
export function VizText({
  x,
  y,
  children,
  size = "small",
  tone,
  anchor = "start",
  numeric = false,
  weight,
  transform,
  style,
  className,
}: VizTextProps) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      transform={transform}
      className={`${numeric ? "tabular-nums " : ""}font-sans${className ? ` ${className}` : ""}`}
      style={{ fill: resolveTone(tone), fontSize: SCALE[size], fontWeight: weight, ...style }}
    >
      {children}
    </text>
  );
}

// A numeric axis tick — micro size, subtle tone, tabular figures.
export function VizTick({
  x,
  y,
  children,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <VizText x={x} y={y} size="micro" anchor={anchor} numeric>
      {children}
    </VizText>
  );
}

export { SCALE as vizTextScale };
