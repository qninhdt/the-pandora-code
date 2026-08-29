"use client";

import {
  DEFAULT_INPUTS,
  MATERIALS,
  type SparMaterial,
  VIABILITY_LIMIT,
  evaluateSpar,
} from "@/components/content/spar-mass-fraction-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// The gate the great leonopteryx has to pass. Set its span, mass and how hard it
// banks, then swap the spar material: ordinary bone puts more than half the
// animal's weight into two wing bones, which leaves no animal. A composite in the
// CFRP class does the same job for about a sixth. Here — unlike the trunk figure —
// the canon claim is load-bearing.

const W = 320;
const H = 120;
const BAR_X = 96;
const BAR_W = 200;
const BAR_H = 26;

const MATERIAL_KEYS: SparMaterial[] = ["bone", "composite"];

interface SparMassFractionGateProps {
  caption?: string;
  className?: string;
}

export function SparMassFractionGate({ caption, className }: SparMassFractionGateProps) {
  const uid = useId();
  const t = useTranslations("viz.sparMassFractionGate");

  const [material, setMaterial] = useState<SparMaterial>("bone");
  const [span, setSpan] = useState<number>(DEFAULT_INPUTS.span);
  const [bodyMass, setBodyMass] = useState<number>(DEFAULT_INPUTS.bodyMass);
  const [loadFactor, setLoadFactor] = useState<number>(DEFAULT_INPUTS.loadFactor);

  const inputs = useMemo(
    () => ({ ...DEFAULT_INPUTS, span, bodyMass, loadFactor }),
    [span, bodyMass, loadFactor],
  );
  const result = useMemo(() => evaluateSpar(inputs, material), [inputs, material]);
  // Both materials are always scored, so the reader can see the contrast even
  // while looking at one of them.
  const other = material === "bone" ? "composite" : "bone";
  const otherResult = useMemo(() => evaluateSpar(inputs, other), [inputs, other]);

  const props = MATERIALS[material];
  const tone = props.tone;
  const toneVar = `var(--${tone})`;

  // The bar runs to twice the viability line so an impossible design overruns it
  // visibly rather than just pinning at the end.
  const barMax = VIABILITY_LIMIT * 2;
  const fill = Math.min(result.massFraction / barMax, 1) * BAR_W;
  const limitX = BAR_X + (VIABILITY_LIMIT / barMax) * BAR_W;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={tone}
      caption={caption}
      hint={t("hint")}
      controls={
        <SegmentedToggle
          options={MATERIAL_KEYS.map((k) => ({
            value: k,
            label: t(`material.${k}`),
            tone: `var(--${MATERIALS[k].tone})`,
          }))}
          value={material}
          onChange={setMaterial}
          ariaLabel={t("materialLabel")}
        />
      }
      className={className}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={t("aria", { pct: Math.round(result.massFraction * 100) })}
      >
        <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

        {/* the wing, bending under the manoeuvre load */}
        <WingRoot
          loadFactor={loadFactor}
          toneVar={toneVar}
          moment={result.rootMoment}
          label={t("rootMoment", { value: (result.rootMoment / 1000).toFixed(1) })}
          idBase={uid}
        />

        {/* mass-fraction bar against the viability line */}
        <text
          x={BAR_X - 6}
          y={92}
          textAnchor="end"
          className="font-sans"
          style={{ fill: "var(--muted)", fontSize: 8.5 }}
        >
          {t("barLabel")}
        </text>
        <rect
          x={BAR_X}
          y={79}
          width={BAR_W}
          height={BAR_H}
          rx={3}
          fill="color-mix(in oklab, var(--void) 45%, transparent)"
          stroke="var(--border)"
          strokeWidth={0.5}
        />
        <rect
          x={BAR_X}
          y={79}
          width={fill}
          height={BAR_H}
          rx={3}
          fill={toneVar}
          fillOpacity={0.7}
          filter={glowUrl(uid, "bloom")}
        />
        <line
          x1={limitX}
          y1={73}
          x2={limitX}
          y2={79 + BAR_H + 6}
          stroke="var(--amber)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={limitX + 4}
          y={71}
          className="font-sans"
          style={{ fill: "var(--amber)", fontSize: 7.5 }}
        >
          {t("viabilityLine")}
        </text>
        <text
          x={BAR_X + Math.min(fill + 6, BAR_W - 30)}
          y={96}
          className="font-sans tabular-nums"
          style={{ fill: toneVar, fontSize: 10, fontWeight: 700 }}
        >
          {t("percent", { value: Math.round(result.massFraction * 100) })}
        </text>
      </svg>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("readout.sparMass")}
          value={t("readout.kg", { value: Math.round(result.sparMass) })}
          note={t("readout.sparMassNote")}
          tone={toneVar}
        />
        <VizReadout
          label={t("readout.stress")}
          value={t("readout.mpa", { value: Math.round(result.stressMPa) })}
          note={t("readout.stressNote", { yield: props.yieldMPa })}
          tone={toneVar}
        />
        <VizReadout
          label={t("readout.safety")}
          value={t("readout.times", { value: result.safetyFactor.toFixed(2) })}
          note={
            result.safetyFactor < 1.5 ? t("readout.safetyThin") : t("readout.safetyComfortable")
          }
          tone={toneVar}
          tinted
        />
      </div>

      <p className="mt-3 font-sans text-xs leading-relaxed text-muted">
        {result.viable ? t("verdict.viable") : t("verdict.grounded")}{" "}
        {t("verdict.compare", {
          material: t(`material.${other}`),
          pct: Math.round(otherResult.massFraction * 100),
        })}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <VizSlider
          label={t("slider.span")}
          display={t("slider.spanValue", { value: span.toFixed(0) })}
          min={8}
          max={35}
          step={0.5}
          value={span}
          onChange={setSpan}
          tone={toneVar}
        />
        <VizSlider
          label={t("slider.mass")}
          display={t("readout.kg", { value: Math.round(bodyMass) })}
          min={80}
          max={800}
          step={10}
          value={bodyMass}
          onChange={setBodyMass}
          tone="var(--cyan)"
        />
        <VizSlider
          label={t("slider.load")}
          display={t("slider.loadValue", { value: loadFactor.toFixed(1) })}
          min={1}
          max={5}
          step={0.1}
          value={loadFactor}
          onChange={setLoadFactor}
          tone="var(--amber)"
        />
      </div>
    </VizFigure>
  );
}

interface WingRootProps {
  loadFactor: number;
  toneVar: string;
  moment: number;
  label: string;
  idBase: string;
}

/** A half-wing bending away from the shoulder; harder banking bends it further. */
function WingRoot({ loadFactor, toneVar, label, idBase }: WingRootProps) {
  const rootX = 30;
  const rootY = 40;
  const tipX = 290;
  // Deflection grows with load factor — a visual proxy, not a computed deflection.
  const sag = 4 + loadFactor * 5;
  const d = `M ${rootX} ${rootY} Q ${(rootX + tipX) / 2} ${rootY - sag * 0.4} ${tipX} ${rootY - sag}`;
  return (
    <g>
      {/* the shoulder the moment acts on */}
      <rect
        x={rootX - 12}
        y={rootY - 9}
        width={14}
        height={18}
        rx={2}
        fill="color-mix(in oklab, var(--subtle) 30%, transparent)"
        stroke="var(--border-strong)"
        strokeWidth={0.6}
      />
      <path
        d={d}
        fill="none"
        stroke={toneVar}
        strokeWidth={2.5}
        strokeLinecap="round"
        filter={glowUrl(idBase, "bloom")}
      />
      {/* lift arrows along the span */}
      {[0.3, 0.5, 0.7].map((f) => {
        const x = rootX + (tipX - rootX) * f;
        const y = rootY - sag * f * 0.9;
        return (
          <line
            key={f}
            x1={x}
            y1={y + 12}
            x2={x}
            y2={y + 2}
            stroke="var(--amber)"
            strokeWidth={1}
            strokeOpacity={0.7}
          />
        );
      })}
      <text
        x={rootX + 6}
        y={rootY + 26}
        className="font-sans tabular-nums"
        style={{ fill: "var(--muted)", fontSize: 8 }}
      >
        {label}
      </text>
    </g>
  );
}
