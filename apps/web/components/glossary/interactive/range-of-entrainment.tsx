"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The narrow band a clock can be held to. Inside it the correction fits and the
// clock locks on; outside, the demand exceeds what light can give and it lets go.
const TAU = 24.2;
const MAX_SHIFT = 1;

export default function RangeOfEntrainment() {
  const t = useTranslations("viz.range-of-entrainment");
  const [day, setDay] = useState(26);

  const required = Math.abs(day - TAU);
  const locked = required <= MAX_SHIFT;
  const tone = locked ? "var(--teal)" : "var(--magenta)";

  const xFor = (h: number) => 8 + ((h - 20) / 10) * 84;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setDay(26)}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{locked ? t("locked") : t("free")}</span>}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 78"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* the entrainable band around tau */}
          <rect
            x={xFor(TAU - MAX_SHIFT)}
            y="22"
            width={xFor(TAU + MAX_SHIFT) - xFor(TAU - MAX_SHIFT)}
            height="26"
            fill="var(--teal)"
            opacity={0.18}
            rx="1"
          />
          <line
            x1={xFor(TAU)}
            y1="20"
            x2={xFor(TAU)}
            y2="50"
            stroke="var(--teal)"
            strokeWidth="0.5"
            strokeDasharray="2 1.5"
          />
          <line x1="8" y1="48" x2="92" y2="48" stroke="var(--border)" strokeWidth="0.4" />

          {/* reference worlds */}
          {[
            { h: 24, c: "var(--cyan)" },
            { h: 24.65, c: "var(--amber)" },
            { h: 26, c: "var(--magenta)" },
          ].map((m) => (
            <circle key={m.h} cx={xFor(m.h)} cy="48" r="1.4" fill={m.c} opacity={0.9} />
          ))}

          {/* the chosen day */}
          <line
            x1={xFor(day)}
            y1="16"
            x2={xFor(day)}
            y2="52"
            stroke={tone}
            strokeWidth="1"
            style={{ filter: `drop-shadow(0 0 4px ${tone})` }}
          />
          <circle cx={xFor(day)} cy="16" r="2" fill={tone} />
          <text
            x="50"
            y="70"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("required")}
            value={required.toFixed(1)}
            unit="h"
            accent={locked ? "teal" : "magenta"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("dayLength")}
            value={day}
            min={20}
            max={30}
            step={0.05}
            display={`${day.toFixed(2)} h`}
            onChange={setDay}
            thumb={locked ? "teal" : "magenta"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
