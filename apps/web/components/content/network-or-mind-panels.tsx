"use client";

import { useTranslations } from "next-intl";
import {
  GATES,
  GATE_SOURCE,
  type Grade,
  SPECIMENS,
  SPECIMEN_GRADES,
  type SpecimenId,
} from "./network-or-mind-model";

// The two HTML panels beside the NetworkOrMindDiagnostic chain, split out so the
// figure file stays lean. The specimen picker deliberately mixes brainless
// networks, a brain structure that fails the test, and a mind that passes: the
// reader should calibrate the instrument on cases with known answers before
// reading its verdict on Eywa. The check cards spell out what each framework
// actually asks and how this specimen answered.

const GRADE_TONE: Record<Grade, string> = {
  yes: "var(--teal)",
  partial: "var(--amber)",
  no: "var(--magenta)",
  unknown: "var(--subtle)",
};

export function SpecimenPicker({
  picked,
  onPick,
}: { picked: SpecimenId; onPick: (id: SpecimenId) => void }) {
  const t = useTranslations("viz.networkOrMind");
  return (
    <div
      className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5"
      role="radiogroup"
      aria-label={t("specimenLabel")}
    >
      {SPECIMENS.map((id) => {
        const active = id === picked;
        return (
          <button
            key={id}
            type="button"
            // biome-ignore lint/a11y/useSemanticElements: styled specimen picker needs a button carrying radio semantics; a native radio can't take this treatment
            role="radio"
            aria-checked={active}
            onClick={() => onPick(id)}
            className="rounded-lg border px-3 py-2 text-left font-sans text-xs font-600 leading-snug transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
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

export function CheckCards({ picked }: { picked: SpecimenId }) {
  const t = useTranslations("viz.networkOrMind");
  const grades = SPECIMEN_GRADES[picked];
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2" aria-label={t("gateLabel")}>
      {GATES.map((gate) => {
        const grade = grades[gate];
        const tone = GRADE_TONE[grade];
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
                {t(`grade.${grade}`)}
              </span>
            </div>
            <p className="mt-0.5 font-sans text-[0.7rem] uppercase tracking-wider text-subtle">
              {t(`source.${GATE_SOURCE[gate]}`)}
            </p>
            <p className="mt-1 font-sans text-xs leading-relaxed text-muted">
              {t(`detail.${picked}.${gate}`)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
