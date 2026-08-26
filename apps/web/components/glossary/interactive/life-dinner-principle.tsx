"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Asymmetric stakes: prey fails → death; predator fails → missed meal.
// Selection pressure ∝ stake × encounter rate. Prey usually under stronger filter.
export default function LifeDinnerPrinciple() {
  const t = useTranslations("viz.life-dinner-principle");
  const [preyStake, setPreyStake] = useState(1.0); // 0–1, life = 1
  const [predStake, setPredStake] = useState(0.25); // dinner ≪ life

  // relative selection intensity (Dawkins–Krebs intuition)
  const preyPressure = preyStake * 1.0;
  const predPressure = predStake * 1.0;
  const asymmetry = preyPressure / Math.max(0.05, predPressure);

  // race bars: higher pressure → longer evolved edge
  const preyEdge = Math.min(1, preyPressure / Math.max(preyPressure, predPressure));
  const predEdge = Math.min(1, predPressure / Math.max(preyPressure, predPressure));

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setPreyStake(1.0);
        setPredStake(0.25);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("pressure")} ratio <span className="text-amber">{asymmetry.toFixed(1)}×</span>{" "}
          prey-biased
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
          {/* track */}
          <line
            x1="14"
            y1="40"
            x2="86"
            y2="40"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            strokeDasharray="1.5 1.5"
          />

          {/* prey runner */}
          <g transform={`translate(${18 + preyEdge * 52} 36)`}>
            <ellipse cx="0" cy="0" rx="5" ry="3.2" fill="var(--teal)" opacity="0.85" />
            <text
              x="0"
              y="10"
              textAnchor="middle"
              style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--teal)" }}
            >
              prey
            </text>
          </g>

          {/* predator runner */}
          <g transform={`translate(${18 + predEdge * 52} 48)`}>
            <ellipse cx="0" cy="0" rx="5.5" ry="3.4" fill="var(--magenta)" opacity="0.85" />
            <text
              x="0"
              y="10"
              textAnchor="middle"
              style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--magenta)" }}
            >
              pred
            </text>
          </g>

          {/* selection pressure bars */}
          <text
            x="14"
            y="68"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("pressure")}
          </text>
          <rect
            x="14"
            y="72"
            width="72"
            height="4"
            rx="1"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
          />
          <rect
            x="14"
            y="72"
            width={72 * preyEdge}
            height="4"
            rx="1"
            fill="var(--teal)"
            opacity="0.75"
          />
          <rect
            x="14"
            y="78"
            width="72"
            height="4"
            rx="1"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
          />
          <rect
            x="14"
            y="78"
            width={72 * predEdge}
            height="4"
            rx="1"
            fill="var(--magenta)"
            opacity="0.75"
          />
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("preyStake")} value={preyStake.toFixed(2)} accent="teal" />
          <Readout label={t("predStake")} value={predStake.toFixed(2)} accent="magenta" />
        </div>

        <div className="absolute inset-x-3 bottom-10 space-y-1.5">
          <ControlSlider
            label={t("preyStake")}
            value={preyStake}
            min={0.2}
            max={1}
            step={0.02}
            display={preyStake.toFixed(2)}
            onChange={setPreyStake}
            thumb="teal"
          />
          <ControlSlider
            label={t("predStake")}
            value={predStake}
            min={0.05}
            max={1}
            step={0.02}
            display={predStake.toFixed(2)}
            onChange={setPredStake}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
