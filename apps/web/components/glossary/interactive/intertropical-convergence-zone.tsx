"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The rising branch of the Hadley cell, drawn on a globe: a band of towering
// storm cloud where the two hemispheres' trade winds converge and force air up.
// Rain falls almost daily beneath it — which is why the densest rainforests
// track it. The season slider marches the band north/south of the equator; on a
// slow-spinning world like Pandora the belt is broad, not a narrow stripe.
export default function IntertropicalConvergenceZone() {
  const t = useTranslations("viz.intertropical-convergence-zone");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [season, setSeason] = useState(0); // -1 (south) .. +1 (north)
  const rain = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      rain.current = (rain.current + dt) % 1;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const CX = 50;
  const CY = 50;
  const R = 40;
  // band centre latitude → y on globe
  const bandLat = season * 20; // degrees
  const bandY = CY - (bandLat / 90) * R;
  const BAND_H = 9; // broad Pandoran belt

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSeason(0)}
      allowFullscreen={false}
      caption={
        <span>
          {t("band")}:{" "}
          <span className="text-cyan">
            {Math.abs(bandLat) < 3
              ? t("equator")
              : `${Math.abs(bandLat).toFixed(0)}° ${t(bandLat > 0 ? "n" : "s")}`}
          </span>
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="itcz-globe" cx="42%" cy="38%" r="72%">
              <stop offset="0%" stopColor="#12403a" />
              <stop offset="70%" stopColor="#0a2438" />
              <stop offset="100%" stopColor="#061020" />
            </radialGradient>
            <clipPath id="itcz-clip">
              <circle cx={CX} cy={CY} r={R} />
            </clipPath>
          </defs>

          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="url(#itcz-globe)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />

          <g clipPath="url(#itcz-clip)">
            {/* latitude lines */}
            {[-60, -30, 0, 30, 60].map((lat) => {
              const y = CY - (lat / 90) * R;
              return (
                <line
                  key={lat}
                  x1={CX - R}
                  y1={y}
                  x2={CX + R}
                  y2={y}
                  stroke="var(--border-strong)"
                  strokeWidth="0.3"
                  opacity={lat === 0 ? 0.5 : 0.2}
                />
              );
            })}

            {/* trade winds converging on the band (arrows from both sides) */}
            {[-1, 1].map((s) => (
              <g key={s}>
                {Array.from({ length: 3 }, (_, i) => {
                  const y0 = bandY + s * (14 + i * 8);
                  return (
                    <line
                      key={i}
                      x1={CX - 22 + (i % 2) * 44}
                      y1={y0}
                      x2={CX - 8 + (i % 2) * 16}
                      y2={bandY + s * 5}
                      stroke="var(--teal)"
                      strokeWidth="0.4"
                      opacity="0.4"
                    />
                  );
                })}
              </g>
            ))}

            {/* the cloud band */}
            <rect
              x={CX - R}
              y={bandY - BAND_H / 2}
              width={R * 2}
              height={BAND_H}
              fill="var(--cyan)"
              opacity="0.28"
            />
            {Array.from({ length: 10 }, (_, i) => (
              <ellipse
                key={i}
                cx={CX - R + 4 + i * 8}
                cy={bandY + ((i % 3) - 1) * 2}
                rx="4.5"
                ry="2.6"
                fill="var(--cyan)"
                opacity="0.35"
              />
            ))}

            {/* rain streaks beneath the band */}
            {Array.from({ length: 22 }, (_, i) => {
              const rx = CX - R + 3 + ((i * 3.6) % (R * 2 - 4));
              const ry = bandY + BAND_H / 2 + ((i * 5 + rain.current * 14) % 16);
              return (
                <line
                  key={i}
                  x1={rx}
                  y1={ry}
                  x2={rx - 0.6}
                  y2={ry + 2.4}
                  stroke="var(--cyan)"
                  strokeWidth="0.4"
                  opacity="0.55"
                />
              );
            })}

            {/* forest strip that tracks the rain */}
            <rect
              x={CX - R}
              y={bandY + BAND_H / 2 + 16}
              width={R * 2}
              height="6"
              fill="var(--teal)"
              opacity="0.3"
            />
          </g>

          {/* equator label tick */}
          <circle cx={CX + R + 2} cy={CY} r="0.8" fill="var(--muted)" />
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("rainfall")} value={t("heavy")} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("season")}
            value={season}
            min={-1}
            max={1}
            step={0.05}
            onChange={setSeason}
            display={season < -0.15 ? t("south") : season > 0.15 ? t("north") : t("equinox")}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
