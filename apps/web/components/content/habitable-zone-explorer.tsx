"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface HabitableZoneExplorerProps {
  caption?: string;
  className?: string;
}

// Plot geometry in SVG user units; a fixed viewBox stays crisp at any width.
const VIEW_W = 460;
const VIEW_H = 210;
const PAD = { left: 16, right: 16, top: 30, bottom: 38 };
const MAX_AU = 3; // distance axis runs 0..3 Earth-distances (AU)

// Conservative habitable-zone edges scale with the square root of stellar
// luminosity (flux ∝ L / d²), the same √L rule the chapter prose describes.
// Coefficients are the runaway-greenhouse / maximum-greenhouse limits.
const HZ_INNER_COEFF = 0.95;
const HZ_OUTER_COEFF = 1.37;

// Deterministic defaults so the server-rendered frame is meaningful and matches
// the chapter: Alpha Centauri A is a shade brighter than the Sun, and canon
// parks Polyphemus a little past one Earth-distance.
const DEFAULT_L = 1.5; // stellar luminosity, relative to the Sun
const DEFAULT_D = 1.25; // orbital distance, in AU

// Map a distance in AU to an SVG x-coordinate.
function ax(au: number): number {
  return PAD.left + (au / MAX_AU) * (VIEW_W - PAD.left - PAD.right);
}

// An interactive habitable-zone diagram. The reader sets how bright the star is
// and how far out a world orbits; the temperate band (where flux lands near
// Earth's) shifts with √L, and the world's marker reports too-hot / just-right /
// too-cold. SVG-only so it renders identically on the server; the controls are
// plain range inputs, so it needs no motion and works under reduced-motion.
export function HabitableZoneExplorer({ caption, className }: HabitableZoneExplorerProps) {
  const t = useTranslations("viz.habitableZone");
  const uid = useId();
  const [luminosity, setLuminosity] = useState(DEFAULT_L);
  const [distance, setDistance] = useState(DEFAULT_D);

  const inner = HZ_INNER_COEFF * Math.sqrt(luminosity);
  const outer = HZ_OUTER_COEFF * Math.sqrt(luminosity);
  const flux = luminosity / (distance * distance); // relative to Earth (=1)

  const state = distance < inner ? "hot" : distance > outer ? "cold" : "ok";
  const statusText =
    state === "hot" ? t("tooHot") : state === "cold" ? t("tooCold") : t("justRight");
  const statusTone = state === "hot" ? "--amber" : state === "cold" ? "--cyan" : "--teal";

  const trackY = PAD.top + 46;
  const bandH = 36;
  const cy = trackY + bandH / 2;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      hint={t("hint")}
      tone="amber"
      className={className}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={`${t("distance")} ${distance.toFixed(2)} AU, ${t("status")}: ${statusText}`}
      >
        <GlowDefs idBase={uid} />
        <defs>
          {/* hot stellar core → amber body → cooled rim, so the star reads as a
              luminous sphere rather than a flat disc */}
          <radialGradient id={`${uid}-star`} cx="42%" cy="38%" r="65%">
            <stop
              offset="0%"
              stopColor="color-mix(in oklab, var(--amber) 40%, var(--foreground))"
            />
            <stop offset="55%" stopColor="var(--amber)" />
            <stop offset="100%" stopColor="color-mix(in oklab, var(--amber) 72%, var(--void))" />
          </radialGradient>
          <linearGradient id={`${uid}-band`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.55" />
            <stop
              offset={`${(inner / MAX_AU) * 100}%`}
              stopColor="var(--amber)"
              stopOpacity="0.18"
            />
            <stop
              offset={`${((inner + outer) / 2 / MAX_AU) * 100}%`}
              stopColor="var(--teal)"
              stopOpacity="0.5"
            />
            <stop
              offset={`${(outer / MAX_AU) * 100}%`}
              stopColor="var(--cyan)"
              stopOpacity="0.18"
            />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* radial wash behind the star, the focal glow of the scene */}
        <circle cx={ax(0)} cy={cy} r={84} fill={glowUrl(uid, "wash-amber")} />

        {/* the distance track, coloured scorched → temperate → frozen */}
        <rect
          x={ax(0)}
          y={trackY}
          width={ax(MAX_AU) - ax(0)}
          height={bandH}
          rx={7}
          fill={`url(#${uid}-band)`}
        />

        {/* temperate-band fill — a soft teal wash so the survivable zone reads
            as a place, not just an outline */}
        <rect
          x={ax(inner)}
          y={trackY}
          width={ax(outer) - ax(inner)}
          height={bandH}
          rx={7}
          fill="color-mix(in oklab, var(--teal) 26%, transparent)"
        />
        {/* temperate-band outline — the survivable ring */}
        <rect
          x={ax(inner)}
          y={trackY - 3}
          width={ax(outer) - ax(inner)}
          height={bandH + 6}
          rx={7}
          fill="none"
          style={{ stroke: "var(--teal)" }}
          strokeWidth={2}
          filter={glowUrl(uid, "bloom")}
        />
        <VizText
          x={(ax(inner) + ax(outer)) / 2}
          y={trackY - 8}
          size="small"
          tone="teal"
          anchor="middle"
        >
          {t("temperate")}
        </VizText>

        {/* zone labels */}
        <VizText
          x={ax(inner / 2)}
          y={trackY + bandH + 16}
          size="micro"
          tone="amber"
          anchor="middle"
        >
          {t("scorched")}
        </VizText>
        <VizText
          x={ax((outer + MAX_AU) / 2)}
          y={trackY + bandH + 16}
          size="micro"
          tone="cyan"
          anchor="middle"
        >
          {t("frozen")}
        </VizText>

        {/* the star at the origin — a luminous amber sphere that anchors the scene */}
        <circle
          cx={ax(0)}
          cy={cy}
          r={16}
          fill={`url(#${uid}-star)`}
          filter={glowUrl(uid, "bloom-strong")}
        />
        {/* specular hotspot so the sphere catches the light */}
        <circle cx={ax(0) - 5} cy={cy - 6} r={4} fill="var(--foreground)" opacity={0.5} />

        {/* Earth=1 AU reference tick */}
        <line
          x1={ax(1)}
          y1={trackY - 6}
          x2={ax(1)}
          y2={trackY + bandH + 6}
          style={{ stroke: "var(--border-strong)" }}
          strokeWidth={1}
          strokeDasharray="2 3"
        />
        <VizTick x={ax(1)} y={VIEW_H - 14}>
          1 AU
        </VizTick>

        {/* the world marker — a glowing orb sitting on the track */}
        <g transform={`translate(${ax(distance)} ${cy})`}>
          <circle r={8} style={{ fill: `var(${statusTone})` }} filter={glowUrl(uid, "bloom")} />
          {/* specular highlight so the marker reads as a lit sphere */}
          <circle cx={-2.5} cy={-3} r={2.2} fill="var(--foreground)" opacity={0.55} />
          <VizText x={0} y={-16} size="small" tone={statusTone.replace("--", "")} anchor="middle">
            {t("pandora")}
          </VizText>
        </g>
      </svg>

      {/* readouts */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        <VizReadout label={t("status")} value={statusText} tone={`var(${statusTone})`} tinted />
        <VizReadout label={t("flux")} value={`${flux.toFixed(2)}×`} tone="var(--amber)" />
        <VizReadout label={t("distance")} value={`${distance.toFixed(2)} AU`} tone="var(--teal)" />
      </div>

      {/* controls */}
      <div className="mt-4 space-y-3">
        <VizSlider
          label={t("luminosity")}
          min={0.2}
          max={2}
          step={0.01}
          value={luminosity}
          display={`${luminosity.toFixed(2)} L☉`}
          tone="var(--amber)"
          onChange={setLuminosity}
        />
        <VizSlider
          label={t("distance")}
          min={0.2}
          max={MAX_AU}
          step={0.01}
          value={distance}
          display={`${distance.toFixed(2)} AU`}
          tone="var(--teal)"
          onChange={setDistance}
        />
      </div>
    </VizFigure>
  );
}
