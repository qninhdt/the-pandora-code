"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Absorb short, emit long — Stokes shift. Pick a fluorophore.
const MOL = [
  { key: "m1", ex: 365, em: 450, color: "var(--cyan)" },
  { key: "m2", ex: 488, em: 520, color: "var(--teal)" },
  { key: "m3", ex: 550, em: 610, color: "var(--amber)" },
] as const;

export default function Fluorescence() {
  const t = useTranslations("viz.fluorescence");
  const [idx, setIdx] = useState(1);
  const m = MOL[idx];
  const stokes = m.em - m.ex;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setIdx(1)}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("stokes")}: {stokes} nm
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
          <circle cx="35" cy="45" r="10" fill="var(--magenta)" opacity="0.35" />
          <text
            x="35"
            y="48"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--magenta)" }}
          >
            {m.ex}
          </text>
          <path
            d="M48 45 L58 45"
            stroke="var(--border-strong)"
            strokeWidth="1"
            markerEnd="url(#a)"
          />
          <circle
            cx="72"
            cy="45"
            r="12"
            fill={m.color}
            opacity="0.55"
            style={{ filter: `drop-shadow(0 0 8px ${m.color})` }}
          />
          <text
            x="72"
            y="48"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: m.color }}
          >
            {m.em}
          </text>
          <text
            x="35"
            y="66"
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("excite")}
          </text>
          <text
            x="72"
            y="66"
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("emit")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("stokes")} value={`${stokes} nm`} accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {MOL.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
              style={{
                borderColor: idx === i ? "var(--cyan)" : "var(--border-strong)",
                color: idx === i ? "var(--cyan)" : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {t("molecule")} {i + 1}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
