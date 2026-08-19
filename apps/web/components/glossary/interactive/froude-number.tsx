"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Fr = v / √(gL). Near 1, wave drag peaks and swimming gait shifts.
export default function FroudeNumber() {
  const t = useTranslations("viz.froude-number");
  const [speed, setSpeed] = useState(1.2);
  const L = 2; // m characteristic
  const g = 9.81;
  const fr = speed / Math.sqrt(g * L);
  const waveDrag = Math.exp(-((fr - 1) ** 2) / 0.18); // peaks ~1

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSpeed(1.2)}
      allowFullscreen={false}
      caption={
        <span className={fr > 0.85 && fr < 1.15 ? "text-amber" : "text-cyan"}>
          Fr {fr.toFixed(2)}
          {fr > 0.85 && fr < 1.15 ? ` · ${t("transition")}` : ""}
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
          <rect x="8" y="40" width="84" height="28" rx="2" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.5" />
          {/* water line */}
          <line x1="8" y1="52" x2="92" y2="52" stroke="var(--cyan)" strokeWidth="0.6" opacity="0.5" />
          {/* creature */}
          <ellipse cx={20 + speed * 18} cy="50" rx="8" ry="3.5" fill="var(--teal)" opacity="0.9" />
          {/* bow wave height ~ waveDrag */}
          <path
            d={`M${28 + speed * 18} 52 q 6 ${-10 * waveDrag} 14 0`}
            fill="none"
            stroke="var(--amber)"
            strokeWidth="1.2"
            opacity={0.4 + waveDrag * 0.6}
          />
          {/* Fr meter */}
          <line x1="12" y1="82" x2="88" y2="82" stroke="var(--border-strong)" strokeWidth="0.6" />
          <circle cx={12 + Math.min(fr, 2) * 38} cy="82" r="3" fill="var(--cyan)" />
          <text x="50" y="92" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}>
            Fr = 1
          </text>
          <line x1="50" y1="78" x2="50" y2="86" stroke="var(--amber)" strokeWidth="0.7" />
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("fr")} value={fr.toFixed(2)} accent="cyan" />
          <Readout label={t("waveDrag")} value={waveDrag.toFixed(2)} accent="amber" />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("speed")}
            value={speed}
            min={0.2}
            max={3.5}
            step={0.05}
            display={`${speed.toFixed(2)} m/s`}
            onChange={setSpeed}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
