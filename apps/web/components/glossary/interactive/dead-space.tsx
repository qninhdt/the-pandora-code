"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Dead space is fixed conduit; deepen tidal volume and its fraction falls.
export default function DeadSpace() {
  const t = useTranslations("viz.dead-space");
  const [tidal, setTidal] = useState(0.5);
  const dead = 0.15;
  const frac = dead / Math.max(tidal, 0.05);
  const exchange = Math.max(0, tidal - dead);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setTidal(0.5)}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("fraction")}: {(frac * 100).toFixed(0)}%
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
          <rect
            x="30"
            y="20"
            width="40"
            height="60"
            rx="4"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
          />
          <rect
            x="30"
            y={80 - tidal * 55}
            width="40"
            height={tidal * 55}
            fill="var(--cyan)"
            opacity="0.45"
          />
          <rect
            x="30"
            y={80 - dead * 55}
            width="40"
            height={dead * 55}
            fill="var(--magenta)"
            opacity="0.55"
          />
          <text
            x="74"
            y="40"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            {t("tidal")}
          </text>
          <text
            x="74"
            y="70"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--magenta)" }}
          >
            {t("dead")}
          </text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("exchange")} value={exchange.toFixed(2)} accent="teal" />
          <Readout label={t("fraction")} value={`${(frac * 100).toFixed(0)}%`} accent="magenta" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("tidal")}
            value={tidal}
            min={0.2}
            max={1}
            step={0.02}
            display={tidal.toFixed(2)}
            onChange={setTidal}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
