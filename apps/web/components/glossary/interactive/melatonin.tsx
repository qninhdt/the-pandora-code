"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A darkness signal, not a sedative. Melatonin rises through the night and light
// suppresses it — and the threshold is low, roughly twilight levels.
export default function Melatonin() {
  const t = useTranslations("viz.melatonin");
  const [lux, setLux] = useState(0.2);

  // Suppression climbs steeply once ambient light passes a few lux.
  const suppression = Math.min(1, Math.log10(1 + lux * 9) / Math.log10(1 + 30 * 9));
  const level = 1 - suppression;

  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const f = i / 200;
    // night hump across the middle of the trace, scaled by remaining melatonin
    const hump = Math.max(0, Math.sin((f - 0.15) * Math.PI * 1.4));
    pts.push(`${8 + f * 84},${(58 - hump * level * 34).toFixed(2)}`);
  }

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setLux(0.2)}
      allowFullscreen={false}
      caption={
        <span className={level > 0.5 ? "text-cyan" : "text-amber"}>
          {level > 0.5 ? t("nightSignal") : t("suppressed")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 78"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <rect x="8" y="12" width="84" height="46" fill="var(--void)" opacity={0.5} />
          <polyline
            points={pts.join(" ")}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.2"
            style={{ filter: "drop-shadow(0 0 3px var(--cyan))" }}
          />
          <line x1="8" y1="58" x2="92" y2="58" stroke="var(--border)" strokeWidth="0.4" />
          {/* the intruding lamp, brightening with lux */}
          <circle
            cx="62"
            cy="20"
            r={1.6 + suppression * 3.4}
            fill="var(--amber)"
            opacity={0.35 + suppression * 0.65}
            style={{ filter: `drop-shadow(0 0 ${2 + suppression * 8}px var(--amber))` }}
          />
          <text
            x="50"
            y="72"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("level")}
            value={`${(level * 100).toFixed(0)}%`}
            accent={level > 0.5 ? "cyan" : "amber"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("ambient")}
            value={lux}
            min={0}
            max={30}
            step={0.1}
            display={`${lux.toFixed(1)} lux`}
            onChange={setLux}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
