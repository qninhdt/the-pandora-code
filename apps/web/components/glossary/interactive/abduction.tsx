"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Peirce's third arrow. Deduction runs rule→result, induction counts toward a
// rule, abduction invents the case that would make the surprising result ordinary.
// Three cards, three arrow directions; the Pandoran example is always "why six limbs".
const MODES = [
  { key: "deduction", flow: "deductionFlow", color: "var(--teal)" },
  { key: "induction", flow: "inductionFlow", color: "var(--cyan)" },
  { key: "abduction", flow: "abductionFlow", color: "var(--magenta)" },
] as const;

export default function Abduction() {
  const t = useTranslations("viz.abduction");
  const [mode, setMode] = useState(2);

  const active = MODES[mode];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode(2)}
      allowFullscreen={false}
      caption={
        <span>
          {t("example")}: <span className="text-magenta">{t(active.flow)}</span>
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
          {MODES.map((m, i) => {
            const x = 18 + i * 28;
            const on = i === mode;
            return (
              <g
                key={m.key}
                onClick={() => setMode(i)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x - 10}
                  y="28"
                  width="20"
                  height="36"
                  rx="2"
                  fill="var(--surface)"
                  stroke={on ? m.color : "var(--border-strong)"}
                  strokeWidth={on ? 1.2 : 0.5}
                  opacity={on ? 0.95 : 0.55}
                />
                <text
                  x={x}
                  y="38"
                  textAnchor="middle"
                  style={{
                    fontSize: 3.2,
                    fontFamily: "monospace",
                    fill: on ? m.color : "var(--muted)",
                  }}
                >
                  {t(m.key)}
                </text>
                {/* direction glyph */}
                <path
                  d={
                    m.key === "deduction"
                      ? `M${x} 48 L${x} 56 M${x - 2.5} 53.5 L${x} 56 L${x + 2.5} 53.5`
                      : m.key === "induction"
                        ? `M${x - 5} 52 L${x + 5} 52 M${x + 2.5} 49.5 L${x + 5} 52 L${x + 2.5} 54.5`
                        : `M${x} 56 L${x} 48 M${x - 2.5} 50.5 L${x} 48 L${x + 2.5} 50.5`
                  }
                  fill="none"
                  stroke={on ? m.color : "var(--muted)"}
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text
                  x={x}
                  y="72"
                  textAnchor="middle"
                  style={{
                    fontSize: 2.2,
                    fontFamily: "monospace",
                    fill: on ? m.color : "var(--muted)",
                  }}
                >
                  {t(m.flow)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("pick")} value={t(active.key)} accent="magenta" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
