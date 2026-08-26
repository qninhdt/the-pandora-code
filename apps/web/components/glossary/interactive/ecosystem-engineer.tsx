"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Two ways to engineer a habitat. The allogenic worker moves material around;
// the autogenic one simply grows, and its own body becomes the structure.
type Mode = "allogenic" | "autogenic";

export default function EcosystemEngineer() {
  const t = useTranslations("viz.ecosystem-engineer");
  const [mode, setMode] = useState<Mode>("autogenic");

  const tone = mode === "autogenic" ? "var(--cyan)" : "var(--teal)";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("autogenic")}
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

          {mode === "allogenic" ? (
            <g>
              {/* the engineer, small, beside the structure it assembled */}
              <ellipse
                cx="26"
                cy="53"
                rx="5"
                ry="3.4"
                fill={tone}
                opacity={0.9}
                style={{ filter: `drop-shadow(0 0 3px ${tone})` }}
              />
              {/* moved material: a dam of separate pieces */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect
                  key={i}
                  x={46 + (i % 3) * 9}
                  y={48 - Math.floor(i / 3) * 5}
                  width="8"
                  height="4"
                  rx="0.8"
                  fill="var(--muted)"
                  opacity={0.55}
                  transform={`rotate(${((i * 13) % 20) - 10} ${50 + (i % 3) * 9} ${50 - Math.floor(i / 3) * 5})`}
                />
              ))}
              <rect x="44" y="52" width="32" height="6" fill={tone} opacity={0.14} />
            </g>
          ) : (
            <g>
              {/* the engineer IS the structure: one body, many tenants on it */}
              <path
                d="M48 58 L48 22 M48 34 L38 26 M48 40 L59 32 M48 30 L57 22"
                stroke={tone}
                strokeWidth="2.6"
                strokeLinecap="round"
                opacity={0.9}
                style={{ filter: `drop-shadow(0 0 4px ${tone})` }}
              />
              <ellipse cx="48" cy="58" rx="13" ry="3" fill={tone} opacity={0.2} />
              {[
                [38, 26],
                [59, 32],
                [57, 22],
                [48, 30],
                [44, 44],
                [52, 50],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="1.7" fill="var(--amber)" opacity={0.85} />
              ))}
            </g>
          )}

          <text
            x="50"
            y="70"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t(`caption.${mode}`)}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("mechanism")}
            value={t(`short.${mode}`)}
            accent={mode === "autogenic" ? "cyan" : "teal"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlTabs
            options={[
              { value: "allogenic", label: t("modes.allogenic") },
              { value: "autogenic", label: t("modes.autogenic") },
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
