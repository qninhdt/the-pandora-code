"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Same shape, bigger size. Area ~k², volume ~k³ — pure isometry snaps under load.
export default function Isometry() {
  const t = useTranslations("viz.isometry");
  const [k, setK] = useState(1.5);
  const area = k * k;
  const volume = k * k * k;
  const stress = volume / area; // ~k
  const fails = stress > 2.2;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setK(1.5)}
      allowFullscreen={false}
      caption={
        <span className={fails ? "text-magenta" : "text-teal"}>
          {fails ? t("fail") : t("safe")} · σ∝{stress.toFixed(2)}
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
          {/* small reference */}
          <rect x="18" y="50" width="14" height="20" fill="var(--surface)" stroke="var(--teal)" strokeWidth="0.8" />
          {/* scaled twin */}
          <rect
            x={55}
            y={70 - 14 * k}
            width={14 * k}
            height={14 * k}
            fill="var(--surface)"
            stroke={fails ? "var(--magenta)" : "var(--cyan)"}
            strokeWidth="1"
          />
          {/* wall thickness proportional (isometric) */}
          <rect
            x={55 + 2 * k}
            y={70 - 14 * k + 2 * k}
            width={10 * k}
            height={10 * k}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            strokeDasharray="1 1"
          />
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("area")} value={area.toFixed(2)} accent="teal" />
          <Readout label={t("volume")} value={volume.toFixed(2)} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("scale")}
            value={k}
            min={1}
            max={3.5}
            step={0.05}
            display={`×${k.toFixed(2)}`}
            onChange={setK}
            thumb={fails ? "magenta" : "cyan"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
