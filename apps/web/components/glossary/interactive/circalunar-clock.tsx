"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A monthly oscillator entrained by sub-lux moonlight. Walk the lunar phase and
// the spawning window locks to one night; the worms rise together.
export default function CircalunarClock() {
  const t = useTranslations("viz.circalunar-clock");
  const [phase, setPhase] = useState(0.5);

  // Moonlight peaks at full moon; spawning is gated to a narrow window near it.
  const illumination = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  const lux = illumination * 0.3;
  const gate = Math.max(0, 1 - Math.abs(phase - 0.5) * 7);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPhase(0.5)}
      allowFullscreen={false}
      caption={
        <span className={gate > 0.4 ? "text-teal" : "text-muted"}>
          {gate > 0.4 ? t("spawning") : t("waiting")}
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
          <rect x="0" y="0" width="100" height="78" fill="var(--void)" opacity={0.4} />

          {/* the moon, waxing and waning */}
          <circle cx="76" cy="18" r="7" fill="var(--surface)" opacity={0.3} />
          <circle
            cx="76"
            cy="18"
            r="7"
            fill="var(--cyan)"
            opacity={0.15 + illumination * 0.7}
            style={{ filter: `drop-shadow(0 0 ${2 + illumination * 8}px var(--cyan))` }}
          />

          {/* worms rising when the gate opens */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = 14 + i * 11;
            const rise = gate * 26;
            return (
              <path
                key={i}
                d={`M${x},${62 - rise} q3,-6 0,-11`}
                fill="none"
                stroke="var(--teal)"
                strokeWidth={0.8}
                opacity={0.25 + gate * 0.7}
                style={{ filter: gate > 0.4 ? "drop-shadow(0 0 3px var(--teal))" : undefined }}
              />
            );
          })}
          <line x1="8" y1="64" x2="92" y2="64" stroke="var(--border)" strokeWidth="0.4" />
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
          <Readout label={t("moonlight")} value={lux.toFixed(2)} unit="lux" accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("lunarPhase")}
            value={phase}
            min={0}
            max={1}
            step={0.01}
            display={`${(phase * 29.5).toFixed(1)} ${t("days")}`}
            onChange={setPhase}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
