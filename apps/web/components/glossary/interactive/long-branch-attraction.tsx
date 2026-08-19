"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Two long branches (fast tips B,D) get falsely clustered under plain parsimony.
// Flip to the corrected model and they separate again — the true tree restored.
const TIPS = [
  { key: "a", xTrue: 20, xPar: 20, rate: "slow" as const },
  { key: "b", xTrue: 40, xPar: 72, rate: "fast" as const },
  { key: "c", xTrue: 60, xPar: 40, rate: "slow" as const },
  { key: "d", xTrue: 80, xPar: 88, rate: "fast" as const },
];

export default function LongBranchAttraction() {
  const t = useTranslations("viz.long-branch-attraction");
  const [mode, setMode] = useState<"standard" | "corrected">("standard");
  const attracted = mode === "standard";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("standard")}
      allowFullscreen={false}
      caption={
        <span className={attracted ? "text-amber" : "text-teal"}>
          {attracted ? t("parsimonyTree") : t("trueTree")}
          {attracted ? ` · ${t("attracted")}` : ""}
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
          <line
            x1={attracted ? 30 : 30}
            y1="70"
            x2={attracted ? 80 : 70}
            y2="70"
            stroke="var(--border-strong)"
            strokeWidth="1"
          />

          {TIPS.map((tip) => {
            const x = attracted ? tip.xPar : tip.xTrue;
            const long = tip.rate === "fast";
            const yTip = long ? 22 : 34;
            const col = long
              ? attracted
                ? "var(--amber)"
                : "var(--cyan)"
              : "var(--border-strong)";
            return (
              <g key={tip.key}>
                <line
                  x1={x}
                  y1="70"
                  x2={x}
                  y2={yTip}
                  stroke={col}
                  strokeWidth={long ? 1.6 : 1}
                />
                <circle
                  cx={x}
                  cy={yTip}
                  r={long ? 3.4 : 2.6}
                  fill={long ? (attracted ? "var(--amber)" : "var(--cyan)") : "var(--surface)"}
                  stroke="var(--border-strong)"
                  strokeWidth="0.5"
                />
                <text
                  x={x}
                  y={yTip - 6}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.5,
                    fontFamily: "monospace",
                    fill: long
                      ? attracted
                        ? "var(--amber)"
                        : "var(--cyan)"
                      : "var(--muted)",
                  }}
                >
                  {tip.key.toUpperCase()}
                </text>
                <text
                  x={x}
                  y={yTip + 8}
                  textAnchor="middle"
                  style={{ fontSize: 2, fontFamily: "monospace", fill: "var(--muted)" }}
                >
                  {t(tip.rate)}
                </text>
              </g>
            );
          })}

          {attracted && (
            <path
              d="M72 30 Q 80 40 88 30"
              fill="none"
              stroke="var(--amber)"
              strokeWidth="0.7"
              strokeDasharray="1.5 1.2"
              opacity="0.8"
            />
          )}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={attracted ? t("parsimonyTree") : t("trueTree")}
            value={attracted ? t("attracted") : t("corrected")}
            accent={attracted ? "amber" : "teal"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {(["standard", "corrected"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md"
              style={{
                borderColor:
                  mode === m
                    ? m === "standard"
                      ? "var(--amber)"
                      : "var(--teal)"
                    : "var(--border-strong)",
                color:
                  mode === m
                    ? m === "standard"
                      ? "var(--amber)"
                      : "var(--teal)"
                    : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {m === "standard" ? t("standard") : t("corrected")}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
