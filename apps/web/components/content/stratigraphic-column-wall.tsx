"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText } from "@/components/content/viz/viz-svg-text";
import type { FeatureId } from "./stratigraphic-column-model";

// The rock wall itself: nine features drawn in the order gravity and intrusion
// left them. Purely presentational — selection is driven by the labelled button
// list beside it, so there is exactly one set of controls for a keyboard or
// screen-reader user to find.

export const WALL_W = 300;
export const WALL_H = 248;
const LEFT = 40;
const RIGHT = 268;
const TOP = 38;

/** Bedded units, drawn as horizontal slabs: [y, height]. */
const BEDS: Record<string, [number, number]> = {
  upperSand: [TOP, 46],
  ashUpper: [84, 12],
  fossilBed: [96, 34],
  ashLower: [130, 12],
  lowerSand: [142, 34],
  basement: [176, 40],
};
const UNCONFORMITY_Y = 84;
const WALL_BASE = 216;
const DIKE_X = 104;
const DIKE_W = 13;

// A ragged erosion surface — the visual cue that time is missing here, not just
// that one bed ends and another begins.
const UNCONFORMITY_PATH = (() => {
  const steps = 8;
  const span = (RIGHT - LEFT) / steps;
  let d = `M ${LEFT} ${UNCONFORMITY_Y}`;
  for (let i = 0; i < steps; i += 1) {
    const x = LEFT + span * (i + 1);
    const lift = i % 2 === 0 ? 4 : -3;
    d += ` Q ${x - span / 2} ${UNCONFORMITY_Y + lift}, ${x} ${UNCONFORMITY_Y}`;
  }
  return d;
})();

interface WallProps {
  uid: string;
  /** Colour for each feature, derived from its relation to the selection. */
  toneOf: (id: FeatureId) => string;
  /** True for the feature the reader is currently reasoning from. */
  isSelected: (id: FeatureId) => boolean;
  younger: string;
  older: string;
  ariaLabel: string;
}

export function StratigraphicColumnWall({
  uid,
  toneOf,
  isSelected,
  younger,
  older,
  ariaLabel,
}: WallProps) {
  const emphasis = (id: FeatureId) => (isSelected(id) ? glowUrl(uid, "bloom") : undefined);

  return (
    <svg viewBox={`0 0 ${WALL_W} ${WALL_H}`} className="w-full" role="img" aria-label={ariaLabel}>
      <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

      {/* the bedded pile: oldest at the bottom, by superposition */}
      {(Object.keys(BEDS) as FeatureId[]).map((id) => {
        const [y, h] = BEDS[id];
        const tone = toneOf(id);
        return (
          <rect
            key={id}
            x={LEFT}
            y={y}
            width={RIGHT - LEFT}
            height={h}
            fill={tone}
            fillOpacity={isSelected(id) ? 0.36 : 0.14}
            stroke={tone}
            strokeWidth={isSelected(id) ? 1.6 : 0.8}
            strokeOpacity={0.75}
            filter={emphasis(id)}
            style={{ transition: "fill-opacity 0.25s ease" }}
          />
        );
      })}

      {/* fossils in the fossil-bearing bed — the marker that lets this wall be
          matched to a wall on another continent */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={`fossil-${i}`}
          cx={LEFT + 34 + i * 52}
          cy={BEDS.fossilBed[0] + 18}
          rx={6}
          ry={3}
          fill={toneOf("fossilBed")}
          fillOpacity={0.7}
          transform={`rotate(${i % 2 === 0 ? -12 : 9} ${LEFT + 34 + i * 52} ${BEDS.fossilBed[0] + 18})`}
        />
      ))}

      {/* an intrusion cutting every bed it passes through, truncated above by
          the erosion surface */}
      <rect
        x={DIKE_X}
        y={UNCONFORMITY_Y}
        width={DIKE_W}
        height={WALL_BASE - UNCONFORMITY_Y}
        fill={toneOf("dike")}
        fillOpacity={isSelected("dike") ? 0.7 : 0.45}
        stroke={toneOf("dike")}
        strokeWidth={1}
        filter={emphasis("dike")}
      />

      {/* a fault plane, likewise truncated — and never touching the intrusion */}
      <line
        x1={214}
        y1={WALL_BASE}
        x2={232}
        y2={UNCONFORMITY_Y}
        stroke={toneOf("fault")}
        strokeWidth={isSelected("fault") ? 4 : 2.4}
        strokeOpacity={0.9}
        filter={emphasis("fault")}
      />

      {/* the erosion surface: a gap in the record, not a layer */}
      <path
        d={UNCONFORMITY_PATH}
        fill="none"
        stroke={toneOf("unconformity")}
        strokeWidth={isSelected("unconformity") ? 3.4 : 2}
        strokeDasharray="7 4"
        filter={emphasis("unconformity")}
      />

      {/* time's arrow up the wall */}
      <line
        x1={26}
        y1={WALL_BASE}
        x2={26}
        y2={TOP + 2}
        stroke="var(--border-strong)"
        strokeWidth={1}
      />
      <path d={`M 26 ${TOP - 4} l -4 7 l 8 0 z`} fill="var(--subtle)" />
      <VizText
        x={22}
        y={TOP + 26}
        size="micro"
        tone="var(--subtle)"
        transform={`rotate(-90 22 ${TOP + 26})`}
      >
        {younger}
      </VizText>
      <VizText
        x={22}
        y={WALL_BASE - 4}
        size="micro"
        tone="var(--subtle)"
        transform={`rotate(-90 22 ${WALL_BASE - 4})`}
      >
        {older}
      </VizText>
    </svg>
  );
}
