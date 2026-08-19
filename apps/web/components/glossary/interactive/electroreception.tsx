"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Move prey in the field; snout receptors light where lines warp.
export default function Electroreception() {
  const t = useTranslations("viz.electroreception");
  const [prey, setPrey] = useState(50);
  const distortion = Math.abs(prey - 50) / 50;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPrey(50)}
      allowFullscreen={false}
      caption={<span className="text-cyan">{t("receptors")}: {(distortion * 100).toFixed(0)}%</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* predator */}
          <ellipse cx="28" cy="50" rx="14" ry="7" fill="var(--surface)" stroke="var(--teal)" strokeWidth="0.8" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={36} cy={42 + i * 4} r={1.2 + distortion * 1.5} fill="var(--cyan)" opacity={0.4 + distortion * 0.6} />
          ))}
          {/* field lines */}
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M42 ${36 + i * 8} Q ${prey} ${40 + i * 6 + (prey - 50) * 0.15}, 88 ${36 + i * 8}`}
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="0.5"
              opacity="0.45"
            />
          ))}
          <circle cx={prey} cy="50" r="4" fill="var(--amber)" />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("field")} value={distortion.toFixed(2)} accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("prey")} value={prey} min={45} max={85} step={1} display={`${prey}`} onChange={setPrey} thumb="amber" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
