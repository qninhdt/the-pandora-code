"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function DynamicSoaring() {
  const t = useTranslations("viz.dynamicSoaring");

  const [shearStrength, setShearStrength] = useState(70); // 0% to 100%
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0); // Animation timer

  // Flight path loop timer
  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;

    const tick = () => {
      setTime((prev) => (prev + 0.01) % 1.0);
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  const handleReset = () => {
    setShearStrength(70);
    setIsPlaying(true);
    setTime(0);
  };

  // Trajectory equations:
  // t goes 0 -> 1
  // We trace a loop:
  // x: center around 180, radius 80
  // y: center around 60, radius 40
  const angle = time * Math.PI * 2;
  const birdX = 187 + Math.cos(angle) * 110;
  // Altitude goes from 20 to 100
  const birdY = 60 - Math.sin(angle) * 40;

  // Ascent is when moving upwards (sin(angle) is positive, Y is decreasing because Y=0 is top)
  // i.e., angle between 0 and PI
  const isAscent = Math.sin(angle) > 0;

  // Wind speed at current bird altitude (higher altitude = stronger wind)
  const altitude = Math.max(0, 100 - birdY); // 0 to 100
  const baseWind = (altitude / 100) * 45;
  const actualWind = baseWind * (shearStrength / 100);

  // Airspeed gains on ascent because of wind gradient, loses on descent
  // Energy harvested accumulates when climbing through wind shear
  const energyGain =
    shearStrength > 30 && isAscent ? Math.round((altitude / 100) * 15 * (shearStrength / 100)) : 0;
  const currentSpeed = Math.round(35 + (isAscent ? actualWind * 0.8 : -actualWind * 0.2));

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
        {/* Wind gradient view */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-2">
          <div className="relative w-full h-full bg-void/50 border border-border/20 rounded-xl overflow-hidden">
            <svg viewBox="0 0 375 130" className="w-full h-full select-none">
              <title>Dynamic Soaring Trajectory and Wind Gradient</title>

              {/* Sea level (bottom) */}
              <line x1="10" y1="110" x2="365" y2="110" className="stroke-cyan/20 stroke-1" />

              {/* Wind Speed Gradient (Horizontal vector lines at different heights) */}
              {Array.from({ length: 5 }).map((_, i) => {
                const yPos = 20 + i * 20;
                const alt = 100 - yPos;
                const windLen = (alt / 100) * 80 * (shearStrength / 100);
                return (
                  <g key={i} className="opacity-40">
                    {/* Wind vector arrow */}
                    <line
                      x1="20"
                      y1={yPos}
                      x2={20 + windLen}
                      y2={yPos}
                      className="stroke-cyan stroke-[1.2]"
                    />
                    <path
                      d={`M ${20 + windLen} ${yPos} L ${17 + windLen} ${yPos - 2.5} L ${17 + windLen} ${yPos + 2.5} Z`}
                      className="fill-cyan"
                    />
                  </g>
                );
              })}

              {/* Wind Gradient label */}
              <text x="20" y="116" className="fill-muted font-mono text-[7px] text-right">
                {t("seaLevel")}
              </text>
              <text x="20" y="12" className="fill-cyan font-mono text-[6.5px]">
                {t("windGradient") || "Wind Gradient"}
              </text>

              {/* Flight Trajectory Loop */}
              <path
                d="M 297 60 A 110 40 0 1 1 77 60 A 110 40 0 1 1 297 60"
                fill="none"
                className="stroke-border/20 stroke-[1.5]"
                strokeDasharray="4,4"
              />

              {/* The Bird (representing albatross/banshee) */}
              <g transform={`translate(${birdX}, ${birdY})`}>
                {/* Simple wing glide shape */}
                <path
                  d="M -12 -2 Q 0 -6 12 -2 Q 4 0 0 4 Q -4 0 -12 -2 Z"
                  className={isAscent ? "fill-teal" : "fill-cyan"}
                  style={{
                    filter: `drop-shadow(0 0 4px ${isAscent ? "var(--teal)" : "var(--cyan)"})`,
                    transform: `rotate(${isAscent ? -15 : 15}deg)`,
                  }}
                />
                <circle cx="0" cy="0" r="1.5" className="fill-foreground" />
              </g>

              {/* Energy harvest glowing indicators */}
              {isAscent && shearStrength > 30 && (
                <g className="stroke-teal/30 fill-none stroke-[0.8]">
                  <circle cx={birdX} cy={birdY} r="8" className="stroke-teal/30 animate-ping" />
                </g>
              )}
            </svg>

            {/* Readouts */}
            <div className="absolute top-2 left-2 flex gap-3 text-[8.5px] font-mono pointer-events-none">
              <div>
                <span className="text-muted mr-1">{t("modeLabel") || "Phase"}:</span>
                <span className={isAscent ? "text-teal font-bold" : "text-cyan font-bold"}>
                  {isAscent ? t("phaseAscent") || "Ascent" : t("phaseDescent") || "Descent"}
                </span>
              </div>
              <div>
                <span className="text-muted mr-1">Airspeed:</span>
                <span className="text-foreground font-bold">{currentSpeed} kt</span>
              </div>
              <div>
                <span className="text-muted mr-1">{t("energyLabel") || "Energy"}:</span>
                <span
                  className={`${energyGain > 0 ? "text-teal animate-pulse" : "text-muted"} font-bold`}
                >
                  +{energyGain} J
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono">
          {/* Wind Shear slider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted uppercase">
              {t("windShear")}:
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={shearStrength}
              onChange={(e) => setShearStrength(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-foreground w-12 text-right font-bold">{shearStrength}%</span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
