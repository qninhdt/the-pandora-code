"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Plant on host tree — air/debris only, no parasitism.
export default function Epiphyte() {
  const t = useTranslations("viz.epiphyte");
  const [height, setHeight] = useState(0.55); // 0 base → 1 crown
  // Higher canopy: more light/debris catch; mid heights hold more mist water.
  const water = 0.35 + Math.sin(height * Math.PI) * 0.55;
  const debris = 0.2 + height * 0.65;
  const y = 72 - height * 48;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setHeight(0.55)}
      allowFullscreen={false}
      caption={<span className="text-teal">{t("parasite")}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* host trunk */}
          <rect x="46" y="16" width="8" height="62" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="0.8" rx="1" />
          <ellipse cx="50" cy="14" rx="20" ry="10" fill="var(--teal)" opacity={0.35} />
          <rect x="20" y="78" width="60" height="6" fill="var(--surface)" opacity={0.6} />
          {/* no-parasitism mark: dashed boundary, no arrow into xylem */}
          <line x1="54" y1={y} x2="62" y2={y} stroke="var(--border-strong)" strokeWidth="0.5" strokeDasharray="1 1" />
          {/* epiphyte body */}
          <g>
            <circle cx="60" cy={y} r="5" fill="var(--magenta)" opacity={0.45} style={{ filter: "drop-shadow(0 0 4px var(--magenta))" }} />
            <path d={`M60 ${y} L66 ${y - 6} M60 ${y} L68 ${y - 1} M60 ${y} L66 ${y + 5}`} stroke="var(--teal)" strokeWidth="0.9" fill="none" />
            {/* water droplets from air */}
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                cx={64 + i * 3}
                cy={y - 10 - i * 2}
                r={0.8 + water * 0.8}
                fill="var(--cyan)"
                opacity={0.3 + water * 0.5}
              />
            ))}
            {/* debris catch */}
            <rect x="57" y={y + 4} width="8" height="2" fill="var(--amber)" opacity={0.3 + debris * 0.5} rx="0.5" />
          </g>
          <text x="72" y={y + 1} style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--magenta)" }}>
            {t("host")}
          </text>
        </svg>
        <div className="absolute left-3 top-14 space-y-1">
          <Readout label={t("water")} value={`${Math.round(water * 100)}%`} accent="cyan" />
          <Readout label={t("debris")} value={`${Math.round(debris * 100)}%`} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("height")}
            value={height}
            min={0.1}
            max={0.95}
            step={0.01}
            display={`${Math.round(height * 40)} m`}
            onChange={setHeight}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
