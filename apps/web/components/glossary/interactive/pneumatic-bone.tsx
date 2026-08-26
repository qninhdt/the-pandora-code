"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Solid → pneumatic: mass drops faster than stiffness. Flyers buy span with air.
export default function PneumaticBone() {
  const t = useTranslations("viz.pneumatic-bone");
  const [p, setP] = useState(0.55); // 0 solid .. 1 fully pneumatic
  const mass = 1 - 0.65 * p;
  const stiff = 1 - 0.25 * p;
  const ratio = stiff / mass;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setP(0.55)}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("ratio")} {ratio.toFixed(2)}
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
          {/* bone cross-section */}
          <circle
            cx="50"
            cy="42"
            r="22"
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="1"
          />
          <circle
            cx="50"
            cy="42"
            r={6 + p * 12}
            fill="var(--void)"
            stroke="var(--teal)"
            strokeWidth="0.6"
          />
          {/* struts when pneumatic */}
          {p > 0.3 &&
            [0, 60, 120].map((ang) => {
              const r = (Math.PI * ang) / 180;
              return (
                <line
                  key={ang}
                  x1={50 + Math.cos(r) * 8}
                  y1={42 + Math.sin(r) * 8}
                  x2={50 + Math.cos(r) * 18}
                  y2={42 + Math.sin(r) * 18}
                  stroke="var(--teal)"
                  strokeWidth="0.7"
                  opacity={p}
                />
              );
            })}
          <text
            x="22"
            y="78"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("solid")}
          </text>
          <text
            x="68"
            y="78"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("pneumatic")}
          </text>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("mass")} value={mass.toFixed(2)} accent="amber" />
          <Readout label={t("stiffness")} value={stiff.toFixed(2)} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("pneumatic")}
            value={p}
            min={0}
            max={1}
            step={0.02}
            display={`${Math.round(p * 100)}%`}
            onChange={setP}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
