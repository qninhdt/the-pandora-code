"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Two mechanisms, one record. Under a light cycle they are identical; released
// into darkness the clock keeps drifting while masked behaviour scatters.
type Mode = "clock" | "masking";

export default function Masking() {
  const t = useTranslations("viz.masking");
  const [mode, setMode] = useState<Mode>("masking");

  const days = 10;
  const cycleDays = 4;
  const tone = mode === "clock" ? "var(--teal)" : "var(--magenta)";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("masking")}
      allowFullscreen={false}
      caption={
        <span style={{ color: tone }}>
          {mode === "clock" ? t("verdictClock") : t("verdictMasking")}
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
          {/* dark half of the light cycle, then constant darkness below the line */}
          {Array.from({ length: cycleDays }, (_, d) => (
            <rect
              key={d}
              x="50"
              y={10 + d * 5.4}
              width="42"
              height="4"
              fill="var(--cyan)"
              opacity={0.1}
            />
          ))}
          <rect
            x="8"
            y={10 + cycleDays * 5.4}
            width="84"
            height={(days - cycleDays) * 5.4}
            fill="var(--void)"
            opacity={0.55}
          />
          <line
            x1="6"
            y1={9 + cycleDays * 5.4}
            x2="94"
            y2={9 + cycleDays * 5.4}
            stroke="var(--amber)"
            strokeWidth="0.5"
            strokeDasharray="2 1.5"
          />

          {Array.from({ length: days }, (_, d) => {
            const y = 10 + d * 5.4;
            if (d < cycleDays) {
              return (
                <rect
                  key={d}
                  x="52"
                  y={y}
                  width="14"
                  height="3.2"
                  rx="0.8"
                  fill={tone}
                  opacity={0.85}
                />
              );
            }
            if (mode === "clock") {
              const x = 52 + (d - cycleDays + 1) * 4.4;
              return (
                <rect
                  key={d}
                  x={Math.min(x, 76)}
                  y={y}
                  width="14"
                  height="3.2"
                  rx="0.8"
                  fill={tone}
                  opacity={0.85}
                  style={{ filter: `drop-shadow(0 0 3px ${tone})` }}
                />
              );
            }
            // masked: scattered, deterministic so SSR matches
            return (
              <g key={d}>
                {[0, 1, 2, 3].map((i) => {
                  const seed = (d * 7 + i * 13) % 23;
                  return (
                    <rect
                      key={i}
                      x={10 + (seed / 23) * 76}
                      y={y}
                      width="3.4"
                      height="3.2"
                      rx="0.6"
                      fill={tone}
                      opacity={0.7}
                    />
                  );
                })}
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
            label={t("afterRelease")}
            value={mode === "clock" ? t("persists") : t("scatters")}
            accent={mode === "clock" ? "teal" : "magenta"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlTabs
            options={[
              { value: "masking", label: t("modes.masking") },
              { value: "clock", label: t("modes.clock") },
            ]}
            value={mode}
            onChange={setMode}
            ariaLabel={t("title")}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
