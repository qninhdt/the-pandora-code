"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  HCO3_MAX,
  HCO3_MIN,
  PACO2_MAX,
  PACO2_MIN,
  PRESETS,
  PRESET_STATE,
  type PresetKey,
  bicarbonateFraction,
  isoPhCurve,
  paco2Fraction,
  solveAcidBase,
} from "./acid-base-set-point-model";

const W = 330;
const H = 232;
const PAD_L = 44;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 40;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const VERDICT_TONE = {
  lethalAcidosis: "var(--magenta)",
  compensatedLow: "var(--cyan)",
  terrestrialNormal: "var(--teal)",
  alkalosis: "var(--amber)",
  lethalAlkalosis: "var(--magenta)",
} as const;

const VERDICT_FIGURE_TONE = {
  lethalAcidosis: "magenta",
  compensatedLow: "cyan",
  terrestrialNormal: "teal",
  alkalosis: "amber",
  lethalAlkalosis: "magenta",
} as const;

const LOAD_TONE = {
  ordinary: "var(--teal)",
  elevated: "var(--amber)",
  unaffordable: "var(--magenta)",
} as const;

// Carbon dioxide tension runs across, plasma bicarbonate up, and the two dashed
// lines are the pairs that hold pH 7.40 and pH 7.16 exactly. The point of the plot
// is the slope: holding a fixed pH against rising carbon dioxide is a straight
// climb in bicarbonate, so a body breathing Pandoran air either carries an
// unaffordable reserve or moves its set-point down. The presets walk that argument.
export function AcidBaseSetPointSolver({
  caption,
  className,
}: {
  caption?: string;
  className?: string;
}) {
  const uid = useId();
  const t = useTranslations("viz.acidBaseSetPoint");
  const [preset, setPreset] = useState<PresetKey>("earth");
  const [paco2, setPaco2] = useState(PRESET_STATE.earth.paco2);
  const [bicarbonate, setBicarbonate] = useState(PRESET_STATE.earth.bicarbonate);

  function applyPreset(key: PresetKey) {
    setPreset(key);
    setPaco2(PRESET_STATE[key].paco2);
    setBicarbonate(PRESET_STATE[key].bicarbonate);
  }

  const out = useMemo(() => solveAcidBase(paco2, bicarbonate), [paco2, bicarbonate]);
  const tone = VERDICT_TONE[out.verdict];

  const xOf = (v: number) => PAD_L + paco2Fraction(v) * plotW;
  const yOf = (v: number) => PAD_T + (1 - bicarbonateFraction(v)) * plotH;

  const earthPhPath = isoPhCurve(7.4)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${PAD_L + p.x * plotW} ${PAD_T + (1 - p.y) * plotH}`)
    .join(" ");
  const nativePhPath = isoPhCurve(7.16)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${PAD_L + p.x * plotW} ${PAD_T + (1 - p.y) * plotH}`)
    .join(" ");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${preset}`)}
      caption={caption}
      tone={VERDICT_FIGURE_TONE[out.verdict]}
      className={className}
      controls={
        <div className="flex w-full flex-col items-end gap-2">
          <SegmentedToggle<PresetKey>
            options={PRESETS.map((key) => ({
              value: key,
              label: t(`preset.${key}`),
              tone: key === "earth" ? "var(--teal)" : "var(--cyan)",
            }))}
            value={preset}
            onChange={applyPreset}
            ariaLabel={t("controls.preset")}
          />
          <div className="flex w-40 flex-col gap-2 sm:w-52">
            <VizSlider
              label={t("controls.paco2")}
              display={t("mmHgValue", { n: paco2 })}
              min={PACO2_MIN}
              max={PACO2_MAX}
              step={1}
              value={paco2}
              onChange={setPaco2}
              tone="var(--amber)"
            />
            <VizSlider
              label={t("controls.bicarbonate")}
              display={t("mmolValue", { n: bicarbonate })}
              min={HCO3_MIN}
              max={HCO3_MAX}
              step={1}
              value={bicarbonate}
              onChange={setBicarbonate}
              tone="var(--cyan)"
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t(`aria.${out.verdict}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          <rect
            x={PAD_L}
            y={PAD_T}
            width={plotW}
            height={plotH}
            fill={glowUrl(uid, "grid")}
            fillOpacity={0.5}
          />

          {/* the pairs that hold each set-point exactly */}
          <path
            d={earthPhPath}
            fill="none"
            stroke="var(--teal)"
            strokeWidth={1.4}
            strokeDasharray="5 3"
            strokeOpacity={0.85}
          />
          <path
            d={nativePhPath}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={1.4}
            strokeDasharray="5 3"
            strokeOpacity={0.85}
          />

          <VizText x={PAD_L + plotW - 4} y={yOf(74) - 4} size="micro" anchor="end" tone="teal">
            {t("iso.earth")}
          </VizText>
          <VizText x={PAD_L + plotW - 4} y={yOf(42) + 10} size="micro" anchor="end" tone="cyan">
            {t("iso.native")}
          </VizText>

          {/* axes */}
          <line
            x1={PAD_L}
            y1={PAD_T + plotH}
            x2={PAD_L + plotW}
            y2={PAD_T + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <VizTick x={PAD_L} y={PAD_T + plotH + 12}>
            {PACO2_MIN}
          </VizTick>
          <VizTick x={PAD_L + plotW} y={PAD_T + plotH + 12}>
            {PACO2_MAX}
          </VizTick>
          <VizTick x={PAD_L - 6} y={PAD_T + plotH} anchor="end">
            {HCO3_MIN}
          </VizTick>
          <VizTick x={PAD_L - 6} y={PAD_T + 4} anchor="end">
            {HCO3_MAX}
          </VizTick>
          <VizText
            x={PAD_L + plotW / 2}
            y={PAD_T + plotH + 28}
            size="small"
            anchor="middle"
            tone="var(--muted)"
          >
            {t("axis.paco2")}
          </VizText>
          <VizText
            x={11}
            y={PAD_T + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 11 ${PAD_T + plotH / 2})`}
          >
            {t("axis.bicarbonate")}
          </VizText>

          {/* where this blood sits */}
          <circle cx={xOf(paco2)} cy={yOf(bicarbonate)} r={15} fill={glowUrl(uid, "wash-cyan")} />
          <circle
            cx={xOf(paco2)}
            cy={yOf(bicarbonate)}
            r={4.5}
            fill={tone}
            filter={glowUrl(uid, "bloom")}
          />
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.ph")}
            value={out.ph.toFixed(2)}
            note={t(`verdict.${out.verdict}`)}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("readout.load")}
            value={t(`load.${out.load}`)}
            note={t(`loadNote.${out.load}`)}
            tone={LOAD_TONE[out.load]}
          />
          <VizReadout
            label={t("readout.earthCost")}
            value={t("mmolValue", { n: Math.round(out.bicarbonateForEarthPh) })}
            note={t("earthCostNote")}
            tone="var(--amber)"
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("modelNote")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
