"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Fe₃O₄ chain torques the cell to the field.
export default function Magnetite() {
  const t = useTranslations("viz.magnetite");
  const [angle, setAngle] = useState(40);
  const rad = (angle * Math.PI) / 180;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setAngle(40)}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("align")}: {angle}°
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
          <ellipse
            cx="50"
            cy="48"
            rx="22"
            ry="14"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.7"
            transform={`rotate(${angle} 50 48)`}
          />
          {[-12, -6, 0, 6, 12].map((d) => (
            <rect
              key={d}
              x={48 + Math.cos(rad) * d - 2}
              y={46 + Math.sin(rad) * d - 2}
              width="4"
              height="4"
              rx="0.5"
              fill="var(--amber)"
              transform={`rotate(${angle} ${50 + Math.cos(rad) * d} ${48 + Math.sin(rad) * d})`}
            />
          ))}
          <line
            x1="50"
            y1="48"
            x2={50 + Math.cos(rad) * 30}
            y2={48 + Math.sin(rad) * 30}
            stroke="var(--cyan)"
            strokeWidth="0.7"
            strokeDasharray="2 2"
          />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("crystal")} value={`${angle}°`} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("field")}
            value={angle}
            min={0}
            max={180}
            step={2}
            display={`${angle}°`}
            onChange={setAngle}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
