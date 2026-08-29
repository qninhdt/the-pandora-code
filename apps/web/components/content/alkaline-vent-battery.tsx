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
  CELL_PMF_RANGE,
  MEMBRANE_POTENTIAL_MV,
  PH_RANGE,
  TEMP_RANGE,
  VENT_PRESETS,
  VENT_PRESET_ORDER,
  driveRatio,
  driveVerdict,
  nernstFactorMv,
  protonMotiveForceMv,
} from "./alkaline-vent-battery-model";

// The claim a vent origin rests on is that the rock supplies the same kind of
// electrical drive a living cell runs on — for free, continuously, before there
// is any biology to build a pump. This figure lets the reader set the two fluids
// and the temperature and read the voltage straight off the pH difference. The
// bar at the bottom is the point: the band a modern cell's ATP synthase uses is
// marked on it, and the vent's own drive routinely overshoots it. Physics in
// alkaline-vent-battery-model.ts; strings translate.

const W = 340;
const H = 200;
const WALL_X = 168;
const WALL_W = 14;
const FLUID_TOP = 30;
const FLUID_H = 116;
const BAR_Y = 172;
const BAR_X0 = 30;
const BAR_X1 = 322;
const BAR_MAX_MV = 450;

const mvToX = (mv: number) => BAR_X0 + (Math.min(mv, BAR_MAX_MV) / BAR_MAX_MV) * (BAR_X1 - BAR_X0);

export function AlkalineVentBattery({
  caption,
  className,
}: { caption?: string; className?: string }) {
  const uid = useId();
  const t = useTranslations("viz.ventBattery");

  const [preset, setPreset] = useState<(typeof VENT_PRESET_ORDER)[number]>("pandora");
  const [ventPh, setVentPh] = useState(VENT_PRESETS.pandora.ventPh);
  const [oceanPh, setOceanPh] = useState(VENT_PRESETS.pandora.oceanPh);
  const [tempK, setTempK] = useState(VENT_PRESETS.pandora.tempK);

  const deltaPh = ventPh - oceanPh;
  const perPh = nernstFactorMv(tempK);
  const pmf = protonMotiveForceMv(ventPh, oceanPh, tempK, MEMBRANE_POTENTIAL_MV);
  const verdict = driveVerdict(pmf);
  const ratio = driveRatio(pmf);
  const tone = verdict === "below" ? "var(--magenta)" : "var(--teal)";

  // Proton crossings drawn as a column of ticks: a wider pH gap means a steeper
  // downhill, so more of them cross the wall.
  const crossings = Math.max(2, Math.min(9, Math.round(Math.abs(deltaPh) * 1.6)));

  function applyPreset(id: (typeof VENT_PRESET_ORDER)[number]) {
    const p = VENT_PRESETS[id];
    setPreset(id);
    setVentPh(p.ventPh);
    setOceanPh(p.oceanPh);
    setTempK(p.tempK);
  }

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={verdict === "below" ? "magenta" : "teal"}
      hint={t(`verdict.${verdict}`, { ratio: ratio.toFixed(1) })}
      controls={
        <SegmentedToggle
          options={VENT_PRESET_ORDER.map((id) => ({
            value: id,
            label: t(`preset.${id}`),
            tone: id === "pandora" ? "var(--teal)" : "var(--cyan)",
          }))}
          value={preset}
          onChange={applyPreset}
          ariaLabel={t("presetLabel")}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", { mv: Math.round(pmf) })}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "amber", "cyan"]} />

          {/* alkaline vent fluid, welling up from the rock on the left */}
          <rect
            x={18}
            y={FLUID_TOP}
            width={WALL_X - 18}
            height={FLUID_H}
            rx={3}
            fill="color-mix(in oklab, var(--teal) 22%, var(--void))"
          />
          {/* acidic, CO2-loaded ocean on the right */}
          <rect
            x={WALL_X + WALL_W}
            y={FLUID_TOP}
            width={W - 18 - (WALL_X + WALL_W)}
            height={FLUID_H}
            rx={3}
            fill="color-mix(in oklab, var(--magenta) 18%, var(--void))"
          />
          {/* the thin porous iron-sulfide barrier the voltage sits across */}
          <rect
            x={WALL_X}
            y={FLUID_TOP - 6}
            width={WALL_W}
            height={FLUID_H + 12}
            rx={2}
            fill="color-mix(in oklab, var(--subtle) 40%, var(--void))"
            stroke="var(--border-strong)"
            strokeWidth={0.8}
          />

          {Array.from({ length: crossings }, (_, i) => {
            const y = FLUID_TOP + 12 + (i * (FLUID_H - 24)) / Math.max(1, crossings - 1);
            const rightward = deltaPh > 0;
            return (
              <g key={`crossing-${uid}-${i}`}>
                <circle
                  cx={rightward ? WALL_X - 8 : WALL_X + WALL_W + 8}
                  cy={y}
                  r={2.6}
                  fill="var(--amber)"
                  filter={glowUrl(uid, "bloom")}
                />
                <line
                  x1={rightward ? WALL_X - 4 : WALL_X + WALL_W + 4}
                  y1={y}
                  x2={rightward ? WALL_X + WALL_W + 4 : WALL_X - 4}
                  y2={y}
                  stroke="var(--amber)"
                  strokeWidth={1}
                  strokeOpacity={0.65}
                />
              </g>
            );
          })}

          <VizText x={20} y={FLUID_TOP - 10} size="small" tone="teal" weight={700}>
            {t("ventSide")}
          </VizText>
          <VizText x={20} y={FLUID_TOP + 14} size="base" tone="teal" numeric weight={700}>
            {t("phValue", { ph: ventPh.toFixed(1) })}
          </VizText>
          <VizText
            x={W - 20}
            y={FLUID_TOP - 10}
            anchor="end"
            size="small"
            tone="magenta"
            weight={700}
          >
            {t("oceanSide")}
          </VizText>
          <VizText
            x={W - 20}
            y={FLUID_TOP + 14}
            anchor="end"
            size="base"
            tone="magenta"
            numeric
            weight={700}
          >
            {t("phValue", { ph: oceanPh.toFixed(1) })}
          </VizText>
          <VizText
            x={WALL_X + WALL_W / 2}
            y={FLUID_TOP + FLUID_H + 18}
            anchor="middle"
            size="micro"
          >
            {t("wallLabel")}
          </VizText>

          {/* the drive, laid against the band a living cell actually uses */}
          <line
            x1={BAR_X0}
            y1={BAR_Y}
            x2={BAR_X1}
            y2={BAR_Y}
            stroke="var(--border)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <rect
            x={mvToX(CELL_PMF_RANGE.min)}
            y={BAR_Y - 7}
            width={mvToX(CELL_PMF_RANGE.max) - mvToX(CELL_PMF_RANGE.min)}
            height={14}
            rx={3}
            fill="color-mix(in oklab, var(--cyan) 26%, transparent)"
            stroke="color-mix(in oklab, var(--cyan) 55%, transparent)"
            strokeWidth={0.8}
          />
          <line
            x1={BAR_X0}
            y1={BAR_Y}
            x2={mvToX(Math.max(0, pmf))}
            y2={BAR_Y}
            stroke={tone}
            strokeWidth={4}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          />
          <VizText x={BAR_X0} y={BAR_Y - 12} size="micro">
            {t("barLabel")}
          </VizText>
          <VizText x={mvToX(CELL_PMF_RANGE.max) + 6} y={BAR_Y + 3} size="micro" tone="cyan" numeric>
            {t("cellBand", { min: CELL_PMF_RANGE.min, max: CELL_PMF_RANGE.max })}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("pmfLabel")}
            value={`${Math.round(pmf)} mV`}
            note={t("pmfNote")}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("deltaPhLabel")}
            value={deltaPh.toFixed(1)}
            note={t("deltaPhNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("perPhLabel")}
            value={`${perPh.toFixed(1)} mV`}
            note={t("perPhNote")}
            tone="var(--amber)"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <VizSlider
          label={t("ventPhLabel")}
          display={ventPh.toFixed(1)}
          min={PH_RANGE.min}
          max={PH_RANGE.max}
          step={0.1}
          value={ventPh}
          onChange={setVentPh}
          tone="var(--teal)"
        />
        <VizSlider
          label={t("oceanPhLabel")}
          display={oceanPh.toFixed(1)}
          min={PH_RANGE.min}
          max={PH_RANGE.max}
          step={0.1}
          value={oceanPh}
          onChange={setOceanPh}
          tone="var(--magenta)"
        />
        <VizSlider
          label={t("tempLabel")}
          display={`${tempK} K`}
          min={TEMP_RANGE.min}
          max={TEMP_RANGE.max}
          step={1}
          value={tempK}
          onChange={setTempK}
          tone="var(--amber)"
        />
      </div>
    </VizFigure>
  );
}
