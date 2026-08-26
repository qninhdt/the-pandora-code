"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Two unpaired spins; weak field tips singlet/triplet product ratio.
export default function RadicalPair() {
  const t = useTranslations("viz.radical-pair");
  const [field, setField] = useState(0.4);
  const singlet = 50 + field * 35;
  const triplet = 100 - singlet;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setField(0.4)}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("ratio")}: {(singlet / triplet).toFixed(2)}
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
          <circle
            cx="38"
            cy="42"
            r="10"
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="0.8"
          />
          <circle
            cx="62"
            cy="42"
            r="10"
            fill="var(--surface)"
            stroke="var(--magenta)"
            strokeWidth="0.8"
          />
          <line
            x1="38"
            y1="42"
            x2="38"
            y2={42 - 8 + field * 4}
            stroke="var(--cyan)"
            strokeWidth="1.4"
          />
          <line
            x1="62"
            y1="42"
            x2="62"
            y2={42 + 8 - field * 4}
            stroke="var(--magenta)"
            strokeWidth="1.4"
          />
          <rect x="16" y="72" width={singlet * 0.35} height="5" fill="var(--cyan)" />
          <rect x="16" y="82" width={triplet * 0.35} height="5" fill="var(--magenta)" />
          <text
            x="54"
            y="76"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("singlet")}
          </text>
          <text
            x="54"
            y="86"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("triplet")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("field")} value={field.toFixed(2)} accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("field")}
            value={field}
            min={0}
            max={1}
            step={0.02}
            display={field.toFixed(2)}
            onChange={setField}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
