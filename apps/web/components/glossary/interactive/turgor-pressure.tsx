"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Cell turgid ↔ plasmolyzed; whole shoot posture follows osmotic gradient.
export default function TurgorPressure() {
  const t = useTranslations("viz.turgor-pressure");
  const [osmotic, setOsmotic] = useState(0.7); // high = water in = turgid
  const pressure = osmotic;
  const turgid = pressure >= 0.45;
  // cell wall fixed; protoplast shrinks when wilted
  const protoR = 10 + pressure * 8;
  const wallR = 20;
  // shoot droop angle
  const droop = (1 - pressure) * 35;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOsmotic(0.7)}
      allowFullscreen={false}
      caption={
        <span className={turgid ? "text-teal" : "text-magenta"}>
          {turgid ? t("turgid") : t("wilted")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* cell close-up left */}
          <circle cx="30" cy="42" r={wallR} fill="var(--surface)" stroke="var(--cyan)" strokeWidth="1.2" />
          <circle
            cx="30"
            cy="42"
            r={protoR}
            fill="var(--teal)"
            opacity={0.35 + pressure * 0.45}
            stroke="var(--teal)"
            strokeWidth="0.6"
          />
          {/* gap (plasmolysis) when wilted */}
          {!turgid && (
            <circle cx="30" cy="42" r={wallR - 1} fill="none" stroke="var(--magenta)" strokeWidth="0.5" strokeDasharray="2 1.5" opacity={0.7} />
          )}
          <text x="30" y="72" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("pressure")}
          </text>
          {/* whole plant right */}
          <g transform={`translate(70 70) rotate(${droop})`}>
            <line x1="0" y1="0" x2="0" y2={-28 - pressure * 8} stroke="var(--cyan)" strokeWidth="2" />
            <ellipse
              cx="0"
              cy={-30 - pressure * 8}
              rx={8 + pressure * 4}
              ry={5 + pressure * 2}
              fill="var(--teal)"
              opacity={0.4 + pressure * 0.45}
            />
            {/* leaf droop */}
            <path
              d={`M0 ${-18} Q ${12 - droop * 0.2} ${-14 + droop * 0.3} ${16} ${-8 + droop * 0.4}`}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="1.2"
              opacity={0.7}
            />
            <path
              d={`M0 ${-18} Q ${-12 + droop * 0.2} ${-14 + droop * 0.3} ${-16} ${-8 + droop * 0.4}`}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="1.2"
              opacity={0.7}
            />
          </g>
          <text x="70" y="88" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("plant")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("pressure")}
            value={`${Math.round(pressure * 100)}`}
            unit="%"
            accent={turgid ? "teal" : "magenta"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("osmotic")}
            value={osmotic}
            min={0.05}
            max={1}
            step={0.01}
            display={`${Math.round(osmotic * 100)}%`}
            onChange={setOsmotic}
            thumb={turgid ? "teal" : "magenta"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
