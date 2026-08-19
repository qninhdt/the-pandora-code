"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const CX = 50;
const CY = 50;
const BASE_R = 22;

// On an eccentric orbit the moon is squeezed harder at periapsis, less at
// apoapsis; that rhythmic flex heats the interior by friction. Eccentricity
// drives both the squash amplitude and the steady-state core temperature.
export default function TidalHeating() {
  const t = useTranslations("viz.tidal-heating");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [ecc, setEcc] = useState(0.4);
  const [isPlaying, setIsPlaying] = useState(true);

  const phaseRef = useRef(0);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      phaseRef.current += dt * 1.4;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const phase = phaseRef.current;
  // Orbital squeeze: strongest near periapsis. Amplitude scales with ecc.
  const squeeze = Math.sin(phase) * ecc;
  const rx = BASE_R * (1 + squeeze * 0.16);
  const ry = BASE_R * (1 - squeeze * 0.16);

  // Heat 0..1 climbs steeply with eccentricity (∝ e² in reality).
  const heat = Math.min(1, ecc * ecc * 1.8 + 0.05);
  const coreColor =
    heat > 0.66 ? "var(--magenta)" : heat > 0.3 ? "var(--amber)" : "var(--cyan)";
  const tempC = Math.round(heat * 1700);
  const state = heat > 0.66 ? t("molten") : heat > 0.3 ? t("warm") : t("cool");

  // Periapsis pulse for the core glow.
  const pulse = 0.5 + 0.5 * Math.max(0, Math.sin(phase));
  const coreR = (5 + heat * 9) * (1 + pulse * 0.12 * ecc);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        phaseRef.current = 0;
        setEcc(0.4);
      }}
      caption={<span style={{ color: coreColor }}>{state}</span>}
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="th-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={coreColor} />
              <stop offset="70%" stopColor={coreColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* outer heat halo, intensity tracks the periapsis pulse */}
          <circle
            cx={CX}
            cy={CY}
            r={BASE_R + 8}
            fill={coreColor}
            opacity={0.04 + heat * pulse * 0.14}
          />

          {/* flexing moon body */}
          <ellipse
            cx={CX}
            cy={CY}
            rx={rx}
            ry={ry}
            fill="color-mix(in oklab, var(--surface-raised) 80%, var(--void))"
            stroke="var(--border-strong)"
            strokeWidth="1"
          />

          {/* mantle tint warms with heat */}
          <ellipse
            cx={CX}
            cy={CY}
            rx={rx * 0.74}
            ry={ry * 0.74}
            fill={coreColor}
            opacity={0.06 + heat * 0.16}
          />

          {/* molten core */}
          <circle cx={CX} cy={CY} r={coreR} fill="url(#th-core)" />
          <circle cx={CX} cy={CY} r={coreR * 0.5} fill={coreColor} opacity="0.85" />

          {/* surface fissures appear when molten */}
          {heat > 0.5 &&
            [0, 1, 2, 3].map((i) => {
              const a = (i / 4) * Math.PI * 2 + phase * 0.2;
              const x1 = CX + Math.cos(a) * coreR;
              const y1 = CY + Math.sin(a) * coreR;
              const x2 = CX + Math.cos(a) * rx * 0.92;
              const y2 = CY + Math.sin(a) * ry * 0.92;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={coreColor}
                  strokeWidth="0.8"
                  opacity={(heat - 0.5) * pulse * 1.4}
                />
              );
            })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("heat")}
            value={`${tempC}`}
            unit="°C"
            accent={heat > 0.66 ? "magenta" : heat > 0.3 ? "amber" : "cyan"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("ecc")}
            value={ecc}
            min={0}
            max={0.9}
            step={0.01}
            onChange={setEcc}
            display={ecc.toFixed(2)}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
