"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  GAS_BUDGET,
  LEG_COUNT,
  LEG_WINDS,
  type Level,
  START_LEVEL,
  TARGET_KM,
  WATER_BUDGET,
  planRoute,
} from "./ballast-budget-model";

// Five legs, three levels each, one water account and one gas account. The reader
// discovers by spending that the fast layer is not free — that riding the jet the
// whole way both costs the climb and wastes it, because the jet only helps on one
// leg. Of the 243 possible itineraries, five arrive.
const LEVELS: Level[] = ["low", "mid", "jet"];

const LEVEL_TONE: Record<Level, string> = {
  low: "var(--teal)",
  mid: "var(--cyan)",
  jet: "var(--amber)",
};

const OUTCOME_TONE = {
  arrived: "var(--teal)",
  short: "var(--amber)",
  stranded: "var(--magenta)",
} as const;

const OUTCOME_FIGURE_TONE = {
  arrived: "teal",
  short: "amber",
  stranded: "magenta",
} as const;

interface BallastBudgetPlannerProps {
  caption?: string;
  className?: string;
}

export function BallastBudgetPlanner({ caption, className }: BallastBudgetPlannerProps) {
  const t = useTranslations("viz.ballast-budget");
  // Start on the itinerary a reader reaches for first: ride the fast layer all the
  // way. It fails, and the failure is the lesson.
  const [route, setRoute] = useState<Level[]>(() => Array(LEG_COUNT).fill("jet"));

  const plan = planRoute(route);
  const tone = OUTCOME_TONE[plan.outcome];

  const setLeg = (index: number, level: Level) =>
    setRoute((prev) => prev.map((l, i) => (i === index ? level : l)));

  const options = LEVELS.map((value) => ({
    value,
    label: t(`level.${value}`),
    tone: LEVEL_TONE[value],
  }));

  const pct = (used: number, total: number) => `${Math.round((used / total) * 100)}%`;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${plan.outcome}`)}
      caption={caption}
      tone={OUTCOME_FIGURE_TONE[plan.outcome]}
      className={className}
    >
      <div className="flex flex-col gap-4">
        <ol className="flex flex-col gap-2">
          {plan.legs.map((leg, i) => (
            <li
              key={`leg-${i + 1}`}
              className="flex flex-col gap-2 rounded-lg border border-border bg-void/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-sans text-xs text-muted">{t("legLabel", { n: i + 1 })}</p>
                <p className="font-sans text-[0.7rem] text-subtle">
                  {t("legWinds", {
                    low: LEG_WINDS[i].low,
                    mid: LEG_WINDS[i].mid,
                    jet: LEG_WINDS[i].jet,
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {leg.refused ? (
                  <span className="font-sans text-[0.7rem] uppercase tracking-wider text-[color:var(--magenta)]">
                    {t("refused")}
                  </span>
                ) : null}
                <span
                  className="font-display text-sm font-700 tabular-nums"
                  style={{ color: LEVEL_TONE[leg.level] }}
                >
                  {leg.progressKm >= 0
                    ? t("kmForward", { n: Math.round(leg.progressKm).toLocaleString("en-US") })
                    : t("kmBack", {
                        n: Math.abs(Math.round(leg.progressKm)).toLocaleString("en-US"),
                      })}
                </span>
                <SegmentedToggle
                  options={options}
                  value={route[i]}
                  onChange={(v) => setLeg(i, v)}
                  ariaLabel={t("legControl", { n: i + 1 })}
                />
              </div>
            </li>
          ))}
        </ol>

        <div className="grid gap-2 sm:grid-cols-3">
          <VizReadout
            label={t("readout.water")}
            value={t("ofValue", { used: plan.waterUsed, total: WATER_BUDGET })}
            note={pct(plan.waterUsed, WATER_BUDGET)}
            tone={plan.waterUsed >= WATER_BUDGET ? "var(--magenta)" : "var(--teal)"}
          />
          <VizReadout
            label={t("readout.gas")}
            value={t("ofValue", { used: plan.gasUsed, total: GAS_BUDGET })}
            note={pct(plan.gasUsed, GAS_BUDGET)}
            tone={plan.gasUsed >= GAS_BUDGET ? "var(--magenta)" : "var(--cyan)"}
          />
          <VizReadout
            label={t("readout.distance")}
            value={t("ofKm", {
              made: Math.round(plan.distanceKm).toLocaleString("en-US"),
              need: TARGET_KM.toLocaleString("en-US"),
            })}
            note={t(`outcome.${plan.outcome}`)}
            tone={tone}
            tinted
          />
        </div>

        <p className="font-sans text-xs text-subtle">
          {t("startNote", { level: t(`level.${START_LEVEL}`) })}
        </p>
      </div>
    </VizFigure>
  );
}
