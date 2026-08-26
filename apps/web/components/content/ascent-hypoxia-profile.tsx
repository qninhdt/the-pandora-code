"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE MODEL — the danger is on the way up, and the alarm is the wrong one
//
// Partial pressure is fraction times ambient pressure:
//
//   P_O2 = F_O2 * P_abs
//
// Descending compresses the lung, so alveolar P_O2 SPIKES even as the
// oxygen itself is being spent. Ascending re-expands it, and P_O2 crashes
// far faster than the oxygen ran out. Below a cerebral floor the diver
// blacks out — in the last few metres, with no warning, because the urge
// to breathe is driven by CO2, not by O2.
//
// SOURCED: cerebral blackout floor P_aO2 ~ 25-30 mmHg; hyperventilation
// drives P_aCO2 below 35 mmHg while adding negligible O2 to already
// saturated haemoglobin; 1 atm per 10.06 m of Earth seawater.
//
// CHOSEN FOR ILLUSTRATION: the resting alveolar oxygen fraction (0.14),
// the CO2 break point (50 mmHg) and its rise rate, the share of metabolic
// demand drawn from lung gas rather than blood and muscle (0.55), and a
// 1 m/s descent and ascent. The research note gives NO diving metabolic
// rate at all, which is why consumption is the reader's slider.
// ─────────────────────────────────────────────────────────────────────

const METRES_PER_ATM = 10.06; // Earth seawater
const MMHG_PER_ATM = 760;
const ALVEOLAR_F_O2 = 0.14;
const LUNG_SHARE = 0.55; // fraction of demand met from lung gas
const BLACKOUT_MMHG = 30; // cerebral floor, upper end of the 25-30 band
const TRAVEL_RATE = 1; // m/s, both directions

const CO2_BREAKPOINT = 50; // mmHg — where the urge to breathe becomes irresistible
const CO2_RISE = 0.22; // mmHg/s
const CO2_START = { normal: 40, hyperventilated: 25 } as const;
type Prep = keyof typeof CO2_START;

/** Depth (m) at time `t` seconds into a dive to `depth` with `bottom` seconds on it. */
function depthAt(t: number, depth: number, bottom: number): number {
  const descent = depth / TRAVEL_RATE;
  if (t <= descent) return t * TRAVEL_RATE;
  if (t <= descent + bottom) return depth;
  const ascending = t - descent - bottom;
  return Math.max(0, depth - ascending * TRAVEL_RATE);
}

/** Alveolar oxygen partial pressure (mmHg) at time `t`. */
function alveolarPO2(t: number, depth: number, bottom: number, vo2: number, tlc: number): number {
  const oxygenAtSurface = tlc * ALVEOLAR_F_O2; // litres of O2 in the held breath
  const spent = (LUNG_SHARE * vo2 * t) / 60;
  const remaining = Math.max(0, oxygenAtSurface - spent);
  const fraction = remaining / tlc;
  const pAbs = 1 + depthAt(t, depth, bottom) / METRES_PER_ATM;
  return fraction * pAbs * MMHG_PER_ATM;
}

const W = 340;
const H = 210;
const PAD = { l: 40, r: 16, t: 16, b: 44 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

const PO2_MAX = 340; // mmHg — headroom for the compression spike

interface AscentHypoxiaProfileProps {
  caption?: string;
  className?: string;
}

// Set a dive, then change nothing but the breathing you did beforehand.
// Hyperventilating buys no oxygen; it only removes the alarm.
export function AscentHypoxiaProfile({ caption, className }: AscentHypoxiaProfileProps) {
  const uid = useId();
  const t = useTranslations("viz.ascentHypoxia");
  const [depth, setDepth] = useState(25);
  const [bottom, setBottom] = useState(45);
  const [vo2, setVo2] = useState(0.75);
  const [prep, setPrep] = useState<Prep>("normal");

  const total = (2 * depth) / TRAVEL_RATE + bottom;
  const xOf = (time: number) => PAD.l + (time / total) * plotW;
  const yOf = (po2: number) => PAD.t + (1 - Math.min(po2, PO2_MAX) / PO2_MAX) * plotH;
  const depthY = (d: number) => PAD.t + plotH - (d / Math.max(depth, 1)) * (plotH * 0.32);

  // Walk the dive second by second and find the first moment the brain's
  // oxygen supply falls through the floor.
  const STEPS = 140;
  const samples: { time: number; po2: number; depth: number }[] = [];
  let crossing: number | null = null;
  for (let i = 0; i <= STEPS; i += 1) {
    const time = (total * i) / STEPS;
    const po2 = alveolarPO2(time, depth, bottom, vo2, 6);
    samples.push({ time, po2, depth: depthAt(time, depth, bottom) });
    if (crossing === null && i > 0 && po2 < BLACKOUT_MMHG) crossing = time;
  }

  const breakPoint = (CO2_BREAKPOINT - CO2_START[prep]) / CO2_RISE;
  const warnedInTime = breakPoint <= (crossing ?? Number.POSITIVE_INFINITY);
  const state = crossing === null ? "safe" : warnedInTime ? "warned" : "blackout";

  const tone =
    state === "safe" ? "var(--teal)" : state === "warned" ? "var(--amber)" : "var(--magenta)";
  const figureTone = state === "safe" ? "teal" : state === "warned" ? "amber" : "magenta";

  const po2Path = samples
    .map((s, i) => `${i === 0 ? "M" : "L"}${xOf(s.time).toFixed(1)},${yOf(s.po2).toFixed(1)}`)
    .join(" ");
  const profilePath = samples
    .map((s, i) => `${i === 0 ? "M" : "L"}${xOf(s.time).toFixed(1)},${depthY(s.depth).toFixed(1)}`)
    .join(" ");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${state}`)}
      caption={caption}
      tone={figureTone}
      className={className}
      controls={
        <SegmentedToggle
          options={[
            { value: "normal", label: t("prep.normal"), tone: "var(--teal)" },
            { value: "hyperventilated", label: t("prep.hyperventilated"), tone: "var(--magenta)" },
          ]}
          value={prep}
          onChange={setPrep}
          ariaLabel={t("prepControl")}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", { seconds: Math.round(total) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />
          <rect x={PAD.l} y={PAD.t} width={plotW} height={plotH} fill={glowUrl(uid, "grid")} />

          {/* below this line the brain stops */}
          <rect
            x={PAD.l}
            y={yOf(BLACKOUT_MMHG)}
            width={plotW}
            height={PAD.t + plotH - yOf(BLACKOUT_MMHG)}
            fill="var(--magenta)"
            opacity={0.1}
          />
          <line
            x1={PAD.l}
            y1={yOf(BLACKOUT_MMHG)}
            x2={PAD.l + plotW}
            y2={yOf(BLACKOUT_MMHG)}
            stroke="var(--magenta)"
            strokeWidth={1.3}
            strokeOpacity={0.75}
            strokeDasharray="4 3"
          />
          <VizText x={PAD.l + 4} y={yOf(BLACKOUT_MMHG) - 4} size="micro" tone="var(--magenta)">
            {t("blackoutLabel")}
          </VizText>

          {/* the dive shape itself, kept faint under the trace */}
          <path
            d={profilePath}
            fill="none"
            stroke="var(--subtle)"
            strokeWidth={1.2}
            strokeOpacity={0.5}
          />

          {/* when the urge to breathe finally arrives */}
          {breakPoint <= total ? (
            <g>
              <line
                x1={xOf(breakPoint)}
                y1={PAD.t}
                x2={xOf(breakPoint)}
                y2={PAD.t + plotH}
                stroke="var(--cyan)"
                strokeWidth={1.2}
                strokeOpacity={0.65}
              />
              <VizText x={xOf(breakPoint) + 4} y={PAD.t + 10} size="micro" tone="var(--cyan)">
                {t("breakpointLabel")}
              </VizText>
            </g>
          ) : null}

          <path
            d={po2Path}
            fill="none"
            stroke={tone}
            strokeWidth={2.4}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "d 0.3s ease" }}
          />

          {crossing !== null ? (
            <circle
              cx={xOf(crossing)}
              cy={yOf(BLACKOUT_MMHG)}
              r={4.6}
              fill="var(--magenta)"
              filter={glowUrl(uid, "bloom-strong")}
            />
          ) : null}

          <VizTick x={PAD.l - 6} y={yOf(200) + 3} anchor="end">
            200
          </VizTick>
          <VizTick x={PAD.l - 6} y={yOf(100) + 3} anchor="end">
            100
          </VizTick>
          <VizTick x={PAD.l} y={PAD.t + plotH + 13} anchor="start">
            0
          </VizTick>
          <VizTick x={PAD.l + plotW} y={PAD.t + plotH + 13} anchor="end">
            {Math.round(total)}
          </VizTick>
          <VizText x={PAD.l + plotW / 2} y={H - 8} size="small" anchor="middle" tone="var(--muted)">
            {t("axis.time")}
          </VizText>
          <VizText
            x={11}
            y={PAD.t + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 11 ${PAD.t + plotH / 2})`}
          >
            {t("axis.po2")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.breakpoint")}
            value={t("secondValue", { n: Math.round(breakPoint) })}
            note={t("readout.breakpointNote", { n: CO2_START[prep] })}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.crossing")}
            value={
              crossing === null
                ? t("readout.neverCrosses")
                : t("secondValue", { n: Math.round(crossing) })
            }
            tone={tone}
          />
          <VizReadout
            label={t("readout.outcome")}
            value={t(`outcome.${state}`)}
            note={t(`verdict.${state}`)}
            tone={tone}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("modelNote")}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <VizSlider
          label={t("slider.depth")}
          display={t("metreValue", { n: depth })}
          min={5}
          max={40}
          step={1}
          value={depth}
          onChange={setDepth}
          tone="var(--cyan)"
        />
        <VizSlider
          label={t("slider.bottom")}
          display={t("secondValue", { n: bottom })}
          min={0}
          max={120}
          step={5}
          value={bottom}
          onChange={setBottom}
          tone="var(--teal)"
        />
        <VizSlider
          label={t("slider.vo2")}
          display={t("perMinLitreValue", { n: vo2.toFixed(2) })}
          min={0.3}
          max={1.5}
          step={0.05}
          value={vo2}
          onChange={setVo2}
          tone="var(--amber)"
        />
      </div>
    </VizFigure>
  );
}
