"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  EARTH_PO2,
  ISOMETRIC_AREA_EXPONENT,
  PANDORA_DENSITY,
  PANDORA_PO2,
  REFERENCE_MASS,
  type VentilationMode,
  evaluate,
} from "./opercular-oxygen-budget-model";
import { MASS_MAX, MASS_MIN, OpercularBudgetPlot } from "./opercular-oxygen-budget-plot";
import { OpercularBudgetReadouts, formatMass } from "./opercular-oxygen-budget-readouts";

// Two exponents decide whether a giant can breathe. Oxygen demand climbs as
// M^0.75; a breathing surface that merely grew in proportion to the body would
// climb as M^0.67 — so the bigger the animal, the further its fans fall behind
// its appetite, and somewhere up the mass scale the margin hits zero. The reader
// gets three levers against that: fold the exchange surface faster than the body
// grows, breathe richer air, or stop paying to reverse a heavy column of gas
// twice a breath. Pandora's air quietly refuses the second lever — at 0.9 atm
// its oxygen partial pressure is barely Earth's, so the thick air is all cost
// and no gift. What should land is that the flank fans are not decoration: in
// air this heavy they are what makes a thanator-sized animal possible at all.
// The arithmetic and its sourcing live in ./opercular-oxygen-budget-model.ts.

type AirId = "earth" | "pandora";

const AIR: Record<AirId, { density: number; po2: number }> = {
  earth: { density: 1, po2: EARTH_PO2 },
  pandora: { density: PANDORA_DENSITY, po2: PANDORA_PO2 },
};

const MODES: VentilationMode[] = ["tidal", "oneWay"];

interface OpercularOxygenBudgetProps {
  caption?: string;
  className?: string;
}

export function OpercularOxygenBudget({ caption, className }: OpercularOxygenBudgetProps) {
  const uid = useId();
  const t = useTranslations("viz.opercularOxygenBudget");

  const [mode, setMode] = useState<VentilationMode>("tidal");
  const [air, setAir] = useState<AirId>("pandora");
  const [mass, setMass] = useState(REFERENCE_MASS); // a large runner, mid-scale
  const [areaExponent, setAreaExponent] = useState(ISOMETRIC_AREA_EXPONENT);

  const inputs = { mass, areaExponent, mode, ...AIR[air] };
  const shadow = { ...inputs, mode: mode === "tidal" ? ("oneWay" as const) : ("tidal" as const) };
  const result = evaluate(inputs);

  const surviving = result.margin >= 1;
  const tone = surviving ? "var(--teal)" : "var(--magenta)";
  const figureTone = surviving ? "teal" : "magenta";

  // The guidance line always names the lever that would actually change the
  // answer from where the reader is standing, rather than restating the verdict.
  const hintKey = surviving
    ? mode === "oneWay"
      ? "carried"
      : "affording"
    : mode === "tidal"
      ? "payingTwice"
      : "foldFaster";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={figureTone}
      hint={t(`hint.${hintKey}`)}
      caption={caption}
      className={className}
      controls={
        <SegmentedToggle<VentilationMode>
          ariaLabel={t("modeControl")}
          value={mode}
          onChange={setMode}
          options={MODES.map((m) => ({
            value: m,
            label: t(`mode.${m}`),
            tone: m === "oneWay" ? "var(--teal)" : "var(--amber)",
          }))}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="sm:w-3/5">
          <OpercularBudgetPlot
            uid={uid}
            inputs={inputs}
            shadow={shadow}
            tone={tone}
            labels={{
              aria: t("aria", {
                mode: t(`mode.${mode}`),
                margin: result.margin.toFixed(2),
              }),
              breakEven: t("breakEven"),
              massAxis: t("axis.mass"),
              marginAxis: t("axis.margin"),
              ceiling: t("ceilingMarker"),
            }}
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("shadowNote")}</p>
        </div>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <OpercularBudgetReadouts
            result={result}
            mode={mode}
            surviving={surviving}
            tone={tone}
            t={t}
          />
          <SegmentedToggle<AirId>
            ariaLabel={t("airControl")}
            value={air}
            onChange={setAir}
            options={[
              { value: "earth", label: t("air.earth"), tone: "var(--cyan)" },
              { value: "pandora", label: t("air.pandora"), tone: "var(--teal)" },
            ]}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VizSlider
          label={t("slider.mass")}
          display={t("kgValue", { n: formatMass(mass) })}
          min={MASS_MIN}
          max={MASS_MAX}
          step={0.5}
          value={mass}
          onChange={setMass}
          tone="var(--cyan)"
        />
        <VizSlider
          label={t("slider.areaExponent")}
          display={areaExponent.toFixed(2)}
          min={0.6}
          max={0.9}
          step={0.01}
          value={areaExponent}
          onChange={setAreaExponent}
          tone="var(--teal)"
        />
      </div>
      <p className="mt-2 font-sans text-xs leading-relaxed text-subtle">
        {t("exponentNote", { isometric: ISOMETRIC_AREA_EXPONENT.toFixed(2) })}
      </p>
      <p className="mt-1.5 font-sans text-xs leading-relaxed text-subtle">
        {t("calibrationNote", { reference: REFERENCE_MASS })}
      </p>
    </VizFigure>
  );
}
