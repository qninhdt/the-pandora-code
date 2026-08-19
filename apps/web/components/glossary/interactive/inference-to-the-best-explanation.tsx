"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Harman's IBE: three rivals for one observation. Rate simplicity / scope / fit;
// the highest composite glows brightest — "best" is criteria, not taste.
const HYP = [
  { key: "h1" as const, simplicity: 3, scope: 2, fit: 2 },
  { key: "h2" as const, simplicity: 2, scope: 3, fit: 3 },
  { key: "h3" as const, simplicity: 1, scope: 2, fit: 1 },
];

export default function InferenceToTheBestExplanation() {
  const t = useTranslations("viz.inference-to-the-best-explanation");
  const [sel, setSel] = useState(1);

  const scores = useMemo(
    () => HYP.map((h) => h.simplicity + h.scope + h.fit),
    [],
  );
  const bestIdx = scores.indexOf(Math.max(...scores));
  const active = HYP[sel];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSel(1)}
      allowFullscreen={false}
      caption={
        <span>
          {t("observation")}
          {sel === bestIdx && (
            <>
              {" · "}
              <span className="text-teal">{t("best")}</span>
            </>
          )}
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
          {HYP.map((h, i) => {
            const x = 20 + i * 30;
            const on = i === sel;
            const isBest = i === bestIdx;
            const score = scores[i];
            const glow = 0.35 + score / 20;
            return (
              <g
                key={h.key}
                onClick={() => setSel(i)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x - 11}
                  y="24"
                  width="22"
                  height="44"
                  rx="2"
                  fill="var(--surface)"
                  stroke={
                    on
                      ? isBest
                        ? "var(--teal)"
                        : "var(--cyan)"
                      : "var(--border-strong)"
                  }
                  strokeWidth={on ? 1.2 : 0.5}
                  opacity={on ? 0.98 : glow}
                />
                <text
                  x={x}
                  y="34"
                  textAnchor="middle"
                  style={{
                    fontSize: 3.4,
                    fontFamily: "monospace",
                    fill: on
                      ? isBest
                        ? "var(--teal)"
                        : "var(--cyan)"
                      : "var(--muted)",
                  }}
                >
                  {t(h.key)}
                </text>
                {/* criterion bars */}
                {(
                  [
                    ["simplicity", h.simplicity],
                    ["scope", h.scope],
                    ["fit", h.fit],
                  ] as const
                ).map(([label, v], bi) => {
                  const by = 42 + bi * 7;
                  return (
                    <g key={label}>
                      <rect
                        x={x - 8}
                        y={by}
                        width="16"
                        height="2.2"
                        rx="0.4"
                        fill="var(--void)"
                      />
                      <rect
                        x={x - 8}
                        y={by}
                        width={(16 * v) / 3}
                        height="2.2"
                        rx="0.4"
                        fill={isBest ? "var(--teal)" : "var(--cyan)"}
                        opacity="0.85"
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col gap-1">
          <Readout label={t("simplicity")} value={active.simplicity} accent="cyan" />
          <Readout label={t("scope")} value={active.scope} accent="teal" />
          <Readout label={t("fit")} value={active.fit} accent="amber" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
