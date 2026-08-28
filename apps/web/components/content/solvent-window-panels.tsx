"use client";

import { useTranslations } from "next-intl";
import { GATE_ORDER, SOLVENT_ORDER, type Solvent, type SolventId } from "./solvent-window-model";

// The two HTML panels under the SolventWindowBench chart, split out to keep the
// figure file lean. The picker chooses which candidate the readouts describe; the
// gate cards are the honest part of the figure — three requirements a cell has to
// clear in a solvent, each graded works / untested / ruled out, so a reader can
// see that water's advantage is in the gates rather than in the headline numbers.

const GATE_TONE: Record<string, string> = {
  works: "var(--teal)",
  untested: "var(--amber)",
  fails: "var(--magenta)",
};

export function SolventPicker({
  picked,
  onPick,
}: { picked: SolventId; onPick: (id: SolventId) => void }) {
  const t = useTranslations("viz.solventWindow");
  return (
    <div
      className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
      role="radiogroup"
      aria-label={t("solventLabel")}
    >
      {SOLVENT_ORDER.map((id) => {
        const active = id === picked;
        return (
          <button
            key={id}
            type="button"
            // biome-ignore lint/a11y/useSemanticElements: styled picker needs a button carrying radio semantics; a native radio can't take this treatment
            role="radio"
            aria-checked={active}
            onClick={() => onPick(id)}
            className="rounded-lg border px-3 py-2 text-left font-sans text-xs font-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            style={{
              borderColor: active
                ? "color-mix(in oklab, var(--cyan) 50%, transparent)"
                : "var(--border)",
              background: active
                ? "color-mix(in oklab, var(--cyan) 10%, var(--void))"
                : "transparent",
              color: active ? "var(--cyan)" : "var(--subtle)",
            }}
          >
            {t(`names.${id}`)}
          </button>
        );
      })}
    </div>
  );
}

export function SolventGateCards({ solvent }: { solvent: Solvent }) {
  const t = useTranslations("viz.solventWindow");
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-3" aria-label={t("gateLabel")}>
      {GATE_ORDER.map((gate) => {
        const state = solvent.gates[gate];
        const tone = GATE_TONE[state];
        return (
          <div
            key={gate}
            className="rounded-lg border px-3 py-2"
            style={{
              borderColor: `color-mix(in oklab, ${tone} 38%, var(--border))`,
              background: `color-mix(in oklab, ${tone} 7%, transparent)`,
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-sans text-xs font-600 text-foreground">
                {t(`gates.${gate}`)}
              </span>
              <span
                className="font-sans text-[0.65rem] uppercase tracking-wider"
                style={{ color: tone }}
              >
                {t(`gateState.${state}`)}
              </span>
            </div>
            <p className="mt-1 font-sans text-xs leading-relaxed text-muted">
              {t(`gateDetail.${solvent.id}.${gate}`)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
