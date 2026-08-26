"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Branching order only — lengths are noise. Three topologies of six tips; the
// parsimony score is the step count. Cycle until the minimum lights teal.
const TIPS = ["A", "B", "C", "D", "E", "F"];

// tip x positions per topology (viewBox 0–100); steps = invented character changes
const TREES = [
  {
    // balanced true-ish: ((A B)(C D))(E F)
    xs: [14, 28, 42, 56, 72, 88],
    steps: 4,
    forks: [
      [21, 48],
      [49, 48],
      [80, 48],
      [35, 64],
      [80, 64],
      [52, 80],
    ] as [number, number][],
  },
  {
    // caterpillar / worse
    xs: [14, 28, 42, 56, 72, 88],
    steps: 7,
    forks: [
      [21, 40],
      [35, 52],
      [49, 64],
      [63, 72],
      [80, 80],
      [52, 88],
    ] as [number, number][],
  },
  {
    // middling
    xs: [14, 28, 42, 56, 72, 88],
    steps: 5,
    forks: [
      [21, 48],
      [42, 48],
      [64, 48],
      [88, 48],
      [42, 66],
      [52, 82],
    ] as [number, number][],
  },
];

export default function Cladogram() {
  const t = useTranslations("viz.cladogram");
  const [idx, setIdx] = useState(0);
  const tree = TREES[idx];
  const best = Math.min(...TREES.map((tr) => tr.steps));
  const isBest = tree.steps === best;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setIdx(0)}
      allowFullscreen={false}
      caption={
        <span className={isBest ? "text-teal" : "text-muted"}>
          {isBest ? t("best") : t("hint")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* simplified rectangular cladogram from tip xs */}
          {tree.xs.map((x, i) => (
            <line
              key={`stem-${i}`}
              x1={x}
              y1="28"
              x2={x}
              y2="44"
              stroke={isBest ? "var(--teal)" : "var(--border-strong)"}
              strokeWidth="1"
            />
          ))}
          {/* horizontal connectors at mid depth */}
          <line
            x1={tree.xs[0]}
            y1="44"
            x2={tree.xs[tree.xs.length - 1]}
            y2="44"
            stroke={isBest ? "var(--teal)" : "var(--border-strong)"}
            strokeWidth="1"
            opacity="0.85"
          />
          <line
            x1="52"
            y1="44"
            x2="52"
            y2="78"
            stroke={isBest ? "var(--teal)" : "var(--border-strong)"}
            strokeWidth="1"
          />
          {tree.forks.map(([fx, fy], i) => (
            <circle
              key={`f-${i}`}
              cx={fx}
              cy={fy}
              r="1.6"
              fill={isBest ? "var(--teal)" : "var(--surface)"}
              stroke="var(--border-strong)"
              strokeWidth="0.4"
              opacity="0.8"
            />
          ))}

          {tree.xs.map((x, i) => (
            <g key={TIPS[i]}>
              <circle
                cx={x}
                cy="28"
                r="3"
                fill={isBest ? "var(--teal)" : "var(--surface)"}
                stroke="var(--border-strong)"
                strokeWidth="0.5"
              />
              <text
                x={x}
                y="20"
                textAnchor="middle"
                style={{
                  fontSize: 2.8,
                  fontFamily: "monospace",
                  fill: isBest ? "var(--teal)" : "var(--muted)",
                }}
              >
                {TIPS[i]}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col gap-1.5">
          <Readout label={t("steps")} value={tree.steps} accent={isBest ? "teal" : "amber"} />
          <Readout label={t("topology")} value={`${idx + 1}/3`} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {TREES.map((tr, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md transition-colors"
              style={{
                borderColor:
                  idx === i
                    ? tr.steps === best
                      ? "var(--teal)"
                      : "var(--amber)"
                    : "var(--border-strong)",
                color:
                  idx === i ? (tr.steps === best ? "var(--teal)" : "var(--amber)") : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {t("topology")} {i + 1}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
