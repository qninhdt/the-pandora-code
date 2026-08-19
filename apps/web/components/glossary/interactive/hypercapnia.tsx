"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Raise pCO₂; breathing drive spikes — Na'vi must blunt this urge.
export default function Hypercapnia() {
  const t = useTranslations("viz.hypercapnia");
  const [pco2, setPco2] = useState(40);
  const drive = Math.min(100, Math.max(0, (pco2 - 30) * 3.2));

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPco2(40)}
      allowFullscreen={false}
      caption={<span className="text-amber">{t("urge")}: {drive.toFixed(0)}%</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <line x1="16" y1="70" x2="88" y2="70" stroke="var(--border-strong)" strokeWidth="0.5" />
          <line x1="16" y1="70" x2="16" y2="20" stroke="var(--border-strong)" strokeWidth="0.5" />
          <polyline
            fill="none"
            stroke="var(--amber)"
            strokeWidth="1.3"
            points={Array.from({ length: 20 }, (_, i) => {
              const x = 16 + i * 3.6;
              const p = 30 + i * 2.5;
              const d = Math.min(100, Math.max(0, (p - 30) * 3.2));
              const y = 70 - (d / 100) * 46;
              return `${x},${y}`;
            }).join(" ")}
          />
          <circle cx={16 + ((pco2 - 30) / 50) * 72} cy={70 - (drive / 100) * 46} r="3" fill="var(--magenta)" />
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("pco2")} value={`${pco2}`} accent="cyan" />
          <Readout label={t("drive")} value={`${drive.toFixed(0)}%`} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("pco2")} value={pco2} min={30} max={80} step={1} display={`${pco2} mmHg`} onChange={setPco2} thumb="amber" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
