"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Drag the limb — spindles on stretch, Golgi on load.
export default function Proprioception() {
  const t = useTranslations("viz.proprioception");
  const [angle, setAngle] = useState(40);
  const spindle = Math.abs(angle - 40) / 50;
  const golgi = Math.max(0, (angle - 20) / 70);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setAngle(40)}
      allowFullscreen={false}
      caption={<span className="text-cyan">{t("angle")}: {angle}°</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <circle cx="40" cy="40" r="4" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.6" />
          <line
            x1="40"
            y1="40"
            x2={40 + Math.cos((angle * Math.PI) / 180) * 34}
            y2={40 + Math.sin((angle * Math.PI) / 180) * 34}
            stroke="var(--teal)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={40 + Math.cos((angle * Math.PI) / 180) * 18} cy={40 + Math.sin((angle * Math.PI) / 180) * 18}
            r={2 + spindle * 4} fill="var(--cyan)" opacity={0.4 + spindle * 0.6} />
          <circle cx={40 + Math.cos((angle * Math.PI) / 180) * 30} cy={40 + Math.sin((angle * Math.PI) / 180) * 30}
            r={2 + golgi * 4} fill="var(--amber)" opacity={0.4 + golgi * 0.6} />
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("spindle")} value={spindle.toFixed(2)} accent="cyan" />
          <Readout label={t("golgi")} value={golgi.toFixed(2)} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("angle")} value={angle} min={10} max={100} step={1} display={`${angle}°`} onChange={setAngle} thumb="teal" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
