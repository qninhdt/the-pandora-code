"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Dock substrate → close pocket → release oxyluciferin + photon.
const PHASES = ["dock", "bound", "release"] as const;

export default function Luciferase() {
  const t = useTranslations("viz.luciferase");
  const [phase, setPhase] = useState(0);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPhase(0)}
      allowFullscreen={false}
      caption={<span className="text-teal">{t(PHASES[phase])}</span>}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <ellipse
            cx="50"
            cy="48"
            rx="28"
            ry="18"
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="1"
          />
          <ellipse
            cx="50"
            cy="48"
            rx={phase === 1 ? 8 : 12}
            ry={phase === 1 ? 6 : 9}
            fill="var(--void)"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
          />
          <circle
            cx={phase === 0 ? 28 : phase === 1 ? 50 : 78}
            cy="48"
            r="5"
            fill={phase === 2 ? "var(--teal)" : "var(--amber)"}
            opacity="0.9"
            style={phase === 2 ? { filter: "drop-shadow(0 0 8px var(--teal))" } : undefined}
          />
          {phase === 2 && (
            <circle
              cx="78"
              cy="32"
              r="4"
              fill="var(--cyan)"
              style={{ filter: "drop-shadow(0 0 6px var(--cyan))" }}
            />
          )}
          <text
            x="50"
            y="78"
            textAnchor="middle"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("active")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("active")} value={t(PHASES[phase])} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {PHASES.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setPhase(i)}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
              style={{
                borderColor: phase === i ? "var(--teal)" : "var(--border-strong)",
                color: phase === i ? "var(--teal)" : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {t(p)}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
