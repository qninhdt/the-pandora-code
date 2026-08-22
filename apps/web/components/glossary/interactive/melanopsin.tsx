"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A light meter, not an eye. Melanopsin peaks in the blue near 480 nm, so the
// colour of a source decides how loudly it speaks to the clock.
const PEAK_NM = 480;

export default function Melanopsin() {
  const t = useTranslations("viz.melanopsin");
  const [nm, setNm] = useState(PEAK_NM);

  // Gaussian sensitivity around the melanopsin peak.
  const response = Math.exp(-((nm - PEAK_NM) ** 2) / (2 * 55 ** 2));
  const xFor = (w: number) => 8 + ((w - 400) / 300) * 84;

  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const w = 400 + (i / 200) * 300;
    const r = Math.exp(-((w - PEAK_NM) ** 2) / (2 * 55 ** 2));
    pts.push(`${xFor(w).toFixed(2)},${(56 - r * 34).toFixed(2)}`);
  }

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setNm(PEAK_NM)}
      allowFullscreen={false}
      caption={
        <span className={response > 0.6 ? "text-cyan" : "text-muted"}>
          {response > 0.6 ? t("loud") : t("quiet")}
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
          <defs>
            <linearGradient id="melanopsin-spectrum" x1="0" x2="1">
              <stop offset="0%" stopColor="#7b5cff" />
              <stop offset="27%" stopColor="#3fa9ff" />
              <stop offset="45%" stopColor="#3ddc97" />
              <stop offset="70%" stopColor="#ffd166" />
              <stop offset="100%" stopColor="#ff6b6b" />
            </linearGradient>
          </defs>
          <rect
            x="8"
            y="58"
            width="84"
            height="4"
            fill="url(#melanopsin-spectrum)"
            opacity={0.75}
            rx="0.6"
          />
          <polyline
            points={pts.join(" ")}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.2"
            style={{ filter: "drop-shadow(0 0 3px var(--cyan))" }}
          />
          <line
            x1={xFor(nm)}
            y1="14"
            x2={xFor(nm)}
            y2="62"
            stroke="var(--foreground)"
            strokeWidth="0.5"
            strokeDasharray="2 1.5"
            opacity={0.7}
          />
          <circle
            cx={xFor(nm)}
            cy={56 - response * 34}
            r="2"
            fill="var(--cyan)"
            style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }}
          />
          <text
            x="50"
            y="72"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("response")} value={`${(response * 100).toFixed(0)}%`} accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("wavelength")}
            value={nm}
            min={400}
            max={700}
            step={5}
            display={`${nm} nm`}
            onChange={setNm}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
