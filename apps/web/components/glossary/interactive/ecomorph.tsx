"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Six niches, six body plans. Pick a habitat; the matching ecomorph glows.
const FORMS = [
  { key: "arboreal", x: 20, y: 36, path: "M0 8 L4 0 L8 8 L6 8 L6 16 L2 16 L2 8 Z" },
  {
    key: "cursorial",
    x: 50,
    y: 36,
    path: "M0 6 L12 6 L12 10 L10 10 L10 16 L8 16 L8 10 L4 10 L4 16 L2 16 L2 10 L0 10 Z",
  },
  { key: "fossorial", x: 80, y: 36, path: "M2 12 L0 8 L4 4 L10 6 L12 12 L8 14 Z" },
  { key: "aquatic", x: 20, y: 68, path: "M0 8 Q 8 0 16 8 Q 8 14 0 8 Z" },
  { key: "aerial", x: 50, y: 68, path: "M8 8 L0 4 L2 8 L0 12 L8 8 L16 4 L14 8 L16 12 Z" },
  { key: "grazing", x: 80, y: 68, path: "M2 4 L10 4 L12 10 L10 16 L2 16 L0 10 Z" },
] as const;

export default function Ecomorph() {
  const t = useTranslations("viz.ecomorph");
  const [sel, setSel] = useState(4);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSel(4)}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("habitat")}: {t(FORMS[sel].key)}
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
          {FORMS.map((f, i) => {
            const on = i === sel;
            return (
              <g
                key={f.key}
                transform={`translate(${f.x - 8} ${f.y - 8})`}
                onClick={() => setSel(i)}
                style={{ cursor: "pointer" }}
                opacity={on ? 1 : 0.4}
              >
                <path
                  d={f.path}
                  fill={on ? "var(--cyan)" : "var(--surface)"}
                  stroke="var(--border-strong)"
                  strokeWidth="0.5"
                />
                <text
                  x="8"
                  y="24"
                  textAnchor="middle"
                  style={{
                    fontSize: 2.2,
                    fontFamily: "monospace",
                    fill: on ? "var(--cyan)" : "var(--muted)",
                  }}
                >
                  {t(f.key)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("habitat")} value={t(FORMS[sel].key)} accent="cyan" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
