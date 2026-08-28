"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  ARRIVAL_TONE,
  CMB_GRAZE_DEG,
  type CoreState,
  PKP_RETURN_DEG,
  R_CMB,
  R_INNER,
  arrivalsAt,
  pPhase,
  surfacePoint,
} from "./seismic-shadow-model";

// Sweep a seismometer around a planet and watch which arrivals survive. The
// figure exists for one moment: past 103°, with a liquid outer core, the shear
// wave stops coming and never comes back. Flip the core to solid and the shadow
// vanishes — so the missing signal, not any present one, is the measurement.

interface SeismicShadowSounderProps {
  caption?: string;
  className?: string;
}

const W = 320;
const H = 250;
const CX = W / 2;
const CY = 118;
const R = 96;

function pt(distanceDeg: number, radius: number): { x: number; y: number } {
  const u = surfacePoint(distanceDeg);
  return { x: CX + u.x * radius, y: CY + u.y * radius };
}

// A ray from the source to the station, bowed toward the surface because seismic
// velocity rises with depth and refracts the path back upward.
function mantlePath(distanceDeg: number): string {
  const a = pt(0, R);
  const b = pt(distanceDeg, R);
  const mid = pt(distanceDeg / 2, R * (1 - 0.3 * Math.sin((distanceDeg / 180) * Math.PI)));
  return `M ${a.x} ${a.y} Q ${mid.x} ${mid.y} ${b.x} ${b.y}`;
}

// A ray that dives through the core: two straight legs meeting near the centre.
function corePath(distanceDeg: number, viaInner: boolean): string {
  const a = pt(0, R);
  const b = pt(distanceDeg, R);
  const depth = viaInner ? R * R_INNER * 0.5 : R * R_CMB * 0.55;
  const mid = pt(distanceDeg / 2, depth);
  return `M ${a.x} ${a.y} L ${mid.x} ${mid.y} L ${b.x} ${b.y}`;
}

export function SeismicShadowSounder({ caption, className }: SeismicShadowSounderProps) {
  const uid = useId();
  const t = useTranslations("viz.seismicShadow");

  const [distance, setDistance] = useState(70);
  const [core, setCore] = useState<CoreState>("liquid");

  const { p, s } = arrivalsAt(distance, core);
  const station = pt(distance, R);
  const source = pt(0, R);

  const pPathD =
    p === "direct" ? mantlePath(distance) : corePath(distance, p === "precursor");
  const sPathD = s === "none" ? null : s === "direct" ? mantlePath(distance) : corePath(distance, false);

  // Shadow annulus on the surface: where no shear wave can land.
  const shadowArc = (() => {
    if (core === "solid") return null;
    const a = pt(CMB_GRAZE_DEG, R);
    const b = pt(180, R);
    return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`;
  })();

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="teal"
      controls={
        <SegmentedToggle
          ariaLabel={t("coreToggle")}
          value={core}
          onChange={setCore}
          options={[
            { value: "liquid", label: t("core.liquid"), tone: "var(--cyan)" },
            { value: "solid", label: t("core.solid"), tone: "var(--subtle)" },
          ]}
        />
      }
      className={className}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
        <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />

        {/* Interior shells: mantle, outer core, inner core. */}
        <circle cx={CX} cy={CY} r={R} fill="var(--abyss)" stroke="var(--border)" strokeWidth={0.8} />
        <circle
          cx={CX}
          cy={CY}
          r={R * R_CMB}
          fill={core === "liquid" ? "var(--surface-overlay)" : "var(--abyss)"}
          stroke="var(--border)"
          strokeWidth={0.6}
          fillOpacity={0.55}
        />
        <circle cx={CX} cy={CY} r={R * R_INNER} fill="var(--subtle)" fillOpacity={0.35} />

        {shadowArc ? (
          <path
            d={shadowArc}
            fill="none"
            stroke="var(--magenta)"
            strokeWidth={4}
            strokeOpacity={0.5}
            strokeLinecap="round"
          />
        ) : null}

        {sPathD ? (
          <path
            d={sPathD}
            fill="none"
            stroke={ARRIVAL_TONE[s]}
            strokeWidth={2}
            strokeDasharray="5 3"
            filter={glowUrl(uid, "bloom")}
          />
        ) : null}
        <path
          d={pPathD}
          fill="none"
          stroke={ARRIVAL_TONE[p]}
          strokeWidth={1.6}
          filter={glowUrl(uid, "bloom")}
        />

        <circle cx={source.x} cy={source.y} r={4} fill="var(--amber)" filter={glowUrl(uid, "bloom")} />
        <VizText x={source.x} y={source.y - 8} anchor="middle" size="micro" tone="amber">
          {t("source")}
        </VizText>

        <circle
          cx={station.x}
          cy={station.y}
          r={5}
          fill={s === "none" ? "var(--magenta)" : "var(--foreground)"}
          filter={glowUrl(uid, "bloom")}
        />

        <VizText x={CX} y={H - 6} anchor="middle" size="micro">
          {t("shells")}
        </VizText>
      </svg>

      <div className="mt-4">
        <VizSlider
          label={t("distanceLabel")}
          display={`${Math.round(distance)}°`}
          min={10}
          max={180}
          step={1}
          value={distance}
          onChange={setDistance}
          tone="var(--foreground)"
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("pLabel")}
          value={pPhase(distance, core)}
          note={t(`arrival.${p}`)}
          tone={ARRIVAL_TONE[p]}
        />
        <VizReadout
          label={t("sLabel")}
          value={s === "none" ? t("noArrival") : "S"}
          note={t(`arrival.${s}`)}
          tone={ARRIVAL_TONE[s]}
        />
        <VizReadout
          label={t("verdictLabel")}
          value={s === "none" ? t("verdict.liquid") : t("verdict.transmits")}
          note={
            core === "liquid"
              ? t("verdict.shadowRange", { from: CMB_GRAZE_DEG, to: PKP_RETURN_DEG })
              : t("verdict.noShadow")
          }
          tone={s === "none" ? "var(--magenta)" : "var(--teal)"}
          tinted
        />
      </div>
    </VizFigure>
  );
}
