"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// One tip, one private novelty. Autapomorphies name a species; they never bind a group.
// Magenta marks stay locked to a single tip — useful ID, useless kinship signal.
const TIPS = [
  { key: "t1", x: 22, mark: "queue-fork" },
  { key: "t2", x: 42, mark: "extra-eye" },
  { key: "t3", x: 62, mark: "fin-ridge" },
  { key: "t4", x: 82, mark: "glow-ring" },
];

export default function Autapomorphy() {
  const t = useTranslations("viz.autapomorphy");
  const [sel, setSel] = useState(1);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSel(1)}
      allowFullscreen={false}
      caption={
        <span>
          <span className="text-magenta">{t("unique")}</span>
          {" · "}
          <span className="text-muted">{t("noGroup")}</span>
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
          <line x1="52" y1="82" x2="52" y2="68" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="32" y1="68" x2="72" y2="68" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="32" y1="68" x2="32" y2="50" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="72" y1="68" x2="72" y2="50" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="22" y1="50" x2="42" y2="50" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="62" y1="50" x2="82" y2="50" stroke="var(--border-strong)" strokeWidth="1" />
          {TIPS.map((tip) => (
            <line
              key={`stem-${tip.key}`}
              x1={tip.x}
              y1="50"
              x2={tip.x}
              y2="32"
              stroke="var(--border-strong)"
              strokeWidth="1"
            />
          ))}

          {TIPS.map((tip, i) => {
            const on = i === sel;
            return (
              <g
                key={tip.key}
                onClick={() => setSel(i)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={tip.x}
                  cy="32"
                  r={on ? 3.6 : 2.6}
                  fill={on ? "var(--surface)" : "var(--surface)"}
                  stroke={on ? "var(--magenta)" : "var(--border-strong)"}
                  strokeWidth={on ? 1.1 : 0.5}
                />
                {/* private novelty badge — only the selected tip wears magenta */}
                {on && (
                  <>
                    <rect
                      x={tip.x - 3}
                      y="18"
                      width="6"
                      height="6"
                      rx="1"
                      fill="var(--magenta)"
                      opacity="0.9"
                    />
                    <circle
                      cx={tip.x}
                      cy="32"
                      r="7"
                      fill="none"
                      stroke="var(--magenta)"
                      strokeWidth="0.35"
                      opacity="0.45"
                    />
                  </>
                )}
                <text
                  x={tip.x}
                  y="14"
                  textAnchor="middle"
                  style={{
                    fontSize: 2.6,
                    fontFamily: "monospace",
                    fill: on ? "var(--magenta)" : "var(--muted)",
                  }}
                >
                  {t(tip.key)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("unique")} value={t(TIPS[sel].key)} accent="magenta" />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
            {t("hint")}
          </span>
        </div>
      </div>
    </GlossaryFrame>
  );
}
