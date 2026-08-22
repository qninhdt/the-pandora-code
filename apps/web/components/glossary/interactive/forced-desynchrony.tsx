"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Hand a body a day outside its entrainable range and its systems come apart:
// the master clock free-runs on tau while sleep tracks the imposed cycle.
const TAU = 24.2;

export default function ForcedDesynchrony() {
  const t = useTranslations("viz.forced-desynchrony");
  const [imposed, setImposed] = useState(28);

  const days = 10;
  const gap = imposed - TAU;
  const entrainable = Math.abs(gap) <= 1;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setImposed(28)}
      allowFullscreen={false}
      caption={
        <span className={entrainable ? "text-teal" : "text-magenta"}>
          {entrainable ? t("coupled") : t("decoupled")}
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
          {Array.from({ length: days }, (_, d) => {
            const y = 10 + d * 5.6;
            // sleep follows the imposed schedule; the clock keeps its own period
            const sleepX = 20;
            const clockX = 20 + (entrainable ? 0 : gap * d * 2.1);
            const cx = Math.max(8, Math.min(86, clockX));
            return (
              <g key={d}>
                <rect
                  x={sleepX}
                  y={y}
                  width="10"
                  height="3.2"
                  rx="0.8"
                  fill="var(--cyan)"
                  opacity={0.6}
                />
                <circle
                  cx={cx + 5}
                  cy={y + 1.6}
                  r="1.6"
                  fill={entrainable ? "var(--teal)" : "var(--magenta)"}
                  style={{
                    filter: `drop-shadow(0 0 3px ${entrainable ? "var(--teal)" : "var(--magenta)"})`,
                  }}
                />
              </g>
            );
          })}
          <line x1="8" y1="70" x2="92" y2="70" stroke="var(--border)" strokeWidth="0.4" />
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
          <Readout
            label={t("gap")}
            value={`${gap >= 0 ? "+" : ""}${gap.toFixed(1)}`}
            unit="h"
            accent={entrainable ? "teal" : "magenta"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("imposed")}
            value={imposed}
            min={20}
            max={28}
            step={0.05}
            display={`${imposed.toFixed(2)} h`}
            onChange={setImposed}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
