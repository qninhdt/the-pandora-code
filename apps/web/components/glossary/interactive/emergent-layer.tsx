"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Scroll forest profile; emergents catch full sun/wind above closed canopy.
export default function EmergentLayer() {
  const t = useTranslations("viz.emergent-layer");
  const [height, setHeight] = useState(0.75); // 0 floor → 1 above emergent
  const viewY = (1 - height) * 40; // pan content
  const aboveCanopy = height > 0.62;
  const sun = aboveCanopy ? 0.55 + (height - 0.62) * 1.2 : 0.15 + height * 0.3;
  const wind = aboveCanopy ? 0.4 + (height - 0.62) * 1.5 : 0.08;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setHeight(0.75)}
      allowFullscreen={false}
      caption={
        <span className={aboveCanopy ? "text-amber" : "text-teal"}>
          {aboveCanopy ? t("emergent") : t("canopy")}
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
          <g transform={`translate(0, ${viewY})`}>
            {/* sky */}
            <rect x="0" y="-20" width="100" height="50" fill="#0a1420" />
            {/* emergent crowns */}
            <rect x="30" y="0" width="3" height="48" fill="var(--cyan)" opacity={0.4} />
            <ellipse
              cx="31.5"
              cy="-2"
              rx="14"
              ry="10"
              fill="var(--amber)"
              opacity={0.45 + sun * 0.4}
              style={{ filter: aboveCanopy ? "drop-shadow(0 0 6px var(--amber))" : undefined }}
            />
            <rect x="58" y="6" width="3" height="42" fill="var(--cyan)" opacity={0.35} />
            <ellipse cx="59.5" cy="4" rx="12" ry="9" fill="var(--teal)" opacity={0.4 + sun * 0.3} />
            {/* closed canopy band */}
            <rect x="10" y="28" width="80" height="14" fill="var(--teal)" opacity={0.35} rx="2" />
            <text
              x="50"
              y="37"
              textAnchor="middle"
              style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--teal)" }}
            >
              {t("canopy")}
            </text>
            {/* understory stubs */}
            {[20, 40, 55, 75].map((x) => (
              <rect key={x} x={x} y="42" width="2" height="20" fill="var(--cyan)" opacity={0.25} />
            ))}
            <rect x="8" y="62" width="84" height="8" fill="var(--surface)" opacity={0.6} />
          </g>
          {/* wind streaks when exposed */}
          {aboveCanopy &&
            [0, 1, 2].map((i) => (
              <line
                key={i}
                x1={12 + i * 8}
                y1={18 + i * 5}
                x2={28 + i * 8 + wind * 10}
                y2={18 + i * 5}
                stroke="var(--cyan)"
                strokeWidth="0.6"
                opacity={0.4 + wind * 0.4}
              />
            ))}
          {/* sun disc */}
          <circle cx="86" cy="14" r={4 + sun * 3} fill="var(--amber)" opacity={0.3 + sun * 0.5} />
        </svg>
        <div className="absolute right-3 top-14 space-y-1">
          <Readout
            label={t("sun")}
            value={`${Math.round(Math.min(1, sun) * 100)}%`}
            accent="amber"
          />
          <Readout
            label={t("wind")}
            value={`${Math.round(Math.min(1, wind) * 100)}%`}
            accent="cyan"
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("height")}
            value={height}
            min={0}
            max={1}
            step={0.01}
            display={`${Math.round(height * 70)} m`}
            onChange={setHeight}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
