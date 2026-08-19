"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Several minerals crystallize from one melt sharing an initial daughter ratio
// (the y-intercept) but different parent contents (spread along x). As decay
// proceeds every point slides up-left along a fixed slope: parent→daughter. The
// line stays straight and pivots about the intercept; its slope = e^(λt) − 1.
const SAMPLES = [
  { x0: 0.2, name: "a" },
  { x0: 0.55, name: "b" },
  { x0: 0.95, name: "c" },
  { x0: 1.4, name: "d" },
  { x0: 1.85, name: "e" },
] as const;

const INITIAL_RATIO = 0.6; // shared starting daughter/stable ratio (intercept)
const PLOT = { x0: 12, y0: 82, w: 78, h: 66 }; // svg plot box

export default function Isochron() {
  const t = useTranslations("viz.isochron");
  // t in "half-lives" of the parent; slope = 2^t − 1.
  const [age, setAge] = useState(0);

  const slope = 2 ** age - 1;

  // map data coords (parent 0..2.4, daughter 0..3.2) into svg
  const sx = (x: number) => PLOT.x0 + (x / 2.4) * PLOT.w;
  const sy = (y: number) => PLOT.y0 - (y / 3.2) * PLOT.h;

  const pts = SAMPLES.map((s) => {
    const x = s.x0; // parent/stable ratio stays put on this axis convention
    const y = INITIAL_RATIO + slope * x;
    return { ...s, x, y };
  });

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setAge(0)}
      caption={
        <span>
          {t("slope")}: <span className="text-cyan">{slope.toFixed(2)}</span> · {t("intercept")}:{" "}
          {INITIAL_RATIO.toFixed(2)}
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
          {/* axes */}
          <line
            x1={PLOT.x0}
            y1={PLOT.y0}
            x2={PLOT.x0 + PLOT.w}
            y2={PLOT.y0}
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          <line
            x1={PLOT.x0}
            y1={PLOT.y0}
            x2={PLOT.x0}
            y2={PLOT.y0 - PLOT.h}
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />

          {/* the isochron line through the samples */}
          <line
            x1={sx(0)}
            y1={sy(INITIAL_RATIO)}
            x2={sx(2.4)}
            y2={sy(INITIAL_RATIO + slope * 2.4)}
            stroke="var(--cyan)"
            strokeWidth="0.9"
            opacity="0.85"
          />
          {/* intercept marker: the recovered initial daughter ratio */}
          <circle cx={sx(0)} cy={sy(INITIAL_RATIO)} r="1.3" fill="var(--magenta)" />
          <line
            x1={PLOT.x0}
            y1={sy(INITIAL_RATIO)}
            x2={PLOT.x0 - 3}
            y2={sy(INITIAL_RATIO)}
            stroke="var(--magenta)"
            strokeWidth="0.5"
          />

          {/* sample minerals */}
          {pts.map((p) => (
            <g key={p.name}>
              {/* trail from origin position to now, hinting the fan */}
              <line
                x1={sx(p.x)}
                y1={sy(INITIAL_RATIO)}
                x2={sx(p.x)}
                y2={sy(p.y)}
                stroke="var(--amber)"
                strokeWidth="0.4"
                strokeDasharray="1 1.5"
                opacity="0.4"
              />
              <circle cx={sx(p.x)} cy={sy(p.y)} r="1.8" fill="var(--amber)" />
              <circle cx={sx(p.x)} cy={sy(p.y)} r="3" fill="var(--amber)" opacity="0.15" />
            </g>
          ))}

          {/* axis labels */}
          <text
            x={PLOT.x0 + PLOT.w / 2}
            y="96"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3.4, fontFamily: "monospace" }}
          >
            {t("xAxis")}
          </text>
          <text
            x="4"
            y={PLOT.y0 - PLOT.h / 2}
            textAnchor="middle"
            transform={`rotate(-90 4 ${PLOT.y0 - PLOT.h / 2})`}
            className="fill-muted"
            style={{ fontSize: 3.4, fontFamily: "monospace" }}
          >
            {t("yAxis")}
          </text>
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("age")} value={age.toFixed(2)} unit={t("halfLives")} accent="cyan" />
          <Readout label={t("initial")} value={INITIAL_RATIO.toFixed(2)} accent="magenta" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("time")}
            value={age}
            min={0}
            max={2}
            step={0.01}
            onChange={setAge}
            display={`${age.toFixed(2)} ${t("halfLives")}`}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
