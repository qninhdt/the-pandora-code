"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  SOLVENTS,
  SOLVENT_ORDER,
  type SolventId,
  liquidAt,
  phaseAt,
  windowWidthK,
} from "./solvent-window-model";
import { SolventGateCards, SolventPicker } from "./solvent-window-panels";

// "Water is close to a universal optimum" — this bench is where the reader earns
// the words "close to". Drag a world's surface temperature and watch which of the
// four seriously-proposed solvents is even liquid there: water flows only in a
// narrow band, and below it the liquids that remain are the ones no protein can
// fold in. Then pick a solvent and read the three gates a cell must clear in it.
// The feeling to leave behind is not "water wins": water wins on the gates while
// *losing* both headline numbers to formamide — wider liquid window, higher
// polarity — which is exactly why the honest verdict is "close to optimal"
// rather than "optimal". Physical data and gate verdicts live in
// solvent-window-model.ts; the HTML panels in solvent-window-panels.tsx.

const W = 360;
const H = 190;
const T_MIN = 80;
const T_MAX = 500;
const PLOT_X0 = 104;
const PLOT_X1 = 348;
const ROW_TOP = 34;
const ROW_GAP = 30;
const BAR_H = 15;
const TICKS = [100, 200, 300, 400, 500];

const xForK = (k: number) => PLOT_X0 + ((k - T_MIN) / (T_MAX - T_MIN)) * (PLOT_X1 - PLOT_X0);

export function SolventWindowBench({
  caption,
  className,
}: { caption?: string; className?: string }) {
  const uid = useId();
  const t = useTranslations("viz.solventWindow");

  // A world's surface temperature. Starts inside water's band — where Earth life
  // and, by canon, Pandoran life both do their chemistry.
  const [tempK, setTempK] = useState(293);
  const [picked, setPicked] = useState<SolventId>("water");

  const solvent = SOLVENTS[picked];
  const phase = phaseAt(solvent, tempK);
  const liquidHere = liquidAt(tempK);
  const tone = phase === "liquid" ? "var(--teal)" : "var(--magenta)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={phase === "liquid" ? "teal" : "magenta"}
      hint={phase === "liquid" ? t(`verdict.${picked}`) : t("verdict.notLiquid")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={t("aria", { count: liquidHere.length })}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "amber", "cyan"]} />

          {SOLVENT_ORDER.map((id, i) => {
            const s = SOLVENTS[id];
            const y = ROW_TOP + i * ROW_GAP;
            const isLiquid = phaseAt(s, tempK) === "liquid";
            const isPicked = id === picked;
            const x = xForK(s.meltK);
            return (
              <g key={id}>
                {/* the full temperature axis this solvent is being judged against */}
                <line
                  x1={PLOT_X0}
                  y1={y + BAR_H / 2}
                  x2={PLOT_X1}
                  y2={y + BAR_H / 2}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  strokeDasharray="2 3"
                />
                {/* the band where this solvent is actually a liquid */}
                <rect
                  x={x}
                  y={y}
                  width={Math.max(3, xForK(s.boilK) - x)}
                  height={BAR_H}
                  rx={4}
                  fill={
                    isLiquid ? "var(--teal)" : "color-mix(in oklab, var(--cyan) 24%, var(--void))"
                  }
                  fillOpacity={isLiquid ? 0.85 : 0.7}
                  stroke={isPicked ? "var(--cyan)" : "transparent"}
                  strokeWidth={1.4}
                  filter={isLiquid ? glowUrl(uid, "bloom") : undefined}
                  style={{ transition: "fill-opacity 0.3s ease" }}
                />
                <VizText
                  x={PLOT_X0 - 8}
                  y={y + BAR_H / 2 + 2}
                  anchor="end"
                  size="small"
                  tone={isPicked ? "cyan" : "muted"}
                  weight={isPicked ? 700 : 500}
                >
                  {t(`names.${id}`)}
                </VizText>
                <VizText
                  x={PLOT_X0 - 8}
                  y={y + BAR_H / 2 + 12}
                  anchor="end"
                  size="micro"
                  tone="subtle"
                >
                  {s.formula}
                </VizText>
              </g>
            );
          })}

          {/* one world's temperature, swept across every candidate at once */}
          <line
            x1={xForK(tempK)}
            y1={ROW_TOP - 12}
            x2={xForK(tempK)}
            y2={ROW_TOP + 3 * ROW_GAP + BAR_H + 6}
            stroke="var(--amber)"
            strokeWidth={1.6}
            filter={glowUrl(uid, "bloom")}
          />
          <VizText
            x={Math.min(xForK(tempK), PLOT_X1 - 22)}
            y={ROW_TOP - 17}
            anchor="middle"
            size="small"
            tone="amber"
            numeric
            weight={700}
          >
            {t("marker", { temp: tempK })}
          </VizText>

          {TICKS.map((k) => (
            <VizTick key={k} x={xForK(k)} y={H - 14}>
              {k}
            </VizTick>
          ))}
          <VizText x={PLOT_X1} y={H - 3} anchor="end" size="micro" tone="subtle">
            {t("axisLabel")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout label={t("phaseLabel")} value={t(`phase.${phase}`)} tone={tone} tinted />
          <VizReadout
            label={t("windowLabel")}
            value={`${windowWidthK(solvent)} K`}
            note={t("windowNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("polarityLabel")}
            value={solvent.dielectric.toFixed(1)}
            note={t("polarityNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("liquidCountLabel")}
            value={`${liquidHere.length} / 4`}
            note={t("liquidCountNote")}
            tone="var(--amber)"
          />
        </div>
      </div>

      <VizSlider
        label={t("tempLabel")}
        display={`${tempK} K`}
        min={T_MIN}
        max={T_MAX}
        step={1}
        value={tempK}
        onChange={setTempK}
        tone="var(--amber)"
        className="mt-4"
      />

      <SolventPicker picked={picked} onPick={setPicked} />
      <SolventGateCards solvent={solvent} />
    </VizFigure>
  );
}
