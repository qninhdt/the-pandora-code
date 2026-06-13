"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface ScaleUpChallengeProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL — The Square-Cube Law and Wing Loading
//
// When you scale a flier uniformly by factor k:
//   Length       → k
//   Wing area    → k²  (surface scales with square)
//   Body mass    → k³  (volume scales with cube)
//   Wing loading → k³/k² = k  (mass per unit wing area)
//
// Wing loading (W/S in kg/m²) determines minimum flight speed:
//   V_stall = √(2·W·g / (ρ·S·C_L))
// Higher wing loading → faster stall speed → harder to take off.
//
// At some scale factor, wing loading becomes so brutal that the
// minimum airspeed exceeds anything muscles can produce → grounded.
// ─────────────────────────────────────────────────────────────────────

// Reference sparrow values (baseline at k=1)
const BASE_MASS = 0.03; // kg
const BASE_WING = 0.008; // m² (wing area)
const BASE_SPAN = 0.22; // m

function wingLoading(k: number): number {
  return (BASE_MASS * k ** 3) / (BASE_WING * k ** 2); // = BASE_MASS/BASE_WING * k
}

// Stall speed in m/s (simplified): V ∝ √(wing_loading)
function stallSpeed(k: number): number {
  return 4.2 * Math.sqrt(wingLoading(k));
}

// Status thresholds
function flightStatus(k: number): "easy" | "hard" | "desperate" | "grounded" {
  const wl = wingLoading(k);
  if (wl < 8) return "easy";
  if (wl < 20) return "hard";
  if (wl < 40) return "desperate";
  return "grounded";
}

const STATUS_TONE: Record<string, string> = {
  easy: "var(--teal)",
  hard: "var(--cyan)",
  desperate: "var(--amber)",
  grounded: "var(--magenta)",
};

// ─────────────────────────────────────────────────────────────────────
// SVG body drawing — a stylized bird/flier that scales and distorts
// ─────────────────────────────────────────────────────────────────────
const W_SVG = 300;
const H_SVG = 220;

function fmt(n: number): string {
  return n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2);
}

export function ScaleUpChallenge({ caption, className }: ScaleUpChallengeProps) {
  const uid = useId();
  const t = useTranslations("viz.scaleUp");
  const [k, setK] = useState(1);

  const mass = BASE_MASS * k ** 3;
  const wing = BASE_WING * k ** 2;
  const span = BASE_SPAN * k;
  const wl = wingLoading(k);
  const stall = stallSpeed(k);
  const status = flightStatus(k);
  const statusTone = STATUS_TONE[status];

  // Divergence bars: normalized so k=1 → same length, then they diverge
  const barMax = 5 ** 3; // at k=5, mass = 125× base
  const bars = useMemo(
    () => [
      { key: "wing", value: k ** 2, exp: "k²", tone: "var(--cyan)" },
      { key: "mass", value: k ** 3, exp: "k³", tone: "var(--teal)" },
      { key: "loading", value: k, exp: "k", tone: statusTone },
    ],
    [k, statusTone],
  );

  // SVG body dimensions — the body grows as k³ (volume), wings as k²
  const groundY = H_SVG - 30;
  const bodyW = 24 * Math.cbrt(k); // cube-root so body doesn't overflow
  const bodyH = 20 * Math.cbrt(k);
  const wingSpan = 80 * Math.sqrt(k); // wing grows as √(k²) = k (visual)
  const bodyCx = W_SVG / 2;
  const bodyCy = groundY - bodyH / 2;

  // Wing loading gauge: a circular arc that fills as loading increases
  const gaugeR = 32;
  const gaugeAngle = Math.min(270, (wl / 50) * 270);
  const gaugePath = describeArc(W_SVG - 50, 50, gaugeR, -135, -135 + gaugeAngle);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="teal"
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W_SVG} ${H_SVG}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("title")}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta"]} />

          {/* Ground line */}
          <line
            x1={20}
            y1={groundY}
            x2={W_SVG - 20}
            y2={groundY}
            stroke="var(--border-strong)"
            strokeWidth={2}
            strokeOpacity={0.5}
          />

          {/* Contact shadow */}
          <ellipse
            cx={bodyCx}
            cy={groundY + 2}
            rx={bodyW * 0.8}
            ry={4}
            fill="var(--void)"
            opacity={0.5}
            style={{ filter: "blur(3px)" }}
          />

          {/* Radial wash behind body */}
          <ellipse
            cx={bodyCx}
            cy={bodyCy}
            rx={wingSpan * 0.6}
            ry={bodyH * 1.2}
            fill={glowUrl(uid, `wash-${status === "grounded" ? "magenta" : "teal"}`)}
            opacity={0.5}
          />

          {/* Wings — they become visibly inadequate at high k */}
          <line
            x1={bodyCx - wingSpan / 2}
            y1={bodyCy - 2}
            x2={bodyCx + wingSpan / 2}
            y2={bodyCy - 2}
            stroke={statusTone}
            strokeWidth={Math.max(2, 3 / Math.sqrt(k))}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          />
          {/* Wing tips — downward curve showing strain at high k */}
          <line
            x1={bodyCx - wingSpan / 2}
            y1={bodyCy - 2}
            x2={bodyCx - wingSpan / 2 - 3}
            y2={bodyCy + Math.min(10, k * 2)}
            stroke={statusTone}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={bodyCx + wingSpan / 2}
            y1={bodyCy - 2}
            x2={bodyCx + wingSpan / 2 + 3}
            y2={bodyCy + Math.min(10, k * 2)}
            stroke={statusTone}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Body — ellipse that grows with k³ */}
          <ellipse
            cx={bodyCx}
            cy={bodyCy}
            rx={bodyW / 2}
            ry={bodyH / 2}
            fill={`color-mix(in oklab, ${statusTone} 30%, transparent)`}
            stroke={statusTone}
            strokeWidth={2}
            filter={glowUrl(uid, "bloom")}
          />

          {/* Head */}
          <circle
            cx={bodyCx + bodyW / 2 + 4}
            cy={bodyCy - 3}
            r={Math.max(3, 5 / Math.cbrt(k))}
            fill={statusTone}
          />

          {/* Legs — get disproportionately thicker (allometric) */}
          {[-0.3, 0.3].map((offset) => (
            <line
              key={offset}
              x1={bodyCx + bodyW * offset}
              y1={bodyCy + bodyH / 2}
              x2={bodyCx + bodyW * offset}
              y2={groundY}
              stroke={statusTone}
              strokeWidth={Math.max(2, 1.5 * Math.sqrt(k))}
              strokeLinecap="round"
            />
          ))}

          {/* Size label */}
          <VizText
            x={bodyCx}
            y={bodyCy - bodyH / 2 - 10}
            size="small"
            tone={statusTone}
            anchor="middle"
            weight={700}
            numeric
          >
            {t("multiple", { n: fmt(k) })}
          </VizText>

          {/* Status badge */}
          <VizText
            x={bodyCx}
            y={groundY + 18}
            size="small"
            tone={statusTone}
            anchor="middle"
            weight={700}
          >
            {t(`status.${status}`)}
          </VizText>

          {/* Wing loading gauge — top right */}
          <circle
            cx={W_SVG - 50}
            cy={50}
            r={gaugeR}
            fill="none"
            stroke="var(--border)"
            strokeWidth={3}
            strokeOpacity={0.2}
          />
          {gaugeAngle > 0 && (
            <path
              d={gaugePath}
              fill="none"
              stroke={statusTone}
              strokeWidth={3.5}
              strokeLinecap="round"
              filter={glowUrl(uid, "bloom")}
            />
          )}
          <VizText
            x={W_SVG - 50}
            y={48}
            size="base"
            tone={statusTone}
            anchor="middle"
            weight={700}
            numeric
          >
            {fmt(wl)}
          </VizText>
          <VizText x={W_SVG - 50} y={62} size="micro" tone="subtle" anchor="middle">
            {t("wlUnit")}
          </VizText>
        </svg>

        {/* Right panel — divergence readouts */}
        <div className="flex flex-col justify-center gap-2 sm:w-2/5">
          <VizSlider
            label={t("sizeLabel")}
            display={t("multiple", { n: fmt(k) })}
            min={1}
            max={5}
            step={0.1}
            value={k}
            onChange={setK}
            tone={statusTone}
          />

          {/* Divergence bars */}
          {bars.map((b) => {
            const pct = Math.min(100, (b.value / barMax) * 100);
            return (
              <div key={b.key} className="mt-1">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="font-sans text-xs text-muted">
                    {t(b.key)} ({b.exp})
                  </span>
                  <span
                    className="font-display text-sm font-700 tabular-nums"
                    style={{ color: b.tone }}
                  >
                    {fmt(b.value)}×
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-void/40">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${pct}%`, background: b.tone }}
                  />
                </div>
              </div>
            );
          })}

          <VizReadout
            className="mt-2"
            label={t("stallLabel")}
            value={`${stall.toFixed(1)} m/s`}
            note={t(`stallNote.${status}`)}
            tone={statusTone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SVG arc helper for the wing-loading gauge
// ─────────────────────────────────────────────────────────────────────
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const rad = (a: number) => (a * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startAngle));
  const y1 = cy + r * Math.sin(rad(startAngle));
  const x2 = cx + r * Math.cos(rad(endAngle));
  const y2 = cy + r * Math.sin(rad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}
