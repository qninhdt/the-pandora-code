"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { HORIZON_YEARS } from "./regeneration-race-model";

// Geometry of the standing-density plot. Kept beside the figure so the component
// file stays under the size cap; the parent owns the model state and hands in the
// finished trajectory plus its translated labels.
export const W = 340;
export const H = 176;
const PAD_L = 34;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const xAt = (year: number) => PAD_L + (year / HORIZON_YEARS) * PLOT_W;
const yAt = (density: number) => PAD_T + (1 - density) * PLOT_H;

interface RegenerationRacePlotProps {
  /** Standing density per year, index = years elapsed. */
  density: number[];
  /** Standing density below which the giant component dies. */
  critical: number;
  /** Year the network crosses the threshold, or null if it never does. */
  shatterYear: number | null;
  /** CSS color for the trajectory. */
  tone: string;
  idBase: string;
  ariaLabel: string;
  criticalLabel: string;
  axisFull: string;
  axisGone: string;
  axisYears: string;
}

export function RegenerationRacePlot({
  density,
  critical,
  shatterYear,
  tone,
  idBase,
  ariaLabel,
  criticalLabel,
  axisFull,
  axisGone,
  axisYears,
}: RegenerationRacePlotProps) {
  const path = density
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(d).toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full sm:w-3/5" role="img" aria-label={ariaLabel}>
      <GlowDefs idBase={idBase} tones={["teal", "magenta", "amber"]} />

      <rect
        x={PAD_L}
        y={PAD_T}
        width={PLOT_W}
        height={PLOT_H}
        fill={glowUrl(idBase, "grid")}
        stroke="var(--border)"
        strokeWidth={0.8}
      />

      {/* the critical standing density — below this the web stops conducting */}
      <line
        x1={PAD_L}
        y1={yAt(critical)}
        x2={W - PAD_R}
        y2={yAt(critical)}
        stroke="var(--magenta)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <VizText x={W - PAD_R} y={yAt(critical) - 4} size="micro" tone="magenta" anchor="end">
        {criticalLabel}
      </VizText>

      <path
        d={path}
        fill="none"
        stroke={tone}
        strokeWidth={2}
        strokeLinejoin="round"
        filter={glowUrl(idBase, "bloom")}
      />

      {/* where the giant component falls off the cliff */}
      {shatterYear !== null && (
        <g>
          <line
            x1={xAt(shatterYear)}
            y1={PAD_T}
            x2={xAt(shatterYear)}
            y2={H - PAD_B}
            stroke="var(--magenta)"
            strokeWidth={1}
            strokeOpacity={0.6}
          />
          <circle
            cx={xAt(shatterYear)}
            cy={yAt(density[shatterYear])}
            r={4}
            fill="var(--magenta)"
            filter={glowUrl(idBase, "bloom")}
          />
        </g>
      )}

      <VizText x={4} y={PAD_T + 8} size="micro">
        {axisFull}
      </VizText>
      <VizText x={4} y={H - PAD_B} size="micro">
        {axisGone}
      </VizText>
      <VizTick x={PAD_L} y={H - PAD_B + 14} anchor="start">
        0
      </VizTick>
      <VizTick x={W - PAD_R} y={H - PAD_B + 14} anchor="end">
        {HORIZON_YEARS}
      </VizTick>
      <VizText x={PAD_L + PLOT_W / 2} y={H - 4} size="micro" anchor="middle">
        {axisYears}
      </VizText>
    </svg>
  );
}
