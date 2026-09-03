"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { FACTORS, type FactorKey, type FactorSet } from "./preservation-odds-chain-model";

// Five bars on a shared log axis, because the factors span four orders of
// magnitude and a linear axis would flatten the interesting end into nothing.
// The bottleneck bar is tinted magenta and the rest teal, so the reader's eye
// lands on the term that is actually deciding the outcome. Below the bars, the
// running product is drawn as a descending staircase: each step multiplies the
// one before, and the drop at the bottleneck is visibly the cliff.

const W = 360;
const ROW_H = 26;
const LABEL_W = 96;
const TRACK_X = LABEL_W;
const TRACK_W = W - LABEL_W - 34;

/** Decades of probability the axis spans: 1 down to 1e-4. */
const DECADES = 4;

/** Map a probability to a 0–1 position on the log axis, clamped at the floor. */
function logPos(p: number): number {
  if (p <= 0) return 0;
  const decades = -Math.log10(p);
  return Math.max(0, Math.min(1, 1 - decades / DECADES));
}

interface ChainBarsProps {
  uid: string;
  factors: FactorSet;
  bottleneck: FactorKey;
  labels: {
    aria: string;
    factor: Record<FactorKey, string>;
    axis: string;
  };
}

export function PreservationChainBars({ uid, factors, bottleneck, labels }: ChainBarsProps) {
  const height = FACTORS.length * ROW_H + 46;

  // Running product after each factor, for the staircase under the bars.
  let running = 1;
  const steps = FACTORS.map((key) => {
    running *= factors[key];
    return { key, running };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      className="w-full"
      role="img"
      aria-label={labels.aria}
      style={{ maxHeight: 260 }}
    >
      <GlowDefs idBase={uid} tones={["teal", "magenta", "cyan"]} />

      {/* decade gridlines: 1, 0.1, 0.01, 0.001, 0.0001 */}
      {Array.from({ length: DECADES + 1 }, (_, i) => {
        const x = TRACK_X + (1 - i / DECADES) * TRACK_W;
        return (
          <g key={i}>
            <line
              x1={x}
              y1={14}
              x2={x}
              y2={FACTORS.length * ROW_H + 16}
              stroke="var(--border)"
              strokeWidth={0.5}
              strokeDasharray={i === 0 ? undefined : "2 3"}
            />
            <VizTick x={x} y={10}>
              {i === 0 ? "1" : `10⁻${i}`}
            </VizTick>
          </g>
        );
      })}

      {FACTORS.map((key, i) => {
        const y = 20 + i * ROW_H;
        const isBottleneck = key === bottleneck;
        const tone = isBottleneck ? "var(--magenta)" : "var(--teal)";
        const w = Math.max(1.5, logPos(factors[key]) * TRACK_W);
        return (
          <g key={key}>
            <VizText x={LABEL_W - 8} y={y + 11} anchor="end" tone={isBottleneck ? "magenta" : undefined}>
              {labels.factor[key]}
            </VizText>
            <rect
              x={TRACK_X}
              y={y}
              width={TRACK_W}
              height={14}
              rx={3}
              fill="color-mix(in oklab, var(--void) 40%, transparent)"
              stroke="var(--border)"
              strokeWidth={0.5}
            />
            <rect
              x={TRACK_X}
              y={y}
              width={w}
              height={14}
              rx={3}
              fill={tone}
              opacity={isBottleneck ? 0.9 : 0.6}
              filter={isBottleneck ? glowUrl(uid, "bloom") : undefined}
            />
            <VizText x={TRACK_X + TRACK_W + 5} y={y + 11} size="micro" numeric tone={isBottleneck ? "magenta" : undefined}>
              {factors[key] < 0.01 ? factors[key].toExponential(1) : factors[key].toFixed(2)}
            </VizText>
          </g>
        );
      })}

      {/* the running product, as a descending staircase */}
      <polyline
        points={steps
          .map((s, i) => `${TRACK_X + logPos(s.running) * TRACK_W},${20 + i * ROW_H + 7}`)
          .join(" ")}
        fill="none"
        stroke="var(--cyan)"
        strokeWidth={1.2}
        strokeDasharray="3 2"
        opacity={0.85}
      />
      {steps.map((s, i) => (
        <circle
          key={s.key}
          cx={TRACK_X + logPos(s.running) * TRACK_W}
          cy={20 + i * ROW_H + 7}
          r={2}
          fill="var(--cyan)"
          filter={glowUrl(uid, "soft-shadow")}
        />
      ))}

      <VizText x={TRACK_X} y={height - 6} size="micro">
        {labels.axis}
      </VizText>
    </svg>
  );
}
