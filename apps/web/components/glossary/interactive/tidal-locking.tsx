"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

interface TidalLockingProps {
  locale: string;
}

export default function TidalLocking({ locale }: TidalLockingProps) {
  const t = useTranslations("viz.tidalLocking");

  const [isPlaying, setIsPlaying] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [speed, setSpeed] = useState(1); // Speed multiplier 0.5 to 2.0
  const [theta, setTheta] = useState(0); // Orbital angle in radians

  // Animation tick
  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;

    const tick = () => {
      setTheta((prev) => (prev + 0.015 * speed) % (2 * Math.PI));
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, speed]);

  const center = { x: 200, y: 100 };
  const orbitRadius = 110;

  // Orbit coordinates of the moon
  const moonX = center.x + orbitRadius * Math.cos(theta);
  const moonY = center.y + 40 * Math.sin(theta); // slightly elliptical orbit for perspective
  const isMoonInFront = Math.sin(theta) > 0;

  // Moon self-rotation angle
  // If locked, rotation angle is exactly theta + PI (facing the parent giant)
  // If unlocked, rotation angle spins faster/freely (e.g. 3.5 * theta)
  const moonRotation = isLocked ? theta + Math.PI : theta * 3.5;

  const handleReset = () => {
    setIsPlaying(true);
    setIsLocked(true);
    setSpeed(1);
    setTheta(0);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={handleReset}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Orbit Visualization Viewport */}
        <div className="w-full flex-1 flex flex-col justify-start pb-28 pt-4">
          <svg viewBox="0 0 400 200" className="w-full h-full select-none">
            <title>Tidal Locking orbital dynamics</title>

            {/* Orbit Path line */}
            <path
              d={`M ${center.x - orbitRadius} ${center.y} A ${orbitRadius} 40 0 1 0 ${center.x + orbitRadius} ${center.y} A ${orbitRadius} 40 0 1 0 ${center.x - orbitRadius} ${center.y}`}
              fill="none"
              className="stroke-border/10 stroke-1"
              strokeDasharray="4,4"
            />

            {/* Back half of orbit path (behind Giant) */}
            {!isMoonInFront && (
              <path
                d={`M ${center.x + orbitRadius} ${center.y} A ${orbitRadius} 40 0 0 0 ${center.x - orbitRadius} ${center.y}`}
                fill="none"
                className="stroke-cyan/20 stroke-[1.5]"
              />
            )}

            {/* Parent Gas Giant (Polyphemus) */}
            <g>
              <defs>
                <radialGradient id="giantGradient" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#ffb454" />
                  <stop offset="50%" stopColor="#ff5da8" />
                  <stop offset="100%" stopColor="#070912" />
                </radialGradient>
              </defs>
              <circle
                cx={center.x}
                cy={center.y}
                r="38"
                fill="url(#giantGradient)"
                className="stroke-border/20 stroke-1"
                style={{ filter: "drop-shadow(0 0 15px rgba(255, 93, 168, 0.25))" }}
              />
              {/* Planetary stripes */}
              <path d="M 164 94 Q 200 98 236 94" fill="none" className="stroke-void/30 stroke-1" />
              <path
                d="M 163 100 Q 200 106 237 100"
                fill="none"
                className="stroke-void/40 stroke-2"
              />
              <path
                d="M 165 106 Q 200 112 235 106"
                fill="none"
                className="stroke-void/30 stroke-1"
              />
            </g>

            {/* Front half of orbit path (in front of Giant) */}
            {isMoonInFront && (
              <path
                d={`M ${center.x - orbitRadius} ${center.y} A ${orbitRadius} 40 0 0 0 ${center.x + orbitRadius} ${center.y}`}
                fill="none"
                className="stroke-cyan/30 stroke-[1.5]"
              />
            )}

            {/* Gravity pull lines (Tidal bulge forces) */}
            {isLocked ? (
              // Locked: Bulge points directly to the center
              <line
                x1={center.x}
                y1={center.y}
                x2={moonX}
                y2={moonY}
                className="stroke-cyan/40 stroke-[0.8]"
                strokeDasharray="2,2"
              />
            ) : (
              // Unlocked: Bulge is misaligned due to rapid rotation (bulge lag)
              <g>
                <line
                  x1={center.x}
                  y1={center.y}
                  x2={moonX}
                  y2={moonY}
                  className="stroke-amber/20 stroke-[0.8]"
                  strokeDasharray="2,2"
                />
                {/* Visual indicator of bulge lag torque */}
                <path
                  d={`M ${moonX} ${moonY} Q ${(center.x + moonX) / 2} ${(center.y + moonY) / 2 + 10} ${center.x} ${center.y}`}
                  fill="none"
                  className="stroke-magenta/30 stroke-[1] animate-pulse"
                />
              </g>
            )}

            {/* The Moon (Pandora) */}
            <g transform={`translate(${moonX}, ${moonY})`}>
              <g transform={`rotate(${(moonRotation * 180) / Math.PI})`}>
                {/* Tidally locked moon is slightly stretched (elliptical bulge) */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx={isLocked ? "14" : "11"}
                  ry="11"
                  fill="#0e1320"
                  className="stroke-cyan stroke-[1.5]"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(54, 197, 217, 0.4))",
                  }}
                />

                {/* Continental bioluminescent marks on Moon */}
                <circle cx="-4" cy="-3" r="3" className="fill-teal opacity-80" />
                <path d="M 2 3 Q 6 1 4 -3" fill="none" className="stroke-cyan stroke-1" />

                {/* Arrow pointing to "Face A" of moon */}
                <line
                  x1="0"
                  y1="0"
                  x2="-10"
                  y2="0"
                  className={isLocked ? "stroke-cyan stroke-2" : "stroke-amber stroke-1"}
                />
                <polygon
                  points="-10,0 -7,-3 -7,3"
                  className={isLocked ? "fill-cyan" : "fill-amber"}
                />
              </g>

              {/* Bulge alignment label indicator */}
              {isLocked && <circle cx="0" cy="0" r="1.5" className="fill-cyan animate-ping" />}
            </g>

            {/* Labels overlay */}
            <text
              x={center.x}
              y={center.y - 45}
              className="fill-muted font-mono text-[9px] text-center"
              textAnchor="middle"
            >
              POLYPHEMUS
            </text>
            <text
              x={moonX}
              y={moonY - 18}
              className="fill-cyan font-mono text-[8px] text-center"
              textAnchor="middle"
            >
              PANDORA
            </text>
          </svg>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10">
          {/* Unlocked / Locked Mode Toggles */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsLocked(false)}
              className="flex-1 py-1.5 px-1 rounded border font-mono text-[10px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: !isLocked ? "var(--amber)" : "transparent",
                color: !isLocked ? "var(--background)" : "var(--foreground)",
                borderColor: !isLocked ? "var(--amber)" : "var(--border)",
                boxShadow: !isLocked ? "0 0 8px rgba(255, 180, 84, 0.4)" : "none",
              }}
            >
              {t("unlocked") || "Unlocked (Free Rotation)"}
            </button>

            <button
              type="button"
              onClick={() => setIsLocked(true)}
              className="flex-1 py-1.5 px-1 rounded border font-mono text-[10px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: isLocked ? "var(--cyan)" : "transparent",
                color: isLocked ? "var(--background)" : "var(--foreground)",
                borderColor: isLocked ? "var(--cyan)" : "var(--border)",
                boxShadow: isLocked ? "0 0 8px rgba(54, 197, 217, 0.4)" : "none",
              }}
            >
              {t("locked") || "Tidally Locked"}
            </button>
          </div>

          {/* Speed slider & Bulge indicator readout */}
          <div className="flex justify-between items-center border-t border-border/15 pt-2 text-[9px] font-mono">
            {/* Speed controller */}
            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
              <span className="text-muted text-[8.5px] uppercase">
                {locale === "vi" ? "Tốc độ quỹ đạo" : "Orbit Speed"}:
              </span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
                className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
              />
              <span className="text-foreground w-6 text-right">{speed.toFixed(1)}x</span>
            </div>

            {/* Bulge label alignment info */}
            <div>
              <span className="text-muted mr-1">{t("bulge") || "Tidal bulge alignment"}:</span>
              <span className={isLocked ? "text-cyan font-bold" : "text-amber font-bold"}>
                {isLocked ? "100% (STABLE)" : "LAGGING (TORQUE)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
