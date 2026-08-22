"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// De Mairan's cupboard. Slide the day into darkness: the light bars stop, the
// rhythm does not. A rhythm that persists without a cue is being generated.
export default function CircadianRhythm() {
  const t = useTranslations("viz.circadian-rhythm");
  const [darkFrom, setDarkFrom] = useState(0.5);

  const cycles = 4;
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const f = i / 240;
    const y = 44 - Math.sin(f * cycles * Math.PI * 2) * 13;
    pts.push(`${8 + f * 84},${y.toFixed(2)}`);
  }

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setDarkFrom(0.5)}
      allowFullscreen={false}
      caption={
        <span className="text-teal">{darkFrom < 0.98 ? t("persists") : t("underLight")}</span>
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
          {/* Light cycle: day bars, which stop where darkness begins */}
          {Array.from({ length: cycles }, (_, c) => {
            const x = 8 + (c / cycles) * 84;
            const w = (0.5 / cycles) * 84;
            const lit = (c + 0.5) / cycles < darkFrom;
            return (
              <rect
                key={c}
                x={x}
                y={12}
                width={w}
                height={64}
                fill="var(--amber)"
                opacity={lit ? 0.16 : 0}
              />
            );
          })}
          <rect
            x={8 + darkFrom * 84}
            y={12}
            width={Math.max(0, 84 - darkFrom * 84)}
            height={64}
            fill="var(--void)"
            opacity={0.6}
          />
          <line
            x1={8 + darkFrom * 84}
            y1={10}
            x2={8 + darkFrom * 84}
            y2={76}
            stroke="var(--magenta)"
            strokeWidth="0.5"
            strokeDasharray="2 1.5"
          />

          {/* The rhythm, unbroken across the boundary */}
          <polyline
            points={pts.join(" ")}
            fill="none"
            stroke="var(--teal)"
            strokeWidth="1.1"
            style={{ filter: "drop-shadow(0 0 3px var(--teal))" }}
          />
          <line x1="8" y1="44" x2="92" y2="44" stroke="var(--border)" strokeWidth="0.3" />
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
          <Readout
            label={t("cue")}
            value={darkFrom < 0.98 ? t("removed") : t("present")}
            accent="magenta"
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("darkness")}
            value={darkFrom}
            min={0.1}
            max={1}
            step={0.02}
            display={`${((1 - darkFrom) * 100).toFixed(0)}%`}
            onChange={setDarkFrom}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
