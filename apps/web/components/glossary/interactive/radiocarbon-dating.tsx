"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const HALF_LIFE = 5730; // years
// Beyond ~9 half-lives (<0.2% left) the signal drowns in noise — the wall of the
// method. Past it, an organic sample simply reads "older than radiocarbon can see".
const DETECTION_FLOOR = 0.002;
const PLOT = { x0: 12, y0: 78, w: 80, h: 60 };

export default function RadiocarbonDating() {
  const t = useTranslations("viz.radiocarbon-dating");
  // measured fraction of original C-14 remaining
  const [fraction, setFraction] = useState(0.5);

  const measurable = fraction > DETECTION_FLOOR;
  const ageYears = measurable ? -HALF_LIFE * Math.log2(fraction) : Number.POSITIVE_INFINITY;
  // Counting-statistics uncertainty grows as the sample nears the floor.
  const uncertainty = measurable
    ? Math.round((HALF_LIFE * 0.04) / Math.max(fraction, DETECTION_FLOOR))
    : 0;

  const sx = (x: number) => PLOT.x0 + x * PLOT.w; // x: 0..1 in "fraction of ceiling"
  const sy = (f: number) => PLOT.y0 - f * PLOT.h; // f: 0..1 remaining fraction

  // decay curve sampled across the readable window (0..10 half-lives)
  const curve = Array.from({ length: 81 }, (_, k) => {
    const hl = (k / 80) * 10;
    const f = 0.5 ** hl;
    return `${k === 0 ? "M" : "L"}${sx(hl / 10).toFixed(1)} ${sy(f).toFixed(1)}`;
  }).join(" ");

  // current sample position on the curve
  const curHL = measurable ? Math.log2(1 / fraction) : 10;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setFraction(0.5)}
      caption={
        measurable ? (
          <span>
            {t("age")}: <span className="text-teal">{Math.round(ageYears).toLocaleString()}</span> ±{" "}
            {uncertainty.toLocaleString()} {t("yr")}
          </span>
        ) : (
          <span className="text-magenta">{t("beyond")}</span>
        )
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
          <defs>
            <linearGradient id="rc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* detection wall */}
          <rect
            x={sx(0.9)}
            y={PLOT.y0 - PLOT.h}
            width={PLOT.w * 0.1}
            height={PLOT.h}
            fill="var(--magenta)"
            opacity="0.08"
          />
          <line
            x1={sx(0.9)}
            y1={PLOT.y0 - PLOT.h}
            x2={sx(0.9)}
            y2={PLOT.y0}
            stroke="var(--magenta)"
            strokeWidth="0.4"
            strokeDasharray="1 1"
            opacity="0.6"
          />
          <text
            x={sx(0.9) + 1}
            y={PLOT.y0 - PLOT.h + 4}
            className="fill-magenta"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            ~50 kyr
          </text>

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

          {/* decay curve + fill */}
          <path d={`${curve} L${sx(1)} ${PLOT.y0} L${PLOT.x0} ${PLOT.y0} Z`} fill="url(#rc-fill)" />
          <path d={curve} fill="none" stroke="var(--teal)" strokeWidth="1" />

          {/* sample marker */}
          <line
            x1={sx(curHL / 10)}
            y1={PLOT.y0 - PLOT.h}
            x2={sx(curHL / 10)}
            y2={PLOT.y0}
            stroke="var(--amber)"
            strokeWidth="0.4"
            opacity="0.7"
          />
          <circle
            cx={sx(curHL / 10)}
            cy={sy(Math.min(fraction, 1))}
            r="2"
            fill={measurable ? "var(--amber)" : "var(--magenta)"}
          />

          <text
            x={PLOT.x0 + PLOT.w / 2}
            y="93"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3.2, fontFamily: "monospace" }}
          >
            {t("timeAxis")}
          </text>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("remaining")} value={`${(fraction * 100).toFixed(1)}%`} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("measured")}
            value={fraction}
            min={0.001}
            max={1}
            step={0.001}
            onChange={setFraction}
            display={`${(fraction * 100).toFixed(1)}%`}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
