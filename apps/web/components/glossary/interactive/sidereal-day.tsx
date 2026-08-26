"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Legend } from "./shared/legend";
import { Readout } from "./shared/readout";

const CX = 50;
const CY = 50;
const ORBIT_R = 30;

export default function SiderealDay() {
  const t = useTranslations("viz.sidereal-day");
  // Orbit progress 0..1 of one full revolution around the star.
  const [orbit, setOrbit] = useState(0.18);

  // World position along its orbit.
  const orbitAng = orbit * Math.PI * 2;
  const worldX = CX + Math.cos(orbitAng) * ORBIT_R;
  const worldY = CY + Math.sin(orbitAng) * ORBIT_R * 0.9;

  // Sidereal: a fixed-star reference points the same absolute direction always.
  // We pick "up" (toward a distant star) as the sidereal mark — it does a full
  // 360 per sidereal day, here drawn as a fixed-direction arrow.
  // For one orbit step, the solar mark must turn an EXTRA angle equal to the
  // orbit angle to point back at the star. That extra turn is the gap.
  const siderealDir = -Math.PI / 2; // toward fixed star (up)
  const solarDir = -Math.PI / 2 + orbitAng; // must rotate further to face the star

  const markLen = 11;
  const sx2 = worldX + Math.cos(siderealDir) * markLen;
  const sy2 = worldY + Math.sin(siderealDir) * markLen;
  const ux2 = worldX + Math.cos(solarDir) * markLen;
  const uy2 = worldY + Math.sin(solarDir) * markLen;

  const extraDeg = (orbit * 360).toFixed(0);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      aspectRatio="16/10"
      caption={
        <span>
          {t("gap")}: +{extraDeg}°
        </span>
      }
    >
      <div className="flex h-full w-full flex-col gap-3 p-4 pt-16">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={t("title")}
          >
            <defs>
              <radialGradient id="sid-star" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff6e0" />
                <stop offset="60%" stopColor="var(--amber)" />
                <stop offset="100%" stopColor="#a85f1c" />
              </radialGradient>
            </defs>

            {/* distant fixed star (up, far away) */}
            <circle cx={CX} cy={4} r="1.4" fill="var(--cyan)" />
            <circle cx={CX} cy={4} r="3" fill="var(--cyan)" opacity="0.2" />

            {/* orbit ring */}
            <ellipse
              cx={CX}
              cy={CY}
              rx={ORBIT_R}
              ry={ORBIT_R * 0.9}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="0.3"
              opacity="0.5"
            />

            {/* central star */}
            <circle cx={CX} cy={CY} r="9" fill="var(--amber)" opacity="0.12" />
            <circle cx={CX} cy={CY} r="6" fill="url(#sid-star)" />

            {/* world */}
            <circle cx={worldX} cy={worldY} r="4.5" fill="#2a5b6e" />
            <circle
              cx={worldX}
              cy={worldY}
              r="4.5"
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="0.4"
            />

            {/* sidereal mark — toward fixed star (cyan) */}
            <line x1={worldX} y1={worldY} x2={sx2} y2={sy2} stroke="var(--cyan)" strokeWidth="1" />
            <circle cx={sx2} cy={sy2} r="1.2" fill="var(--cyan)" />

            {/* solar mark — toward the star it orbits (amber) */}
            <line x1={worldX} y1={worldY} x2={ux2} y2={uy2} stroke="var(--amber)" strokeWidth="1" />
            <circle cx={ux2} cy={uy2} r="1.2" fill="var(--amber)" />
          </svg>

          <div className="absolute right-2 top-14 flex flex-col gap-1.5">
            <Readout label={t("sidereal")} value="360°" accent="cyan" />
            <Readout label={t("solar")} value={`+${extraDeg}°`} accent="amber" />
          </div>

          <div className="absolute left-2 top-14">
            <Legend
              vertical
              items={[
                { color: "var(--cyan)", label: t("star") },
                { color: "var(--amber)", label: t("sun") },
              ]}
            />
          </div>
        </div>

        <ControlSlider
          label={t("title")}
          value={orbit}
          min={0}
          max={1}
          step={0.005}
          onChange={setOrbit}
          display={`${(orbit * 100).toFixed(0)}%`}
          thumb="amber"
        />
      </div>
    </GlossaryFrame>
  );
}
