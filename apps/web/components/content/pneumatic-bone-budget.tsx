"use client";

import {
  MATERIALS,
  type MaterialKey,
  THIN_WALL_LIMIT,
  coolingCapacity,
  sparBudget,
} from "@/components/content/pneumatic-bone-budget-model";
import { SparSection } from "@/components/content/pneumatic-bone-budget-section";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface PneumaticBoneBudgetProps {
  caption?: string;
  className?: string;
}

// A wing spar has three jobs the reader can watch compete: hold the wing rigid,
// weigh as little as possible, and carry cooling air through its own middle. This
// figure hollows the bone out in front of them at fixed stiffness — the wall
// thins, the mass falls, the air channel opens — until the wall gets so thin the
// tube stops failing by bending and starts crumpling. Switching the material to
// Pandora's carbon-threaded bone shrinks the whole tube instead of thinning it,
// which is the chapter's point about changed inputs rather than broken laws.
// Section arithmetic lives in the model file; the drawing lives beside this one.

const DEFAULT_HOLLOWNESS = 0.8; // pterosaur-like, the calibration the note gives
/** The wall-thinness bar runs to 1.6× the crumple threshold, so failure is visible. */
const WALL_BAR_MAX = THIN_WALL_LIMIT * 1.6;

export function PneumaticBoneBudget({ caption, className }: PneumaticBoneBudgetProps) {
  const uid = useId();
  const t = useTranslations("viz.pneumaticBoneBudget");

  const [hollowness, setHollowness] = useState(DEFAULT_HOLLOWNESS);
  const [material, setMaterial] = useState<MaterialKey>("carbon");

  const budget = useMemo(() => sparBudget(hollowness, material), [hollowness, material]);
  const cooling = useMemo(() => coolingCapacity(hollowness), [hollowness]);

  const fragile = budget.verdict === "fragile";
  const tone: "cyan" | "teal" | "magenta" = fragile
    ? "magenta"
    : material === "carbon"
      ? "teal"
      : "cyan";
  const toneVar = `var(--${tone})`;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone={tone}
      className={className}
      hint={t(`verdict.${budget.verdict}`)}
      controls={
        <SegmentedToggle<MaterialKey>
          ariaLabel={t("materialLabel")}
          value={material}
          onChange={setMaterial}
          options={[
            { value: "mineral", label: t("material.mineral"), tone: "var(--cyan)" },
            { value: "carbon", label: t("material.carbon"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <SparSection
        relativeDiameter={budget.relativeDiameter}
        hollowness={hollowness}
        relativeMass={budget.relativeMass}
        wallFill={Math.min(budget.wallRatio / WALL_BAR_MAX, 1)}
        fragile={fragile}
        tone={tone}
        idBase={uid}
        referenceLabel={(key, pct) => t(`reference.${key}`, { pct })}
        labels={{
          aria: t("aria"),
          solidReference: t("solidReference"),
          airChannel: t("airChannel"),
          massBar: t("massBar"),
          bucklingBar: t("bucklingBar"),
          crumpleLimit: t("crumpleLimit"),
        }}
      />

      <VizSlider
        className="mt-4"
        label={t("hollownessLabel")}
        display={t("hollownessValue", { pct: Math.round(hollowness * 100) })}
        min={0}
        max={0.96}
        step={0.02}
        value={hollowness}
        onChange={setHollowness}
        tone={toneVar}
      />

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("readout.mass")}
          value={t("readout.massValue", { pct: Math.round(budget.massSavedPct) })}
          tone={toneVar}
          note={t("readout.massNote", { stiffness: MATERIALS[material] })}
        />
        <VizReadout
          label={t("readout.cooling")}
          value={`${cooling.toFixed(2)}×`}
          tone="var(--amber)"
          note={t("readout.coolingNote")}
        />
        <VizReadout
          label={t("readout.wall")}
          value={
            Number.isFinite(budget.wallRatio)
              ? t("readout.wallValue", { ratio: budget.wallRatio.toFixed(1) })
              : "—"
          }
          tone={fragile ? "var(--magenta)" : "var(--teal)"}
          tinted
        />
      </div>
    </VizFigure>
  );
}
