"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

interface HabitableZoneProps {
  locale: string;
}

export default function HabitableZone({ locale }: HabitableZoneProps) {
  const t = useTranslations("viz.habitableZone");
  const [temp, setTemp] = useState(5800); // Kelvin
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;
    const tick = () => {
      setTime((prev) => prev + 0.04);
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  // Star luminosity relative to the Sun (L ~ T^4 for main sequence approx)
  const l = (temp / 5800) ** 4;

  // Visually scaled radii for orbits
  const center = { x: 200, y: 140 };
  const planetOrbitRadius = 80;

  // Midpoint of habitable zone scaled to look good on screen
  // Damping the massive range of T^4 using a smaller power for visualization
  const hzPosition = planetOrbitRadius * (temp / 5800) ** 1.2;
  const hzWidth = 32 * (temp / 5800) ** 1.2;

  const innerBound = hzPosition - hzWidth / 2;
  const outerBound = hzPosition + hzWidth / 2;

  // Determine planet status
  let statusKey: "scorched" | "temperate" | "frozen" = "temperate";
  let statusText = t("temperate");
  let statusClass = "text-teal";
  let planetColor = "#36c5d9"; // Pandora Cyan
  let planetGlow = "shadow-[0_0_10px_#36c5d9]";

  if (planetOrbitRadius < innerBound) {
    statusKey = "scorched";
    statusText = t("scorched");
    statusClass = "text-magenta";
    planetColor = "#ff5da8"; // Biolum Magenta
    planetGlow = "shadow-[0_0_10px_#ff5da8]";
  } else if (planetOrbitRadius > outerBound) {
    statusKey = "frozen";
    statusText = t("frozen");
    statusClass = "text-muted";
    planetColor = "#8a93a8"; // Stone/Ice
    planetGlow = "shadow-[0_0_10px_#8a93a8]";
  }

  // Interpolate star color and glow based on temperature
  let starColor = "#fff4e8";
  let starGlowColor = "rgba(255, 180, 84, 0.4)"; // Ember Amber
  if (temp < 4500) {
    // Red Dwarf
    starColor = "#ff7c3b";
    starGlowColor = "rgba(255, 93, 168, 0.5)"; // Magenta glow
  } else if (temp < 7000) {
    // G-type yellow-white
    starColor = "#ffeaad";
    starGlowColor = "rgba(255, 180, 84, 0.4)"; // Amber glow
  } else {
    // Blue Giant
    starColor = "#a6e3e9";
    starGlowColor = "rgba(54, 197, 217, 0.6)"; // Cyan glow
  }

  // Planet coordinates
  const pX = center.x + Math.cos(time) * planetOrbitRadius;
  const pY = center.y + Math.sin(time) * planetOrbitRadius;

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={() => {
        setTemp(5800);
        setTime(0);
        setIsPlaying(true);
      }}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* Simulation Canvas */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-20">
          <svg viewBox="0 0 400 280" className="w-full h-full max-h-[85%] select-none">
            <title>Habitable Zone Simulator</title>
            <defs>
              {/* Star Glow */}
              <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={starColor} stopOpacity="1" />
                <stop offset="30%" stopColor={starColor} stopOpacity="0.8" />
                <stop offset="70%" stopColor={starColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor={starColor} stopOpacity="0" />
              </radialGradient>

              {/* Habitable Zone Gradient */}
              <radialGradient id="hzGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(43, 212, 168, 0)" />
                <stop offset="60%" stopColor="rgba(43, 212, 168, 0.18)" />
                <stop offset="85%" stopColor="rgba(43, 212, 168, 0.25)" />
                <stop offset="100%" stopColor="rgba(43, 212, 168, 0)" />
              </radialGradient>
            </defs>

            {/* Orbit paths */}
            <circle
              cx={center.x}
              cy={center.y}
              r={planetOrbitRadius}
              className="fill-none stroke-border/20 stroke-dasharray-[3,3]"
            />

            {/* Shaded Habitable Zone Ring */}
            {outerBound > innerBound && (
              <path
                d={`
                  M ${center.x} ${center.y - outerBound}
                  A ${outerBound} ${outerBound} 0 1 0 ${center.x} ${center.y + outerBound}
                  A ${outerBound} ${outerBound} 0 1 0 ${center.x} ${center.y - outerBound}
                  Z
                  M ${center.x} ${center.y - innerBound}
                  A ${innerBound} ${innerBound} 0 1 1 ${center.x} ${center.y + innerBound}
                  A ${innerBound} ${innerBound} 0 1 1 ${center.x} ${center.y - innerBound}
                  Z
                `}
                fill="url(#hzGradient)"
                fillRule="evenodd"
                className="transition-all duration-300"
              />
            )}

            {/* Habitable zone borders (labels/helpers) */}
            <circle
              cx={center.x}
              cy={center.y}
              r={innerBound}
              className="fill-none stroke-teal/10 stroke-1 transition-all duration-300"
            />
            <circle
              cx={center.x}
              cy={center.y}
              r={outerBound}
              className="fill-none stroke-teal/10 stroke-1 transition-all duration-300"
            />

            {/* Central Star */}
            <circle
              cx={center.x}
              cy={center.y}
              r={25 + temp / 3000}
              fill="url(#starGlow)"
              className="transition-all duration-300"
            />
            <circle
              cx={center.x}
              cy={center.y}
              r={8 + temp / 2000}
              fill={starColor}
              className="transition-all duration-300"
              style={{ filter: `drop-shadow(0 0 12px ${starGlowColor})` }}
            />

            {/* Planet */}
            <g>
              {/* Planet shadow or atmosphere glow */}
              <circle
                cx={pX}
                cy={pY}
                r={6}
                fill={planetColor}
                opacity="0.4"
                className="animate-pulse"
              />
              <circle
                cx={pX}
                cy={pY}
                r={4}
                fill={planetColor}
                className="transition-colors duration-300"
              />
            </g>
          </svg>
        </div>

        {/* HUD Overlay for active planet details */}
        <div className="absolute top-16 left-4 bg-void/90 border border-border/40 rounded-xl p-3 min-w-[150px] z-10 shadow-lg">
          <h5 className="text-[10px] font-mono font-bold text-muted uppercase mb-1">
            {t("status")}
          </h5>
          <div className="text-xs font-mono font-semibold tracking-wide">
            <span className={statusClass}>{statusText}</span>
          </div>
          <div className="text-[10px] text-muted mt-1 font-mono">
            {t("luminosity")}: <span className="text-foreground">{l.toFixed(2)}x</span>
          </div>
          <div className="text-[10px] text-muted mt-0.5 font-mono">
            Temp: <span className="text-foreground">{temp} K</span>
          </div>
        </div>

        {/* Bottom controls panel */}
        <div className="relative z-10 w-full flex items-center justify-between gap-4 mt-auto bg-void/65 backdrop-blur-md px-4 py-2 border border-border/30 rounded-xl">
          {/* Temperature slider */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] font-mono text-muted uppercase whitespace-nowrap">
              {t("star")} Temp
            </span>
            <input
              type="range"
              min="3000"
              max="10000"
              step="100"
              value={temp}
              onChange={(e) => setTemp(Number.parseInt(e.target.value))}
              className="w-full h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[10px] font-mono text-foreground w-14 text-right">{temp} K</span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
