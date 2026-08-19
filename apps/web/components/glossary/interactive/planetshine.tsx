"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const W = 100;
const H = 70;

// A near-full giant reflects the most light; a thin crescent reflects little.
// phase: 0 = new (dark), 1 = full.
function reflectedFraction(phase: number) {
  return phase * phase; // crescent gives disproportionately little light
}

export default function Planetshine() {
  const t = useTranslations("viz.planetshine");
  const [phase, setPhase] = useState(0.85);
  const [shine, setShine] = useState(true);

  const frac = shine ? reflectedFraction(phase) : 0;
  // Night-side wash brightness 0..1.
  const wash = frac;

  // Terminator x for the giant's lit fraction (drawn as a clipped bright disk).
  const giantCx = 70;
  const giantCy = 24;
  const giantR = 18;
  // Lit limb sweeps from left (new) to full as phase rises.
  const litOffset = (1 - phase) * giantR * 2;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      aspectRatio="16/10"
      caption={
        <span style={{ color: shine ? "var(--cyan)" : "var(--muted)" }}>
          {shine ? t("on") : t("off")}
        </span>
      }
    >
      <div className="flex h-full w-full flex-col gap-3 p-4 pt-16">
        <div className="relative flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={t("title")}
          >
            <defs>
              <radialGradient id="ps-giant-lit" cx="40%" cy="40%" r="70%">
                <stop offset="0%" stopColor="#cfe6ff" />
                <stop offset="55%" stopColor="#6f9fd8" />
                <stop offset="100%" stopColor="#27406e" />
              </radialGradient>
              <clipPath id="ps-lit-clip">
                <circle cx={giantCx - litOffset} cy={giantCy} r={giantR} />
              </clipPath>
              <radialGradient id="ps-wash" cx="50%" cy="35%" r="75%">
                <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.5 * wash} />
                <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* reflected wash over the foreground night */}
            <rect x="0" y="0" width={W} height={H} fill="url(#ps-wash)" />

            {/* giant planet — dark base then clipped lit crescent/disk */}
            <circle cx={giantCx} cy={giantCy} r={giantR} fill="#14213a" />
            <g clipPath="url(#ps-lit-clip)">
              <circle cx={giantCx} cy={giantCy} r={giantR} fill="url(#ps-giant-lit)" />
            </g>
            {/* banding hint */}
            <ellipse cx={giantCx} cy={giantCy} rx={giantR} ry={giantR * 0.32} fill="#1d2f5a" opacity="0.25" />

            {/* light rays from giant down to the moon surface when shining */}
            {shine && wash > 0.05 &&
              Array.from({ length: 5 }).map((_, i) => {
                const x = giantCx - 12 + i * 6;
                return (
                  <line
                    key={i}
                    x1={giantCx}
                    y1={giantCy + giantR}
                    x2={x}
                    y2={H - 14}
                    stroke="var(--cyan)"
                    strokeWidth="0.4"
                    opacity={0.1 + wash * 0.3}
                  />
                );
              })}

            {/* moon surface foreground — bioluminescent dots brighten with wash */}
            <path
              d={`M 0 ${H - 12} Q ${W / 2} ${H - 20} ${W} ${H - 12} L ${W} ${H} L 0 ${H} Z`}
              fill="#0a1120"
            />
            {Array.from({ length: 9 }).map((_, i) => {
              const x = 6 + i * 11;
              const baseY = H - 13 - ((i * 37) % 5);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={baseY}
                  r={0.9 + (i % 3) * 0.4}
                  fill={i % 4 === 0 ? "var(--magenta)" : "var(--teal)"}
                  opacity={0.3 + wash * 0.6}
                />
              );
            })}
          </svg>

          <div className="absolute right-2 top-14">
            <Readout
              label={t("nightside")}
              value={`${(wash * 100).toFixed(0)}%`}
              accent={wash > 0.05 ? "cyan" : "foreground"}
            />
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <ControlSlider
            label={t("phase")}
            value={phase}
            min={0}
            max={1}
            step={0.01}
            onChange={setPhase}
            display={`${(phase * 100).toFixed(0)}%`}
            thumb="cyan"
            disabled={!shine}
            className="flex-1"
          />
          <ControlButton
            variant={shine ? "active" : "default"}
            onClick={() => setShine((v) => !v)}
          >
            {t("shine")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
