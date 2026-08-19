"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Bright honest warning. Dim the signal until the predator stops retreating.
export default function Aposematism() {
  const t = useTranslations("viz.aposematism");
  const [brightness, setBrightness] = useState(0.75);
  const retreats = brightness >= 0.45;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setBrightness(0.75)}
      allowFullscreen={false}
      caption={
        <span className={retreats ? "text-amber" : "text-magenta"}>
          {retreats ? t("retreat") : t("attack")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <ellipse cx="38" cy="48" rx="14" ry="10" fill="var(--surface)" stroke="var(--amber)" strokeWidth="1" opacity={0.4 + brightness * 0.6} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={28 + i * 7} y="42" width="5" height="12" fill="var(--amber)" opacity={brightness} />
          ))}
          <circle
            cx={retreats ? 78 : 58}
            cy="48"
            r="8"
            fill="var(--magenta)"
            opacity={retreats ? 0.45 : 0.9}
          />
          <text x="38" y="70" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--amber)" }}>
            {t("brightness")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("threshold")} value={retreats ? t("retreat") : t("attack")} accent={retreats ? "amber" : "magenta"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("brightness")} value={brightness} min={0.1} max={1} step={0.02} display={`${Math.round(brightness * 100)}%`} onChange={setBrightness} thumb="amber" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
