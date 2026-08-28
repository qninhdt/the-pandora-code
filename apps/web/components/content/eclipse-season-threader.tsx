"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  DEFAULT_SEASON,
  DEFAULT_TILT,
  ORBIT_RADII,
  eclipseSeasonFraction,
  shadowFit,
  shadowOffset,
} from "./eclipse-season-threader-model";

// The chapter's best piece of real orbital mechanics: a moon that laps its planet
// once a day still does not get an eclipse every day. The reader tips the orbit
// and walks the year forward, watching the orbit lift clear of the planet's
// shadow cylinder and drop back into it. The feeling to earn is that "daily
// eclipse" is a *season*, not a constant — and that the same tilt which buys the
// bright weeks is what makes the eclipse weeks arrive on schedule. Seen edge-on
// from the side, so the shadow reads as a corridor the orbit either threads or
// clears. Geometry lives in eclipse-season-threader-model.ts; strings in i18n.

interface EclipseSeasonThreaderProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 360;
const VIEW_H = 190;
const PLANET_CX = 118;
const PLANET_CY = VIEW_H / 2;
const PLANET_R = 26; // one planet radius, in SVG units
const SHADOW_END = VIEW_W - 8;

export function EclipseSeasonThreader({ caption, className }: EclipseSeasonThreaderProps) {
  const t = useTranslations("viz.eclipseSeasonThreader");
  const uid = useId();

  const [tilt, setTilt] = useState(DEFAULT_TILT);
  const [season, setSeason] = useState(DEFAULT_SEASON);

  const offset = shadowOffset(tilt, season);
  const fit = shadowFit(offset);
  const seasonFraction = eclipseSeasonFraction(tilt);

  // Screen position of the moon where it crosses behind the planet.
  const moonY = PLANET_CY - offset * PLANET_R;
  const moonX = PLANET_CX + ORBIT_RADII * PLANET_R * 0.52;
  const orbitRy = ORBIT_RADII * PLANET_R * 0.52;
  const tone =
    fit === "total" ? "var(--magenta)" : fit === "grazing" ? "var(--amber)" : "var(--cyan)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`explain.${fit}`)}
      caption={caption}
      tone={fit === "total" ? "magenta" : fit === "grazing" ? "amber" : "cyan"}
      className={className}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={`${t("aria")} — ${t(`fit.${fit}`)}`}
      >
        <GlowDefs idBase={uid} tones={["amber", "cyan", "magenta"]} />

        {/* starlight arriving from the left */}
        {[-2, -1, 0, 1, 2].map((k) => (
          <line
            key={k}
            x1={4}
            y1={PLANET_CY + k * 20}
            x2={PLANET_CX - PLANET_R - 4}
            y2={PLANET_CY + k * 20}
            stroke="var(--amber)"
            strokeOpacity={0.4}
            strokeWidth={1}
          />
        ))}
        <VizText x={6} y={PLANET_CY - 52} size="small" tone="amber">
          {t("starlight")}
        </VizText>

        {/* the planet's shadow corridor, thrown away from the star */}
        <rect
          x={PLANET_CX}
          y={PLANET_CY - PLANET_R}
          width={SHADOW_END - PLANET_CX}
          height={PLANET_R * 2}
          fill="var(--void)"
          fillOpacity={0.85}
          style={{ stroke: "var(--border-strong)" }}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <VizText x={SHADOW_END - 6} y={PLANET_CY - PLANET_R - 7} size="small" anchor="end">
          {t("shadowCorridor")}
        </VizText>

        {/* the tilted orbit, seen edge-on */}
        <ellipse
          cx={PLANET_CX}
          cy={PLANET_CY}
          rx={orbitRy}
          ry={Math.max(
            4,
            orbitRy *
              Math.sin((tilt * Math.PI) / 180) *
              Math.abs(Math.sin((season * Math.PI) / 180)),
          )}
          fill="none"
          style={{ stroke: tone }}
          strokeWidth={1.4}
          strokeOpacity={0.7}
        />

        {/* the planet */}
        <circle cx={PLANET_CX} cy={PLANET_CY} r={PLANET_R + 8} fill={glowUrl(uid, "wash-cyan")} />
        <circle
          cx={PLANET_CX}
          cy={PLANET_CY}
          r={PLANET_R}
          fill="var(--surface-raised)"
          style={{ stroke: "var(--cyan)" }}
          strokeWidth={1.5}
        />
        <VizText
          x={PLANET_CX}
          y={PLANET_CY + PLANET_R + 15}
          size="small"
          tone="cyan"
          anchor="middle"
        >
          {t("planet")}
        </VizText>

        {/* the moon at the moment it passes behind the planet */}
        <circle cx={moonX} cy={moonY} r={7} style={{ fill: tone }} filter={glowUrl(uid, "bloom")} />
        <VizText x={moonX + 12} y={moonY + 3} size="small" tone={tone}>
          {t("moon")}
        </VizText>

        {/* how far the moon misses the shadow's axis */}
        <line
          x1={moonX}
          y1={PLANET_CY}
          x2={moonX}
          y2={moonY}
          stroke={tone}
          strokeWidth={1}
          strokeDasharray="2 2"
        />
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <VizReadout label={t("today")} value={t(`fit.${fit}`)} tone={tone} tinted />
        <VizReadout
          label={t("clearance")}
          value={`${offset.toFixed(2)}×`}
          tone="var(--cyan)"
          note={t("clearanceNote")}
        />
        <VizReadout
          label={t("seasonShare")}
          value={`${Math.round(seasonFraction * 100)}%`}
          tone="var(--amber)"
          note={t("seasonShareNote")}
        />
      </div>

      <div className="mt-4 space-y-3">
        <VizSlider
          label={t("tiltLabel")}
          min={0}
          max={40}
          step={0.5}
          value={tilt}
          display={`${tilt.toFixed(1)}°`}
          tone="var(--amber)"
          onChange={setTilt}
        />
        <VizSlider
          label={t("seasonLabel")}
          min={0}
          max={90}
          step={1}
          value={season}
          display={season < 25 ? t("nearEquinox") : season > 65 ? t("nearSolstice") : t("midYear")}
          tone="var(--cyan)"
          onChange={setSeason}
        />
      </div>
    </VizFigure>
  );
}
