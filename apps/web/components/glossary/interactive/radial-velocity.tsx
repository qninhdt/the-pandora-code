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
// Shared barycentre sits slightly off the star toward the planet's side.
const STAR_ORBIT = 5;
const PLANET_ORBIT = 32;

export default function RadialVelocity() {
  const t = useTranslations("viz.radial-velocity");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [speed, setSpeed] = useState(0.6);
  const [isPlaying, setIsPlaying] = useState(true);

  const phaseRef = useRef(0);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      phaseRef.current = (phaseRef.current + dt * speed) % (Math.PI * 2);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const phase = phaseRef.current;
  // Star and planet orbit the barycentre on opposite sides.
  const starX = CX - Math.cos(phase) * STAR_ORBIT;
  const starY = CY - Math.sin(phase) * STAR_ORBIT * 0.45;
  const planetX = CX + Math.cos(phase) * PLANET_ORBIT;
  const planetY = CY + Math.sin(phase) * PLANET_ORBIT * 0.45;

  // Line-of-sight velocity is the x-component of the star's motion.
  const radialV = Math.sin(phase) * STAR_ORBIT;
  const approaching = radialV < -0.05;
  const receding = radialV > 0.05;
  // Doppler-shifted spectral line: blue when approaching, red when receding.
  const shiftPx = -radialV * 1.6;
  const lineColor = approaching ? "var(--cyan)" : receding ? "var(--magenta)" : "var(--foreground)";
  const state = approaching ? t("approaching") : receding ? t("receding") : t("rest");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        phaseRef.current = 0;
      }}
      caption={<span style={{ color: lineColor }}>{state}</span>}
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
            <radialGradient id="rv-star" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff3d6" />
              <stop offset="55%" stopColor="var(--amber)" />
              <stop offset="100%" stopColor="#b5701f" />
            </radialGradient>
            <radialGradient id="rv-star-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* orbit guides */}
          <ellipse
            cx={CX}
            cy={CY}
            rx={PLANET_ORBIT}
            ry={PLANET_ORBIT * 0.45}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            strokeDasharray="1.5 2"
            opacity="0.6"
          />
          <ellipse
            cx={CX}
            cy={CY}
            rx={STAR_ORBIT}
            ry={STAR_ORBIT * 0.45}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
            opacity="0.5"
          />
          {/* barycentre cross */}
          <line
            x1={CX - 1.6}
            y1={CY}
            x2={CX + 1.6}
            y2={CY}
            stroke="var(--muted)"
            strokeWidth="0.3"
          />
          <line
            x1={CX}
            y1={CY - 1.6}
            x2={CX}
            y2={CY + 1.6}
            stroke="var(--muted)"
            strokeWidth="0.3"
          />

          {/* planet */}
          <circle cx={planetX} cy={planetY} r="2.4" fill="var(--teal)" />
          <circle cx={planetX} cy={planetY} r="4" fill="var(--teal)" opacity="0.18" />

          {/* star with Doppler tint */}
          <circle cx={starX} cy={starY} r="14" fill="url(#rv-star-glow)" />
          <circle cx={starX} cy={starY} r="8" fill="url(#rv-star)" />
          {(approaching || receding) && (
            <circle
              cx={starX}
              cy={starY}
              r="8"
              fill="none"
              stroke={lineColor}
              strokeWidth="1.2"
              opacity={Math.min(0.7, Math.abs(radialV) / STAR_ORBIT)}
            />
          )}
        </svg>

        {/* spectral line readout: rest position vs shifted line */}
        <div className="absolute inset-x-3 top-16">
          <div className="relative h-10 overflow-hidden rounded-lg border border-border/40 bg-void/70">
            <div className="absolute inset-0 bg-gradient-to-r from-magenta/15 via-foreground/5 to-cyan/15" />
            {/* rest wavelength marker */}
            <div className="absolute top-0 h-full w-px bg-muted/60" style={{ left: "50%" }} />
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 font-mono text-[7px] uppercase tracking-wider text-muted">
              {t("rest")}
            </span>
            {/* shifted spectral line */}
            <div
              className="absolute top-0 h-full w-[3px] transition-[background] duration-150"
              style={{
                left: `calc(50% + ${shiftPx}%)`,
                background: lineColor,
                boxShadow: `0 0 8px ${lineColor}`,
              }}
            />
          </div>
        </div>

        <div className="absolute right-3 top-28">
          <Readout
            label={t("line")}
            value={approaching ? "−" : receding ? "+" : "0"}
            accent={approaching ? "cyan" : receding ? "magenta" : "foreground"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("speed")}
            value={speed}
            min={0.15}
            max={1.6}
            step={0.01}
            onChange={setSpeed}
            display={`${(speed * 100).toFixed(0)}%`}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
