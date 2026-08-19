"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Hub mother routes more carbon to a shaded seedling.
export default function MotherTreeHypothesis() {
  const t = useTranslations("viz.mother-tree-hypothesis");
  const [shade, setShade] = useState(0.4);
  // More shade → mother sends more C to that juvenile
  const carbonSent = 0.2 + shade * 0.75;
  const otherShare = (1 - carbonSent) / 3;

  const juveniles = [
    { x: 22, y: 48, shaded: true },
    { x: 36, y: 52, shaded: false },
    { x: 70, y: 50, shaded: false },
    { x: 84, y: 54, shaded: false },
  ];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setShade(0.4)}
      allowFullscreen={false}
      caption={
        <span className="text-amber">
          {t("carbon")} {Math.round(carbonSent * 100)}%
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <rect x="4" y="60" width="92" height="24" fill="var(--surface)" opacity={0.5} />
          {/* mother */}
          <rect x="47" y="22" width="6" height="40" fill="var(--cyan)" opacity={0.5} />
          <ellipse cx="50" cy="20" rx="16" ry="11" fill="var(--teal)" opacity={0.55} style={{ filter: "drop-shadow(0 0 6px var(--teal))" }} />
          <text x="50" y="14" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--teal)" }}>
            {t("mother")}
          </text>
          {/* mycorrhizal links */}
          {juveniles.map((j, i) => {
            const share = j.shaded ? carbonSent : otherShare;
            return (
              <g key={i}>
                <path
                  d={`M50 64 C ${(50 + j.x) / 2} 72, ${j.x} 70, ${j.x} 64`}
                  fill="none"
                  stroke="var(--magenta)"
                  strokeWidth={0.6 + share * 2}
                  opacity={0.35 + share * 0.6}
                />
                {/* carbon packet */}
                <circle
                  cx={(50 + j.x) / 2}
                  cy={68}
                  r={1 + share * 2}
                  fill="var(--amber)"
                  opacity={0.5 + share * 0.5}
                />
                <rect x={j.x - 1} y={j.y} width="2" height="14" fill="var(--cyan)" opacity={0.35 + share * 0.45} />
                <ellipse
                  cx={j.x}
                  cy={j.y}
                  rx={3 + share * 4}
                  ry={2 + share * 2.5}
                  fill="var(--teal)"
                  opacity={0.3 + share * 0.55}
                />
                {j.shaded && (
                  <g>
                    {/* shade cloud */}
                    <ellipse cx={j.x} cy={j.y - 8} rx={6 + shade * 4} ry="3" fill="var(--void)" opacity={0.35 + shade * 0.4} />
                    <text x={j.x} y={j.y + 20} textAnchor="middle" style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--amber)" }}>
                      {t("juvenile")}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          <text x="50" y="90" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("link")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("carbon")} value={`${Math.round(carbonSent * 100)}%`} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("shade")}
            value={shade}
            min={0}
            max={1}
            step={0.01}
            display={`${Math.round(shade * 100)}%`}
            onChange={setShade}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
