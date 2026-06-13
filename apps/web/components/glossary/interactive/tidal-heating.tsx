"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

interface TidalHeatingProps {
  locale: string;
}

export default function TidalHeating({ locale }: TidalHeatingProps) {
  const t = useTranslations("viz.tidalHeating");
  const [eccentricity, setEccentricity] = useState(0.4);
  const [isPlaying, setIsPlaying] = useState(true);
  const [theta, setTheta] = useState(0);

  // Constants
  const center = { x: 200, y: 130 };
  const a = 110; // Semi-major axis

  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;

    const tick = () => {
      setTheta((prev) => {
        // Approximate Keplerian speed: speed up near periapsis, slow down near apoapsis
        // e is current eccentricity
        const b = a * Math.sqrt(1 - eccentricity * eccentricity);
        const c = a * eccentricity;
        const xCenter = center.x - c;
        const x = xCenter + a * Math.cos(prev);
        const y = center.y + b * Math.sin(prev);

        const dx = x - center.x;
        const dy = y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Angular step inversely proportional to distance squared (conservation of angular momentum)
        const step = 0.05 * (a / dist) ** 1.8;
        return (prev + step) % (2 * Math.PI);
      });
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, eccentricity]);

  const b = a * Math.sqrt(1 - eccentricity * eccentricity);
  const c = a * eccentricity;
  const xCenter = center.x - c;

  // Current positions
  const mX = xCenter + a * Math.cos(theta);
  const mY = center.y + b * Math.sin(theta);

  // Distance to Gas Giant
  const dx = mX - center.x;
  const dy = mY - center.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Tidal force scales as 1/d^3. Let's compute a relative heat value [0..1]
  // normalized so that at max eccentricity (0.6) and periapsis, heat = 1
  const periapsisDist = a * (1 - eccentricity);
  const heat = eccentricity > 0 ? eccentricity * (periapsisDist / dist) ** 3 : 0;

  // Moon orientation angle to point to Gas Giant
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;

  // Stretched radius (radial direction) and squished radius (transverse direction)
  const rRadial = 6 + 12 * heat;
  const rTransverse = Math.max(3, 6 - 3 * heat);

  // Interpolate moon core color from cool slate to hot amber
  // We can represent this with radial gradients in SVG
  const coreColor = heat > 0.1 ? "#ffb454" : "#8a93a8"; // Ember Amber or Stone
  const glowColor =
    heat > 0.1 ? `rgba(255, 180, 84, ${0.2 + 0.6 * heat})` : "rgba(138, 147, 168, 0.2)";

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={() => {
        setEccentricity(0.4);
        setTheta(0);
        setIsPlaying(true);
      }}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* Orbit simulation */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-20">
          <svg viewBox="0 0 400 260" className="w-full h-full max-h-[85%] select-none">
            <title>Tidal Heating Simulator</title>
            <defs>
              {/* Gas Giant Glow */}
              <radialGradient id="giantGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0e1320" />
                <stop offset="70%" stopColor="#143b46" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#143b46" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Elliptical Orbit Path */}
            <ellipse
              cx={xCenter}
              cy={center.y}
              rx={a}
              ry={b}
              className="fill-none stroke-border/20 stroke-1 stroke-dasharray-[3,3]"
            />

            {/* Gas Giant at focal point */}
            <circle cx={center.x} cy={center.y} r={35} fill="url(#giantGlow)" />
            <circle
              cx={center.x}
              cy={center.y}
              r={24}
              fill="#070912"
              className="stroke-cyan/40 stroke-2"
              style={{ filter: "drop-shadow(0 0 10px rgba(54, 197, 217, 0.2))" }}
            />
            {/* Atmospheric lines for giant */}
            <line
              x1={center.x - 23}
              y1={center.y - 6}
              x2={center.x + 23}
              y2={center.y - 6}
              className="stroke-cyan/15 stroke-1"
            />
            <line
              x1={center.x - 24}
              y1={center.y + 4}
              x2={center.x + 24}
              y2={center.y + 4}
              className="stroke-cyan/15 stroke-1"
            />

            {/* Moon with tidal flexing */}
            <g transform={`translate(${mX}, ${mY}) rotate(${angleDeg})`}>
              {/* Glow overlay */}
              <ellipse
                cx={0}
                cy={0}
                rx={rRadial + 4}
                ry={rTransverse + 4}
                fill={coreColor}
                opacity={0.3 + 0.5 * heat}
                className="transition-all duration-100"
              />
              {/* Physical body */}
              <ellipse
                cx={0}
                cy={0}
                rx={rRadial}
                ry={rTransverse}
                fill={heat > 0.2 ? "#ffb454" : "#8a93a8"}
                className="stroke-void stroke-1 transition-all duration-100"
                style={{
                  filter: `drop-shadow(0 0 8px ${glowColor})`,
                }}
              />
              {/* Flex lines (glow cracks when hot) */}
              {heat > 0.3 && (
                <line
                  x1={-3}
                  y1={0}
                  x2={3}
                  y2={0}
                  className="stroke-magenta stroke-1.5 animate-pulse"
                />
              )}
            </g>
          </svg>
        </div>

        {/* HUD Overlay for telemetry */}
        <div className="absolute top-16 left-4 bg-void/90 border border-border/40 rounded-xl p-3 min-w-[150px] z-10 shadow-lg">
          <h5 className="text-[10px] font-mono font-bold text-muted uppercase mb-1">TELEMETRY</h5>
          <div className="text-xs font-mono font-semibold tracking-wide">
            {eccentricity > 0.05 ? (
              <span className="text-amber">{t("flexing")}</span>
            ) : (
              <span className="text-teal">{t("circular")}</span>
            )}
          </div>
          <div className="text-[9px] text-muted mt-1 font-mono">
            Heat Energy: <span className="text-foreground">{(heat * 100).toFixed(0)}%</span>
          </div>
          <div className="text-[9px] text-muted mt-0.5 font-mono">
            {t("eccentricity")}: <span className="text-foreground">{eccentricity.toFixed(2)}</span>
          </div>
        </div>

        {/* Bottom controls panel */}
        <div className="relative z-10 w-full flex items-center justify-between gap-4 mt-auto bg-void/65 backdrop-blur-md px-4 py-2 border border-border/30 rounded-xl">
          {/* Eccentricity slider */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] font-mono text-muted uppercase whitespace-nowrap">
              {t("eccentricity")}
            </span>
            <input
              type="range"
              min="0.0"
              max="0.6"
              step="0.05"
              value={eccentricity}
              onChange={(e) => setEccentricity(Number.parseFloat(e.target.value))}
              className="w-full h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[10px] font-mono text-foreground w-10 text-right">
              {eccentricity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
