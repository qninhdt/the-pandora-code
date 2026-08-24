"use client";

import {
  ENVELOPE_MATERIALS,
  type EnvelopeMaterial,
  LIFTING_GASES,
  type LiftingGas,
  grossLiftAt,
  householdEquivalent,
  hydrogenAdvantagePct,
  liftBudget,
  overheadMass,
} from "@/components/content/aerostatic-lift-budget-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface AerostaticLiftBudgetProps {
  caption?: string;
  className?: string;
}

// Two power laws racing each other across envelope diameter: gross lift rises as
// the cube, the mass of skin and organs rises as the square. They cross once. The
// plot is drawn on a log diameter axis so the whole canon size range - the field
// guide's small drifter through the caravan animals - fits in one frame, and both
// power laws read as straight lines of different slope.

const W = 380;
const H = 220;
const PAD_L = 34;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 30;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const D_MIN = 4; // m
const D_MAX = 160; // m
const MASS_MIN = 1; // kg
const MASS_MAX = 4_000_000; // kg

const logSpan = (v: number, lo: number, hi: number) =>
  (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo));

const px = (d: number) => PAD_L + logSpan(d, D_MIN, D_MAX) * PLOT_W;
const py = (m: number) => PAD_T + (1 - logSpan(Math.max(m, MASS_MIN), MASS_MIN, MASS_MAX)) * PLOT_H;

// The two sizes canon actually gives for this animal, marked on the axis.
const CANON_SIZES = [
  { key: "fieldGuide", d: 15 },
  { key: "caravan", d: 50 },
];

function curvePath(fn: (d: number) => number): string {
  const N = 60;
  let path = "";
  for (let i = 0; i <= N; i++) {
    const d = D_MIN * (D_MAX / D_MIN) ** (i / N);
    path += `${i === 0 ? "M" : " L"} ${px(d).toFixed(1)} ${py(fn(d)).toFixed(1)}`;
  }
  return path;
}

function formatMass(kg: number): string {
  if (kg >= 1000) return `${Math.round(kg / 1000).toLocaleString()} t`;
  return `${Math.round(kg)} kg`;
}

export function AerostaticLiftBudget({ caption, className }: AerostaticLiftBudgetProps) {
  const t = useTranslations("viz.aerostatic-lift-budget");
  const uid = useId();
  const [gas, setGas] = useState<LiftingGas>("hydrogen");
  const [material, setMaterial] = useState<EnvelopeMaterial>("collagen");
  const [diameter, setDiameter] = useState(50);

  const budget = liftBudget(diameter, gas, material);
  const tone: "teal" | "magenta" = budget.grounded ? "magenta" : "teal";
  const toneVar = `var(--${tone})`;

  const liftPath = useMemo(() => curvePath((d) => grossLiftAt(d, gas)), [gas]);
  const overheadPath = useMemo(() => curvePath((d) => overheadMass(d, material)), [material]);

  const advantage = hydrogenAdvantagePct(true);
  const crossing = budget.minimumDiameter;
  const crossingOnPlot = crossing > D_MIN && crossing < D_MAX;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={budget.grounded ? t("hint.grounded") : t("hint.flying")}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("gasLabel")}
          value={gas}
          onChange={setGas}
          options={LIFTING_GASES.map((g) => ({
            value: g,
            label: t(`gas.${g}`),
            tone: g === "hydrogen" ? "var(--teal)" : "var(--cyan)",
          }))}
        />
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full md:w-3/5"
          role="img"
          aria-label={budget.grounded ? t("aria.grounded") : t("aria.flying")}
        >
          <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />
          <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill={glowUrl(uid, "grid")} />

          {/* axes */}
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD_L}
            y1={PAD_T + PLOT_H}
            x2={PAD_L + PLOT_W}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {/* the mass of skin and organs - what the animal must lift before anything else */}
          <path
            d={overheadPath}
            fill="none"
            stroke="var(--amber)"
            strokeWidth={2.2}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "d 0.4s ease" }}
          />
          {/* gross lift - what the displaced air will carry */}
          <path
            d={liftPath}
            fill="none"
            stroke="var(--teal)"
            strokeWidth={2.6}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "d 0.4s ease" }}
          />

          {/* where the two power laws cross: the smallest workable balloon animal */}
          {crossingOnPlot ? (
            <g
              style={{ transition: "transform 0.4s ease" }}
              transform={`translate(${px(crossing)},0)`}
            >
              <line
                x1={0}
                y1={PAD_T}
                x2={0}
                y2={PAD_T + PLOT_H}
                stroke="var(--foreground)"
                strokeOpacity={0.3}
                strokeDasharray="3 4"
                strokeWidth={1}
              />
              <VizText x={4} y={PAD_T + 10} size="micro" tone="subtle">
                {t("crossing")}
              </VizText>
            </g>
          ) : null}

          {/* the sizes canon gives */}
          {CANON_SIZES.map((s) => (
            <g key={s.key} transform={`translate(${px(s.d)}, ${PAD_T + PLOT_H})`}>
              <line y1={0} y2={5} stroke="var(--border-strong)" strokeWidth={1} />
              <VizTick x={0} y={16}>
                {t(`canon.${s.key}`)}
              </VizTick>
            </g>
          ))}

          {/* the reader's current envelope */}
          <g
            style={{ transition: "transform 0.3s ease" }}
            transform={`translate(${px(diameter)},0)`}
          >
            <line
              x1={0}
              y1={PAD_T}
              x2={0}
              y2={PAD_T + PLOT_H}
              stroke={toneVar}
              strokeWidth={1.4}
              strokeOpacity={0.55}
            />
            <circle
              cx={0}
              cy={py(budget.grossLift)}
              r={5}
              fill={toneVar}
              filter={glowUrl(uid, "bloom-strong")}
            />
          </g>

          <VizText x={PAD_L} y={PAD_T - 5} size="micro" tone="teal">
            {t("liftCurve")}
          </VizText>
          <VizText x={PAD_L + PLOT_W} y={PAD_T - 5} size="micro" tone="amber" anchor="end">
            {t("overheadCurve")}
          </VizText>
          <VizText x={PAD_L + PLOT_W} y={H - 4} size="micro" tone="subtle" anchor="end">
            {t("xAxis")}
          </VizText>
          <VizText
            x={11}
            y={PAD_T + PLOT_H / 2}
            size="micro"
            tone="subtle"
            anchor="middle"
            transform={`rotate(-90 11 ${PAD_T + PLOT_H / 2})`}
          >
            {t("yAxis")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 md:w-2/5">
          <VizReadout
            label={t("readout.specificLift")}
            value={`${budget.specificLift.toFixed(2)} kg/m³`}
            note={
              gas === "hydrogen" ? t("readout.vsHelium", { pct: advantage.toFixed(1) }) : undefined
            }
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.grossLift")}
            value={formatMass(budget.grossLift)}
            note={t("readout.volume", { v: Math.round(budget.volume).toLocaleString() })}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.overhead")}
            value={formatMass(budget.envelopeMass + budget.organMass)}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("readout.payload")}
            value={budget.grounded ? t("readout.grounded") : formatMass(budget.netPayload)}
            note={
              budget.grounded
                ? t("readout.minimumDiameter", { d: Math.round(budget.minimumDiameter) })
                : t("readout.households", { n: householdEquivalent(budget.netPayload) })
            }
            tone={toneVar}
            tinted
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <VizSlider
          className="flex-1"
          label={t("diameterLabel")}
          display={`${diameter} m`}
          min={D_MIN}
          max={D_MAX}
          step={1}
          value={diameter}
          onChange={setDiameter}
          tone={toneVar}
        />
        <SegmentedToggle
          ariaLabel={t("materialLabel")}
          value={material}
          onChange={setMaterial}
          options={ENVELOPE_MATERIALS.map((m) => ({
            value: m,
            label: t(`material.${m}`),
            tone: "var(--amber)",
          }))}
        />
      </div>
    </VizFigure>
  );
}
