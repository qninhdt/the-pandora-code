"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Night mirror behind the retina. Dim ambient; eyeshine blooms on the double pass.
export default function TapetumLucidum() {
  const t = useTranslations("viz.tapetum-lucidum");
  const [ambient, setAmbient] = useState(0.35);
  const glow = Math.max(0.1, 1 - ambient);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setAmbient(0.35)}
      allowFullscreen={false}
      caption={
        <span className="text-amber">
          {t("glow")}: {(glow * 100).toFixed(0)}%
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
          <circle
            cx="50"
            cy="46"
            r="22"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.7"
          />
          <circle
            cx="50"
            cy="46"
            r="14"
            fill="var(--void)"
            stroke="var(--cyan)"
            strokeWidth="0.5"
            opacity={0.3 + ambient * 0.5}
          />
          <ellipse
            cx="50"
            cy="58"
            rx="12"
            ry="3"
            fill="var(--amber)"
            opacity={0.3 + glow * 0.7}
            style={{ filter: `drop-shadow(0 0 ${4 + glow * 8}px var(--amber))` }}
          />
          <circle
            cx="50"
            cy="46"
            r="5"
            fill="var(--teal)"
            opacity={glow}
            style={{ filter: `drop-shadow(0 0 ${glow * 10}px var(--teal))` }}
          />
          <text
            x="50"
            y="78"
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("pass")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("glow")} value={`${(glow * 100).toFixed(0)}%`} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("ambient")}
            value={ambient}
            min={0.05}
            max={1}
            step={0.02}
            display={`${(ambient * 100).toFixed(0)}%`}
            onChange={setAmbient}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
