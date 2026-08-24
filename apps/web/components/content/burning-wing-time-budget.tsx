"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { type PhaseKey, wingTimeBudget } from "./burning-wing-model";

// The stacked bar is the argument. Nearly all of the burn-through budget is one
// phase — boiling the water out of the membrane — while the two markers that
// matter sit right at the left edge, in the first few seconds, where collagen
// denatures and the wing loses roll authority. Reading the bar left to right, the
// reader sees the failure happen long before the fire finishes its work.
const W = 360;
const H = 128;
const PAD_L = 14;
const PAD_R = 14;
const BAR_Y = 42;
const BAR_H = 26;
const BAR_W = W - PAD_L - PAD_R;

const PHASE_ORDER: PhaseKey[] = ["denature", "boil", "desiccate", "char"];

export interface BurningWingTimeBudgetProps {
  caption?: string;
  className?: string;
}

export function BurningWingTimeBudget({ caption, className }: BurningWingTimeBudgetProps) {
  const t = useTranslations("viz.burning-wing");
  const uid = useId();
  const [thickness, setThickness] = useState(0.8);
  const [flux, setFlux] = useState(40);

  const budget = wingTimeBudget(thickness, flux);
  const total = budget.burnThroughAt;
  const scale = (seconds: number) => (seconds / total) * BAR_W;

  // Cumulative left edge of each phase segment.
  let cursor = PAD_L;
  const segments = PHASE_ORDER.map((key) => {
    const phase = budget.phases.find((p) => p.key === key);
    const width = phase ? scale(phase.seconds) : 0;
    const seg = { key, x: cursor, width, tone: phase?.tone ?? "var(--border)" };
    cursor += width;
    return seg;
  });

  const locFromX = PAD_L + scale(budget.locFrom);
  const locToX = PAD_L + scale(budget.locTo);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint", {
        loc: fmt(budget.locFrom),
        burn: fmt(budget.burnThroughAt),
        water: Math.round(budget.waterSharePct),
      })}
      caption={caption}
      tone="amber"
      className={className}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={t("aria", { loc: fmt(budget.locFrom), burn: fmt(budget.burnThroughAt) })}
      >
        <GlowDefs idBase={uid} tones={["amber", "cyan", "teal", "magenta"]} />

        {/* the four thermal phases, laid end to end across the full budget */}
        {segments.map((seg, i) => (
          <g key={seg.key}>
            <rect
              x={seg.x}
              y={BAR_Y}
              width={Math.max(0, seg.width)}
              height={BAR_H}
              fill={seg.tone}
              fillOpacity={0.5}
              stroke={seg.tone}
              strokeOpacity={0.8}
              strokeWidth={0.8}
              style={{ transition: "x 0.35s ease, width 0.35s ease" }}
            />
            {seg.width > 46 ? (
              <VizText
                x={seg.x + seg.width / 2}
                y={BAR_Y + BAR_H / 2 + 3}
                size="micro"
                tone={seg.tone}
                anchor="middle"
                weight={700}
              >
                {t(`phase.${seg.key}`)}
              </VizText>
            ) : null}
            {/* short phases get their label stacked above the bar instead */}
            {seg.width <= 46 ? (
              <VizText
                x={seg.x}
                y={BAR_Y - 6 - (i % 2) * 11}
                size="micro"
                tone={seg.tone}
                anchor="start"
              >
                {t(`phase.${seg.key}`)}
              </VizText>
            ) : null}
          </g>
        ))}

        {/* the loss-of-control window — the answer the figure exists to deliver */}
        <rect
          x={locFromX}
          y={BAR_Y - 4}
          width={Math.max(2, locToX - locFromX)}
          height={BAR_H + 8}
          fill="var(--magenta)"
          fillOpacity={0.24}
          stroke="var(--magenta)"
          strokeWidth={1.2}
          filter={glowUrl(uid, "bloom")}
          style={{ transition: "x 0.35s ease, width 0.35s ease" }}
        />
        <VizText
          x={locToX + 5}
          y={BAR_Y + BAR_H + 22}
          size="small"
          tone="var(--magenta)"
          weight={700}
        >
          {t("locMarker", { from: fmt(budget.locFrom), to: fmt(budget.locTo) })}
        </VizText>

        {/* the far end of the bar: physical burn-through, tens of seconds away */}
        <line
          x1={PAD_L + BAR_W}
          y1={BAR_Y - 6}
          x2={PAD_L + BAR_W}
          y2={BAR_Y + BAR_H + 6}
          stroke="var(--foreground)"
          strokeOpacity={0.4}
          strokeWidth={1}
        />
        <VizText x={PAD_L + BAR_W} y={BAR_Y + BAR_H + 22} size="small" tone="subtle" anchor="end">
          {t("burnMarker", { s: fmt(budget.burnThroughAt) })}
        </VizText>

        <VizText x={PAD_L} y={22} size="micro" tone="subtle">
          {t("ignition")}
        </VizText>
      </svg>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("readout.loc")}
          value={t("readout.locValue", { from: fmt(budget.locFrom), to: fmt(budget.locTo) })}
          note={t("readout.locNote")}
          tone="var(--magenta)"
          tinted
        />
        <VizReadout
          label={t("readout.burn")}
          value={t("readout.seconds", { s: fmt(budget.burnThroughAt) })}
          note={t("readout.burnNote", { water: Math.round(budget.waterSharePct) })}
          tone="var(--teal)"
        />
        <VizReadout
          label={t("readout.biot")}
          value={budget.biot.toFixed(3)}
          note={budget.biot < 0.1 ? t("readout.biotThin") : t("readout.biotThick")}
          tone="var(--cyan)"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VizSlider
          label={t("slider.thickness")}
          display={t("slider.thicknessValue", { v: thickness.toFixed(2) })}
          min={0.05}
          max={1.5}
          step={0.05}
          value={thickness}
          onChange={setThickness}
          tone="var(--teal)"
        />
        <VizSlider
          label={t("slider.flux")}
          display={`${flux} kW/m²`}
          min={10}
          max={90}
          step={5}
          value={flux}
          onChange={setFlux}
          tone="var(--amber)"
        />
      </div>
    </VizFigure>
  );
}

// Sub-second values need a decimal; tens of seconds do not. Keeps the markers
// readable without pretending to stopwatch precision.
function fmt(seconds: number): string {
  return seconds < 10 ? seconds.toFixed(1) : Math.round(seconds).toString();
}
