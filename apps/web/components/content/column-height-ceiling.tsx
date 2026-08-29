"use client";

import {
  REFERENCES,
  type TrunkProfile,
  criticalHeight,
  requiredDiameter,
  safetyFactor,
} from "@/components/content/column-height-ceiling-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// The figure that delivers the chapter's surprise. Set the trunk's base diameter
// and its wood, and Greenhill's formula returns the height at which the column
// buckles under its own weight. Ordinary wood clears Hometree's 300 m with room
// to spare — and dragging gravity between Earth and Pandora barely moves the
// line, because gravity sits under a cube root. Whatever stops a tree at 130 m
// on Earth, it is not this.

const W = 300;
const H = 210;
const AXIS_X = 52;
const PLOT_W = W - AXIS_X - 60;
/** Metres at the top of the scale — comfortably above Hometree. */
const SCALE_MAX = 1700;

const DEFAULTS = {
  diameter: 30,
  modulus: 10,
  density: 600,
  gravityRatio: 0.8,
} as const;

const PROFILES: TrunkProfile[] = ["uniform", "tapered"];

/** Hometree's canonical overall height — the number the figure is really asking about. */
const HOMETREE_HEIGHT = 300;

interface ColumnHeightCeilingProps {
  caption?: string;
  className?: string;
}

export function ColumnHeightCeiling({ caption, className }: ColumnHeightCeilingProps) {
  const uid = useId();
  const t = useTranslations("viz.columnHeightCeiling");

  const [diameter, setDiameter] = useState<number>(DEFAULTS.diameter);
  const [modulus, setModulus] = useState<number>(DEFAULTS.modulus);
  const [density, setDensity] = useState<number>(DEFAULTS.density);
  const [gravityRatio, setGravityRatio] = useState<number>(DEFAULTS.gravityRatio);
  const [profile, setProfile] = useState<TrunkProfile>("uniform");

  const inputs = useMemo(
    () => ({ diameter, modulus, density, gravityRatio, profile }),
    [diameter, modulus, density, gravityRatio, profile],
  );
  const ceiling = useMemo(() => criticalHeight(inputs), [inputs]);
  const neededD = useMemo(
    () => requiredDiameter(HOMETREE_HEIGHT, { modulus, density, gravityRatio, profile }),
    [modulus, density, gravityRatio, profile],
  );
  const sf = safetyFactor(inputs, HOMETREE_HEIGHT);
  const clears = sf >= 1;
  const tone = clears ? "teal" : "magenta";
  const toneVar = `var(--${tone})`;

  const toY = (metres: number) => H - 16 - (Math.min(metres, SCALE_MAX) / SCALE_MAX) * (H - 34);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={tone}
      caption={caption}
      hint={t("hint")}
      controls={
        <SegmentedToggle
          options={PROFILES.map((p) => ({ value: p, label: t(`profile.${p}`) }))}
          value={profile}
          onChange={setProfile}
          ariaLabel={t("profileLabel")}
        />
      }
      className={className}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr] sm:items-start">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={t("aria", { height: Math.round(ceiling) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {/* height scale */}
          <line
            x1={AXIS_X}
            y1={toY(0)}
            x2={AXIS_X}
            y2={toY(SCALE_MAX)}
            stroke="var(--border-strong)"
            strokeWidth={0.75}
          />
          {[0, 400, 800, 1200, 1600].map((m) => (
            <g key={m}>
              <line
                x1={AXIS_X - 3}
                y1={toY(m)}
                x2={AXIS_X}
                y2={toY(m)}
                stroke="var(--border-strong)"
                strokeWidth={0.75}
              />
              <text
                x={AXIS_X - 6}
                y={toY(m) + 3}
                textAnchor="end"
                className="font-sans tabular-nums"
                style={{ fill: "var(--subtle)", fontSize: 7.5 }}
              >
                {m}
              </text>
            </g>
          ))}
          <text
            x={AXIS_X - 6}
            y={toY(SCALE_MAX) - 6}
            textAnchor="end"
            className="font-sans"
            style={{ fill: "var(--subtle)", fontSize: 7.5 }}
          >
            {t("axisMetres")}
          </text>

          {/* the trunk, drawn to the buckling ceiling */}
          <TrunkColumn
            x={AXIS_X + 18}
            baseY={toY(0)}
            topY={toY(ceiling)}
            widthPx={Math.max(4, Math.min(38, (diameter / 50) * 38))}
            tapered={profile === "tapered"}
            toneVar={toneVar}
            idBase={uid}
          />

          {/* reference heights */}
          {REFERENCES.map((ref) => (
            <g key={ref.key}>
              <line
                x1={AXIS_X}
                y1={toY(ref.height)}
                x2={AXIS_X + PLOT_W + 44}
                y2={toY(ref.height)}
                stroke={`var(--${ref.tone})`}
                strokeWidth={0.75}
                strokeDasharray="3 4"
                strokeOpacity={0.75}
              />
              <text
                x={AXIS_X + PLOT_W + 46}
                y={toY(ref.height) + 3}
                className="font-sans"
                style={{ fill: `var(--${ref.tone})`, fontSize: 7.5 }}
              >
                {t(`reference.${ref.key}`)}
              </text>
            </g>
          ))}

          {/* the computed ceiling */}
          <line
            x1={AXIS_X}
            y1={toY(ceiling)}
            x2={AXIS_X + PLOT_W + 44}
            y2={toY(ceiling)}
            stroke={toneVar}
            strokeWidth={1.5}
            filter={glowUrl(uid, "bloom")}
          />
        </svg>

        <div className="grid gap-2">
          <VizReadout
            label={t("readout.ceiling")}
            value={t("readout.metres", { value: Math.round(ceiling).toLocaleString() })}
            note={t("readout.ceilingNote")}
            tone={toneVar}
            tinted
          />
          <VizReadout
            label={t("readout.safety")}
            value={t("readout.times", { value: sf.toFixed(1) })}
            note={t("readout.safetyNote")}
            tone={toneVar}
          />
          <VizReadout
            label={t("readout.needed")}
            value={t("readout.metresPrecise", { value: neededD.toFixed(2) })}
            note={t("readout.neededNote")}
            tone="var(--amber)"
          />
          <p className="font-sans text-xs leading-relaxed text-muted">
            {clears ? t("verdict.clears") : t("verdict.fails")}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <VizSlider
          label={t("slider.diameter")}
          display={t("readout.metresPrecise", { value: diameter.toFixed(1) })}
          min={1}
          max={50}
          step={0.5}
          value={diameter}
          onChange={setDiameter}
          tone={toneVar}
        />
        <VizSlider
          label={t("slider.gravity")}
          display={t("slider.gravityValue", { value: gravityRatio.toFixed(2) })}
          min={0.2}
          max={1.5}
          step={0.05}
          value={gravityRatio}
          onChange={setGravityRatio}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("slider.modulus")}
          display={t("slider.modulusValue", { value: modulus.toFixed(1) })}
          min={2}
          max={40}
          step={0.5}
          value={modulus}
          onChange={setModulus}
          tone="var(--cyan)"
        />
        <VizSlider
          label={t("slider.density")}
          display={t("slider.densityValue", { value: Math.round(density) })}
          min={120}
          max={1200}
          step={10}
          value={density}
          onChange={setDensity}
          tone="var(--cyan)"
        />
      </div>
    </VizFigure>
  );
}

interface TrunkColumnProps {
  x: number;
  baseY: number;
  topY: number;
  widthPx: number;
  tapered: boolean;
  toneVar: string;
  idBase: string;
}

/** The trunk as a filled column, flaring at the base when tapered. */
function TrunkColumn({ x, baseY, topY, widthPx, tapered, toneVar, idBase }: TrunkColumnProps) {
  const halfBase = widthPx / 2;
  const halfTop = tapered ? Math.max(1.5, halfBase * 0.25) : halfBase;
  const cx = x + halfBase;
  const d = `M ${cx - halfBase} ${baseY} L ${cx - halfTop} ${topY} L ${cx + halfTop} ${topY} L ${cx + halfBase} ${baseY} Z`;
  return (
    <path
      d={d}
      fill={`color-mix(in oklab, ${toneVar} 26%, transparent)`}
      stroke={toneVar}
      strokeWidth={1}
      filter={glowUrl(idBase, "bloom")}
    />
  );
}
