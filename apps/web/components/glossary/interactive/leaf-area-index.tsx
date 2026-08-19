"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Beer–Lambert interception: 1 - exp(-k * LAI)
export default function LeafAreaIndex() {
  const t = useTranslations("viz.leaf-area-index");
  const [layers, setLayers] = useState(3.2);
  const k = 0.5;
  const intercept = 1 - Math.exp(-k * layers);
  const saturated = intercept > 0.92;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setLayers(3.2)}
      allowFullscreen={false}
      caption={
        <span className={saturated ? "text-amber" : "text-teal"}>
          {saturated ? t("saturate") : t("intercept")} {Math.round(intercept * 100)}%
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* ground patch */}
          <rect x="22" y="72" width="56" height="8" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.5" />
          <text x="50" y="84" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("ground")}
          </text>
          {/* stacked leaf layers */}
          {Array.from({ length: Math.min(10, Math.ceil(layers)) }).map((_, i) => {
            const y = 66 - i * 5.5;
            const w = 40 + (i % 3) * 4;
            const op = 0.25 + (1 - i / 12) * 0.45;
            const partial = i === Math.ceil(layers) - 1 ? layers % 1 || 1 : 1;
            return (
              <ellipse
                key={i}
                cx="50"
                cy={y}
                rx={(w / 2) * (0.7 + partial * 0.3)}
                ry={2.4}
                fill="var(--teal)"
                opacity={op * partial}
              />
            );
          })}
          {/* sun rays attenuated */}
          {[35, 50, 65].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1="10"
              x2={x}
              y2={20 + intercept * 50}
              stroke="var(--amber)"
              strokeWidth="0.7"
              opacity={0.7 - intercept * 0.5 - i * 0.05}
              strokeDasharray={saturated ? "1 2" : undefined}
            />
          ))}
          <circle cx="50" cy="8" r="4" fill="var(--amber)" opacity={0.7} />
        </svg>
        <div className="absolute right-3 top-14 space-y-1">
          <Readout label={t("lai")} value={layers.toFixed(1)} accent="teal" />
          <Readout label={t("intercept")} value={`${Math.round(intercept * 100)}%`} accent={saturated ? "amber" : "cyan"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("layers")}
            value={layers}
            min={0.2}
            max={8}
            step={0.1}
            display={layers.toFixed(1)}
            onChange={setLayers}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
