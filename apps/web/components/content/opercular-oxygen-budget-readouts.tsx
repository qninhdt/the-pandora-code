"use client";

import { VizReadout } from "@/components/content/viz/viz-readout";
import type { BudgetResult, VentilationMode } from "./opercular-oxygen-budget-model";

// The five numbers that carry the argument, in the order a reader needs them:
// does this body break even, how heavy could it get, how much folding that would
// demand of the surface, and then the two line items the ventilation mode either
// pays or escapes — the ventilation work and the stagnant film on the membrane.

/** Body mass for display: thousands separated above 100 kg, one decimal below 10. */
export function formatMass(kg: number): string {
  if (kg >= 100) return Math.round(kg).toLocaleString("en-US");
  return kg.toFixed(kg < 10 ? 1 : 0);
}

interface ReadoutsProps {
  result: BudgetResult;
  mode: VentilationMode;
  surviving: boolean;
  tone: string;
  /** Scoped translator for viz.opercularOxygenBudget. */
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function OpercularBudgetReadouts({ result, mode, surviving, tone, t }: ReadoutsProps) {
  const oneWay = mode === "oneWay";
  return (
    <>
      <VizReadout
        label={t("readout.margin")}
        value={t("timesValue", { n: result.margin.toFixed(2) })}
        note={t(surviving ? "verdict.enough" : "verdict.short")}
        tone={tone}
        tinted
      />
      <VizReadout
        label={t("readout.ceiling")}
        value={
          result.ceiling === null
            ? t("readout.noCeiling")
            : t("kgValue", { n: formatMass(result.ceiling) })
        }
        note={t("readout.ceilingNote")}
        tone="var(--magenta)"
      />
      <VizReadout
        label={t("readout.required")}
        value={
          result.requiredExponent === null
            ? t("readout.noRequirement")
            : result.requiredExponent.toFixed(3)
        }
        note={t("readout.requiredNote")}
        tone="var(--teal)"
      />
      <VizReadout
        label={t("readout.ventilationCost")}
        value={t("percentValue", { n: Math.round(result.ventilationCost * 100) })}
        note={t(oneWay ? "readout.costFree" : "readout.costPaid")}
        tone="var(--amber)"
      />
      <VizReadout
        label={t("readout.barrier")}
        value={t("timesValue", { n: result.barrier.toFixed(2) })}
        note={t(oneWay ? "readout.barrierScoured" : "readout.barrierStagnant")}
        tone="var(--cyan)"
      />
    </>
  );
}
