"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A hundred million years on the night shift, and the sensory bill it left. Drag
// the time spent nocturnal: colour pigments are shed, whiskers and smell expand.
export default function NocturnalBottleneck() {
  const t = useTranslations("viz.nocturnal-bottleneck");
  const [myr, setMyr] = useState(100);

  const f = myr / 160;
  const opsins = Math.max(2, Math.round(4 - f * 2.2));
  const tactile = Math.min(1, 0.3 + f * 0.8);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMyr(100)}
      allowFullscreen={false}
      caption={
        <span className="text-teal">
          {t("opsins")}: {opsins} / 4
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
          <rect x="8" y="12" width="84" height="42" fill="var(--void)" opacity={0.3 + f * 0.4} />

          {/* four ancestral colour pigments, dimming as they are lost */}
          {[0, 1, 2, 3].map((i) => {
            const kept = i < opsins;
            const hue = ["#7b5cff", "#3fa9ff", "#3ddc97", "#ff6b6b"][i];
            return (
              <circle
                key={i}
                cx={24 + i * 9}
                cy="24"
                r="3.4"
                fill={kept ? hue : "var(--surface)"}
                stroke={kept ? hue : "var(--border)"}
                strokeWidth="0.4"
                opacity={kept ? 0.9 : 0.25}
                style={{ filter: kept ? `drop-shadow(0 0 3px ${hue})` : undefined }}
              />
            );
          })}

          {/* whiskers and olfaction expanding to compensate */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="62"
              y1="40"
              x2={62 + 6 + tactile * 16}
              y2={32 + i * 4}
              stroke="var(--teal)"
              strokeWidth={0.3 + tactile * 0.5}
              opacity={0.3 + tactile * 0.6}
            />
          ))}
          <circle cx="60" cy="40" r="4" fill="var(--void)" stroke="var(--teal)" strokeWidth="0.6" />

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
          <Readout label={t("tactile")} value={`${(tactile * 100).toFixed(0)}%`} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("duration")}
            value={myr}
            min={0}
            max={160}
            step={5}
            display={`${myr} ${t("myr")}`}
            onChange={setMyr}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
