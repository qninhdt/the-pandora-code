"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { evaluate } from "./opercular-oxygen-budget-model";
import type { BudgetInputs } from "./opercular-oxygen-budget-model";

// The plot half of OpercularOxygenBudget: how the supply-to-demand margin runs
// with body size. A log-log frame is the honest one here — both curves are power
// laws, so on log axes the whole argument is a straight line whose tilt *is* the
// difference between the two exponents.

export const PLOT_W = 320;
export const PLOT_H = 214;
const PAD = { l: 40, r: 14, t: 16, b: 34 };
const innerW = PLOT_W - PAD.l - PAD.r;
const innerH = PLOT_H - PAD.t - PAD.b;

export const MASS_MIN = 0.5;
export const MASS_MAX = 4000;
const LOG_M0 = Math.log10(MASS_MIN);
const LOG_M_SPAN = Math.log10(MASS_MAX) - LOG_M0;

const MARGIN_MIN = 0.3;
const MARGIN_MAX = 6.5;
const LOG_Y0 = Math.log10(MARGIN_MIN);
const LOG_Y_SPAN = Math.log10(MARGIN_MAX) - LOG_Y0;

export const xOf = (mass: number) => PAD.l + ((Math.log10(mass) - LOG_M0) / LOG_M_SPAN) * innerW;

export const yOf = (margin: number) => {
  const clamped = Math.min(MARGIN_MAX, Math.max(MARGIN_MIN, margin));
  return PAD.t + innerH * (1 - (Math.log10(clamped) - LOG_Y0) / LOG_Y_SPAN);
};

function marginPath(inputs: Omit<BudgetInputs, "mass">): string {
  const pts: string[] = [];
  for (let i = 0; i <= 80; i += 1) {
    const mass = 10 ** (LOG_M0 + (LOG_M_SPAN * i) / 80);
    const { margin } = evaluate({ ...inputs, mass });
    pts.push(`${i === 0 ? "M" : "L"}${xOf(mass).toFixed(1)},${yOf(margin).toFixed(1)}`);
  }
  return pts.join(" ");
}

interface PlotProps {
  uid: string;
  inputs: BudgetInputs;
  /** The comparison curve — the same body ventilating the other way. */
  shadow: BudgetInputs;
  tone: string;
  labels: {
    aria: string;
    breakEven: string;
    massAxis: string;
    marginAxis: string;
    ceiling: string;
  };
}

export function OpercularBudgetPlot({ uid, inputs, shadow, tone, labels }: PlotProps) {
  const live = evaluate(inputs);
  const ceilingX = live.ceiling !== null && live.ceiling < MASS_MAX ? xOf(live.ceiling) : null;

  return (
    <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full" role="img" aria-label={labels.aria}>
      <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />
      <rect x={PAD.l} y={PAD.t} width={innerW} height={innerH} fill={glowUrl(uid, "grid")} />

      {/* break-even: above this line the fan keeps up, below it the body starves */}
      <line
        x1={PAD.l}
        y1={yOf(1)}
        x2={PAD.l + innerW}
        y2={yOf(1)}
        stroke="var(--foreground)"
        strokeWidth={1.1}
        strokeOpacity={0.45}
        strokeDasharray="5 3"
      />
      <VizText x={PAD.l + 4} y={yOf(1) - 4} size="micro" tone="var(--muted)">
        {labels.breakEven}
      </VizText>

      {/* the other ventilation mode, for contrast */}
      <path
        d={marginPath(shadow)}
        fill="none"
        stroke="var(--subtle)"
        strokeWidth={1.4}
        strokeDasharray="3 3"
        strokeOpacity={0.8}
      />

      <path
        d={marginPath(inputs)}
        fill="none"
        stroke={tone}
        strokeWidth={2.4}
        strokeLinecap="round"
        filter={glowUrl(uid, "bloom")}
      />

      {/* where the margin runs out, if it does */}
      {ceilingX !== null ? (
        <>
          <line
            x1={ceilingX}
            y1={PAD.t}
            x2={ceilingX}
            y2={PAD.t + innerH}
            stroke="var(--magenta)"
            strokeWidth={1}
            strokeOpacity={0.55}
          />
          <VizText x={ceilingX - 4} y={PAD.t + 10} size="micro" anchor="end" tone="var(--magenta)">
            {labels.ceiling}
          </VizText>
        </>
      ) : null}

      <circle
        cx={xOf(inputs.mass)}
        cy={yOf(live.margin)}
        r={4.8}
        fill={tone}
        filter={glowUrl(uid, "bloom-strong")}
        style={{ transition: "cx 0.2s ease, cy 0.25s ease" }}
      />

      <VizTick x={PAD.l - 6} y={yOf(4) + 3} anchor="end">
        4×
      </VizTick>
      <VizTick x={PAD.l - 6} y={yOf(1) + 3} anchor="end">
        1×
      </VizTick>
      <VizTick x={PAD.l - 6} y={yOf(0.5) + 3} anchor="end">
        0.5×
      </VizTick>
      <VizTick x={xOf(1)} y={PAD.t + innerH + 12}>
        1
      </VizTick>
      <VizTick x={xOf(100)} y={PAD.t + innerH + 12}>
        100
      </VizTick>
      <VizTick x={xOf(MASS_MAX)} y={PAD.t + innerH + 12} anchor="end">
        {MASS_MAX}
      </VizTick>
      <VizText
        x={PAD.l + innerW / 2}
        y={PLOT_H - 4}
        size="small"
        anchor="middle"
        tone="var(--muted)"
      >
        {labels.massAxis}
      </VizText>
      <VizText
        x={10}
        y={PAD.t + innerH / 2}
        size="small"
        anchor="middle"
        tone="var(--muted)"
        transform={`rotate(-90 10 ${PAD.t + innerH / 2})`}
      >
        {labels.marginAxis}
      </VizText>
    </svg>
  );
}
