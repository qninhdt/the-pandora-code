"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  ALL_RESERVOIRS,
  BASE_RESERVOIR,
  EARTH_OCEAN_PPM,
  SECOND_SOURCES,
  mixWithBase,
  secondSourceById,
} from "./volatile-source-model";

// Try to build an ocean. Asteroid water is the base supply; the reader picks a
// second supplier and dials up its share, watching the blend's isotope ratio move
// against the value seawater actually has. Comet water overshoots so violently
// that only a percent or two of it is admissible — which is how a single
// measurement settled an argument plausibility could not. Strings from i18n.

interface VolatileSourceFingerprintProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 340;
const VIEW_H = 150;
const AXIS_X = 18;
const AXIS_W = VIEW_W - AXIS_X - 16;
const AXIS_Y = 98;
const MARKER_Y = 64;
const MIX_Y = AXIS_Y - 14;

// Log axis: the reservoirs span more than a decade.
const PPM_MIN = 15;
const PPM_MAX = 700;
const xFor = (ppm: number) => {
  const clamped = Math.min(PPM_MAX, Math.max(PPM_MIN, ppm));
  return (
    AXIS_X +
    ((Math.log10(clamped) - Math.log10(PPM_MIN)) / (Math.log10(PPM_MAX) - Math.log10(PPM_MIN))) *
      AXIS_W
  );
};

const TICKS = [20, 50, 100, 200, 500];

const DEFAULT_SECOND = "comet67p";
const DEFAULT_FRACTION = 0.02;

export function VolatileSourceFingerprint({ caption, className }: VolatileSourceFingerprintProps) {
  const t = useTranslations("viz.volatileSourceFingerprint");
  const uid = useId();

  const [secondId, setSecondId] = useState(DEFAULT_SECOND);
  const [secondFraction, setSecondFraction] = useState(DEFAULT_FRACTION);

  const second = secondSourceById(secondId);
  const mix = mixWithBase(secondId, secondFraction);

  const tone =
    mix.verdict === "match"
      ? "var(--teal)"
      : mix.verdict === "tooLight"
        ? "var(--cyan)"
        : "var(--magenta)";

  const targetX = xFor(EARTH_OCEAN_PPM);
  const mixX = xFor(mix.dhPpm);
  const baseX = xFor(BASE_RESERVOIR.dhPpm);
  const secondX = xFor(second.dhPpm);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={
        mix.solutionFraction === null
          ? t("hintUnreachable", { source: t(`reservoir.${secondId}`) })
          : t("hintReachable", {
              source: t(`reservoir.${secondId}`),
              pct: Math.max(1, Math.round(mix.solutionFraction * 100)),
            })
      }
      caption={caption}
      tone={mix.verdict === "match" ? "teal" : "magenta"}
      className={className}
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-sans text-xs text-muted">{t("secondSourceLabel")}</span>
        {SECOND_SOURCES.map((reservoir) => {
          const active = reservoir.id === secondId;
          return (
            <button
              key={reservoir.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSecondId(reservoir.id)}
              className="rounded-md border px-2.5 py-1.5 font-sans text-xs transition-all duration-200"
              style={{
                borderColor: active
                  ? `color-mix(in oklab, ${reservoir.tone} 45%, transparent)`
                  : "var(--border)",
                background: active
                  ? `color-mix(in oklab, ${reservoir.tone} 12%, transparent)`
                  : "transparent",
                color: active ? reservoir.tone : "var(--subtle)",
              }}
            >
              {t(`reservoir.${reservoir.id}`)}
            </button>
          );
        })}
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={`${t("aria")} — ${t(`verdict.${mix.verdict}`)}`}
      >
        <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

        {/* the value seawater actually has */}
        <line
          x1={targetX}
          y1={24}
          x2={targetX}
          y2={AXIS_Y + 4}
          stroke="var(--teal)"
          strokeWidth={1.4}
          strokeDasharray="4 3"
        />
        <VizText x={targetX} y={19} size="micro" tone="teal" anchor="middle">
          {t("target")}
        </VizText>

        {/* every measured reservoir; the two in play are lit */}
        {ALL_RESERVOIRS.map((reservoir) => {
          const rx = xFor(reservoir.dhPpm);
          const inUse = reservoir.id === BASE_RESERVOIR.id || reservoir.id === secondId;
          return (
            <g key={reservoir.id}>
              <circle
                cx={rx}
                cy={MARKER_Y}
                r={inUse ? 4.5 : 3}
                style={{ fill: reservoir.tone }}
                fillOpacity={inUse ? 0.95 : 0.3}
                filter={inUse ? glowUrl(uid, "bloom") : undefined}
              />
              <VizText
                x={rx}
                y={reservoir.id === BASE_RESERVOIR.id ? MARKER_Y + 15 : MARKER_Y - 10}
                size="micro"
                tone={inUse ? reservoir.tone : "var(--subtle)"}
                anchor="middle"
              >
                {t(`reservoir.${reservoir.id}`)}
              </VizText>
            </g>
          );
        })}

        {/* the mixing line between the two suppliers in play */}
        <line
          x1={Math.min(baseX, secondX)}
          y1={MIX_Y}
          x2={Math.max(baseX, secondX)}
          y2={MIX_Y}
          stroke="var(--border-strong)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeOpacity={0.8}
        />
        <circle
          cx={mixX}
          cy={MIX_Y}
          r={6}
          style={{ fill: tone }}
          filter={glowUrl(uid, "bloom-strong")}
        />

        {/* axis */}
        <line
          x1={AXIS_X}
          y1={AXIS_Y}
          x2={AXIS_X + AXIS_W}
          y2={AXIS_Y}
          stroke="var(--border)"
          strokeWidth={0.8}
        />
        {TICKS.map((ppm) => (
          <VizTick key={ppm} x={xFor(ppm)} y={AXIS_Y + 12}>
            {String(ppm)}
          </VizTick>
        ))}
        <VizText x={AXIS_X + AXIS_W} y={AXIS_Y + 26} size="micro" anchor="end" tone="muted">
          {t("axis")}
        </VizText>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("verdictLabel")}
          value={t(`verdict.${mix.verdict}`)}
          tone={tone}
          tinted
        />
        <VizReadout
          label={t("resultLabel")}
          value={mix.dhPpm.toFixed(0)}
          note={t("resultNote")}
          tone={tone}
        />
        <VizReadout
          label={t("offsetLabel")}
          value={`${mix.offsetPct > 0 ? "+" : ""}${mix.offsetPct.toFixed(1)}%`}
          note={t("offsetNote")}
          tone="var(--amber)"
        />
      </div>

      <div className="mt-4">
        <VizSlider
          label={t("fractionLabel", { source: t(`reservoir.${secondId}`) })}
          min={0}
          max={0.5}
          step={0.005}
          value={secondFraction}
          display={`${(secondFraction * 100).toFixed(1)}%`}
          tone={second.tone}
          onChange={setSecondFraction}
        />
      </div>
    </VizFigure>
  );
}
