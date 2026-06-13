"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

interface CohesionTensionProps {
  locale: string;
}

export default function CohesionTension({ locale }: CohesionTensionProps) {
  const t = useTranslations("viz.cohesionTension");

  const [height, setHeight] = useState(100); // 10m to 350m
  const [transpiration, setTranspiration] = useState(50); // 0% to 100%
  const [isPlaying, setIsPlaying] = useState(true);
  const [offset, setOffset] = useState(0);

  // Compute column tension
  // Height weight adds to tension, transpiration pull adds to tension
  const tension = Math.round((height / 350) * 60 + (transpiration / 100) * 35);
  const isSnapped = tension >= 75;

  // Flow animation tick
  useEffect(() => {
    if (!isPlaying || isSnapped) return;
    let animationId: number;
    const speed = 0.005 + (transpiration / 100) * 0.015;

    const tick = () => {
      setOffset((prev) => (prev - speed) % 1.0);
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, isSnapped, transpiration]);

  const handleReset = () => {
    setHeight(100);
    setTranspiration(50);
    setIsPlaying(true);
  };

  const bubbleColor = isSnapped ? "fill-magenta" : "fill-cyan";
  const glowColor = isSnapped ? "rgba(255, 93, 168, 0.4)" : "rgba(54, 197, 217, 0.4)";

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
        {/* Tree Xylem diagram */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-2">
          <div className="relative w-full h-full bg-void/50 border border-border/20 rounded-xl overflow-hidden flex flex-row p-3 gap-3">
            {/* The Xylem Tube (Left) */}
            <div className="flex-1 h-full relative flex items-center justify-center">
              <svg viewBox="0 0 200 120" className="h-full select-none">
                <title>Cohesion-Tension Xylem Tube Flow</title>

                {/* Xylem Outer Borders */}
                <rect
                  x="85"
                  y="10"
                  width="30"
                  height="100"
                  rx="2"
                  fill="none"
                  className="stroke-border/30 stroke-[1.5]"
                />

                {/* Background water column */}
                {!isSnapped ? (
                  <rect
                    x="86"
                    y="11"
                    width="28"
                    height="98"
                    rx="1"
                    className="fill-cyan/10 transition-colors duration-300"
                  />
                ) : (
                  <>
                    {/* Lower Column */}
                    <rect x="86" y="65" width="28" height="44" className="fill-cyan/5" />
                    {/* Upper Column */}
                    <rect x="86" y="11" width="28" height="44" className="fill-cyan/5" />
                    {/* Cavitation gap marker */}
                    <line
                      x1="80"
                      y1="60"
                      x2="120"
                      y2="60"
                      className="stroke-magenta/50 stroke-1 stroke-dashed"
                    />
                    <text
                      x="124"
                      y="63"
                      className="fill-magenta font-mono text-[6px] uppercase animate-pulse"
                    >
                      SNAP
                    </text>
                  </>
                )}

                {/* Water molecules moving */}
                <g>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const progress = (i / 8 + offset) % 1.0;
                    const yPos = 15 + (progress < 0 ? 1.0 + progress : progress) * 90;

                    // If snapped, molecules around the snap zone (y = 55 to 65) are broken/cavitated
                    if (isSnapped && yPos > 52 && yPos < 68) {
                      return (
                        <circle
                          key={i}
                          cx={90 + (i % 3) * 5 + 5}
                          cy={yPos}
                          r="1.2"
                          className="fill-magenta/40"
                        />
                      );
                    }

                    return (
                      <circle
                        key={i}
                        cx={90 + (i % 3) * 5 + 5}
                        cy={yPos}
                        r="2"
                        className={`${bubbleColor} transition-all duration-300`}
                        style={{
                          filter: `drop-shadow(0 0 2px ${glowColor})`,
                          opacity: isSnapped ? 0.3 : 0.8,
                        }}
                      />
                    );
                  })}
                </g>

                {/* Leaves evaporation indicators at top */}
                <g className="stroke-cyan/30 fill-none stroke-[0.8]">
                  <path
                    d="M 90 10 Q 85 2 92 -2"
                    className={isSnapped ? "opacity-10" : "animate-pulse"}
                  />
                  <path d="M 100 10 Q 100 2 105 -2" className={isSnapped ? "opacity-10" : ""} />
                  <path
                    d="M 110 10 Q 115 2 108 -2"
                    className={isSnapped ? "opacity-10" : "animate-pulse"}
                  />
                </g>
              </svg>
            </div>

            {/* Readouts (Right) */}
            <div className="w-1/3 border-l border-border/15 pl-3 flex flex-col justify-between h-full">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-mono text-muted uppercase">
                    {t("heightLabel") || "Tree Height"}
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground">{height} m</span>
                </div>

                <div className="flex flex-col border-t border-border/10 pt-1.5">
                  <span className="text-[7.5px] font-mono text-muted uppercase">
                    {t("tensionLabel") || "Column Tension"}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSnapped ? "text-magenta" : "text-cyan"
                    }`}
                  >
                    {tension} MPa
                  </span>
                </div>

                <div className="flex flex-col border-t border-border/10 pt-1.5">
                  <span className="text-[7.5px] font-mono text-muted uppercase">
                    {t("stateLabel") || "Column State"}
                  </span>
                  <span
                    className={`font-mono text-[9px] font-bold ${
                      isSnapped ? "text-magenta animate-pulse" : "text-teal"
                    }`}
                  >
                    {isSnapped ? t("stateSnapped") || "Snapped" : t("stateStable") || "Stable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono">
          {/* Sliders Grid */}
          <div className="flex flex-col gap-2">
            {/* Height Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[8.5px] font-mono text-muted w-24 truncate uppercase">
                {t("heightLabel") || "Tree Height"}:
              </span>
              <input
                type="range"
                min="10"
                max="350"
                step="5"
                value={height}
                onChange={(e) => setHeight(Number.parseInt(e.target.value))}
                className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
              />
              <span className="text-foreground w-12 text-right font-bold">{height}m</span>
            </div>

            {/* Transpiration/Sun Slider */}
            <div className="flex items-center gap-3 border-t border-border/10 pt-1.5">
              <span className="text-[8.5px] font-mono text-muted w-24 truncate uppercase">
                {t("sunLabel") || "Sun/Transpiration"}:
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={transpiration}
                onChange={(e) => setTranspiration(Number.parseInt(e.target.value))}
                className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
              />
              <span className="text-foreground w-12 text-right font-bold">{transpiration}%</span>
            </div>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
