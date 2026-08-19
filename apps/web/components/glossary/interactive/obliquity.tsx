"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const CX = 50;
const CY = 38;
const R = 18;

export default function Obliquity() {
  const t = useTranslations("viz.obliquity");
  // Axial tilt in degrees, 0 (upright) -> 45 (steep).
  const [tilt, setTilt] = useState(25);

  // Fraction of the upper hemisphere leaning sunward (star is to the right).
  // More tilt -> stronger seasonal contrast and larger winter ice cap.
  const lean = tilt / 45;
  const capR = R * (0.18 + lean * 0.32);
  const seasonStrength =
    tilt < 6 ? "upright" : tilt < 28 ? "summer" : "steep";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      aspectRatio="16/10"
      caption={
        <span style={{ color: tilt < 6 ? "var(--muted)" : "var(--amber)" }}>
          {t(seasonStrength)}
        </span>
      }
    >
      <div className="flex h-full w-full flex-col gap-3 p-4 pt-16">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 100 70"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={t("title")}
          >
            <defs>
              <radialGradient id="obl-planet" cx="40%" cy="40%" r="65%">
                <stop offset="0%" stopColor="color-mix(in oklab, var(--teal) 55%, var(--void))" />
                <stop offset="100%" stopColor="var(--void)" />
              </radialGradient>
              <radialGradient id="obl-star" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff6e0" />
                <stop offset="60%" stopColor="var(--amber)" />
                <stop offset="100%" stopColor="#a85f1c" />
              </radialGradient>
              <clipPath id="obl-clip">
                <circle cx={CX} cy={CY} r={R} />
              </clipPath>
            </defs>

            {/* star at right — the season driver */}
            <circle cx="90" cy={CY} r="6.5" fill="var(--amber)" opacity="0.18" />
            <circle cx="90" cy={CY} r="4" fill="url(#obl-star)" />

            {/* sunlight hint */}
            <line
              x1="84"
              y1={CY}
              x2={CX + R}
              y2={CY}
              stroke="var(--amber)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              opacity="0.4"
            />

            {/* planet body */}
            <circle cx={CX} cy={CY} r={R} fill="url(#obl-planet)" stroke="var(--border-strong)" strokeWidth="0.5" />

            {/* day/night terminator: night on the far side from star (left) */}
            <g clipPath="url(#obl-clip)">
              <rect x={CX - R} y={CY - R} width={R} height={R * 2} fill="var(--void)" opacity="0.55" />
            </g>

            {/* tilted spin axis + ice caps, rotated by tilt around planet centre */}
            <g transform={`rotate(${tilt} ${CX} ${CY})`}>
              <line
                x1={CX}
                y1={CY - R - 6}
                x2={CX}
                y2={CY + R + 6}
                stroke="var(--foreground)"
                strokeWidth="0.5"
                opacity="0.5"
                strokeDasharray="2 1.5"
              />
              {/* north cap (summer-leaning) smaller, south cap (winter) larger */}
              <g clipPath="url(#obl-clip)">
                <ellipse cx={CX} cy={CY - R} rx={capR} ry={capR * 0.7} fill="var(--cyan)" opacity={0.35 + lean * 0.3} />
                <ellipse cx={CX} cy={CY + R} rx={capR * 1.3} ry={capR * 0.9} fill="var(--cyan)" opacity={0.45 + lean * 0.4} />
              </g>
            </g>
          </svg>

          <div className="absolute right-2 top-14 flex flex-col gap-1.5">
            <Readout label={t("tilt")} value={`${tilt.toFixed(0)}°`} accent="cyan" />
          </div>

          <div className="absolute left-2 top-14 flex flex-col gap-1 font-mono text-[9px]">
            <span className="text-amber/80">{t("summer")}</span>
            <span className="text-cyan/80">{t("winter")}</span>
          </div>
        </div>

        <ControlSlider
          label={t("tilt")}
          value={tilt}
          min={0}
          max={45}
          step={0.5}
          onChange={setTilt}
          display={`${tilt.toFixed(0)}°`}
          thumb="cyan"
        />
      </div>
    </GlossaryFrame>
  );
}
