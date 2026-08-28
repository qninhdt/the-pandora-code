"use client";

import { type Gait, LIMBS, type LimbKey } from "@/components/content/hexapod-gait-sequencer-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText } from "@/components/content/viz/viz-svg-text";

// The two views of one stride, split out of the figure file to keep both under
// the size ceiling: the footfall chart (when each foot is down across the whole
// cycle) and the plan view (which feet are down at this instant).

const CHART_W = 360;
const CHART_TOP = 18;
const ROW_H = 15;
const LANE_X = 74;
const LANE_W = 244;
const BODY_W = 128;
const BODY_H = 148;

const PAIR_TONE: Record<string, string> = {
  fore: "var(--cyan)",
  mid: "var(--amber)",
  hind: "var(--teal)",
};

function pairOf(limb: LimbKey): "fore" | "mid" | "hind" {
  if (limb.startsWith("fore")) return "fore";
  if (limb.startsWith("mid")) return "mid";
  return "hind";
}

// Stance bars wrap around the end of the stride, so a stance that starts late is
// drawn as two segments rather than one that runs off the lane.
function stanceBars(phase: number, duty: number): { x: number; w: number }[] {
  const end = phase + duty;
  if (end <= 1) return [{ x: phase, w: duty }];
  return [
    { x: phase, w: 1 - phase },
    { x: 0, w: end - 1 },
  ];
}

interface ChartProps {
  gait: Gait;
  phases: Record<LimbKey, number>;
  contacts: Record<LimbKey, boolean>;
  /** Playhead position, 0–1 through the stride. */
  playhead: number;
  labels: { aria: string; strideStart: string; strideEnd: string; legend: string };
  limbLabel: (limb: LimbKey) => string;
  idBase: string;
}

export function FootfallChart({
  gait,
  phases,
  contacts,
  playhead,
  labels,
  limbLabel,
  idBase,
}: ChartProps) {
  const height = CHART_TOP + LIMBS.length * ROW_H + 22;
  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${height}`}
      className="w-full sm:w-2/3"
      role="img"
      aria-label={labels.aria}
    >
      <GlowDefs idBase={idBase} tones={["cyan", "teal", "amber"]} />
      <VizText x={LANE_X} y={10} size="micro" tone="subtle">
        {labels.strideStart}
      </VizText>
      <VizText x={LANE_X + LANE_W} y={10} size="micro" tone="subtle" anchor="end">
        {labels.strideEnd}
      </VizText>

      {LIMBS.map((limb, i) => {
        const y = CHART_TOP + i * ROW_H;
        const stroke = PAIR_TONE[pairOf(limb)];
        return (
          <g key={limb}>
            <VizText x={0} y={y + 4} size="micro" tone="muted">
              {limbLabel(limb)}
            </VizText>
            <line
              x1={LANE_X}
              y1={y}
              x2={LANE_X + LANE_W}
              y2={y}
              stroke="var(--border)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            {stanceBars(phases[limb], gait.duty).map((bar) => (
              <line
                key={`${limb}-${bar.x}`}
                x1={LANE_X + bar.x * LANE_W}
                y1={y}
                x2={LANE_X + (bar.x + bar.w) * LANE_W}
                y2={y}
                stroke={stroke}
                strokeWidth={5}
                strokeLinecap="round"
                strokeOpacity={contacts[limb] ? 1 : 0.5}
                filter={contacts[limb] ? glowUrl(idBase, "bloom") : undefined}
              />
            ))}
          </g>
        );
      })}

      {/* where in the stride the animal is right now */}
      <line
        x1={LANE_X + playhead * LANE_W}
        y1={CHART_TOP - 8}
        x2={LANE_X + playhead * LANE_W}
        y2={CHART_TOP + LIMBS.length * ROW_H - 6}
        stroke="var(--foreground)"
        strokeWidth={1.2}
        strokeOpacity={0.7}
      />
      <VizText x={LANE_X} y={height - 5} size="micro" tone="subtle">
        {labels.legend}
      </VizText>
    </svg>
  );
}

export function ContactPlanView({
  contacts,
  aria,
  idBase,
}: { contacts: Record<LimbKey, boolean>; aria: string; idBase: string }) {
  return (
    <svg
      viewBox={`0 0 ${BODY_W} ${BODY_H}`}
      className="mx-auto w-1/2 sm:w-1/3"
      role="img"
      aria-label={aria}
    >
      <GlowDefs idBase={idBase} tones={["cyan", "teal", "amber"]} />
      <ellipse
        cx={BODY_W / 2}
        cy={BODY_H / 2}
        rx={20}
        ry={54}
        fill="color-mix(in oklab, var(--surface-raised) 80%, transparent)"
        stroke="var(--border-strong)"
        strokeWidth={1}
      />
      {LIMBS.map((limb) => {
        const pair = pairOf(limb);
        const rowY = pair === "fore" ? 34 : pair === "mid" ? BODY_H / 2 : BODY_H - 34;
        const side = limb.endsWith("Left") ? -1 : 1;
        // The middle pair is the short one: its foot plants closer in.
        const reach = pair === "mid" ? 30 : 42;
        const footX = BODY_W / 2 + side * reach;
        const down = contacts[limb];
        const stroke = PAIR_TONE[pair];
        return (
          <g key={limb}>
            <line
              x1={BODY_W / 2 + side * 16}
              y1={rowY}
              x2={footX}
              y2={rowY}
              stroke={down ? stroke : "var(--border-strong)"}
              strokeWidth={down ? 3 : 2}
              strokeLinecap="round"
            />
            <circle
              cx={footX}
              cy={rowY}
              r={down ? 5 : 3}
              fill={down ? stroke : "var(--void)"}
              stroke={stroke}
              strokeWidth={1.2}
              filter={down ? glowUrl(idBase, "bloom") : undefined}
            />
          </g>
        );
      })}
    </svg>
  );
}
