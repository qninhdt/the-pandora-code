"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  BOHR_MAX,
  BOHR_MIN,
  HILL_MAX,
  HILL_MIN,
  HUMAN_PIGMENT,
  P50_MAX,
  P50_MIN,
  PO2_AXIS_MAX,
  REGIMES,
  REGIME_STATE,
  type RegimeKey,
  curvePoints,
  runBench,
} from "./oxygen-affinity-model";

const W = 330;
const H = 226;
const PAD_L = 40;
const PAD_R = 14;
const PAD_T = 12;
const PAD_B = 38;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const REGIME_TONE: Record<RegimeKey, string> = {
  earthRest: "var(--teal)",
  earthSprint: "var(--amber)",
  pandoraRest: "var(--cyan)",
  pandoraSprint: "var(--magenta)",
};

const REGIME_FIGURE_TONE: Record<RegimeKey, "cyan" | "teal" | "magenta" | "amber"> = {
  earthRest: "teal",
  earthSprint: "amber",
  pandoraRest: "cyan",
  pandoraSprint: "magenta",
};

const RESERVE_TONE = {
  thin: "var(--magenta)",
  workable: "var(--amber)",
  ample: "var(--teal)",
} as const;

// Two curves, because a pigment is never at one pH: the upper one is the blood
// arriving at the gas-exchange surface, the lower one the same pigment in a
// working muscle bed where acid has shoved its affinity down. The vertical drop
// between the two dots is what one pass actually delivers.
//
// Open it on human blood in Pandoran air and the surprise is where the trouble
// is not. Loading stays near ninety-six per cent, because alveolar oxygen sits on
// the flat top of the sigmoid. Pull the Bohr slider to zero and the reserve
// recovers — which is the chapter's argument for a blunted pigment, made as a
// gesture rather than an assertion.
export function OxygenAffinityBench({
  caption,
  className,
}: {
  caption?: string;
  className?: string;
}) {
  const uid = useId();
  const t = useTranslations("viz.oxygenAffinity");
  const [regime, setRegime] = useState<RegimeKey>("earthRest");
  const [p50, setP50] = useState(HUMAN_PIGMENT.p50);
  const [hill, setHill] = useState(HUMAN_PIGMENT.hill);
  const [bohr, setBohr] = useState(HUMAN_PIGMENT.bohr);

  const out = useMemo(() => runBench(regime, p50, hill, bohr), [regime, p50, hill, bohr]);
  const r = REGIME_STATE[regime];
  const tone = REGIME_TONE[regime];

  const xOf = (po2: number) => PAD_L + (po2 / PO2_AXIS_MAX) * plotW;
  const yOf = (sat: number) => PAD_T + (1 - sat) * plotH;
  const pathFor = (curveP50: number) =>
    curvePoints(curveP50, hill)
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.po2)} ${yOf(p.sat)}`)
      .join(" ");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${out.reserve}`)}
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
              label={t("controls.p50")}
              display={t("mmHgValue", { n: p50 })}
              min={P50_MIN}
              max={P50_MAX}
              step={1}
              value={p50}
              onChange={setP50}
              tone="var(--cyan)"
            />
            <VizSlider
              label={t("controls.hill")}
              display={hill.toFixed(1)}
              min={HILL_MIN}
              max={HILL_MAX}
              step={0.1}
              value={hill}
              onChange={setHill}
              tone="var(--teal)"
            />
            <VizSlider
              label={t("controls.bohr")}
              display={bohr === 0 ? t("bohrOff") : `−${bohr.toFixed(2)}`}
              min={BOHR_MIN}
              max={BOHR_MAX}
              step={0.05}
              value={bohr}
              onChange={setBohr}
              tone="var(--magenta)"
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
          aria-label={t(`aria.${out.reserve}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          <rect
            x={PAD_L}
            y={PAD_T}
            width={plotW}
            height={plotH}
            fill={glowUrl(uid, "grid")}
            fillOpacity={0.5}
          />

          {/* the pigment as it loads, and the same pigment in acid muscle */}
          <path
            d={pathFor(out.arterialP50)}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={1.8}
            strokeOpacity={0.95}
          />
          <path
            d={pathFor(out.tissueP50)}
            fill="none"
            stroke="var(--magenta)"
            strokeWidth={1.4}
            strokeOpacity={0.75}
            strokeDasharray="5 3"
          />

          {/* the pass: loaded here, unloaded there */}
          <line
            x1={xOf(r.tissuePo2)}
            y1={yOf(out.tissueSat)}
            x2={xOf(r.tissuePo2)}
            y2={yOf(out.arterialSat)}
            stroke={tone}
            strokeWidth={1}
            strokeOpacity={0.5}
            strokeDasharray="2 2"
          />
          <circle
            cx={xOf(r.alveolarPo2)}
            cy={yOf(out.arterialSat)}
            r={4.2}
            fill="var(--cyan)"
            filter={glowUrl(uid, "bloom")}
          />
          <circle
            cx={xOf(r.tissuePo2)}
            cy={yOf(out.tissueSat)}
            r={4.2}
            fill="var(--magenta)"
            filter={glowUrl(uid, "bloom")}
          />

          {/* axes */}
          <line
            x1={PAD_L}
            y1={PAD_T + plotH}
            x2={PAD_L + plotW}
            y2={PAD_T + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <VizTick x={PAD_L} y={PAD_T + plotH + 12}>
            0
          </VizTick>
          <VizTick x={PAD_L + plotW} y={PAD_T + plotH + 12}>
            {PO2_AXIS_MAX}
          </VizTick>
          <VizTick x={PAD_L - 6} y={PAD_T + plotH} anchor="end">
            0
          </VizTick>
          <VizTick x={PAD_L - 6} y={PAD_T + 4} anchor="end">
            100
          </VizTick>
          <VizText
            x={PAD_L + plotW / 2}
            y={PAD_T + plotH + 26}
            size="small"
            anchor="middle"
            tone="var(--muted)"
          >
            {t("axis.po2")}
          </VizText>
          <VizText
            x={10}
            y={PAD_T + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 10 ${PAD_T + plotH / 2})`}
          >
            {t("axis.saturation")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.delivered")}
            value={t("pctValue", { n: Math.round(out.delivered * 100) })}
            note={t(`extraction.${out.extraction}`)}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("readout.loading")}
            value={t("pctValue", { n: Math.round(out.arterialSat * 100) })}
            note={out.loadingLimited ? t("loadingNote.limited") : t("loadingNote.plateau")}
            tone={out.loadingLimited ? "var(--magenta)" : "var(--teal)"}
          />
          <VizReadout
            label={t("readout.reserve")}
            value={t("pctValue", { n: Math.round(out.tissueSat * 100) })}
            note={t(`reserve.${out.reserve}`)}
            tone={RESERVE_TONE[out.reserve]}
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("modelNote")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
