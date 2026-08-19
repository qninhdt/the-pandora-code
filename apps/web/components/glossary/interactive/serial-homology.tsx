"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Repeated parts, one origin, tailored by address. Serial homology is the kinship
// between segments repeated along a body that share a common developmental unit but
// are modified to do different jobs by position — vertebrae, a shrimp's varied
// appendages, a dragonfly's flight segments. Click any of the Pandoran hexapod's
// six limbs and it lights on the shared ancestral limb-field map: all six are the
// same basic module, each re-shaped according to its Hox address along the axis.
const LIMBS = [
  { key: "foreUpper", side: -1, y: 34, role: "grasp" },
  { key: "foreUpperR", side: 1, y: 34, role: "grasp" },
  { key: "midPair", side: -1, y: 50, role: "walk" },
  { key: "midPairR", side: 1, y: 50, role: "walk" },
  { key: "hind", side: -1, y: 66, role: "push" },
  { key: "hindR", side: 1, y: 66, role: "push" },
];

export default function SerialHomology() {
  const t = useTranslations("viz.serial-homology");
  const [sel, setSel] = useState<number | null>(null);

  const spineX = 40;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSel(null)}
      allowFullscreen={false}
      caption={
        sel != null ? (
          <span className="text-cyan">{t("sameModule", { role: t(LIMBS[sel].role) })}</span>
        ) : (
          <span className="text-muted">{t("clickLimb")}</span>
        )
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
          {/* body axis */}
          <line
            x1={spineX}
            y1="26"
            x2={spineX}
            y2="74"
            stroke="var(--border-strong)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle
            cx={spineX}
            cy="24"
            r="4"
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="0.6"
          />

          {/* the six limbs */}
          {LIMBS.map((l, i) => {
            const on = sel === i;
            const bx = spineX;
            const ex = spineX + l.side * 22;
            return (
              <g key={l.key}>
                <line
                  x1={bx}
                  y1={l.y}
                  x2={ex}
                  y2={l.y + 6}
                  stroke={on ? "var(--cyan)" : "var(--teal)"}
                  strokeWidth={on ? 2 : 1.2}
                  strokeLinecap="round"
                  opacity={sel == null ? 0.8 : on ? 1 : 0.35}
                />
                <circle
                  cx={ex}
                  cy={l.y + 6}
                  r={on ? 3.4 : 2.4}
                  fill={on ? "var(--cyan)" : "var(--surface)"}
                  stroke={on ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth="0.5"
                  opacity={sel == null ? 0.8 : on ? 1 : 0.4}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={t(l.role)}
                  aria-pressed={on}
                  onClick={() => setSel(i === sel ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSel(i === sel ? null : i);
                    }
                  }}
                />
              </g>
            );
          })}

          {/* ancestral limb-field map on the right */}
          <line
            x1="78"
            y1="26"
            x2="78"
            y2="74"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.4"
          />
          <text
            x="86"
            y="22"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.6, fontFamily: "monospace" }}
          >
            {t("limbField")}
          </text>
          {LIMBS.filter((_, i) => i % 2 === 0).map((l, i) => {
            const idx = i * 2;
            const on = sel === idx || sel === idx + 1;
            const y = 34 + i * 16;
            return (
              <g key={l.key}>
                <rect
                  x="82"
                  y={y - 3}
                  width="10"
                  height="6"
                  rx="1"
                  fill="var(--cyan)"
                  opacity={on ? 0.9 : 0.3}
                />
                <text
                  x="87"
                  y={y + 1}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.2,
                    fontFamily: "monospace",
                    fill: on ? "var(--void)" : "var(--muted)",
                  }}
                >
                  {t(l.role)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("limbs")} value="6" accent="cyan" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
