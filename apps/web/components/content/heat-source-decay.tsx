"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface HeatSourceDecayProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL — the three heat sources over deep time
//
// A young rocky body is born hot (accretion + differentiation) and hot
// with short-lived isotopes. Over billions of years:
//   • Primordial heat leaks away — secular cooling, a slow decline.
//   • Radiogenic heat decays as the sum of long-lived isotopes
//     (U-238, U-235, Th-232, K-40), each ∝ e^(-λt). It falls severalfold.
//   • Tidal heating, IF an orbital resonance pumps eccentricity, stays
//     roughly flat across the age of the system — it is not a decay bank
//     but a continuously refilled one.
// The point of the figure: for a small, ancient moon, the born-with and
// in-the-rocks banks run low, so a still-molten interior demands the
// third, resonance-fed source. Curves are illustrative (normalized to
// each source's t=0 contribution), not a fitted thermal history.
// ─────────────────────────────────────────────────────────────────────

// Long-lived isotope decay constants (per Gyr) and present-day-ish weights.
const ISOTOPES = [
  { lambda: Math.LN2 / 4.468, w: 0.35 }, // U-238
  { lambda: Math.LN2 / 0.704, w: 0.2 }, // U-235
  { lambda: Math.LN2 / 14.05, w: 0.3 }, // Th-232
  { lambda: Math.LN2 / 1.248, w: 0.15 }, // K-40
];

// Radiogenic output relative to t=0 (formation), normalized to 1 at t=0.
function radiogenic(tGyr: number): number {
  return ISOTOPES.reduce((s, i) => s + i.w * Math.exp(-i.lambda * tGyr), 0);
}
// Primordial secular cooling: a slow decline toward a residual floor.
function primordial(tGyr: number): number {
  return 0.15 + 0.85 * Math.exp(-tGyr / 3.2);
}
// Resonance-fed tidal heating: roughly flat (small ripple for texture).
function tidal(): number {
  return 0.62;
}

const T_MAX = 4.6; // Gyr
const W_SVG = 340;
const H_SVG = 200;
const PAD_L = 34;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 30;
const PLOT_W = W_SVG - PAD_L - PAD_R;
const PLOT_H = H_SVG - PAD_T - PAD_B;

const SERIES = [
  { key: "primordial", fn: (t: number) => primordial(t), tone: "amber" },
  { key: "radiogenic", fn: (t: number) => radiogenic(t), tone: "cyan" },
  { key: "tidal", fn: (_t: number) => tidal(), tone: "teal" },
] as const;

function xOf(t: number): number {
  return PAD_L + (t / T_MAX) * PLOT_W;
}
function yOf(v: number): number {
  return PAD_T + (1 - Math.min(1, v)) * PLOT_H;
}

function pathFor(fn: (t: number) => number): string {
  const steps = 60;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * T_MAX;
    d += `${i === 0 ? "M" : "L"} ${xOf(t).toFixed(1)} ${yOf(fn(t)).toFixed(1)} `;
  }
  return d.trim();
}

export function HeatSourceDecay({ caption, className }: HeatSourceDecayProps) {
  const uid = useId();
  const t = useTranslations("viz.heatSourceDecay");
  const [age, setAge] = useState(4.5);

  const paths = useMemo(() => SERIES.map((s) => ({ ...s, d: pathFor(s.fn) })), []);
  const values = SERIES.map((s) => ({ key: s.key, tone: s.tone, v: s.fn(age) }));
  const dominant = values.reduce((a, b) => (b.v > a.v ? b : a));

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="amber"
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W_SVG} ${H_SVG}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta"]} />
          <rect
            x={PAD_L}
            y={PAD_T}
            width={PLOT_W}
            height={PLOT_H}
            fill={glowUrl(uid, "grid")}
            opacity={0.5}
          />
          {/* Axes */}
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="var(--border-strong)" strokeWidth={1} />
          <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="var(--border-strong)" strokeWidth={1} />
          <VizText x={PAD_L - 4} y={PAD_T + 6} size="micro" tone="subtle" anchor="end">
            {t("yHigh")}
          </VizText>
          <VizText x={PAD_L - 4} y={PAD_T + PLOT_H} size="micro" tone="subtle" anchor="end">
            0
          </VizText>
          <VizText x={W_SVG / 2} y={H_SVG - 4} size="small" tone="subtle" anchor="middle">
            {t("xAxis")}
          </VizText>

          {/* Series curves */}
          {paths.map((p) => (
            <path
              key={p.key}
              d={p.d}
              fill="none"
              stroke={`var(--${p.tone})`}
              strokeWidth={2.2}
              strokeLinecap="round"
              filter={glowUrl(uid, "bloom")}
              opacity={0.92}
            />
          ))}

          {/* "Now" sweep line + dots on each curve */}
          <line
            x1={xOf(age)}
            y1={PAD_T}
            x2={xOf(age)}
            y2={PAD_T + PLOT_H}
            stroke="var(--foreground)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
          {values.map((v) => (
            <circle
              key={v.key}
              cx={xOf(age)}
              cy={yOf(v.v)}
              r={4}
              fill={`var(--${v.tone})`}
              filter={glowUrl(uid, "bloom")}
            />
          ))}
        </svg>

        <div className="flex flex-col justify-center gap-3 sm:w-2/5">
          <VizSlider
            label={t("ageLabel")}
            display={t("gyr", { n: age.toFixed(1) })}
            min={0}
            max={T_MAX}
            step={0.1}
            value={age}
            onChange={setAge}
            tone={`var(--${dominant.tone})`}
          />
          <div className="flex flex-col gap-2">
            {values.map((v) => (
              <div key={v.key} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: `var(--${v.tone})` }}
                />
                <span className="flex-1 font-sans text-xs text-muted">{t(`series.${v.key}`)}</span>
                <span
                  className="font-display text-sm font-700 tabular-nums"
                  style={{ color: `var(--${v.tone})` }}
                >
                  {Math.round(v.v * 100)}%
                </span>
              </div>
            ))}
          </div>
          <VizReadout label={t("dominantLabel")} value={t(`series.${dominant.key}`)} tone={`var(--${dominant.tone})`} tinted />
        </div>
      </div>
    </VizFigure>
  );
}
