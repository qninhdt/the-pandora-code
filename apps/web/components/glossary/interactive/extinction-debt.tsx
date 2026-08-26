"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The habitat goes at year zero; the extinctions are paid later, by instalment.
// Scrub forward and watch the survivors drain away long after the machinery left.
export default function ExtinctionDebt() {
  const t = useTranslations("viz.extinction-debt");
  const [years, setYears] = useState(0);

  // Habitat lost instantly; species decay slowly toward the new equilibrium.
  const equilibrium = 0.35;
  const remaining = equilibrium + (1 - equilibrium) * Math.exp(-years / 90);
  const owed = remaining - equilibrium;
  const tone = owed > 0.3 ? "var(--amber)" : owed > 0.08 ? "var(--teal)" : "var(--magenta)";

  const px = (y: number) => 16 + (y / 400) * 68;
  const py = (f: number) => 54 - f * 32;

  const path = Array.from({ length: 61 }, (_, i) => {
    const y = (i / 60) * 400;
    const f = equilibrium + (1 - equilibrium) * Math.exp(-y / 90);
    return `${i === 0 ? "M" : "L"}${px(y).toFixed(1)},${py(f).toFixed(1)}`;
  }).join(" ");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setYears(0)}
      allowFullscreen={false}
      caption={
        <span style={{ color: tone }}>
          {owed > 0.08 ? t("verdictOwed", { n: Math.round(owed * 100) }) : t("verdictPaid")}
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
          <line
            x1="16"
            y1="54"
            x2="86"
            y2="54"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            opacity={0.6}
          />
          <line
            x1="16"
            y1="18"
            x2="16"
            y2="54"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            opacity={0.6}
          />

          {/* the new equilibrium the system is falling toward */}
          <line
            x1="16"
            y1={py(equilibrium)}
            x2="86"
            y2={py(equilibrium)}
            stroke="var(--magenta)"
            strokeWidth="0.4"
            strokeDasharray="2 1.5"
            opacity={0.7}
          />
          {/* the debt: the gap between the survivors and that floor */}
          <rect
            x={px(years) - 2}
            y={py(remaining)}
            width="4"
            height={Math.max(0, py(equilibrium) - py(remaining))}
            fill="var(--amber)"
            opacity={0.25}
          />

          <path d={path} fill="none" stroke="var(--teal)" strokeWidth="1.2" opacity={0.9} />
          <circle
            cx={px(years)}
            cy={py(remaining)}
            r="1.9"
            fill="var(--teal)"
            style={{ filter: "drop-shadow(0 0 3px var(--teal))" }}
          />
          <line x1="16" y1="18" x2="20" y2="18" stroke="var(--border)" strokeWidth="0.3" />
          <text
            x="50"
            y="66"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("surviving")} value={`${Math.round(remaining * 100)}%`} accent="teal" />
          <Readout label={t("owed")} value={`${Math.round(owed * 100)}%`} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("time")}
            value={years}
            min={0}
            max={400}
            step={5}
            onChange={setYears}
            display={t("yearsValue", { n: Math.round(years) })}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
