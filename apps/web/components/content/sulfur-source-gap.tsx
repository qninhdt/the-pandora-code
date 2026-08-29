"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  CANON_STATED_PPM,
  FLUX_REFERENCES,
  KNOCKDOWN_PPM,
  OXIDISING_LIFETIME_DAYS,
  constraintGap,
  formatFlux,
  fluxPosition,
  sulfurBudget,
  verdict,
} from "./sulfur-source-gap-model";

// The gap, drawn on a ladder that has to be logarithmic to fit. Two dials, because
// there are exactly two ways to repair the sulfur budget: thin the air or slow the
// chemistry. Both are available to the reader, and neither reaches a state where
// the numbers close AND the gas still kills in twenty seconds. Finding that for
// yourself is the point. Strings from i18n; deterministic for SSR.

interface SulfurSourceGapProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 360;
const VIEW_H = 132;
const LADDER_X = 16;
const LADDER_W = VIEW_W - LADDER_X - 16;
const LADDER_Y = 96;
const DEMAND_Y = 40;

const DECADES = [0, 2, 4, 6, 8, 10];

function xFor(tgS: number): number {
  return LADDER_X + fluxPosition(tgS) * LADDER_W;
}

// Log-space dials: sulfide from a few ppm to canon's stated percent, lifetime from
// hours to a year. Defaults sit at canon-as-stated with ordinary photochemistry.
const PPM_EXP_MIN = 0;
const PPM_EXP_MAX = Math.log10(CANON_STATED_PPM);
const DAYS_EXP_MIN = Math.log10(0.04);
const DAYS_EXP_MAX = Math.log10(365);

export function SulfurSourceGap({ caption, className }: SulfurSourceGapProps) {
  const t = useTranslations("viz.sulfurSourceGap");
  const uid = useId();

  const [ppmExp, setPpmExp] = useState(PPM_EXP_MAX);
  const [daysExp, setDaysExp] = useState(Math.log10(OXIDISING_LIFETIME_DAYS));

  const ppm = 10 ** ppmExp;
  const days = 10 ** daysExp;
  const budget = sulfurBudget(ppm, days);
  const state = verdict(budget);
  const gap = constraintGap(days);

  const tone =
    state === "survivableButHarmless" ? "var(--amber)" : "var(--magenta)";
  const figureTone = state === "survivableButHarmless" ? "amber" : "magenta";

  const demandX = xFor(budget.requiredSourceTgS);
  const allowanceX = xFor(FLUX_REFERENCES[2].tgS);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone={figureTone}
      className={className}
      hint={t(`hint.${state}`)}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={t("aria", {
          demand: formatFlux(budget.requiredSourceTgS),
          times: formatFlux(budget.timesEarthVolcanic),
        })}
      >
        <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />

        {/* everything to the right of the allowance is out of reach for any volcanism */}
        <rect
          x={allowanceX}
          y={DEMAND_Y - 16}
          width={LADDER_X + LADDER_W - allowanceX}
          height={LADDER_Y - DEMAND_Y + 16}
          fill="color-mix(in oklab, var(--magenta) 8%, transparent)"
        />
        <VizText x={allowanceX + 4} y={DEMAND_Y - 20} size="micro" tone="magenta">
          {t("unreachableBand")}
        </VizText>

        <line
          x1={LADDER_X}
          y1={LADDER_Y}
          x2={LADDER_X + LADDER_W}
          y2={LADDER_Y}
          stroke="var(--border-strong)"
        />
        {DECADES.map((exp) => {
          const x = xFor(10 ** exp);
          return (
            <g key={exp}>
              <line x1={x} y1={LADDER_Y} x2={x} y2={LADDER_Y + 4} stroke="var(--border-strong)" />
              <VizText x={x} y={LADDER_Y + 13} size="micro" anchor="middle" numeric>
                {t(`decade.e${exp}`)}
              </VizText>
            </g>
          );
        })}
        <VizText
          x={LADDER_X + LADDER_W / 2}
          y={VIEW_H - 3}
          size="micro"
          tone="subtle"
          anchor="middle"
        >
          {t("axisLabel")}
        </VizText>

        {/* the three real fluxes we can compare against */}
        {FLUX_REFERENCES.map((ref) => {
          const x = xFor(ref.tgS);
          return (
            <g key={ref.id}>
              <line
                x1={x}
                y1={LADDER_Y - 22}
                x2={x}
                y2={LADDER_Y}
                stroke="var(--teal)"
                strokeWidth={1.5}
              />
              <circle cx={x} cy={LADDER_Y} r={3} fill="var(--teal)" />
              <VizText
                x={x}
                y={LADDER_Y - 26}
                size="micro"
                tone="teal"
                anchor="middle"
                transform={`rotate(-20 ${x} ${LADDER_Y - 26})`}
              >
                {t(`reference.${ref.id}`)}
              </VizText>
            </g>
          );
        })}

        {/* what the stated concentration actually demands */}
        <line
          x1={demandX}
          y1={DEMAND_Y}
          x2={demandX}
          y2={LADDER_Y}
          stroke={tone}
          strokeWidth={2.4}
          filter={glowUrl(uid, "bloom")}
        />
        <circle cx={demandX} cy={LADDER_Y} r={5.5} fill={tone} filter={glowUrl(uid, "bloom")} />
        <VizText x={demandX} y={DEMAND_Y - 5} size="small" tone={tone} anchor="middle" weight={700}>
          {t("demandMarker", { flux: formatFlux(budget.requiredSourceTgS) })}
        </VizText>
      </svg>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <VizSlider
          label={t("ppmSlider")}
          display={t("ppmDisplay", { ppm: formatFlux(ppm) })}
          min={PPM_EXP_MIN}
          max={PPM_EXP_MAX}
          step={0.05}
          value={ppmExp}
          onChange={setPpmExp}
          tone={tone}
        />
        <VizSlider
          label={t("daysSlider")}
          display={t("daysDisplay", { days: days < 1 ? days.toFixed(2) : formatFlux(days) })}
          min={DAYS_EXP_MIN}
          max={DAYS_EXP_MAX}
          step={0.05}
          value={daysExp}
          onChange={setDaysExp}
          tone={tone}
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("demandLabel")}
          value={t("demandValue", { flux: formatFlux(budget.requiredSourceTgS) })}
          note={t("demandNote")}
          tone={tone}
          tinted
        />
        <VizReadout
          label={t("multipleLabel")}
          value={`${formatFlux(budget.timesEarthVolcanic)}×`}
          note={t("multipleNote")}
        />
        <VizReadout
          label={t("lethalLabel")}
          value={budget.lethal ? t("lethalYes") : t("lethalNo")}
          note={t("lethalNote", { ppm: KNOCKDOWN_PPM })}
          tone={budget.lethal ? "var(--magenta)" : "var(--subtle)"}
        />
      </div>

      <p className="mt-3 font-sans text-xs leading-relaxed text-subtle">
        {t("gapLine", { factor: formatFlux(gap) })}
      </p>
    </VizFigure>
  );
}
