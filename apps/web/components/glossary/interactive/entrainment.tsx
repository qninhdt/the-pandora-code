"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Entrainment as a daily correction. The clock drifts by (tau - 24) each day and
// light hauls it back; when the two cancel, internal and external time agree.
export default function Entrainment() {
  const t = useTranslations("viz.entrainment");
  const [correction, setCorrection] = useState(0.2);

  const drift = 0.2; // hours the clock loses each day at tau = 24.2
  const net = drift - correction;
  const aligned = Math.abs(net) < 0.03;

  const days = 10;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCorrection(0.2)}
      allowFullscreen={false}
      caption={
        <span className={aligned ? "text-teal" : "text-magenta"}>
          {aligned ? t("aligned") : t("drifting")}
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
            y2="66"
            stroke="var(--border)"
            strokeWidth="0.3"
            strokeDasharray="2 2"
          />
          {Array.from({ length: days }, (_, d) => {
            const y = 10 + d * 5.6;
            const x = Math.max(8, Math.min(86, 50 + net * d * 14));
            return (
              <g key={d}>
                <rect
                  x={x}
                  y={y}
                  width="6"
                  height="3.4"
                  rx="0.8"
                  fill={aligned ? "var(--teal)" : "var(--magenta)"}
                  opacity={0.85}
                  style={{
                    filter:
                      d === days - 1
                        ? `drop-shadow(0 0 3px ${aligned ? "var(--teal)" : "var(--magenta)"})`
                        : undefined,
                  }}
                />
                {/* the daily correction, drawn as a nudge back toward the line */}
                {correction > 0.02 ? (
                  <line
                    x1={x + 6}
                    y1={y + 1.7}
                    x2={x + 6 + correction * 9}
                    y2={y + 1.7}
                    stroke="var(--amber)"
                    strokeWidth="0.5"
                    opacity={0.7}
                  />
                ) : null}
              </g>
            );
          })}
          <text
            x="50"
            y="74"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("net")}
            value={`${net >= 0 ? "+" : ""}${(net * 60).toFixed(0)}`}
            unit={t("minPerDay")}
            accent={aligned ? "teal" : "magenta"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("correction")}
            value={correction}
            min={0}
            max={0.5}
            step={0.01}
            display={`${(correction * 60).toFixed(0)} ${t("minPerDay")}`}
            onChange={setCorrection}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
