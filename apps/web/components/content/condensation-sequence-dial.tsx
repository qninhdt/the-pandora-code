"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  MATERIALS,
  SNOW_LINE_AU,
  radiusForTemperature,
  sampleDisk,
} from "./condensation-sequence-model";

// Walk a sampling point outward through a young disk and watch materials freeze
// out one class at a time. The reader is looking for the moment the water line is
// crossed: solids available for building roughly triple, and the density of
// anything assembled there collapses. That is the vice the chapter closes on —
// Pandora's derived density demands the dry inner disk, its oceans and air demand
// the far side of that line. Strings from i18n.

interface CondensationSequenceDialProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 340;
const VIEW_H = 178;
const PLOT_X = 34;
const PLOT_W = VIEW_W - PLOT_X - 12;
const PLOT_TOP = 14;
const PLOT_BOTTOM = 124;

const MIN_AU = 0.3;
const MAX_AU = 12;
const DEFAULT_AU = 1.2;

// Log radius axis: the interesting structure spans two decades.
const logMin = Math.log10(MIN_AU);
const logMax = Math.log10(MAX_AU);
const xFor = (au: number) => PLOT_X + ((Math.log10(au) - logMin) / (logMax - logMin)) * PLOT_W;

// Log temperature axis over the range the condensation ladder occupies.
const T_TOP = 2000;
const T_BOTTOM = 30;
const logT = (k: number) => Math.log10(k);
const yFor = (kelvin: number) =>
  PLOT_TOP +
  ((logT(T_TOP) - logT(Math.min(T_TOP, Math.max(T_BOTTOM, kelvin)))) /
    (logT(T_TOP) - logT(T_BOTTOM))) *
    (PLOT_BOTTOM - PLOT_TOP);

const AU_TICKS = [0.3, 1, 3, 10];

export function CondensationSequenceDial({ caption, className }: CondensationSequenceDialProps) {
  const t = useTranslations("viz.condensationSequenceDial");
  const uid = useId();

  const [radiusAu, setRadiusAu] = useState(DEFAULT_AU);
  const sample = sampleDisk(radiusAu);

  const cursorX = xFor(radiusAu);
  const cursorY = yFor(sample.temperatureK);
  const snowX = xFor(SNOW_LINE_AU);

  // The cooling curve itself, sampled across the plotted decade range.
  const curve = Array.from({ length: 60 }, (_, i) => {
    const au = 10 ** (logMin + ((logMax - logMin) * i) / 59);
    return `${xFor(au).toFixed(1)},${yFor(sampleDisk(au).temperatureK).toFixed(1)}`;
  }).join(" ");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={
        sample.beyondSnowLine
          ? t("hintOutside", { count: sample.available.length })
          : t("hintInside", { count: sample.available.length })
      }
      caption={caption}
      tone={sample.beyondSnowLine ? "cyan" : "amber"}
      className={className}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={`${t("aria")} — ${radiusAu.toFixed(2)} AU, ${Math.round(sample.temperatureK)} K`}
      >
        <GlowDefs idBase={uid} tones={["cyan", "amber", "teal", "magenta"]} />

        {/* condensation thresholds: each band is a material class waiting to freeze */}
        {MATERIALS.map((material) => {
          const y = yFor(material.condensationK);
          const frozen = sample.temperatureK <= material.condensationK;
          const thresholdX = xFor(
            Math.min(MAX_AU, Math.max(MIN_AU, radiusForTemperature(material.condensationK))),
          );
          return (
            <g key={material.id}>
              <line
                x1={PLOT_X}
                y1={y}
                x2={PLOT_X + PLOT_W}
                y2={y}
                style={{ stroke: material.tone }}
                strokeOpacity={frozen ? 0.5 : 0.16}
                strokeWidth={frozen ? 1.1 : 0.7}
                strokeDasharray={frozen ? undefined : "3 3"}
              />
              {/* the radius at which this class becomes available */}
              <circle
                cx={thresholdX}
                cy={y}
                r={frozen ? 3.2 : 2}
                style={{ fill: material.tone }}
                fillOpacity={frozen ? 0.95 : 0.3}
                filter={frozen ? glowUrl(uid, "bloom") : undefined}
              />
              <VizText
                x={PLOT_X + 3}
                y={y - 3}
                size="micro"
                tone={frozen ? material.tone : "var(--subtle)"}
              >
                {t(`material.${material.id}`)}
              </VizText>
            </g>
          );
        })}

        {/* the disk's cooling curve */}
        <polyline
          points={curve}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth={1.4}
          strokeOpacity={0.8}
        />

        {/* the water line — the boundary that decides what a world is made of */}
        <line
          x1={snowX}
          y1={PLOT_TOP}
          x2={snowX}
          y2={PLOT_BOTTOM + 6}
          stroke="var(--cyan)"
          strokeWidth={1.2}
          strokeDasharray="4 3"
          strokeOpacity={0.7}
        />
        <VizText x={snowX - 4} y={PLOT_TOP + 8} size="micro" tone="cyan" anchor="end">
          {t("snowLine")}
        </VizText>

        {/* the sampling point */}
        <line
          x1={cursorX}
          y1={PLOT_TOP}
          x2={cursorX}
          y2={PLOT_BOTTOM + 6}
          stroke="var(--amber)"
          strokeWidth={1}
          strokeOpacity={0.55}
        />
        <circle
          cx={cursorX}
          cy={cursorY}
          r={5.5}
          fill="var(--amber)"
          filter={glowUrl(uid, "bloom-strong")}
        />

        {/* radius axis */}
        <line
          x1={PLOT_X}
          y1={PLOT_BOTTOM + 6}
          x2={PLOT_X + PLOT_W}
          y2={PLOT_BOTTOM + 6}
          stroke="var(--border)"
          strokeWidth={0.8}
        />
        {AU_TICKS.map((au) => (
          <VizTick key={au} x={xFor(au)} y={PLOT_BOTTOM + 18}>
            {au < 1 ? au.toFixed(1) : String(au)}
          </VizTick>
        ))}
        <VizText x={PLOT_X + PLOT_W} y={PLOT_BOTTOM + 32} size="micro" anchor="end" tone="muted">
          {t("radiusAxis")}
        </VizText>
        <VizText
          x={10}
          y={PLOT_TOP + 34}
          size="micro"
          tone="muted"
          transform={`rotate(-90 10 ${PLOT_TOP + 34})`}
        >
          {t("temperatureAxis")}
        </VizText>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <VizReadout
          label={t("temperatureLabel")}
          value={`${Math.round(sample.temperatureK)} K`}
          tone="var(--amber)"
        />
        <VizReadout
          label={t("solidsLabel")}
          value={`${sample.solidEnrichment.toFixed(1)}×`}
          note={sample.beyondSnowLine ? t("solidsIcy") : t("solidsRocky")}
          tone="var(--cyan)"
          tinted
        />
        <VizReadout
          label={t("iceLabel")}
          value={`${Math.round(sample.iceFraction * 100)}%`}
          tone="var(--teal)"
        />
        <VizReadout
          label={t("densityLabel")}
          value={`${sample.bulkDensity.toFixed(2)}`}
          note={t("densityUnit")}
          tone={sample.bulkDensity > 3 ? "var(--foreground)" : "var(--teal)"}
        />
      </div>

      <div className="mt-4">
        <VizSlider
          label={t("radiusLabel")}
          min={MIN_AU}
          max={MAX_AU}
          step={0.05}
          value={radiusAu}
          display={`${radiusAu.toFixed(2)} AU`}
          tone="var(--amber)"
          onChange={setRadiusAu}
        />
      </div>
    </VizFigure>
  );
}
