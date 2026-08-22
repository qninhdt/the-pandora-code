"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Time as an axis of the niche. Slide two competitors' activity windows apart and
// the overlap — the only place they actually compete — collapses toward zero.
export default function TemporalNichePartitioning() {
  const t = useTranslations("viz.temporal-niche-partitioning");
  const [offset, setOffset] = useState(0.5);

  const width = 0.42; // each species' share of the cycle
  const aStart = 0.04;
  const bStart = 0.04 + offset * 0.52;
  const overlap = Math.max(0, aStart + width - bStart);
  const contested = overlap / width;

  const xFor = (f: number) => 8 + f * 84;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOffset(0.5)}
      allowFullscreen={false}
      caption={
        <span className={contested < 0.15 ? "text-teal" : "text-magenta"}>
          {contested < 0.15 ? t("coexist") : t("compete")}
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
          {/* day / night backdrop */}
          <rect x="8" y="14" width={42} height="40" fill="var(--amber)" opacity={0.1} />
          <rect x="50" y="14" width={42} height="40" fill="var(--void)" opacity={0.5} />

          {/* species A window */}
          <rect
            x={xFor(aStart)}
            y="20"
            width={width * 84}
            height="9"
            rx="1.5"
            fill="var(--amber)"
            opacity={0.75}
          />
          {/* species B window */}
          <rect
            x={xFor(bStart)}
            y="34"
            width={width * 84}
            height="9"
            rx="1.5"
            fill="var(--teal)"
            opacity={0.75}
          />

          {/* the contested overlap */}
          {overlap > 0.001 ? (
            <rect
              x={xFor(bStart)}
              y="20"
              width={overlap * 84}
              height="23"
              fill="var(--magenta)"
              opacity={0.3}
              style={{ filter: "drop-shadow(0 0 4px var(--magenta))" }}
            />
          ) : null}

          <line x1="8" y1="54" x2="92" y2="54" stroke="var(--border)" strokeWidth="0.4" />
          <text
            x="50"
            y="68"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("overlap")}
            value={`${(contested * 100).toFixed(0)}%`}
            accent={contested < 0.15 ? "teal" : "magenta"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("separation")}
            value={offset}
            min={0}
            max={1}
            step={0.02}
            display={`${(offset * 100).toFixed(0)}%`}
            onChange={setOffset}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
