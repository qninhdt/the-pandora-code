"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  PACK_STRIKE_LATENCY_MS,
  PACK_STRIKE_SPEED_MS,
  requiredRetialGain,
  thermalScope,
} from "./thermal-scope-model";

// Two gauges, because cold water charges the animal in two different currencies
// and only one of them is obvious. Speed sags gently — power goes as u³, so a
// fivefold metabolic penalty is only a 1.7-fold speed penalty. Reaction time is
// the one that fails, and it fails linearly. Drag the heat-retention slider up and
// watch the latency needle come back through the threshold long before anything
// dramatic happens to the speed. Maths in the model; strings translate.

const W = 320;
const H = 200;

/** Two vertical bar gauges, side by side. */
const GAUGE_TOP = 30;
const GAUGE_H = 116;
const SPEED_X = 78;
const LATENCY_X = 208;
const GAUGE_W = 46;

const SPEED_MAX = 14; // m/s
const LATENCY_MAX = 800; // ms

interface ThermalScopeDialProps {
  caption?: string;
  className?: string;
}

export function ThermalScopeDial({ caption, className }: ThermalScopeDialProps) {
  const uid = useId();
  const t = useTranslations("viz.thermalScope");
  const [ambient, setAmbient] = useState(3); // °C — abyssal water
  const [q10, setQ10] = useState(2.25);
  const [retialGain, setRetialGain] = useState(0); // °C above ambient

  const s = thermalScope(ambient, q10, retialGain);
  const needed = requiredRetialGain(ambient, q10);
  const tone = s.meetsPackStrike ? "teal" : "magenta";
  const toneVar = `var(--${tone})`;

  const speedFill = Math.min(1, s.burstMs / SPEED_MAX);
  const latencyFill = Math.min(1, s.latencyMs / LATENCY_MAX);
  const speedThresholdY = GAUGE_TOP + GAUGE_H * (1 - PACK_STRIKE_SPEED_MS / SPEED_MAX);
  const latencyThresholdY = GAUGE_TOP + GAUGE_H * (1 - PACK_STRIKE_LATENCY_MS / LATENCY_MAX);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(s.meetsPackStrike ? "hint.capable" : "hint.tooSlow", {
        needed: Number.isFinite(needed) ? needed.toFixed(1) : "—",
      })}
      caption={caption}
      tone={tone}
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            temp: s.muscleTempC.toFixed(0),
            latency: Math.round(s.latencyMs),
          })}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "amber"]} />

          {/* burst speed: sags, but never dramatically */}
          <GaugeColumn
            x={SPEED_X}
            fill={speedFill}
            thresholdY={speedThresholdY}
            tone={s.burstMs >= PACK_STRIKE_SPEED_MS ? "var(--teal)" : "var(--magenta)"}
            uid={uid}
            label={t("gauge.speed")}
            value={`${s.burstMs.toFixed(1)} m/s`}
            thresholdLabel={t("gauge.speedThreshold")}
            /* speed is "good when high", so the bar grows from the bottom */
            invert={false}
          />

          {/* strike latency: the currency that actually fails */}
          <GaugeColumn
            x={LATENCY_X}
            fill={latencyFill}
            thresholdY={latencyThresholdY}
            tone={s.latencyMs <= PACK_STRIKE_LATENCY_MS ? "var(--teal)" : "var(--magenta)"}
            uid={uid}
            label={t("gauge.latency")}
            value={`${Math.round(s.latencyMs)} ms`}
            thresholdLabel={t("gauge.latencyThreshold")}
            invert
          />

          <VizText x={W / 2} y={H - 8} size="micro" anchor="middle" tone="subtle">
            {t("footnote")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.muscleTemp")}
            value={`${s.muscleTempC.toFixed(0)} °C`}
            note={t("readout.muscleTempNote", { ambient: ambient.toFixed(0) })}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("readout.rate")}
            value={`${Math.round(s.rateFraction * 100)}%`}
            note={t("readout.rateNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.verdict")}
            value={t(s.meetsPackStrike ? "verdict.capable" : "verdict.tooSlow")}
            note={
              Number.isFinite(needed)
                ? t("readout.verdictNote", { needed: needed.toFixed(1) })
                : t("readout.verdictImpossible")
            }
            tone={toneVar}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("earthCheck")}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <VizSlider
          label={t("slider.ambient")}
          display={`${ambient.toFixed(0)} °C`}
          min={2}
          max={28}
          step={1}
          value={ambient}
          onChange={setAmbient}
          tone="var(--cyan)"
        />
        <VizSlider
          label={t("slider.q10")}
          display={q10.toFixed(2)}
          min={2}
          max={2.5}
          step={0.05}
          value={q10}
          onChange={setQ10}
          tone="var(--teal)"
        />
        <VizSlider
          label={t("slider.retia")}
          display={t("slider.retiaValue", { v: retialGain.toFixed(1) })}
          min={0}
          max={15}
          step={0.5}
          value={retialGain}
          onChange={setRetialGain}
          tone="var(--amber)"
        />
      </div>
    </VizFigure>
  );
}

// One vertical bar gauge with a dashed pass/fail line across it. `invert` flips the
// sense of the line for a quantity that is good when low.
function GaugeColumn({
  x,
  fill,
  thresholdY,
  tone,
  uid,
  label,
  value,
  thresholdLabel,
  invert,
}: {
  x: number;
  fill: number;
  thresholdY: number;
  tone: string;
  uid: string;
  label: string;
  value: string;
  thresholdLabel: string;
  invert: boolean;
}) {
  const barH = Math.max(2, GAUGE_H * fill);
  return (
    <g>
      <rect
        x={x - GAUGE_W / 2}
        y={GAUGE_TOP}
        width={GAUGE_W}
        height={GAUGE_H}
        rx={4}
        fill="color-mix(in oklab, var(--void) 45%, transparent)"
        stroke="var(--border)"
        strokeWidth={0.6}
      />
      {/* the region that fails, tinted so the pass side reads as the safe one */}
      <rect
        x={x - GAUGE_W / 2}
        y={invert ? GAUGE_TOP : thresholdY}
        width={GAUGE_W}
        height={invert ? thresholdY - GAUGE_TOP : GAUGE_TOP + GAUGE_H - thresholdY}
        fill="var(--magenta)"
        opacity={0.08}
      />
      <rect
        x={x - GAUGE_W / 2}
        y={GAUGE_TOP + GAUGE_H - barH}
        width={GAUGE_W}
        height={barH}
        rx={4}
        fill={tone}
        opacity={0.85}
        filter={glowUrl(uid, "bloom")}
        style={{ transition: "height 0.25s ease, y 0.25s ease" }}
      />
      <line
        x1={x - GAUGE_W / 2 - 6}
        y1={thresholdY}
        x2={x + GAUGE_W / 2 + 6}
        y2={thresholdY}
        stroke="var(--amber)"
        strokeWidth={1.4}
        strokeDasharray="4 3"
      />
      <VizText x={x + GAUGE_W / 2 + 9} y={thresholdY + 3} size="micro" tone="var(--amber)">
        {thresholdLabel}
      </VizText>
      <VizText x={x} y={GAUGE_TOP - 8} size="small" anchor="middle" tone="var(--muted)">
        {label}
      </VizText>
      <VizTick x={x} y={GAUGE_TOP + GAUGE_H + 14}>
        {value}
      </VizTick>
    </g>
  );
}
