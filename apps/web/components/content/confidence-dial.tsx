"use client";

import { cn } from "@/lib/utils";
import { useId, useState } from "react";

interface ConfidenceDialProps {
  caption?: string;
  locale?: "vi" | "en";
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

const STRINGS = {
  vi: {
    terms: {
      virtuallyCertain: "Hầu như chắc chắn",
      extremelyLikely: "Cực kỳ có khả năng",
      veryLikely: "Rất có khả năng",
      likely: "Có khả năng",
      aboutEven: "Khả năng ngang nhau",
      unlikely: "Khó xảy ra",
      veryUnlikely: "Rất khó xảy ra",
      extremelyUnlikely: "Cực kỳ khó xảy ra",
      exceptionallyUnlikely: "Hầu như không thể",
    },
    probability: "Xác suất",
    ipccTerm: "Thuật ngữ IPCC",
    range: "Khoảng quy ước",
    sliderLabel: "Xác suất (%)",
    hint: 'Kéo xác suất: mỗi từ tiếng Anh nghe bình dân lại mang một khoảng số chính xác. "Hầu như chắc chắn" nghĩa là > 99%, không phải nói cho sướng miệng.',
  },
  en: {
    terms: {
      virtuallyCertain: "Virtually certain",
      extremelyLikely: "Extremely likely",
      veryLikely: "Very likely",
      likely: "Likely",
      aboutEven: "About as likely as not",
      unlikely: "Unlikely",
      veryUnlikely: "Very unlikely",
      extremelyUnlikely: "Extremely unlikely",
      exceptionallyUnlikely: "Exceptionally unlikely",
    },
    probability: "Probability",
    ipccTerm: "IPCC term",
    range: "Calibrated range",
    sliderLabel: "Probability (%)",
    hint: 'Drag the probability: each ordinary-sounding word carries an exact numeric range. "Virtually certain" means > 99%, not enthusiasm.',
  },
} as const;

// Point on the gauge arc for a probability p (0 = left, 100 = right).
function arcPoint(p: number, r: number): { x: number; y: number } {
  const a = Math.PI * (1 - p / 100); // π (left) → 0 (right)
  return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) };
}

// An interactive dial for the chapter's point that confidence is machinery, not
// a vibe: the reader sweeps a probability and watches it snap to the IPCC's
// calibrated likelihood word and its exact numeric range. SVG-only, no motion,
// deterministic for SSR, keyboard-operable through the range input.
export function ConfidenceDial({ caption, locale = "en", className }: ConfidenceDialProps) {
  const t = STRINGS[locale];
  const uid = useId();
  const [p, setP] = useState(DEFAULT_P);

  const { key, range } = classify(p);
  const tone = p >= 66 ? "--teal" : p > 33 ? "--amber" : "--magenta";
  const needle = arcPoint(p, R - 14);

  // Build the coloured gauge track as a sampled arc path.
  const trackPts = Array.from({ length: 49 }, (_, i) => {
    const pt = arcPoint((i / 48) * 100, R);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  });

  return (
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="mx-auto block w-full max-w-md"
          role="img"
          aria-label={`${t.probability} ${p}% — ${t.terms[key]}`}
        >
          <defs>
            <linearGradient id={`${uid}-g`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--magenta)" />
              <stop offset="50%" stopColor="var(--amber)" />
              <stop offset="100%" stopColor="var(--teal)" />
            </linearGradient>
          </defs>

          {/* gauge track */}
          <polyline
            points={trackPts.join(" ")}
            fill="none"
            stroke={`url(#${uid}-g)`}
            strokeWidth={10}
            strokeLinecap="round"
            opacity={0.85}
          />

          {/* end + mid ticks */}
          {[0, 33, 66, 100].map((v) => {
            const inner = arcPoint(v, R - 16);
            const outer = arcPoint(v, R + 4);
            return (
              <line
                key={v}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                style={{ stroke: "var(--border-strong)" }}
                strokeWidth={1.5}
              />
            );
          })}
          <text
            x={arcPoint(0, R + 16).x}
            y={arcPoint(0, R + 16).y}
            textAnchor="middle"
            style={{ fill: "var(--subtle)", fontSize: 10 }}
            className="font-sans tabular-nums"
          >
            0
          </text>
          <text
            x={arcPoint(100, R + 16).x}
            y={arcPoint(100, R + 16).y}
            textAnchor="middle"
            style={{ fill: "var(--subtle)", fontSize: 10 }}
            className="font-sans tabular-nums"
          >
            100
          </text>

          {/* needle */}
          <line
            x1={CX}
            y1={CY}
            x2={needle.x}
            y2={needle.y}
            style={{ stroke: `var(${tone})`, filter: `drop-shadow(0 0 5px var(${tone}))` }}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={CX} cy={CY} r={6} style={{ fill: `var(${tone})` }} />

          {/* central readout */}
          <text
            x={CX}
            y={CY - 44}
            textAnchor="middle"
            style={{ fill: `var(${tone})`, fontSize: 30 }}
            className="font-display font-800 tabular-nums"
          >
            {p}%
          </text>
        </svg>

        {/* term readout */}
        <div className="mt-1 text-center">
          <p className="font-display text-xl font-800" style={{ color: `var(${tone})` }}>
            {t.terms[key]}
          </p>
          <p className="font-sans text-xs text-subtle">
            {t.ipccTerm} · {t.range} {range}
          </p>
        </div>

        {/* control */}
        <div className="mt-4">
          <label htmlFor={`${uid}-p`} className="mb-1 block font-sans text-[0.7rem] text-muted">
            {t.sliderLabel}
          </label>
          <input
            id={`${uid}-p`}
            type="range"
            min={0}
            max={100}
            step={1}
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
            aria-label={t.sliderLabel}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, var(${tone}) ${p}%, var(--border) ${p}%)`,
            }}
          />
        </div>

        <p className="mt-3 font-sans text-xs text-subtle">{t.hint}</p>
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 font-serif text-sm italic leading-relaxed text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
