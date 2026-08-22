"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Impact plotted against abundance. Slide a species' biomass share and the same
// large removal effect lands in a different category: disproportionate at low
// bulk (keystone), merely proportional at high bulk (foundation).
export default function FoundationSpecies() {
  const t = useTranslations("viz.foundation-species");
  const [share, setShare] = useState(0.85);

  const impact = 0.9;
  const ratio = impact / share;
  const isFoundation = share > 0.4;
  const tone = isFoundation ? "var(--cyan)" : "var(--magenta)";

  const barW = share * 68;
  const impactW = impact * 68;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setShare(0.85)}
      allowFullscreen={false}
      caption={
        <span style={{ color: tone }}>
          {isFoundation ? t("verdictFoundation") : t("verdictKeystone")}
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
          {/* biomass share */}
          <text x="16" y="24" style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("biomass")}
          </text>
          <rect x="16" y="26" width="68" height="6" fill="var(--void)" stroke="var(--border)" strokeWidth="0.3" />
          <rect x="16" y="26" width={barW} height="6" fill={tone} opacity={0.75} />

          {/* removal impact — held constant so the ratio is the story */}
          <text x="16" y="44" style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("impact")}
          </text>
          <rect x="16" y="46" width="68" height="6" fill="var(--void)" stroke="var(--border)" strokeWidth="0.3" />
          <rect
            x="16"
            y="46"
            width={impactW}
            height="6"
            fill="var(--amber)"
            opacity={0.8}
            style={{ filter: "drop-shadow(0 0 3px var(--amber))" }}
          />

          {/* the threshold that renames the mechanism */}
          <line x1={16 + 0.4 * 68} y1="22" x2={16 + 0.4 * 68} y2="56" stroke="var(--border-strong)" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
          <text x="50" y="66" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("ratio")} value={ratio.toFixed(1)} accent={isFoundation ? "cyan" : "magenta"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("biomass")}
            value={share}
            min={0.02}
            max={0.95}
            step={0.01}
            onChange={setShare}
            display={`${Math.round(share * 100)}%`}
            thumb={isFoundation ? "cyan" : "magenta"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
