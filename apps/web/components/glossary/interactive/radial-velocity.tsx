"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function RadialVelocity() {
  const t = useTranslations("viz.radialVelocity");
  const [mass, setMass] = useState(5); // Planet Mass (1..10)
  const [radius, setRadius] = useState(1.2); // Orbit Radius (0.6..2.0)
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;

    const tick = () => {
      // Orbital speed decreases with radius (Kepler's 3rd law: T^2 ~ r^3 => w ~ r^-1.5)
      const speed = 0.04 * (1 / radius) ** 1.5;
      setTime((prev) => (prev + speed) % (2 * Math.PI));
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, radius]);

  const center = { x: 140, y: 110 };
  const observerX = 320;

  // Star wobble radius scales with planet mass
  const rStar = mass * 2.2;
  // Planet orbit radius scales with radius slider
  const rPlanet = radius * 60;

  // Orbit positions
  // Star is 180 degrees out of phase with planet
  const sX = center.x + rStar * Math.cos(time);
  const sY = center.y + rStar * Math.sin(time);

  const pX = center.x - rPlanet * Math.cos(time);
  const pY = center.y - rPlanet * Math.sin(time);

  // Radial velocity relative to observer at (320, 110)
  // Derivative of x-position: -sin(time)
  const rv = -Math.sin(time); // Max positive when moving right (towards observer)

  // Shift value between -1 and 1
  const shift = rv * (mass / 10); // Scale shift by mass

  // Wave colors based on Doppler shift
  let waveColor = "rgba(138, 147, 168, 0.4)"; // Default Stone
  let shiftText = "Neutral";
  let shiftColorClass = "text-muted";

  if (shift > 0.05) {
    // Blue-shifted
    waveColor = `rgba(54, 197, 217, ${0.4 + 0.5 * shift})`;
    shiftText = t("blueShift");
    shiftColorClass = "text-cyan";
  } else if (shift < -0.05) {
    // Red-shifted
    waveColor = `rgba(255, 93, 168, ${0.4 + 0.5 * Math.abs(shift)})`;
    shiftText = t("redShift");
    shiftColorClass = "text-magenta";
  }

  // Generate sine wave path for Doppler plot
  const plotWidth = 300;
  const plotHeight = 35;
  const plotX = 50;
  const plotY = 220;

  let sinePath = `M ${plotX} ${plotY + plotHeight / 2}`;
  for (let i = 0; i <= plotWidth; i++) {
    const x = plotX + i;
    const phase = (i / plotWidth) * 2 * Math.PI;
    const y = plotY + plotHeight / 2 + Math.sin(phase) * (plotHeight / 2) * (mass / 10);
    sinePath += ` L ${x} ${y}`;
  }

  // Map current orbital time to plot coordinate
  // Offset by pi/2 to align velocity peak with time
  const currentPhaseX =
    plotX + (((time + Math.PI / 2) % (2 * Math.PI)) / (2 * Math.PI)) * plotWidth;
  const currentPhaseY = plotY + plotHeight / 2 - rv * (plotHeight / 2) * (mass / 10);

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={() => {
        setMass(5);
        setRadius(1.2);
        setTime(0);
        setIsPlaying(true);
      }}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* Main Simulation View */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-24">
          <svg viewBox="0 0 400 270" className="w-full h-full max-h-[85%] select-none">
            <title>Radial Velocity Simulator</title>
            <defs>
              {/* Star Glow */}
              <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff4e8" />
                <stop offset="60%" stopColor="#ffeaad" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffeaad" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Barycenter marker */}
            <line
              x1={center.x - 4}
              y1={center.y}
              x2={center.x + 4}
              y2={center.y}
              className="stroke-border/40 stroke-0.5"
            />
            <line
              x1={center.x}
              y1={center.y - 4}
              x2={center.x}
              y2={center.y + 4}
              className="stroke-border/40 stroke-0.5"
            />

            {/* Star wobble orbit */}
            <circle
              cx={center.x}
              cy={center.y}
              r={rStar}
              className="fill-none stroke-border/10 stroke-0.5 stroke-dasharray-[2,2]"
            />

            {/* Planet orbit path */}
            <circle
              cx={center.x}
              cy={center.y}
              r={rPlanet}
              className="fill-none stroke-border/20 stroke-1 stroke-dasharray-[3,3]"
            />

            {/* Doppler light wave pulses toward detector */}
            <g>
              <path
                d={`M ${sX + 25} ${sY - 10} Q ${(sX + observerX) / 2} ${sY - 20} ${observerX - 35} 95`}
                className="fill-none stroke-2 transition-colors duration-100"
                stroke={waveColor}
              />
              <path
                d={`M ${sX + 30} ${sY} Q ${(sX + observerX) / 2} ${sY} ${observerX - 30} 110`}
                className="fill-none stroke-2 transition-colors duration-100"
                stroke={waveColor}
              />
              <path
                d={`M ${sX + 25} ${sY + 10} Q ${(sX + observerX) / 2} ${sY + 20} ${observerX - 35} 125`}
                className="fill-none stroke-2 transition-colors duration-100"
                stroke={waveColor}
              />
            </g>

            {/* Observer / Telescope */}
            <g transform={`translate(${observerX}, ${center.y - 12})`}>
              <rect
                x={0}
                y={0}
                width={28}
                height={24}
                rx={4}
                fill="#0e1320"
                className="stroke-border/40 stroke-1"
              />
              <circle cx={14} cy={12} r={5} className="fill-none stroke-cyan/60 stroke-1" />
              <line x1={6} y1={12} x2={22} y2={12} className="stroke-cyan/20 stroke-1" />
              <line x1={14} y1={4} x2={14} y2={20} className="stroke-cyan/20 stroke-1" />
            </g>
            <text
              x={observerX + 14}
              y={center.y + 22}
              className="fill-muted/60 text-[6px] font-mono"
              textAnchor="middle"
            >
              DETECTOR
            </text>

            {/* Star */}
            <circle cx={sX} cy={sY} r={16} fill="url(#starGlow)" />
            <circle
              cx={sX}
              cy={sY}
              r={9}
              fill="#fff"
              className="stroke-amber/20 stroke-1"
              style={{
                filter: `drop-shadow(0 0 8px ${
                  shift > 0.05 ? "var(--cyan)" : shift < -0.05 ? "var(--magenta)" : "var(--amber)"
                })`,
              }}
            />

            {/* Planet */}
            <circle
              cx={pX}
              cy={pY}
              r={4.5}
              fill="#36c5d9"
              style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }}
            />

            {/* Real-time Doppler Curve Plot */}
            <g>
              {/* Plot grid border */}
              <rect
                x={plotX}
                y={plotY}
                width={plotWidth}
                height={plotHeight}
                rx={6}
                fill="#070912"
                className="stroke-border/20 stroke-1"
              />
              {/* Zero velocity reference line */}
              <line
                x1={plotX}
                y1={plotY + plotHeight / 2}
                x2={plotX + plotWidth}
                y2={plotY + plotHeight / 2}
                className="stroke-border/10 stroke-0.5 stroke-dasharray-[2,2]"
              />
              {/* Sine Wave Plot */}
              <path d={sinePath} fill="none" className="stroke-cyan/50 stroke-1" />
              {/* Current value tracking marker dot */}
              <circle
                cx={currentPhaseX}
                cy={currentPhaseY}
                r={4}
                fill={shift > 0.05 ? "#36c5d9" : shift < -0.05 ? "#ff5da8" : "#8a93a8"}
                style={{
                  filter: `drop-shadow(0 0 4px ${
                    shift > 0.05 ? "var(--cyan)" : shift < -0.05 ? "var(--magenta)" : "var(--muted)"
                  })`,
                }}
              />
              {/* Plot label */}
              <text x={plotX + 8} y={plotY + 12} className="fill-muted/40 text-[6px] font-mono">
                VELOCITY CURVE
              </text>
            </g>
          </svg>
        </div>

        {/* HUD Overlay */}
        <div className="absolute top-16 left-4 bg-void/90 border border-border/40 rounded-xl p-3 min-w-[150px] z-10 shadow-lg">
          <h5 className="text-[10px] font-mono font-bold text-muted uppercase mb-1">
            SPECTROSCOPY
          </h5>
          <div className="text-xs font-mono font-semibold tracking-wide">
            <span className={shiftColorClass}>{shiftText}</span>
          </div>
          <div className="text-[9px] text-muted mt-1 font-mono">
            {t("mass")}: <span className="text-foreground">{mass} M</span>
          </div>
          <div className="text-[9px] text-muted mt-0.5 font-mono">
            {t("radius")}: <span className="text-foreground">{radius.toFixed(2)} AU</span>
          </div>
        </div>

        {/* Bottom controls panel */}
        <div className="relative z-10 w-full grid grid-cols-2 gap-x-6 gap-y-2 mt-auto bg-void/65 backdrop-blur-md px-4 py-3 border border-border/30 rounded-xl">
          {/* Planet Mass */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted uppercase w-16 truncate">
              {t("mass")}
            </span>
            <input
              type="range"
              min="1"
              max="10"
              value={mass}
              onChange={(e) => setMass(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[9px] font-mono text-foreground w-6 text-right">{mass}</span>
          </div>

          {/* Orbit Radius */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted uppercase w-16 truncate">
              {t("radius")}
            </span>
            <input
              type="range"
              min="0.6"
              max="2.0"
              step="0.1"
              value={radius}
              onChange={(e) => setRadius(Number.parseFloat(e.target.value))}
              className="flex-1 h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[9px] font-mono text-foreground w-6 text-right">
              {radius.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
