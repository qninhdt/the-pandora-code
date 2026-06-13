"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function TransitTimingVariation() {
  const t = useTranslations("viz.transitTimingVariation");
  const [hasCompanion, setHasCompanion] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [theta, setTheta] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;

    const tick = () => {
      setTheta((prev) => (prev + 0.03) % (2 * Math.PI * 8)); // Run up to 8 orbits
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  const center = { x: 200, y: 70 };
  const rStar = 20;

  // Orbit parameters
  const rPlanet1 = 55;
  const rPlanet2 = 90;

  // Orbit angle calculations
  const orbitAngle = theta % (2 * Math.PI);
  const orbitIndex = Math.floor(theta / (2 * Math.PI)) % 8;

  // Gravitational perturbation (TTV) offset
  // Sinusoidal variation of transit time
  const perturbation = hasCompanion ? 0.08 * Math.sin(orbitIndex * 1.5 + orbitAngle * 0.1) : 0;
  const planet1Angle = orbitAngle + perturbation;

  // Primary planet coordinates (tilted 3D ellipse)
  const p1X = center.x + rPlanet1 * Math.cos(planet1Angle);
  const p1Y = center.y + 18 * Math.sin(planet1Angle);
  const isP1InFront = Math.sin(planet1Angle) > 0;

  // Companion planet coordinates (tilted 3D ellipse, orbits slower)
  const planet2Angle = (theta * 0.45) % (2 * Math.PI);
  const p2X = center.x + rPlanet2 * Math.cos(planet2Angle);
  const p2Y = center.y + 28 * Math.sin(planet2Angle);
  const isP2InFront = Math.sin(planet2Angle) > 0;

  // Transit indicator: primary planet is in front and overlapping star on x-axis
  const isTransiting = isP1InFront && Math.abs(p1X - center.x) < rStar + 3;

  // Light curve value (dips during transit)
  let lightIntensity = 100;
  if (isTransiting) {
    const overlap = Math.max(0, 1 - Math.abs(p1X - center.x) / (rStar + 3));
    lightIntensity = 100 - overlap * 12; // 12% dip
  }

  // TTV Deviation Graph parameters
  const graphX = 60;
  const graphY = 180;
  const graphWidth = 280;
  const graphHeight = 45;

  // Deviation points for orbits 1 to 8
  const points = Array.from({ length: 8 }).map((_, i) => {
    const x = graphX + (i / 7) * graphWidth;
    const deviation = hasCompanion ? 12 * Math.sin(i * 1.5) : 0;
    const y = graphY + graphHeight / 2 - deviation;
    return { x, y, index: i, deviation };
  });

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={() => {
        setHasCompanion(false);
        setTheta(0);
        setIsPlaying(true);
      }}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* Orbits Visualizer */}
        <div className="absolute inset-0 flex flex-col justify-start p-4 pb-20">
          <svg viewBox="0 0 400 240" className="w-full h-full select-none">
            <title>Transit Timing Variations</title>
            <defs>
              <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff4e8" />
                <stop offset="70%" stopColor="#ffeaad" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffeaad" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Orbit Paths (Back Half) */}
            <path
              d={`M ${center.x - rPlanet1} ${center.y} A ${rPlanet1} 18 0 0 1 ${center.x + rPlanet1} ${center.y}`}
              className="fill-none stroke-border/10 stroke-1 stroke-dasharray-[2,2]"
            />
            {hasCompanion && (
              <path
                d={`M ${center.x - rPlanet2} ${center.y} A ${rPlanet2} 28 0 0 1 ${center.x + rPlanet2} ${center.y}`}
                className="fill-none stroke-border/10 stroke-1 stroke-dasharray-[2,2]"
              />
            )}

            {/* Planets behind star */}
            {!isP1InFront && <circle cx={p1X} cy={p1Y} r={3} fill="#8a93a8" opacity="0.7" />}
            {hasCompanion && !isP2InFront && (
              <circle cx={p2X} cy={p2Y} r={2} fill="#8a93a8" opacity="0.6" />
            )}

            {/* Star */}
            <circle cx={center.x} cy={center.y} r={rStar + 10} fill="url(#starGlow)" />
            <circle
              cx={center.x}
              cy={center.y}
              r={rStar}
              fill="#ffeaad"
              style={{ filter: "drop-shadow(0 0 10px rgba(255, 234, 173, 0.4))" }}
            />

            {/* Orbit Paths (Front Half) */}
            <path
              d={`M ${center.x + rPlanet1} ${center.y} A ${rPlanet1} 18 0 0 1 ${center.x - rPlanet1} ${center.y}`}
              className="fill-none stroke-border/20 stroke-1"
            />
            {hasCompanion && (
              <path
                d={`M ${center.x + rPlanet2} ${center.y} A ${rPlanet2} 28 0 0 1 ${center.x - rPlanet2} ${center.y}`}
                className="fill-none stroke-border/20 stroke-1"
              />
            )}

            {/* Planets in front of star */}
            {isP1InFront && (
              <circle
                cx={p1X}
                cy={p1Y}
                r={4}
                fill={isTransiting ? "#070912" : "#36c5d9"}
                className="stroke-cyan/50 stroke-0.5"
                style={{
                  filter: isTransiting ? "none" : "drop-shadow(0 0 4px var(--cyan))",
                }}
              />
            )}
            {hasCompanion && isP2InFront && (
              <circle
                cx={p2X}
                cy={p2Y}
                r={2.5}
                fill="#ff5da8"
                style={{ filter: "drop-shadow(0 0 4px var(--magenta))" }}
              />
            )}

            {/* Transit Timing Deviation Plot */}
            <g>
              {/* Box border */}
              <rect
                x={graphX - 10}
                y={graphY - 5}
                width={graphWidth + 20}
                height={graphHeight + 10}
                rx={6}
                fill="#070912"
                className="stroke-border/20 stroke-1"
              />

              {/* Zero deviation line */}
              <line
                x1={graphX}
                y1={graphY + graphHeight / 2}
                x2={graphX + graphWidth}
                y2={graphY + graphHeight / 2}
                className="stroke-border/10 stroke-0.5 stroke-dasharray-[2,2]"
              />

              {/* Deviation sine line (if companion active) */}
              {hasCompanion && (
                <path
                  d={`M ${points[0].x} ${points[0].y} ${points.map((p) => `L ${p.x} ${p.y}`).join(" ")}`}
                  fill="none"
                  className="stroke-magenta/30 stroke-1"
                />
              )}

              {/* Graph points */}
              {points.map((pt) => {
                const isActive = orbitIndex === pt.index;
                return (
                  <g key={pt.index}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? 4.5 : 2.5}
                      fill={isActive ? (hasCompanion ? "#ff5da8" : "#36c5d9") : "#8a93a8"}
                      style={{
                        filter: isActive
                          ? `drop-shadow(0 0 4px ${hasCompanion ? "var(--magenta)" : "var(--cyan)"})`
                          : "none",
                      }}
                    />
                    <text
                      x={pt.x}
                      y={graphY + graphHeight + 6}
                      className="fill-muted/40 text-[5px] font-mono"
                      textAnchor="middle"
                    >
                      E{pt.index + 1}
                    </text>
                  </g>
                );
              })}

              {/* Graph Label */}
              <text x={graphX} y={graphY + 6} className="fill-muted/40 text-[6px] font-mono">
                {t("deviation")}
              </text>
            </g>
          </svg>
        </div>

        {/* HUD Indicator */}
        <div className="absolute top-16 left-4 right-4 flex justify-between gap-4 pointer-events-none z-10">
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 min-w-[150px] pointer-events-auto shadow-lg">
            <h5 className="text-[10px] font-mono font-bold text-muted uppercase mb-1">
              OBSERVATION
            </h5>
            <div className="text-xs font-mono font-semibold tracking-wide">
              {hasCompanion ? (
                <span className="text-magenta">{t("perturbed")}</span>
              ) : (
                <span className="text-teal">{t("regular")}</span>
              )}
            </div>
            <div className="text-[9px] text-muted mt-1 font-mono">
              Orbit Index: <span className="text-foreground">#{orbitIndex + 1}/8</span>
            </div>
          </div>

          {/* Light curve meter */}
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 min-w-[130px] pointer-events-auto flex flex-col justify-center shadow-lg">
            <div className="flex justify-between text-[9px] font-mono text-muted mb-1">
              <span>LIGHT CURVE</span>
              <span className={isTransiting ? "text-cyan animate-pulse" : "text-muted"}>
                {lightIntensity.toFixed(0)}%
              </span>
            </div>
            <div className="relative w-full h-2 rounded bg-surface border border-border/20 overflow-hidden">
              <div
                className="h-full bg-cyan transition-all duration-100"
                style={{ width: `${lightIntensity}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom controls panel */}
        <div className="relative z-10 w-full flex items-center justify-between gap-6 mt-auto bg-void/65 backdrop-blur-md px-4 py-2.5 border border-border/30 rounded-xl">
          {/* Companion Planet Toggle */}
          <button
            type="button"
            onClick={() => setHasCompanion(!hasCompanion)}
            className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg border cursor-pointer transition-all ${
              hasCompanion
                ? "bg-magenta/10 border-magenta text-magenta"
                : "bg-surface border-border hover:border-magenta/50 text-muted"
            }`}
          >
            {t("companion")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
