"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Occulter slides from 0 (off, star blazing) to 1 (centred over the star).
// As it covers the star the glare fades and a faint planet emerges from the
// washed-out field — the coronagraph trick behind direct imaging.
export default function DirectImaging() {
  const t = useTranslations("viz.direct-imaging");
  const [occ, setOcc] = useState(0);

  // How fully the occulter masks the star. 0 → none, 1 → fully masked.
  const masked = Math.min(1, occ);
  // Star brightness collapses as the disk closes over it.
  const starGlare = 1 - masked;
  // Planet only becomes visible once glare is suppressed enough.
  const planetVisibility = Math.max(0, masked - 0.45) / 0.55;
  const revealed = masked > 0.92;

  // Occulter disk centre tracks the slider from offscreen-left to the star.
  const occCx = 40 + occ * 60;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      aspectRatio="16/10"
      caption={revealed ? t("blocked") : t("open")}
    >
      <div className="flex h-full w-full flex-col gap-3 p-4 pt-16">
        <div className="relative flex-1 overflow-hidden rounded-xl border border-border/40 bg-void">
          <svg viewBox="0 0 200 130" className="size-full" aria-hidden>
            <title>{t("title")}</title>
            <defs>
              <radialGradient id="di-star" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff8e6" />
                <stop offset="35%" stopColor="var(--amber)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="di-planet" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="color-mix(in oklab, var(--cyan) 70%, white)" />
                <stop offset="60%" stopColor="var(--cyan)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* faint background stars */}
            {[
              [24, 22],
              [168, 30],
              [52, 104],
              [148, 98],
              [188, 70],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="0.8" fill="var(--muted)" opacity="0.5" />
            ))}

            {/* star glare halo */}
            <circle
              cx="100"
              cy="65"
              r={48 * starGlare + 8}
              fill="url(#di-star)"
              opacity={0.25 + 0.75 * starGlare}
            />
            <circle cx="100" cy="65" r="6" fill="#fff8e6" opacity={starGlare} />

            {/* the planet, off to the side, washed out until glare is gone */}
            <circle cx="138" cy="50" r="5" fill="url(#di-planet)" opacity={planetVisibility} />
            {planetVisibility > 0.3 && (
              <text
                x="138"
                y="38"
                textAnchor="middle"
                fill="var(--cyan)"
                fontSize="7"
                fontFamily="monospace"
                opacity={planetVisibility}
              >
                {t("planet")}
              </text>
            )}

            {/* occulting disk — opaque mask sliding over the star */}
            <circle
              cx={occCx}
              cy="65"
              r="22"
              fill="var(--void)"
              stroke="var(--border-strong)"
              strokeWidth="1.5"
            />
            <circle
              cx={occCx}
              cy="65"
              r="22"
              fill="none"
              stroke="var(--magenta)"
              strokeWidth="0.75"
              strokeDasharray="3 3"
              opacity="0.6"
            />
          </svg>
        </div>

        <div className="flex items-end gap-4">
          <ControlSlider
            className="flex-1"
            label={t("occulter")}
            value={occ}
            min={0}
            max={1}
            step={0.01}
            onChange={setOcc}
            display={`${Math.round(occ * 100)}%`}
            thumb="magenta"
          />
          <Readout
            label={t("star")}
            value={`${Math.round(starGlare * 100)}%`}
            accent={revealed ? "teal" : "amber"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
