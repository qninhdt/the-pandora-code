"use client";

import { VizFigure } from "@/components/content/viz/viz-figure";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  GRADE_TONE,
  PANDORA_TONE,
  SCENARIO_ORDER,
  SUB_PROBLEMS,
  SUB_PROBLEM_ORDER,
  type ScenarioId,
  type SubProblemId,
  pandoraGains,
  unsolvedRows,
} from "./origin-scenario-model";

// The chapter's sorting device. Six things an origin has to accomplish, three
// settings that have each been proposed as the place it happened, and an honest
// grade in every cell — including the row where all three are weak. The last
// column is where Pandora enters: it marks which rows the moon's environment
// actually improves. Tap a row to read what it demands and what Pandora does or
// does not do about it. The pattern is the payload: Pandora's gains cluster in
// energy and raw material, and stop dead at information.

export function OriginScenarioScoreboard({
  caption,
  className,
}: { caption?: string; className?: string }) {
  const t = useTranslations("viz.originScoreboard");
  // Opens on the information row on purpose: it is the row where every scenario
  // is weak and where Pandora's advantages buy nothing, which is the chapter's
  // actual argument. Energy is the consolation prize, not the headline.
  const [openRow, setOpenRow] = useState<SubProblemId>("information");

  const gains = pandoraGains();
  const stuck = unsolvedRows();
  const row = SUB_PROBLEMS[openRow];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone="cyan"
      hint={t("hint", { gains: gains.length, stuck: stuck.length })}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[19rem] border-collapse font-sans text-xs">
          <thead>
            <tr>
              <th className="px-1 py-2 text-left font-600 text-subtle">{t("stepColumn")}</th>
              {SCENARIO_ORDER.map((s) => (
                <th key={s} className="px-1 py-2 text-center font-600 text-subtle">
                  {t(`scenarioShort.${s}`)}
                </th>
              ))}
              <th className="px-1 py-2 text-center font-600 text-subtle">{t("pandoraColumn")}</th>
            </tr>
          </thead>
          <tbody>
            {SUB_PROBLEM_ORDER.map((id) => {
              const sub = SUB_PROBLEMS[id];
              const active = id === openRow;
              return (
                <tr
                  key={id}
                  onClick={() => setOpenRow(id)}
                  className="cursor-pointer border-t border-border/60 transition-colors hover:bg-surface-raised/50"
                  style={
                    active
                      ? { background: "color-mix(in oklab, var(--cyan) 8%, transparent)" }
                      : undefined
                  }
                >
                  <th scope="row" className="px-1 py-2 text-left font-600 text-foreground">
                    <button
                      type="button"
                      onClick={() => setOpenRow(id)}
                      aria-expanded={active}
                      className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                    >
                      {t(`step.${id}`)}
                    </button>
                  </th>
                  {SCENARIO_ORDER.map((s) => {
                    const grade = sub.grades[s];
                    return (
                      <td key={s} className="px-1 py-2 text-center">
                        <span
                          className="inline-block rounded px-1.5 py-0.5 text-[0.65rem] font-600 uppercase tracking-wide"
                          style={{
                            color: GRADE_TONE[grade],
                            background: `color-mix(in oklab, ${GRADE_TONE[grade]} 12%, transparent)`,
                          }}
                        >
                          {t(`grade.${grade}`)}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-1 py-2 text-center">
                    <span
                      className="font-600 text-[0.65rem] uppercase tracking-wide"
                      style={{ color: PANDORA_TONE[sub.pandora] }}
                    >
                      {t(`pandora.${sub.pandora}`)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className="mt-3 rounded-lg border px-3 py-2"
        style={{
          borderColor: `color-mix(in oklab, ${PANDORA_TONE[row.pandora]} 36%, var(--border))`,
          background: `color-mix(in oklab, ${PANDORA_TONE[row.pandora]} 6%, transparent)`,
        }}
      >
        <p className="font-sans text-xs font-600 text-foreground">{t(`step.${openRow}`)}</p>
        <p className="mt-1 font-sans text-xs leading-relaxed text-muted">
          {t(`detail.${openRow}`)}
        </p>
        <p
          className="mt-2 font-sans text-xs leading-relaxed"
          style={{ color: PANDORA_TONE[row.pandora] }}
        >
          {t(`pandoraDetail.${openRow}`)}
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {SCENARIO_ORDER.map((s: ScenarioId) => (
          <div key={s} className="rounded-lg border border-border px-3 py-2">
            <p className="font-sans text-xs font-600 text-foreground">{t(`scenario.${s}`)}</p>
            <p className="mt-1 font-sans text-xs leading-relaxed text-muted">
              {t(`scenarioNote.${s}`)}
            </p>
          </div>
        ))}
      </div>
    </VizFigure>
  );
}
