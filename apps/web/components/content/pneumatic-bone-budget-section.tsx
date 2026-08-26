"use client";

import { REFERENCE_HOLLOWNESS } from "@/components/content/pneumatic-bone-budget-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText } from "@/components/content/viz/viz-svg-text";

// The spar itself, drawn: a bone cross-section beside the two bars that tell the
// reader whether the design is a bargain or a failure. Split out of the figure
// file to keep both under the size ceiling.

const W = 340;
const H = 190;
const CX = 88;
const CY = 92;
/** The solid mineral spar of equal rigidity — the size every design has to beat. */
const SOLID_R = 40;
const BAR_X = 176;
const BAR_W = 150;
/** Where the crumple threshold sits along the wall-thinness bar. */
const CRUMPLE_FRAC = 1 / 1.6;

interface SparSectionProps {
  /** Outer diameter relative to the solid mineral spar. */
  relativeDiameter: number;
  /** Inner radius as a fraction of the outer radius. */
  hollowness: number;
  /** Mass relative to that same solid spar, 0–1-ish. */
  relativeMass: number;
  /** Wall thinness as a fraction of the bar's full width, already clamped. */
  wallFill: number;
  fragile: boolean;
  tone: "cyan" | "teal" | "magenta";
  labels: {
    aria: string;
    solidReference: string;
    airChannel: string;
    massBar: string;
    bucklingBar: string;
    crumpleLimit: string;
  };
  /** Resolves a reference-skeleton caption for the given key and percentage. */
  referenceLabel: (key: string, pct: number) => string;
  idBase: string;
}

export function SparSection({
  relativeDiameter,
  hollowness,
  relativeMass,
  wallFill,
  fragile,
  tone,
  labels,
  referenceLabel,
  idBase,
}: SparSectionProps) {
  const toneVar = `var(--${tone})`;
  const outerR = SOLID_R * relativeDiameter;
  const innerR = outerR * hollowness;
  const massW = Math.max(relativeMass, 0.02) * BAR_W;
  const wallW = Math.max(wallFill, 0.02) * BAR_W;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={labels.aria}>
      <GlowDefs idBase={idBase} tones={["cyan", "teal", "magenta", "amber"]} />

      {/* ghost outline of the solid mineral spar this design has to beat */}
      <circle
        cx={CX}
        cy={CY}
        r={SOLID_R}
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <VizText x={CX} y={CY + SOLID_R + 16} size="micro" tone="subtle" anchor="middle">
        {labels.solidReference}
      </VizText>

      {/* the spar: bone wall as a ring, air channel as the lumen */}
      <circle cx={CX} cy={CY} r={outerR} fill={glowUrl(idBase, `wash-${tone}`)} />
      <circle
        cx={CX}
        cy={CY}
        r={(outerR + innerR) / 2}
        fill="none"
        stroke={toneVar}
        strokeWidth={Math.max(outerR - innerR, 0.8)}
        filter={glowUrl(idBase, "bloom")}
        style={{ transition: "all 0.3s ease" }}
      />
      {innerR > 3 ? (
        <>
          <circle cx={CX} cy={CY} r={innerR} fill="var(--void)" fillOpacity={0.75} />
          <VizText x={CX} y={CY + 3} size="micro" tone="amber" anchor="middle">
            {labels.airChannel}
          </VizText>
        </>
      ) : null}

      {/* hollowness of real skeletons, for calibration */}
      {REFERENCE_HOLLOWNESS.map((ref, i) => (
        <VizText key={ref.key} x={0} y={16 + i * 11} size="micro" tone="subtle">
          {referenceLabel(ref.key, Math.round(ref.k * 100))}
        </VizText>
      ))}

      {/* what the spar weighs — shorter is better */}
      <VizText x={BAR_X} y={44} size="micro" tone="muted">
        {labels.massBar}
      </VizText>
      <line
        x1={BAR_X}
        y1={54}
        x2={BAR_X + BAR_W}
        y2={54}
        stroke="var(--border)"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <line
        x1={BAR_X}
        y1={54}
        x2={BAR_X + massW}
        y2={54}
        stroke={toneVar}
        strokeWidth={7}
        strokeLinecap="round"
        filter={glowUrl(idBase, "bloom")}
        style={{ transition: "all 0.3s ease" }}
      />

      {/* how thin the wall has become — crossing the marker is the failure */}
      <VizText x={BAR_X} y={100} size="micro" tone="muted">
        {labels.bucklingBar}
      </VizText>
      <line
        x1={BAR_X}
        y1={110}
        x2={BAR_X + BAR_W}
        y2={110}
        stroke="var(--border)"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <line
        x1={BAR_X}
        y1={110}
        x2={BAR_X + wallW}
        y2={110}
        stroke={fragile ? "var(--magenta)" : "var(--amber)"}
        strokeWidth={7}
        strokeLinecap="round"
        filter={glowUrl(idBase, "bloom")}
        style={{ transition: "all 0.3s ease" }}
      />
      <line
        x1={BAR_X + BAR_W * CRUMPLE_FRAC}
        y1={102}
        x2={BAR_X + BAR_W * CRUMPLE_FRAC}
        y2={118}
        stroke="var(--magenta)"
        strokeWidth={1.4}
        strokeDasharray="2 3"
      />
      <VizText x={BAR_X + BAR_W * CRUMPLE_FRAC + 4} y={132} size="micro" tone="magenta">
        {labels.crumpleLimit}
      </VizText>
    </svg>
  );
}

export { CRUMPLE_FRAC };
