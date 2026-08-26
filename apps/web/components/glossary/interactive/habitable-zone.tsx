"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Inner/outer habitable-zone radii scale with the square root of luminosity,
// and luminosity scales steeply with stellar mass (~M^3.5). We fold that into a
// single normalized factor so the band visibly marches outward with mass.
function zoneBounds(mass: number) {
  const lum = mass ** 3.5;
  const inner = 0.95 * Math.sqrt(lum);
  const outer = 1.67 * Math.sqrt(lum);
  return { inner, outer };
}

// Pandora's fixed orbital distance (AU-ish, in canon it orbits Polyphemus but we
// abstract to a star-distance for the Goldilocks demo).
const PANDORA_AU = 1.2;

export default function HabitableZone() {
  const t = useTranslations("viz.habitable-zone");
  const [mass, setMass] = useState(1);

  const { inner, outer } = zoneBounds(mass);
  const inHab = PANDORA_AU >= inner && PANDORA_AU <= outer;

  // Map AU to px radius for the SVG (centre star at 50,50).
  const scale = 26; // px per AU baseline
  const toR = (au: number) => au * scale;
  const innerR = toR(inner);
  const outerR = toR(outer);
  const pandoraR = toR(PANDORA_AU);

  const starColor = mass > 1.2 ? "#bcd4ff" : mass < 0.8 ? "#ff9a52" : "#fff2cc";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      aspectRatio="square"
      caption={
        <span className={inHab ? "text-teal" : "text-amber"}>
          {inHab ? t("inZone") : t("outZone")}
        </span>
      }
    >
      <div className="relative flex h-full w-full flex-col">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full flex-1"
          style={{ background: "radial-gradient(circle at 50% 50%, #0a0f1e, #05060d)" }}
          role="img"
          aria-label={t("zone")}
        >
          <defs>
            <radialGradient id="hz-hot">
              <stop offset="0%" stopColor="#ff7a2e" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ff7a2e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hz-star">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor={starColor} />
              <stop offset="100%" stopColor={starColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* too-hot inner wash */}
          <circle cx={50} cy={50} r={innerR} fill="url(#hz-hot)" />
          {/* habitable green band */}
          <circle
            cx={50}
            cy={50}
            r={(innerR + outerR) / 2}
            fill="none"
            stroke="#2bd4a8"
            strokeOpacity={0.5}
            strokeWidth={outerR - innerR}
          />
          {/* zone edges */}
          <circle
            cx={50}
            cy={50}
            r={innerR}
            fill="none"
            stroke="#2bd4a8"
            strokeOpacity={0.5}
            strokeWidth={0.4}
          />
          <circle
            cx={50}
            cy={50}
            r={outerR}
            fill="none"
            stroke="#36c5d9"
            strokeOpacity={0.4}
            strokeWidth={0.4}
          />

          {/* Pandora orbit + dot */}
          <circle
            cx={50}
            cy={50}
            r={pandoraR}
            fill="none"
            stroke="#9fb4d8"
            strokeOpacity={0.25}
            strokeDasharray="1 2"
            strokeWidth={0.3}
          />
          <circle
            cx={50 + pandoraR}
            cy={50}
            r={2.4}
            fill={inHab ? "#2bd4a8" : "#8a93a8"}
            stroke="#e8ecf5"
            strokeWidth={0.3}
          />

          {/* central star */}
          <circle cx={50} cy={50} r={9} fill="url(#hz-star)" />
          <circle cx={50} cy={50} r={3.4} fill={starColor} />
        </svg>

        <div className="flex items-center gap-3 px-4 pb-3 pt-1">
          <ControlSlider
            className="flex-1"
            label={t("mass")}
            value={mass}
            min={0.5}
            max={1.8}
            step={0.01}
            thumb="cyan"
            display={`${mass.toFixed(2)} M☉`}
            onChange={setMass}
          />
          <Readout
            label="HZ"
            value={`${inner.toFixed(2)}–${outer.toFixed(2)}`}
            unit="AU"
            accent="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
