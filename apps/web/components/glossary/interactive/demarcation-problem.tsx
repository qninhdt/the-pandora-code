"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Popper / Kuhn / Lakatos disagree on the cut, but the useful question is constant:
// what would this claim forbid? Place each claim on the science↔non-science dial.
const CLAIMS = [
  { key: "c1", falsifiable: true, pos: 18 },
  { key: "c2", falsifiable: true, pos: 34 },
  { key: "c3", falsifiable: false, pos: 62 },
  { key: "c4", falsifiable: false, pos: 80 },
];

export default function DemarcationProblem() {
  const t = useTranslations("viz.demarcation-problem");
  const [active, setActive] = useState(0);
  const claim = CLAIMS[active];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setActive(0)}
      allowFullscreen={false}
      caption={
        <span className={claim.falsifiable ? "text-cyan" : "text-muted"}>
          {claim.falsifiable ? t("falsifiable") : t("unfalsifiable")}
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
          {/* dial track */}
          <line x1="12" y1="50" x2="88" y2="50" stroke="var(--border-strong)" strokeWidth="1.2" />
          <line x1="50" y1="44" x2="50" y2="56" stroke="var(--amber)" strokeWidth="0.8" />
          <text
            x="18"
            y="40"
            textAnchor="middle"
            style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            {t("science")}
          </text>
          <text
            x="82"
            y="40"
            textAnchor="middle"
            style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("nonScience")}
          </text>

          {CLAIMS.map((c, i) => {
            const on = i === active;
            const col = c.falsifiable ? "var(--cyan)" : "var(--muted)";
            return (
              <g key={c.key} onClick={() => setActive(i)} style={{ cursor: "pointer" }}>
                <circle
                  cx={c.pos}
                  cy="50"
                  r={on ? 5 : 3.2}
                  fill={on ? col : "var(--surface)"}
                  stroke={col}
                  strokeWidth={on ? 1.1 : 0.5}
                  opacity={c.falsifiable || on ? 0.95 : 0.45}
                />
                {on && (
                  <circle
                    cx={c.pos}
                    cy="50"
                    r="9"
                    fill="none"
                    stroke={col}
                    strokeWidth="0.4"
                    opacity="0.45"
                  />
                )}
                <text
                  x={c.pos}
                  y="64"
                  textAnchor="middle"
                  style={{
                    fontSize: 2.4,
                    fontFamily: "monospace",
                    fill: on ? col : "var(--muted)",
                  }}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("hint")}
            value={claim.falsifiable ? t("falsifiable") : t("unfalsifiable")}
            accent={claim.falsifiable ? "cyan" : "foreground"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
