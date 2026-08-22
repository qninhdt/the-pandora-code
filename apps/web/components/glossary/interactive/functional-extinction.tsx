"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Alive as tissue, gone as a participant. The root system keeps sending up shoots
// and the blight keeps killing them before any can reproduce.
type Mode = "before" | "after";

export default function FunctionalExtinction() {
  const t = useTranslations("viz.functional-extinction");
  const [mode, setMode] = useState<Mode>("after");

  const tone = mode === "before" ? "var(--teal)" : "var(--magenta)";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("after")}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{t(`verdict.${mode}`)}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 78" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <line x1="8" y1="52" x2="92" y2="52" stroke="var(--border-strong)" strokeWidth="0.5" opacity={0.6} />
          {/* the surviving root system, in both states */}
          <path d="M50 52 Q38 58 26 60 M50 52 Q62 58 74 60 M50 52 L50 62" stroke="var(--teal)" strokeWidth="0.8" fill="none" opacity={0.55} />

          {mode === "before" ? (
            <g>
              {/* mature, reproducing: full canopy and a seed crop */}
              <line x1="50" y1="52" x2="50" y2="20" stroke={tone} strokeWidth="3" strokeLinecap="round" opacity={0.9}
                style={{ filter: `drop-shadow(0 0 4px ${tone})` }} />
              <ellipse cx="50" cy="20" rx="16" ry="8" fill={tone} opacity={0.3} />
              {[-10, -4, 3, 9].map((dx, i) => (
                <circle key={i} cx={50 + dx} cy={46 + (i % 2) * 4} r="1.3" fill="var(--amber)" opacity={0.9} />
              ))}
            </g>
          ) : (
            <g>
              {/* the stump plus shoots, each dying before maturity */}
              <path d="M45 52 L46 46 L54 46 L55 52 Z" fill="var(--muted)" opacity={0.6} />
              {[-14, -8, 8, 15].map((dx, i) => (
                <g key={i}>
                  <line x1={50 + dx} y1="52" x2={50 + dx} y2={38 + (i % 2) * 3} stroke={tone} strokeWidth="0.9" strokeLinecap="round" opacity={0.75} />
                  <circle cx={50 + dx} cy={37 + (i % 2) * 3} r="1.5" fill={tone} opacity={0.3} />
                  {/* the blight mark: this shoot will not reach maturity */}
                  <line x1={50 + dx - 2} y1={41 + (i % 2) * 3} x2={50 + dx + 2} y2={44 + (i % 2) * 3} stroke="var(--magenta)" strokeWidth="0.5" opacity={0.85} />
                </g>
              ))}
            </g>
          )}
          <text x="50" y="70" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>{t("axis")}</text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("alive")} value={t("yes")} accent="teal" />
          <Readout label={t("reproducing")} value={mode === "before" ? t("yes") : t("no")} accent={mode === "before" ? "teal" : "magenta"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlTabs
            options={[
              { value: "before", label: t("modes.before") },
              { value: "after", label: t("modes.after") },
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
