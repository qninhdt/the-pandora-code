"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// In and out the same path. Tidal rides on residual; capacity is the ceiling.
export default function TidalVentilation() {
  const t = useTranslations("viz.tidal-ventilation");
  const [breath, setBreath] = useState(0.55);
  const residual = 0.25;
  const capacity = 1;
  const tidal = breath * (capacity - residual);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setBreath(0.55)}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("tidal")}: {tidal.toFixed(2)}
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
          <rect
            x="30"
            y="18"
            width="40"
            height="60"
            rx="3"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
          />
          <rect
            x="30"
            y={78 - residual * 55}
            width="40"
            height={residual * 55}
            fill="var(--muted)"
            opacity="0.45"
          />
          <rect
            x="30"
            y={78 - residual * 55 - tidal * 55}
            width="40"
            height={tidal * 55}
            fill="var(--cyan)"
            opacity="0.55"
          />
          <line x1="28" y1="18" x2="72" y2="18" stroke="var(--teal)" strokeWidth="0.7" />
          <text
            x="76"
            y="22"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            {t("capacity")}
          </text>
          <text
            x="76"
            y="70"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("residual")}
          </text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("tidal")} value={tidal.toFixed(2)} accent="cyan" />
          <Readout label={t("residual")} value={residual.toFixed(2)} accent="foreground" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("breath")}
            value={breath}
            min={0.15}
            max={1}
            step={0.02}
            display={`${(breath * 100).toFixed(0)}%`}
            onChange={setBreath}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
