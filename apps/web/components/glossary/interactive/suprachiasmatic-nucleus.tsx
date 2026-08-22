"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The master clock keeping a body's peripheral clocks in step. Cut its authority
// and the tissue clocks drift apart — the same organ-by-organ scatter jet lag causes.
export default function SuprachiasmaticNucleus() {
  const t = useTranslations("viz.suprachiasmatic-nucleus");
  const [coupling, setCoupling] = useState(0.85);

  // Peripheral clocks around the body. Phase spread grows as coupling falls.
  const tissues = [
    { x: 50, y: 26, seed: 0.1 },
    { x: 34, y: 42, seed: 0.7 },
    { x: 66, y: 42, seed: 0.35 },
    { x: 38, y: 58, seed: 0.9 },
    { x: 62, y: 58, seed: 0.55 },
  ];
  const spread = (1 - coupling) * 2.6;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCoupling(0.85)}
      allowFullscreen={false}
      caption={
        <span className={coupling > 0.6 ? "text-teal" : "text-magenta"}>
          {coupling > 0.6 ? t("inStep") : t("scattered")}
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
          {/* the master clock */}
          <circle
            cx="16"
            cy="42"
            r="7"
            fill="var(--void)"
            stroke="var(--cyan)"
            strokeWidth="0.7"
            style={{ filter: "drop-shadow(0 0 5px var(--cyan))" }}
          />
          <line x1="16" y1="42" x2="16" y2="36" stroke="var(--cyan)" strokeWidth="0.9" />

          {tissues.map((ts, i) => {
            const angle = ts.seed * spread;
            const inStep = spread < 0.9;
            const tone = inStep ? "var(--teal)" : "var(--magenta)";
            return (
              <g key={i}>
                <line
                  x1="23"
                  y1="42"
                  x2={ts.x - 5}
                  y2={ts.y}
                  stroke="var(--cyan)"
                  strokeWidth={0.2 + coupling * 0.6}
                  opacity={0.25 + coupling * 0.5}
                />
                <circle
                  cx={ts.x}
                  cy={ts.y}
                  r="5"
                  fill="var(--void)"
                  stroke="var(--border-strong)"
                  strokeWidth="0.5"
                />
                <line
                  x1={ts.x}
                  y1={ts.y}
                  x2={ts.x + Math.sin(angle) * 3.6}
                  y2={ts.y - Math.cos(angle) * 3.6}
                  stroke={tone}
                  strokeWidth="0.8"
                  style={{ filter: `drop-shadow(0 0 2px ${tone})` }}
                />
              </g>
            );
          })}
          <text
            x="50"
            y="72"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("coupling")}
            value={`${(coupling * 100).toFixed(0)}%`}
            accent={coupling > 0.6 ? "teal" : "magenta"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("coupling")}
            value={coupling}
            min={0}
            max={1}
            step={0.02}
            display={`${(coupling * 100).toFixed(0)}%`}
            onChange={setCoupling}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
