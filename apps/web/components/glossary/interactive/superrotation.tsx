"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Polar view of a planet's upper atmosphere. Jet-stream arrows fly eastward. As
// you slow the planet's spin, the solid surface (inner disk) lags while the air
// shell (outer ring) keeps racing — superrotation, where the atmosphere laps the
// body many times per rotation (Venus, Titan). A slow-spinning dense-aired world
// like Pandora drifts toward this, smearing heat evenly around the globe.
export default function Superrotation() {
  const t = useTranslations("viz.superrotation");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [rotation, setRotation] = useState(1.0); // surface spin rate
  const surfAngle = useRef(0);
  const airAngle = useRef(0);
  const force = useState(0)[1];

  // atmosphere super-rotates: its speed stays high even as the surface slows,
  // so the ratio (air/surface) balloons at low rotation.
  useRafLoop(
    (dt) => {
      const airSpeed = 1.4; // roughly fixed momentum in the shell
      surfAngle.current = (surfAngle.current + dt * rotation * 0.8) % (Math.PI * 2);
      airAngle.current = (airAngle.current + dt * airSpeed * 0.8) % (Math.PI * 2);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const ratio = 1.4 / Math.max(0.1, rotation);
  const superRotating = ratio > 1.5;

  const CX = 50;
  const CY = 50;
  const R_SURF = 24;
  const R_AIR = 42;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setRotation(1.0)}
      allowFullscreen={false}
      caption={
        <span>
          {t("airVsSurface")}:{" "}
          <span className={superRotating ? "text-magenta" : "text-cyan"}>{ratio.toFixed(1)}×</span>{" "}
          {superRotating ? t("superrotating") : t("coupled")}
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
            <radialGradient id="sr-air" cx="50%" cy="50%" r="50%">
              <stop offset="55%" stopColor="var(--cyan)" stopOpacity="0" />
              <stop
                offset="100%"
                stopColor="var(--cyan)"
                stopOpacity={superRotating ? 0.22 : 0.1}
              />
            </radialGradient>
          </defs>

          {/* atmosphere shell */}
          <circle
            cx={CX}
            cy={CY}
            r={R_AIR}
            fill="url(#sr-air)"
            stroke="var(--cyan)"
            strokeWidth="0.4"
            opacity="0.5"
          />

          {/* fast jet-stream arrows in the shell */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = airAngle.current + (i / 12) * Math.PI * 2;
            const r = R_AIR - 4;
            const x = CX + Math.cos(a) * r;
            const y = CY + Math.sin(a) * r;
            // tangential streak
            const tx = -Math.sin(a);
            const ty = Math.cos(a);
            return (
              <line
                key={i}
                x1={x - tx * 4}
                y1={y - ty * 4}
                x2={x + tx * 4}
                y2={y + ty * 4}
                stroke={superRotating ? "var(--magenta)" : "var(--cyan)"}
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.8"
              />
            );
          })}

          {/* the solid planet surface */}
          <circle
            cx={CX}
            cy={CY}
            r={R_SURF}
            fill="#0a1420"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          {/* surface reference marks so its slow spin is visible */}
          {Array.from({ length: 8 }, (_, i) => {
            const a = surfAngle.current + (i / 8) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={CX + Math.cos(a) * (R_SURF - 6)}
                y1={CY + Math.sin(a) * (R_SURF - 6)}
                x2={CX + Math.cos(a) * R_SURF}
                y2={CY + Math.sin(a) * R_SURF}
                stroke="var(--muted)"
                strokeWidth="0.5"
                opacity="0.5"
              />
            );
          })}
          {/* one bright surface landmark to track lap difference */}
          <circle
            cx={CX + Math.cos(surfAngle.current) * (R_SURF - 3)}
            cy={CY + Math.sin(surfAngle.current) * (R_SURF - 3)}
            r="1.6"
            fill="var(--amber)"
          />
          <circle cx={CX} cy={CY} r="1.4" fill="var(--foreground)" opacity="0.5" />
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("heatSpread")}
            value={superRotating ? t("even") : t("uneven")}
            accent={superRotating ? "teal" : "amber"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("surfaceSpin")}
            value={rotation}
            min={0.15}
            max={2}
            step={0.05}
            onChange={setRotation}
            display={
              rotation < 0.5 ? `${rotation.toFixed(2)}× ${t("slow")}` : `${rotation.toFixed(2)}×`
            }
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
