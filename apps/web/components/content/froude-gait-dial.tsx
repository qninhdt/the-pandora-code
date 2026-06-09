"use client";

import {
  GAUGE_END,
  GAUGE_START,
  angleForFraction,
  arcPath,
  arcPoint,
} from "@/components/content/viz/dial";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface FroudeGaitDialProps {
  caption?: string;
  className?: string;
}

// Dynamic similarity: animals of any size move alike at equal Froude numbers,
// Fr = v² / (g·L). Gait transitions sit at fixed Fr (walk→trot ≈ 0.5, the walk
// ceiling ≈ 1.0), so the SPEED at which they happen is v = √(Fr·g·L). Drop g
// from Earth's 9.81 to Pandora's 7.85 and every transition speed slides down by
// √(7.85/9.81) ≈ 0.89 — the pa'li breaks into its efficient spring-gaits at a
// lower absolute speed, easing the pounding on its bones.
const G = { earth: 9.81, pandora: 7.85 } as const;

// km/h from a Froude target: v = √(Fr·g·L), then m/s → km/h.
function transitionKmh(fr: number, g: number, legLen: number): number {
  return Math.sqrt(fr * g * legLen) * 3.6;
}

const W = 200;
const H = 180;
const MAX_KMH = 60;

export function FroudeGaitDial({ caption, className }: FroudeGaitDialProps) {
  const t = useTranslations("viz.froudeDial");
  const uid = useId();
  // Deterministic initial render → SSR-safe.
  const [planet, setPlanet] = useState<"earth" | "pandora">("pandora");
  const [legLen, setLegLen] = useState(2.4);
  const g = G[planet];

  const walkTrot = transitionKmh(0.5, g, legLen);
  const gallop = transitionKmh(1.0, g, legLen);

  // A speed dial: sweep a 180°→0° arc and place the two transition marks on it.
  const cx = W / 2;
  const cy = H - 24;
  const r = 66;
  const angleFor = (kmh: number) =>
    angleForFraction(Math.min(1, kmh / MAX_KMH), GAUGE_START, GAUGE_END);

  const marks = [
    { kmh: walkTrot, tone: "var(--cyan)", wash: "wash-cyan" as const },
    { kmh: gallop, tone: "var(--amber)", wash: "wash-amber" as const },
  ];

  return (
    <VizFigure
      title={t("title")}
      hint={t("hint")}
      caption={caption}
      tone="cyan"
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-1/2"
          role="img"
          aria-label={t("title")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "amber"]} />
          {/* dial track */}
          <path
            d={arcPath(cx, cy, r, GAUGE_START, GAUGE_END)}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeOpacity={0.5}
          />
          {marks.map((m) => {
            const a = angleFor(m.kmh);
            const outer = arcPoint(cx, cy, r + 6, a);
            // Needles sweep out from the hub so the dial reads as a gauge, each
            // pointing at the speed where that gait transition occurs.
            const inner = arcPoint(cx, cy, 14, a);
            return (
              <g key={m.tone}>
                {/* radial wash behind the active marker for depth */}
                <circle
                  cx={outer.x}
                  cy={outer.y}
                  r={18}
                  fill={glowUrl(uid, m.wash)}
                  opacity={0.7}
                />
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={m.tone}
                  strokeWidth={4}
                  strokeLinecap="round"
                  filter={glowUrl(uid, "bloom")}
                />
                <circle
                  cx={outer.x}
                  cy={outer.y}
                  r={4.5}
                  fill={m.tone}
                  filter={glowUrl(uid, "bloom")}
                />
              </g>
            );
          })}
          {/* hub: outer ring + glowing core, the shared pivot for both needles */}
          <circle
            cx={cx}
            cy={cy}
            r={9}
            fill="var(--surface)"
            style={{ stroke: "var(--cyan)" }}
            strokeWidth={2}
          />
          <circle cx={cx} cy={cy} r={4} fill="var(--cyan)" filter={glowUrl(uid, "bloom")} />
          <VizTick x={cx} y={cy + 20}>
            {t("range", { max: MAX_KMH })}
          </VizTick>
        </svg>

        <div className="flex flex-col gap-3 sm:w-1/2">
          <SegmentedToggle
            ariaLabel={t("gravity")}
            value={planet}
            onChange={setPlanet}
            options={[
              { value: "earth", label: `${t("earth")} · ${G.earth} m/s²` },
              { value: "pandora", label: `${t("pandora")} · ${G.pandora} m/s²` },
            ]}
          />

          <VizSlider
            label={t("legLabel")}
            display={`${legLen.toFixed(1)} m`}
            min={1}
            max={3}
            step={0.1}
            value={legLen}
            onChange={setLegLen}
            tone="var(--cyan)"
          />

          <VizReadout
            label={t("walkTrot")}
            value={`${walkTrot.toFixed(0)} km/h`}
            note={t("frNote")}
            tone="var(--cyan)"
            tinted
          />
          <VizReadout
            label={t("gallop")}
            value={`${gallop.toFixed(0)} km/h`}
            note={t("gallopNote")}
            tone="var(--amber)"
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
