"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// ~2% sunlight; lamp reveals decomposers and nutrient loop.
export default function ForestFloor() {
  const t = useTranslations("viz.forest-floor");
  const [lamp, setLamp] = useState(0.35);
  const sunLeft = 0.02;
  const reveal = lamp;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setLamp(0.35)}
      allowFullscreen={false}
      caption={
        <span className="text-amber">
          {t("sun")} ~{Math.round(sunLeft * 100)}%
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* dark understory wash */}
          <rect x="0" y="0" width="100" height="100" fill="#06080c" />
          {/* canopy silhouette top */}
          <ellipse cx="50" cy="8" rx="48" ry="12" fill="var(--teal)" opacity={0.15} />
          {/* litter layer */}
          <rect x="8" y="68" width="84" height="18" fill="var(--surface)" opacity={0.45} />
          {/* lamp beam */}
          <polygon
            points={`50,18 ${30 - lamp * 8},70 ${70 + lamp * 8},70`}
            fill="var(--amber)"
            opacity={0.08 + lamp * 0.25}
          />
          <circle cx="50" cy="16" r="3" fill="var(--amber)" opacity={0.5 + lamp * 0.5} />
          {/* detritus chunks */}
          {[18, 32, 48, 62, 78].map((x, i) => (
            <ellipse
              key={x}
              cx={x}
              cy={74 + (i % 3)}
              rx={4 + (i % 2)}
              ry="2"
              fill="var(--amber)"
              opacity={0.15 + reveal * 0.5}
            />
          ))}
          {/* fungi / decomposers appear with lamp */}
          <g opacity={reveal}>
            {[28, 44, 60, 72].map((x, i) => (
              <g key={x}>
                <line x1={x} y1="68" x2={x} y2={60 - i} stroke="var(--magenta)" strokeWidth="0.7" />
                <circle cx={x} cy={58 - i} r="2.2" fill="var(--magenta)" opacity={0.7} style={{ filter: "drop-shadow(0 0 3px var(--magenta))" }} />
              </g>
            ))}
            {/* nutrient recycle loop */}
            <path
              d="M24 82 C 40 90, 60 90, 76 82"
              fill="none"
              stroke="var(--teal)"
              strokeWidth="0.8"
              strokeDasharray="2 1.5"
              opacity={0.5 + reveal * 0.5}
            />
            <path d="M22 50 C 22 40, 78 40, 78 50" fill="none" stroke="var(--cyan)" strokeWidth="0.6" opacity={0.35 + reveal * 0.4} />
            <text x="50" y="38" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--teal)" }}>
              {t("recycle")}
            </text>
          </g>
          <text x="50" y="92" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("detritus")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("reveal")} value={`${Math.round(reveal * 100)}%`} accent="magenta" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("light")} value={lamp} min={0} max={1} step={0.01} display={`${Math.round(lamp * 100)}%`} onChange={setLamp} thumb="amber" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
