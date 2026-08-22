"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Darkness as a resource. Raise the lamp and the insect swarm is drawn in and
// held, night pollination falls away, and the dark refuge shrinks to nothing.
export default function ArtificialLightAtNight() {
  const t = useTranslations("viz.artificial-light-at-night");
  const [brightness, setBrightness] = useState(0.55);

  const trapped = Math.round(brightness * 26);
  const darkRefuge = Math.max(0, 1 - brightness);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setBrightness(0.55)}
      allowFullscreen={false}
      caption={
        <span className={darkRefuge > 0.5 ? "text-teal" : "text-amber"}>
          {darkRefuge > 0.5 ? t("refugeIntact") : t("refugeLost")}
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
          <rect x="0" y="0" width="100" height="78" fill="var(--void)" opacity={0.55} />

          {/* the lamp and its cone */}
          <path
            d={`M50,16 L${50 - 12 - brightness * 16},62 L${50 + 12 + brightness * 16},62 Z`}
            fill="var(--amber)"
            opacity={0.06 + brightness * 0.22}
          />
          <circle
            cx="50"
            cy="14"
            r={2 + brightness * 3}
            fill="var(--amber)"
            style={{ filter: `drop-shadow(0 0 ${3 + brightness * 12}px var(--amber))` }}
          />
          <line x1="50" y1="16" x2="50" y2="62" stroke="var(--border-strong)" strokeWidth="0.6" />

          {/* insects drawn in and circling */}
          {Array.from({ length: trapped }, (_, i) => {
            const a = (i / Math.max(1, trapped)) * Math.PI * 2;
            const r = 6 + (i % 4) * 3;
            return (
              <circle
                key={i}
                cx={50 + Math.cos(a) * r}
                cy={20 + Math.sin(a) * r * 0.7}
                r="0.7"
                fill="var(--amber)"
                opacity={0.8}
              />
            );
          })}

          {/* what remains of the dark edge */}
          <rect
            x="4"
            y="44"
            width={8 + darkRefuge * 14}
            height="18"
            fill="var(--teal)"
            opacity={0.1 + darkRefuge * 0.18}
            rx="1"
          />
          <line x1="4" y1="62" x2="96" y2="62" stroke="var(--border)" strokeWidth="0.4" />
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
          <Readout label={t("drawnIn")} value={trapped} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("brightness")}
            value={brightness}
            min={0}
            max={1}
            step={0.02}
            display={`${(brightness * 100).toFixed(0)}%`}
            onChange={setBrightness}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
