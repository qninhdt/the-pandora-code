"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Thin aerofoil + AoA. Cl rises then stalls past ~15–18° thin-section peak.
export default function Lift() {
  const t = useTranslations("viz.lift");
  const [aoa, setAoa] = useState(8);
  const stallAt = 16;
  const stalled = aoa > stallAt;
  const cl = stalled
    ? Math.max(0.3, 1.4 - (aoa - stallAt) * 0.12)
    : Math.sin((aoa * Math.PI) / 180) * 5.2;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setAoa(8)}
      allowFullscreen={false}
      caption={
        <span className={stalled ? "text-magenta" : "text-cyan"}>
          {stalled ? t("stall") : t("stream")} · Cl {cl.toFixed(2)}
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
          <g transform={`translate(50 48) rotate(${-aoa * 0.5})`}>
            <path
              d="M-30 2 C -10 -8, 10 -4, 30 2 C 10 6, -10 5, -30 2 Z"
              fill="var(--surface)"
              stroke={stalled ? "var(--magenta)" : "var(--cyan)"}
              strokeWidth="1"
            />
          </g>
          {/* streamlines */}
          {[-12, -4, 4, 12].map((dy, i) => (
            <path
              key={i}
              d={`M8 ${48 + dy} Q 30 ${44 + dy - aoa * 0.2}, 50 ${48 + dy * 0.4} T 92 ${48 + dy * 0.2}`}
              fill="none"
              stroke={stalled ? "var(--magenta)" : "var(--teal)"}
              strokeWidth="0.5"
              opacity={stalled ? 0.35 : 0.55}
              strokeDasharray={stalled ? "1 2" : undefined}
            />
          ))}
          {/* Cl bar */}
          <rect x="12" y="84" width="76" height="5" rx="1" fill="var(--void)" stroke="var(--border-strong)" strokeWidth="0.4" />
          <rect
            x="12"
            y="84"
            width={Math.min(76, (Math.max(cl, 0) / 1.6) * 76)}
            height="5"
            rx="1"
            fill={stalled ? "var(--magenta)" : "var(--cyan)"}
          />
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("cl")} value={cl.toFixed(2)} accent={stalled ? "magenta" : "cyan"} />
          <Readout label={t("aoa")} value={`${aoa}°`} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("aoa")} value={aoa} min={0} max={28} step={0.5} display={`${aoa.toFixed(1)}°`} onChange={setAoa} thumb={stalled ? "magenta" : "cyan"} />
        </div>
      </div>
    </GlossaryFrame>
  );
}
