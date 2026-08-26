"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The outgroup is the compass. Whichever tip you call outgroup roots the tree
// and flips which states read as ancestral vs derived inside the ingroup.
const TIPS = [
  { id: 0, x: 20, label: "O" },
  { id: 1, x: 40, label: "A" },
  { id: 2, x: 60, label: "B" },
  { id: 3, x: 80, label: "C" },
];

export default function Outgroup() {
  const t = useTranslations("viz.outgroup");
  const [og, setOg] = useState(0);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOg(0)}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("rooted")} · {t("outgroup")}: {TIPS[og].label}
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
          {/* root stem under the chosen outgroup */}
          <line
            x1={TIPS[og].x}
            y1="84"
            x2={TIPS[og].x}
            y2="70"
            stroke="var(--amber)"
            strokeWidth="1.4"
          />
          <line x1="20" y1="70" x2="80" y2="70" stroke="var(--border-strong)" strokeWidth="1" />
          {TIPS.map((tip) => {
            const isOg = tip.id === og;
            return (
              <g key={tip.id}>
                <line
                  x1={tip.x}
                  y1="70"
                  x2={tip.x}
                  y2={isOg ? 36 : 30}
                  stroke={isOg ? "var(--amber)" : "var(--cyan)"}
                  strokeWidth={isOg ? 1.5 : 1}
                  opacity={isOg ? 0.95 : 0.75}
                />
                <circle
                  cx={tip.x}
                  cy={isOg ? 36 : 30}
                  r={isOg ? 4 : 2.8}
                  fill={isOg ? "var(--amber)" : "var(--surface)"}
                  stroke={isOg ? "var(--amber)" : "var(--cyan)"}
                  strokeWidth="0.7"
                  onClick={() => setOg(tip.id)}
                  style={{ cursor: "pointer" }}
                />
                <text
                  x={tip.x}
                  y={isOg ? 24 : 20}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.8,
                    fontFamily: "monospace",
                    fill: isOg ? "var(--amber)" : "var(--cyan)",
                  }}
                >
                  {tip.label}
                </text>
                <text
                  x={tip.x}
                  y={isOg ? 48 : 42}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.1,
                    fontFamily: "monospace",
                    fill: "var(--muted)",
                  }}
                >
                  {isOg ? t("outgroup") : t("ingroup")}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("outgroup")} value={TIPS[og].label} accent="amber" />
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
