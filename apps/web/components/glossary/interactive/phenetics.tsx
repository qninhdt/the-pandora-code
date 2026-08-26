"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Same four tips, two algorithms. Phenetics clusters by overall look and pairs
// the convergent twins; cladistics trusts only shared-derived and splits them.
const TIPS = [
  { id: "A", x: 20 },
  { id: "B", x: 40 }, // looks like D (convergence)
  { id: "C", x: 60 },
  { id: "D", x: 80 }, // looks like B
];

export default function Phenetics() {
  const t = useTranslations("viz.phenetics");
  const [mode, setMode] = useState<"phenetic" | "cladistic">("phenetic");
  const phenetic = mode === "phenetic";

  // cluster pairs: phenetic joins B+D; cladistic joins A+B and C+D
  const pairs = phenetic
    ? [
        [20, 60],
        [40, 80],
      ]
    : [
        [20, 40],
        [60, 80],
      ];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("phenetic")}
      allowFullscreen={false}
      caption={
        <span className={phenetic ? "text-amber" : "text-cyan"}>
          {phenetic ? t("trap") : t("cladistic")}
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
          <line x1="50" y1="84" x2="50" y2="70" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="30" y1="70" x2="70" y2="70" stroke="var(--border-strong)" strokeWidth="1" />

          {pairs.map(([x1, x2], i) => (
            <g key={i}>
              <line
                x1={(x1 + x2) / 2}
                y1="70"
                x2={(x1 + x2) / 2}
                y2="48"
                stroke={phenetic ? "var(--amber)" : "var(--cyan)"}
                strokeWidth="1.2"
              />
              <line
                x1={x1}
                y1="48"
                x2={x2}
                y2="48"
                stroke={phenetic ? "var(--amber)" : "var(--cyan)"}
                strokeWidth="1.2"
              />
              <line
                x1={x1}
                y1="48"
                x2={x1}
                y2="30"
                stroke={phenetic ? "var(--amber)" : "var(--cyan)"}
                strokeWidth="1.2"
              />
              <line
                x1={x2}
                y1="48"
                x2={x2}
                y2="30"
                stroke={phenetic ? "var(--amber)" : "var(--cyan)"}
                strokeWidth="1.2"
              />
            </g>
          ))}

          {TIPS.map((tip) => {
            const twin = phenetic && (tip.id === "B" || tip.id === "D");
            return (
              <g key={tip.id}>
                <circle
                  cx={tip.x}
                  cy="30"
                  r={twin ? 3.6 : 2.8}
                  fill={twin ? "var(--amber)" : phenetic ? "var(--surface)" : "var(--cyan)"}
                  stroke="var(--border-strong)"
                  strokeWidth="0.5"
                />
                <text
                  x={tip.x}
                  y="20"
                  textAnchor="middle"
                  style={{
                    fontSize: 2.8,
                    fontFamily: "monospace",
                    fill: twin ? "var(--amber)" : "var(--muted)",
                  }}
                >
                  {tip.id}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("hint")}
            value={phenetic ? t("phenetic") : t("cladistic")}
            accent={phenetic ? "amber" : "cyan"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {(["phenetic", "cladistic"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md"
              style={{
                borderColor:
                  mode === m
                    ? m === "phenetic"
                      ? "var(--amber)"
                      : "var(--cyan)"
                    : "var(--border-strong)",
                color:
                  mode === m ? (m === "phenetic" ? "var(--amber)" : "var(--cyan)") : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {m === "phenetic" ? t("phenetic") : t("cladistic")}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
