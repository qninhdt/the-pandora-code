"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Stick-rig banshee: tap a joint, torque and GRF arrows answer. Structure is load.
const JOINTS = [
  { key: "hip", x: 42, y: 48, torque: 1.2 },
  { key: "knee", x: 40, y: 62, torque: 0.8 },
  { key: "ankle", x: 38, y: 76, torque: 0.5 },
  { key: "wing", x: 55, y: 36, torque: 1.6 },
] as const;

export default function Biomechanics() {
  const t = useTranslations("viz.biomechanics");
  const [sel, setSel] = useState(0);
  const j = JOINTS[sel];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSel(0)}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t(j.key)} · {t("torque")} {j.torque.toFixed(1)}
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
          {/* body + limbs */}
          <line x1="48" y1="28" x2="48" y2="48" stroke="var(--border-strong)" strokeWidth="1.4" />
          <line x1="48" y1="36" x2="70" y2="30" stroke="var(--cyan)" strokeWidth="1.2" />
          <line x1="48" y1="36" x2="28" y2="32" stroke="var(--cyan)" strokeWidth="1.2" />
          <line x1="48" y1="48" x2="42" y2="48" stroke="var(--border-strong)" strokeWidth="1.2" />
          <line x1="42" y1="48" x2="40" y2="62" stroke="var(--border-strong)" strokeWidth="1.2" />
          <line x1="40" y1="62" x2="38" y2="76" stroke="var(--border-strong)" strokeWidth="1.2" />
          <line x1="48" y1="48" x2="56" y2="64" stroke="var(--border-strong)" strokeWidth="1.1" />
          <line x1="56" y1="64" x2="58" y2="78" stroke="var(--border-strong)" strokeWidth="1.1" />
          {/* GRF */}
          <line x1="38" y1="82" x2="38" y2="90" stroke="var(--amber)" strokeWidth="1.4" />
          <path d="M35 88 L38 92 L41 88" fill="none" stroke="var(--amber)" strokeWidth="1" />
          <text x="44" y="92" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--amber)" }}>
            {t("grf")}
          </text>

          {JOINTS.map((jt, i) => {
            const on = i === sel;
            return (
              <g key={jt.key} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
                <circle
                  cx={jt.x}
                  cy={jt.y}
                  r={on ? 3.4 : 2.4}
                  fill={on ? "var(--cyan)" : "var(--surface)"}
                  stroke="var(--border-strong)"
                  strokeWidth="0.5"
                />
                {on && (
                  <path
                    d={`M${jt.x + 4} ${jt.y} Q ${jt.x + 10} ${jt.y - 8} ${jt.x + 6} ${jt.y - 12}`}
                    fill="none"
                    stroke="var(--magenta)"
                    strokeWidth="0.9"
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col gap-1">
          <Readout label={t("joint")} value={t(j.key)} accent="cyan" />
          <Readout label={t("torque")} value={j.torque.toFixed(1)} accent="magenta" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
