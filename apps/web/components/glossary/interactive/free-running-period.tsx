"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Tau: the clock's own period, running free. Set it away from 24 h and the daily
// activity onset walks steadily off the vertical — the signature drift.
export default function FreeRunningPeriod() {
  const t = useTranslations("viz.free-running-period");
  const [tau, setTau] = useState(24.2);

  const days = 12;
  const drift = tau - 24;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setTau(24.2)}
      allowFullscreen={false}
      caption={
        <span className="text-teal">
          {t("driftLabel")}: {drift >= 0 ? "+" : ""}
          {(drift * 60).toFixed(0)} {t("minPerDay")}
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
            x1="50"
            y1="8"
            x2="50"
            y2="70"
            stroke="var(--border)"
            strokeWidth="0.3"
            strokeDasharray="2 2"
          />
          {Array.from({ length: days }, (_, d) => {
            const y = 10 + d * 5;
            const x = 50 + drift * d * 3.4;
            const clamped = Math.max(8, Math.min(88, x));
            return (
              <rect
                key={d}
                x={clamped}
                y={y}
                width="6"
                height="3.2"
                rx="0.8"
                fill="var(--teal)"
                opacity={0.85}
                style={{ filter: d === days - 1 ? "drop-shadow(0 0 3px var(--teal))" : undefined }}
              />
            );
          })}
          <text
            x="50"
            y="76"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("tau")} value={tau.toFixed(1)} unit="h" accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("tau")}
            value={tau}
            min={22}
            max={26}
            step={0.1}
            display={`${tau.toFixed(1)} h`}
            onChange={setTau}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
