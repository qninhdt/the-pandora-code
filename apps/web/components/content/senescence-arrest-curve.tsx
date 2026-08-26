"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE MODEL — what "stops aging" has to mean numerically
//
// Gompertz-Makeham mortality hazard at age t:
//
//   h(t) = h0 * exp(G t) + M
//
// h0 is baseline vulnerability at maturity, G is the actuarial rate of aging, and
// M is the age-independent extrinsic component (accidents, violence). In modern
// human populations the mortality rate doubling time ln2/G is about 8 years.
//
// Three regimes an intervention can produce:
//   compress   — G unchanged; the curve shifts right (morbidity postponed)
//   decelerate — G reduced; doubling time lengthens (what rapamycin does, by ~10%)
//   arrest     — G driven to zero; hazard collapses to the flat floor h0 + M,
//                and death becomes purely extrinsic. This is the amrita claim.
//
// Setting G = 0 is not an incremental improvement on deceleration. It is a
// different kind of statement, and nothing on Earth has ever produced it.
// ─────────────────────────────────────────────────────────────────────

type Regime = "compress" | "decelerate" | "arrest";

const H0 = 0.0008; // annual hazard at maturity (age 30)
const AGE_MIN = 30;
const AGE_MAX = 130;

function hazard(regime: Regime, g: number, m: number, shift: number, age: number): number {
  if (regime === "arrest") return H0 + m;
  const effectiveAge = regime === "compress" ? age - AGE_MIN - shift : age - AGE_MIN;
  return H0 * Math.exp(g * Math.max(0, effectiveAge)) + m;
}

/** Mortality rate doubling time in years. Infinite when aging is arrested. */
function doublingTime(regime: Regime, g: number): number {
  if (regime === "arrest" || g <= 0) return Number.POSITIVE_INFINITY;
  return Math.LN2 / g;
}

/**
 * Median survival age under the hazard: integrate the survival function until it
 * falls below 0.5. Capped at AGE_MAX so an arrested curve reports the cap rather
 * than a meaningless extrapolation.
 */
function medianAge(regime: Regime, g: number, m: number, shift: number): number {
  let surv = 1;
  const step = 0.5;
  for (let age = AGE_MIN; age < 400; age += step) {
    surv *= Math.exp(-hazard(regime, g, m, shift, age) * step);
    if (surv <= 0.5) return age;
  }
  return 400;
}

const W = 330;
const H = 220;
const PAD_L = 44;
const PAD_R = 14;
const PAD_T = 18;
const PAD_B = 34;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const SAMPLES = 80;
const LOG_LO = -4; // hazard 1e-4
const LOG_HI = 0; // hazard 1.0

const xOf = (age: number) => PAD_L + ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * plotW;
const yOf = (h: number) =>
  PAD_T + (1 - (Math.log10(Math.max(1e-5, h)) - LOG_LO) / (LOG_HI - LOG_LO)) * plotH;

function curveFor(regime: Regime, g: number, m: number, shift: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const age = AGE_MIN + (i / SAMPLES) * (AGE_MAX - AGE_MIN);
    pts.push(
      `${i === 0 ? "M" : "L"}${xOf(age).toFixed(1)} ${yOf(hazard(regime, g, m, shift, age)).toFixed(1)}`,
    );
  }
  return pts.join(" ");
}

interface SenescenceArrestCurveProps {
  caption?: string;
  className?: string;
}

// Compare what an intervention claims against what the mortality curve would have
// to do. Deceleration bends the line; arrest flattens it entirely — and only the
// second one is what "stops aging" says.
export function SenescenceArrestCurve({ caption, className }: SenescenceArrestCurveProps) {
  const uid = useId();
  const t = useTranslations("viz.senescenceArrest");
  const [regime, setRegime] = useState<Regime>("decelerate");
  const [gPct, setGPct] = useState(78); // % of baseline aging rate retained
  const [extrinsic, setExtrinsic] = useState(0.4); // % annual extrinsic hazard

  const gBase = Math.LN2 / 8; // baseline: 8-year mortality doubling time
  const g = regime === "decelerate" ? gBase * (gPct / 100) : gBase;
  const m = extrinsic / 100;
  const shift = regime === "compress" ? 12 : 0;

  const { baseline, treated, mrdt, median, baselineMedian } = useMemo(
    () => ({
      baseline: curveFor("decelerate", gBase, m, 0),
      treated: curveFor(regime, g, m, shift),
      mrdt: doublingTime(regime, g),
      median: medianAge(regime, g, m, shift),
      baselineMedian: medianAge("decelerate", gBase, m, 0),
    }),
    [regime, g, gBase, m, shift],
  );

  const tone =
    regime === "arrest"
      ? "var(--magenta)"
      : regime === "decelerate"
        ? "var(--teal)"
        : "var(--amber)";
  const figTone = regime === "arrest" ? "magenta" : regime === "decelerate" ? "teal" : "amber";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${regime}`)}
      caption={caption}
      tone={figTone}
      className={className}
      controls={
        <div className="flex w-full flex-col items-end gap-2">
          <SegmentedToggle<Regime>
            options={[
              { value: "compress", label: t("regime.compress"), tone: "var(--amber)" },
              { value: "decelerate", label: t("regime.decelerate"), tone: "var(--teal)" },
              { value: "arrest", label: t("regime.arrest"), tone: "var(--magenta)" },
            ]}
            value={regime}
            onChange={setRegime}
            ariaLabel={t("controls.regime")}
          />
          {regime === "decelerate" ? (
            <VizSlider
              className="w-40 sm:w-52"
              label={t("controls.rate")}
              display={`${gPct}%`}
              min={20}
              max={100}
              step={1}
              value={gPct}
              onChange={setGPct}
              tone="var(--teal)"
            />
          ) : null}
          <VizSlider
            className="w-40 sm:w-52"
            label={t("controls.extrinsic")}
            display={`${extrinsic.toFixed(1)}%/yr`}
            min={0.1}
            max={2}
            step={0.1}
            value={extrinsic}
            onChange={setExtrinsic}
            tone="var(--cyan)"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t(`aria.${regime}`)}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "amber"]} />

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

          {/* untreated Gompertz hazard, for reference */}
          <path
            d={baseline}
            fill="none"
            stroke="var(--subtle)"
            strokeWidth={1.2}
            strokeDasharray="3 3"
            strokeOpacity={0.7}
          />
          {/* the intervention's hazard */}
          <path
            d={treated}
            fill="none"
            stroke={tone}
            strokeWidth={2}
            filter={glowUrl(uid, "bloom")}
          />

          <VizTick x={PAD_L} y={H - 18}>
            30
          </VizTick>
          <VizTick x={xOf(80)} y={H - 18}>
            80
          </VizTick>
          <VizTick x={PAD_L + plotW} y={H - 18}>
            130
          </VizTick>
          <VizText x={PAD_L + plotW / 2} y={H - 5} size="small" anchor="middle" tone="var(--muted)">
            {t("axis.age")}
          </VizText>
          <VizText
            x={11}
            y={PAD_T + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 11 ${PAD_T + plotH / 2})`}
          >
            {t("axis.hazard")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.mrdt")}
            value={Number.isFinite(mrdt) ? `${mrdt.toFixed(1)} yr` : "∞"}
            note={t("note.mrdt")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.median")}
            value={median >= 400 ? "> 400" : `${Math.round(median)}`}
            note={t("note.median", { baseline: Math.round(baselineMedian) })}
            tone={tone}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("units")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
