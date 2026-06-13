"use client";

import {
  GAUGE_END,
  GAUGE_START,
  angleForFraction,
  arcPath,
  arcPoint,
} from "@/components/content/viz/dial";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface ConfidenceDialProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 340;
const VIEW_H = 200;
const CX = VIEW_W / 2;
const CY = 168;
const R = 128;

const DEFAULT_P = 91; // "Very likely" — a meaningful deterministic SSR default

type TermKey =
  | "virtuallyCertain"
  | "extremelyLikely"
  | "veryLikely"
  | "likely"
  | "aboutEven"
  | "unlikely"
  | "veryUnlikely"
  | "extremelyUnlikely"
  | "exceptionallyUnlikely";

// The IPCC AR5 calibrated likelihood scale: ordinary words with exact numeric
// meaning. Given a probability, return the most specific term and its range.
function classify(p: number): { key: TermKey; range: string } {
  if (p >= 99) return { key: "virtuallyCertain", range: "99–100%" };
  if (p >= 95) return { key: "extremelyLikely", range: "95–99%" };
  if (p >= 90) return { key: "veryLikely", range: "90–95%" };
  if (p >= 66) return { key: "likely", range: "66–90%" };
  if (p > 33) return { key: "aboutEven", range: "33–66%" };
  if (p > 10) return { key: "unlikely", range: "10–33%" };
  if (p > 5) return { key: "veryUnlikely", range: "5–10%" };
  if (p >= 1) return { key: "extremelyUnlikely", range: "1–5%" };
  return { key: "exceptionallyUnlikely", range: "0–1%" };
}

// Point on the half-circle gauge for a probability p (0 = left, 100 = right).
function gaugePoint(p: number, r: number) {
  return arcPoint(CX, CY, r, angleForFraction(p / 100, GAUGE_START, GAUGE_END));
}

// An interactive dial for the chapter's point that confidence is machinery, not
// a vibe: the reader sweeps a probability and watches it snap to the IPCC's
// calibrated likelihood word and its exact numeric range. SVG-only, no motion,
// deterministic for SSR, keyboard-operable through the range input.
export function ConfidenceDial({ caption, className }: ConfidenceDialProps) {
  const t = useTranslations("viz.confidenceDial");
  const uid = useId();
  const [p, setP] = useState(DEFAULT_P);

  const { key, range } = classify(p);
  const term = t(`terms.${key}`);
  const toneName = p >= 66 ? "teal" : p > 33 ? "amber" : "magenta";
  const toneVar = `--${toneName}`;
  const needle = gaugePoint(p, R - 14);

  return (
    <VizFigure
      title={t("title")}
      hint={t("hint")}
      caption={caption}
      tone={toneName}
      className={className}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mx-auto block w-full max-w-md overflow-visible"
        role="img"
        aria-label={t("aria", { probability: t("probability"), p, term })}
      >
        <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />
        <defs>
          <linearGradient id={`${uid}-g`} x1={CX - R} x2={CX + R} y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--magenta)" />
            <stop offset="50%" stopColor="var(--amber)" />
            <stop offset="100%" stopColor="var(--teal)" />
          </linearGradient>
        </defs>

        {/* gauge track */}
        <path
          d={arcPath(CX, CY, R, GAUGE_START, GAUGE_END)}
          fill="none"
          stroke={`url(#${uid}-g)`}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.85}
        />

        {/* end + mid ticks */}
        {[0, 33, 66, 100].map((v) => {
          const inner = gaugePoint(v, R - 16);
          const outer = gaugePoint(v, R + 8); // Extends further out to be clearly visible
          return (
            <line
              key={v}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--foreground)"
              strokeWidth={2}
            />
          );
        })}
        <VizText
          x={gaugePoint(0, R + 24).x}
          y={gaugePoint(0, R + 24).y + 4}
          size="micro"
          anchor="middle"
          numeric
        >
          0
        </VizText>
        <VizText
          x={gaugePoint(100, R + 24).x}
          y={gaugePoint(100, R + 24).y + 4}
          size="micro"
          anchor="middle"
          numeric
        >
          100
        </VizText>

        {/* needle */}
        <g filter={glowUrl(uid, "bloom")}>
          <line x1={CX} y1={CY} x2={CX} y2={CY - 10} stroke="transparent" /> {/* SVG bounding-box strut */}
          <line
            x1={CX}
            y1={CY}
            x2={needle.x}
            y2={needle.y}
            stroke={`var(${toneVar})`}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>
        {/* hub: outer ring + glowing core */}
        <circle
          cx={CX}
          cy={CY}
          r={9}
          fill="var(--surface)"
          style={{ stroke: `var(${toneVar})` }}
          strokeWidth={2}
        />
        <circle cx={CX} cy={CY} r={4} fill={`var(${toneVar})`} filter={glowUrl(uid, "bloom")} />

        {/* central readout */}
        <VizText
          x={CX}
          y={CY - 42}
          size="xlarge"
          tone={toneName}
          anchor="middle"
          numeric
          weight={800}
          className="font-display"
        >
          {p}%
        </VizText>
      </svg>

      {/* term readout */}
      <div className="mt-1 text-center">
        <p className="font-display text-xl font-800" style={{ color: `var(${toneVar})` }}>
          {term}
        </p>
        <p className="font-sans text-xs text-subtle">
          {t("ipccTerm")} · {t("range")} {range}
        </p>
      </div>

      {/* control */}
      <div className="mt-4">
        <label htmlFor={`${uid}-p`} className="mb-1 block font-sans text-xs text-muted">
          {t("sliderLabel")}
        </label>
        <input
          id={`${uid}-p`}
          type="range"
          min={0}
          max={100}
          step={1}
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
          aria-label={t("sliderLabel")}
          className="viz-range w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          style={{
            background: `linear-gradient(to right, var(${toneVar}) ${p}%, var(--border) ${p}%)`,
            ["--viz-thumb" as string]: `var(${toneVar})`,
          }}
        />
      </div>
    </VizFigure>
  );
}
