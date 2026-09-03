"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  DENSITY_MAX,
  DENSITY_MIN,
  EARTH_DENSITY,
  EFFORT_MAX,
  EFFORT_MIN,
  MASS_MAX,
  MASS_MIN,
  PANDORA_DENSITY,
  RADIATOR_MAX,
  RADIATOR_MIN,
  REGIMES,
  REGIME_STATE,
  type RegimeKey,
  barFraction,
  runLedger,
} from "./radiator-heat-model";

const W = 336;
const H = 200;
const PAD_L = 78;
const PAD_R = 56;
const PAD_T = 30;
const PAD_B = 42;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;
const ROWS = 4;
const ROW_GAP = 9;
const rowH = (plotH - ROW_GAP * (ROWS - 1)) / ROWS;

const REGIME_TONE: Record<RegimeKey, string> = {
  rainforestChase: "var(--magenta)",
  eclipseTotality: "var(--cyan)",
  montaneWind: "var(--teal)",
};

const REGIME_FIGURE_TONE: Record<RegimeKey, "cyan" | "teal" | "magenta" | "amber"> = {
  rainforestChase: "magenta",
  eclipseTotality: "cyan",
  montaneWind: "teal",
};

const BALANCE_TONE = {
  overheating: "var(--magenta)",
  steady: "var(--teal)",
  mustConserve: "var(--cyan)",
} as const;

// Four bars: what the muscles make, and the three ways the body can get rid of it.
// The top bar is production, the three below are the outflows at full radiator
// dilation, and whenever production overhangs their sum the animal is on a clock.
//
// The lesson is in the evaporation bar. In saturated rainforest air it is a stub —
// the vapour-pressure deficit has nearly closed, so sweating is not an available
// strategy however hard the animal tries. Everything therefore rides on convection,
// which is exactly the term Pandora's dense air inflates. Drop the density slider to
// Earth's value and watch the sustainable-effort figure fall.
export function RadiatorHeatLedger({
  caption,
  className,
}: {
  caption?: string;
  className?: string;
}) {
  const uid = useId();
  const t = useTranslations("viz.radiatorHeat");
  const [regime, setRegime] = useState<RegimeKey>("rainforestChase");
  const [massKg, setMassKg] = useState(3000);
  const [radiatorFraction, setRadiatorFraction] = useState(0.1);
  const [density, setDensity] = useState(PANDORA_DENSITY);

  const effort = REGIME_STATE[regime].effort;
  const out = useMemo(
    () => runLedger({ regime, massKg, radiatorFraction, densityKgM3: density, effort }),
    [regime, massKg, radiatorFraction, density, effort],
  );
  const tone = REGIME_TONE[regime];
  const balanceTone = BALANCE_TONE[out.balance];

  const peak = Math.max(out.production, out.ceiling);
  const rows: Array<{ key: string; value: number; tone: string }> = [
    { key: "production", value: out.production, tone: balanceTone },
    { key: "convection", value: out.open.convection, tone: "var(--cyan)" },
    { key: "radiation", value: out.open.radiation, tone: "var(--amber)" },
    { key: "evaporation", value: out.open.evaporation, tone: "var(--teal)" },
  ];

  const yOf = (i: number) => PAD_T + i * (rowH + ROW_GAP);
  const ceilingX = PAD_L + barFraction(out.ceiling, peak) * plotW;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${regime}`)}
      caption={caption}
      tone={REGIME_FIGURE_TONE[regime]}
      className={className}
      controls={
        <div className="flex w-full flex-col items-end gap-2">
          <SegmentedToggle<RegimeKey>
            options={REGIMES.map((key) => ({
              value: key,
              label: t(`regime.${key}`),
              tone: REGIME_TONE[key],
            }))}
            value={regime}
            onChange={setRegime}
            ariaLabel={t("controls.regime")}
          />
          <div className="flex w-40 flex-col gap-2 sm:w-52">
            <VizSlider
              label={t("controls.mass")}
              display={t("kgValue", { n: massKg })}
              min={MASS_MIN}
              max={MASS_MAX}
              step={50}
              value={massKg}
              onChange={setMassKg}
              tone="var(--amber)"
            />
            <VizSlider
              label={t("controls.radiator")}
              display={t("pctValue", { n: Math.round(radiatorFraction * 100) })}
              min={RADIATOR_MIN}
              max={RADIATOR_MAX}
              step={0.01}
              value={radiatorFraction}
              onChange={setRadiatorFraction}
              tone="var(--magenta)"
            />
            <VizSlider
              label={t("controls.density")}
              display={t("densityValue", { n: density.toFixed(2) })}
              min={DENSITY_MIN}
              max={DENSITY_MAX}
              step={0.01}
              value={density}
              onChange={setDensity}
              tone="var(--cyan)"
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t(`aria.${out.balance}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {rows.map((row, i) => {
            const y = yOf(i);
            const width = Math.max(1.5, barFraction(row.value, peak) * plotW);
            const isProduction = row.key === "production";
            return (
              <g key={row.key}>
                <rect
                  x={PAD_L}
                  y={y}
                  width={plotW}
                  height={rowH}
                  rx={2}
                  fill="var(--void)"
                  fillOpacity={0.4}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                />
                <rect
                  x={PAD_L}
                  y={y}
                  width={width}
                  height={rowH}
                  rx={2}
                  fill={row.tone}
                  fillOpacity={isProduction ? 0.85 : 0.55}
                  filter={isProduction ? glowUrl(uid, "bloom") : undefined}
                />
                <VizText
                  x={PAD_L - 6}
                  y={y + rowH / 2 + 3}
                  size="small"
                  anchor="end"
                  tone={isProduction ? row.tone : "var(--muted)"}
                  weight={isProduction ? 700 : 400}
                >
                  {t(`row.${row.key}`)}
                </VizText>
                <VizText
                  x={PAD_L + plotW + 6}
                  y={y + rowH / 2 + 3}
                  size="micro"
                  tone={isProduction ? row.tone : "var(--subtle)"}
                  numeric
                >
                  {t("kwValue", { n: (row.value / 1000).toFixed(1) })}
                </VizText>
              </g>
            );
          })}

          {/* everything the body can shed at once */}
          <line
            x1={ceilingX}
            y1={PAD_T - 8}
            x2={ceilingX}
            y2={PAD_T + plotH + 4}
            stroke="var(--foreground)"
            strokeWidth={1}
            strokeOpacity={0.7}
            strokeDasharray="3 3"
          />
          <VizText x={ceilingX} y={PAD_T - 13} size="micro" anchor="middle" tone="var(--muted)">
            {t("ceilingLabel")}
          </VizText>
          <VizText
            x={PAD_L + plotW / 2}
            y={PAD_T + plotH + 26}
            size="micro"
            anchor="middle"
            tone="var(--subtle)"
          >
            {t("axis.power")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.sustainable")}
            value={t("restingMultiple", { n: out.sustainableEffort.toFixed(1) })}
            note={t(`balance.${out.balance}`)}
            tone={balanceTone}
            tinted
          />
          <VizReadout
            label={t("readout.clock")}
            value={
              Number.isFinite(out.sprintMinutes)
                ? t("minutesValue", { n: Math.round(out.sprintMinutes) })
                : t("noClock")
            }
            note={t("clockNote")}
            tone={Number.isFinite(out.sprintMinutes) ? "var(--magenta)" : "var(--teal)"}
          />
          <VizReadout
            label={t("readout.deficit")}
            value={t("mmHgValue", { n: out.open.vpd.toFixed(1) })}
            note={out.open.vpd < 12 ? t("deficitNote.closed") : t("deficitNote.open")}
            tone={out.open.vpd < 12 ? "var(--magenta)" : "var(--teal)"}
          />
          <VizReadout
            label={t("readout.airGain")}
            value={t("pctValue", {
              n: Math.round((out.hc / out.hcEarth - 1) * 100),
            })}
            note={density > EARTH_DENSITY ? t("airGainNote.denser") : t("airGainNote.thinner")}
            tone={tone}
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("modelNote")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
