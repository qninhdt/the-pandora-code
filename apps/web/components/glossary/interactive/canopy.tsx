"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Beer–Lambert-ish light falloff through canopy depth.
export default function Canopy() {
  const t = useTranslations("viz.canopy");
  const [depth, setDepth] = useState(0.35); // 0 crown → 1 floor
  const light = Math.exp(-3.2 * depth);
  const meterY = 18 + depth * 58;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setDepth(0.35)}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("light")} {Math.round(light * 100)}%
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* sky to floor gradient bars */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const y = 12 + i * 12;
            const op = Math.exp(-0.55 * i) * 0.55;
            return <rect key={i} x="18" y={y} width="54" height="11" fill="var(--teal)" opacity={op} rx="1" />;
          })}
          {/* trunks */}
          {[28, 42, 55, 68].map((x) => (
            <rect key={x} x={x - 1} y="20" width="2" height="58" fill="var(--cyan)" opacity={0.25} />
          ))}
          {/* floor */}
          <rect x="14" y="78" width="62" height="6" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.4" />
          {/* light meter probe */}
          <line x1="78" y1="16" x2="78" y2="80" stroke="var(--border-strong)" strokeWidth="0.5" strokeDasharray="1 1" />
          <circle cx="78" cy={meterY} r="3.2" fill="var(--amber)" opacity={0.4 + light * 0.6} style={{ filter: light > 0.3 ? "drop-shadow(0 0 4px var(--amber))" : undefined }} />
          <line x1="72" y1={meterY} x2="84" y2={meterY} stroke="var(--amber)" strokeWidth="0.7" />
          {/* understory adaptation icons */}
          <g opacity={0.5 + (1 - light) * 0.5}>
            <ellipse cx="36" cy="74" rx="5" ry="2.5" fill="var(--magenta)" opacity={depth > 0.5 ? 0.85 : 0.25} />
            <ellipse cx="50" cy="75" rx="6" ry="2.2" fill="var(--teal)" opacity={depth > 0.4 ? 0.8 : 0.2} />
          </g>
          <text x="16" y="14" style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("surface")}
          </text>
          <text x="16" y="88" style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("floor")}
          </text>
        </svg>
        <div className="absolute right-3 top-14 space-y-1">
          <Readout label={t("light")} value={`${Math.round(light * 100)}`} unit="%" accent="amber" />
          <Readout label={t("adapt")} value={depth > 0.55 ? "↑" : "·"} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("depth")} value={depth} min={0} max={1} step={0.01} display={`${Math.round(depth * 40)} m`} onChange={setDepth} thumb="teal" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
