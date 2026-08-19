"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Flux ∝ area × ΔC / thickness. Thin membrane + steep gradient → more O₂.
export default function FicksLaw() {
  const t = useTranslations("viz.ficks-law");
  const [thickness, setThickness] = useState(0.6);
  const [gradient, setGradient] = useState(0.7);
  const [area, setArea] = useState(1.2);
  const flux = (area * gradient) / Math.max(thickness, 0.08);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setThickness(0.6);
        setGradient(0.7);
        setArea(1.2);
      }}
      allowFullscreen={false}
      caption={<span className="text-cyan">{t("flux")}: {flux.toFixed(2)}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <rect x="20" y={42 - thickness * 10} width="60" height={Math.max(2, thickness * 20)} fill="var(--surface)" stroke="var(--cyan)" strokeWidth="0.8" />
          {Array.from({ length: Math.min(12, Math.round(flux * 2)) }, (_, i) => (
            <circle key={i} cx={28 + i * 5} cy="42" r="1.4" fill="var(--teal)" opacity="0.8" />
          ))}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("flux")} value={flux.toFixed(2)} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1">
          <ControlSlider label={t("thickness")} value={thickness} min={0.15} max={1.5} step={0.05} display={thickness.toFixed(2)} onChange={setThickness} thumb="magenta" />
          <ControlSlider label={t("gradient")} value={gradient} min={0.2} max={1.5} step={0.05} display={gradient.toFixed(2)} onChange={setGradient} thumb="cyan" />
          <ControlSlider label={t("area")} value={area} min={0.4} max={2.5} step={0.05} display={area.toFixed(2)} onChange={setArea} thumb="teal" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
