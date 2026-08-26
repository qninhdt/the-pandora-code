"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// High biomass, two different jobs. A dominant monopolises the light and nobody
// lives on it; a foundation has the same bulk and everything depends on it.
type Mode = "dominant" | "foundation";

export default function DominantSpecies() {
  const t = useTranslations("viz.dominant-species");
  const [mode, setMode] = useState<Mode>("dominant");

  const tone = mode === "dominant" ? "var(--teal)" : "var(--cyan)";
  const dependents = mode === "dominant" ? 2 : 18;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("dominant")}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{t(`verdict.${mode}`)}</span>}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 78"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <line
            x1="8"
            y1="58"
            x2="92"
            y2="58"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            opacity={0.6}
          />

          {mode === "dominant" ? (
            /* uniform ranks: all the biomass, nothing living on any of it */
            <g>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <line
                  key={i}
                  x1={20 + i * 10}
                  y1="58"
                  x2={20 + i * 10}
                  y2="26"
                  stroke={tone}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity={0.8}
                />
              ))}
              <rect x="14" y="22" width="72" height="5" fill={tone} opacity={0.2} />
              <circle cx="30" cy="50" r="1.5" fill="var(--amber)" opacity={0.8} />
              <circle cx="70" cy="46" r="1.5" fill="var(--amber)" opacity={0.8} />
            </g>
          ) : (
            /* the same bulk in one body, covered in dependents */
            <g>
              <line
                x1="50"
                y1="58"
                x2="50"
                y2="24"
                stroke={tone}
                strokeWidth="6"
                strokeLinecap="round"
                opacity={0.85}
                style={{ filter: `drop-shadow(0 0 5px ${tone})` }}
              />
              <path
                d="M50 34 L34 26 M50 40 L64 30 M50 30 L62 22 M50 44 L38 38"
                stroke={tone}
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity={0.8}
              />
              {[
                [34, 26],
                [64, 30],
                [62, 22],
                [38, 38],
                [44, 48],
                [56, 50],
                [50, 28],
                [47, 52],
                [53, 36],
                [41, 32],
                [59, 42],
                [50, 46],
                [36, 44],
                [64, 46],
                [45, 40],
                [55, 26],
                [43, 24],
                [58, 34],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="1.3" fill="var(--amber)" opacity={0.85} />
              ))}
            </g>
          )}
          <text
            x="50"
            y="70"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("dependents")}
            value={dependents}
            accent={mode === "dominant" ? "teal" : "cyan"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlTabs
            options={[
              { value: "dominant", label: t("modes.dominant") },
              { value: "foundation", label: t("modes.foundation") },
            ]}
            value={mode}
            onChange={setMode}
            ariaLabel={t("title")}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
