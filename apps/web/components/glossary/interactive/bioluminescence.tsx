"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Luciferin → enzyme → excited → photon. Advance the cascade; cold light climbs.
const STEPS = ["luciferin", "enzyme", "excited", "photon"] as const;

export default function Bioluminescence() {
  const t = useTranslations("viz.bioluminescence");
  const [step, setStep] = useState(0);
  const glow = (step + 1) / 4;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setStep(0)}
      allowFullscreen={false}
      caption={<span className="text-teal">{t(STEPS[step])}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {STEPS.map((s, i) => {
            const x = 18 + i * 22;
            const on = i <= step;
            return (
              <g key={s}>
                <circle
                  cx={x}
                  cy="48"
                  r={on ? 8 : 5}
                  fill={on ? "var(--teal)" : "var(--surface)"}
                  opacity={on ? 0.35 + glow * 0.6 : 0.5}
                  style={on ? { filter: "drop-shadow(0 0 6px var(--teal))" } : undefined}
                />
                {i < 3 && (
                  <line x1={x + 8} y1="48" x2={x + 14} y2="48" stroke="var(--border-strong)" strokeWidth="0.7" />
                )}
                <text x={x} y="66" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: on ? "var(--teal)" : "var(--muted)" }}>
                  {t(s)}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("step")} value={`${step + 1}/4`} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setStep((s) => (s + 1) % 4)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase"
            style={{ borderColor: "var(--teal)", color: "var(--teal)", background: "var(--void)" }}
          >
            {t("next")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
