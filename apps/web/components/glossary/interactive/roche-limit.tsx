"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

interface RocheLimitProps {
  locale: string;
}

interface Particle {
  id: number;
  radius: number;
  speed: number;
  angle: number;
  color: string;
  size: number;
}

export default function RocheLimit({ locale }: RocheLimitProps) {
  const t = useTranslations("viz.rocheLimit");
  const [radius, setRadius] = useState(2.2); // Relative units (0.6 .. 3.0)
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize ring particles once
  useEffect(() => {
    const p: Particle[] = [];
    const colors = ["#36c5d9", "#2bd4a8", "#ff5da8", "#ffb454", "#8a93a8"];
    for (let i = 0; i < 50; i++) {
      p.push({
        id: i,
        // Particle radii distributed between 50 and 85 pixels
        radius: 45 + Math.random() * 45,
        speed: 0.04 + Math.random() * 0.04,
        angle: Math.random() * 2 * Math.PI,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1 + Math.random() * 2,
      });
    }
    setParticles(p);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;
    const tick = () => {
      setTime((prev) => prev + 0.03);
      setParticles((prev) =>
        prev.map((pt) => ({
          ...pt,
          angle: (pt.angle + pt.speed) % (2 * Math.PI),
        })),
      );
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  const center = { x: 200, y: 135 };
  const visualScale = 60; // Scale from relative unit to pixels
  const visualRadius = radius * visualScale;

  // Roche limit is set to 1.35 relative units (~81 pixels)
  const rocheLimitVal = 1.35;
  const visualRocheLimit = rocheLimitVal * visualScale;

  // States
  const isShattered = radius <= 1.05;
  const isDisintegrating = radius <= rocheLimitVal && !isShattered;

  // Moon coords if not shattered
  const mX = center.x + Math.cos(time) * visualRadius;
  const mY = center.y + Math.sin(time) * visualRadius;

  // Warp parameters (stretch moon as it gets close to limit)
  let moonWidth = 7;
  let moonHeight = 7;
  let rotationDeg = 0;

  if (isDisintegrating) {
    const stretchFactor = 1 + (rocheLimitVal - radius) * 2;
    moonWidth = 7 * stretchFactor;
    moonHeight = Math.max(3, 7 / Math.sqrt(stretchFactor));
    // Points toward the center giant
    rotationDeg = (Math.atan2(mY - center.y, mX - center.x) * 180) / Math.PI;
  }

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={() => {
        setRadius(2.2);
        setTime(0);
        setIsPlaying(true);
      }}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* Orbital View */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-20">
          <svg viewBox="0 0 400 270" className="w-full h-full max-h-[85%] select-none">
            <title>Roche Limit Breakup Simulator</title>
            <defs>
              {/* Giant Glow */}
              <radialGradient id="giantGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0e1320" />
                <stop offset="70%" stopColor="#143b46" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#143b46" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Roche Limit circle */}
            <circle
              cx={center.x}
              cy={center.y}
              r={visualRocheLimit}
              className="fill-none stroke-magenta/30 stroke-1 stroke-dasharray-[4,4]"
            />
            {/* Label for Roche Limit */}
            <text
              x={center.x + visualRocheLimit}
              y={center.y + 12}
              className="fill-magenta/60 text-[7px] font-mono"
            >
              LIMIT
            </text>

            {/* Orbit path for moon */}
            {!isShattered && (
              <circle
                cx={center.x}
                cy={center.y}
                r={visualRadius}
                className="fill-none stroke-border/20 stroke-1 transition-all duration-300"
              />
            )}

            {/* Central Planet */}
            <circle cx={center.x} cy={center.y} r={40} fill="url(#giantGlow)" />
            <circle
              cx={center.x}
              cy={center.y}
              r={26}
              fill="#070912"
              className="stroke-cyan/30 stroke-2"
              style={{ filter: "drop-shadow(0 0 10px rgba(54, 197, 217, 0.25))" }}
            />
            <circle
              cx={center.x}
              cy={center.y}
              r={22}
              fill="none"
              className="stroke-cyan/15 stroke-1"
            />

            {/* Moon / Particles */}
            {isShattered ? (
              // Shattered particles forming a ring
              <g>
                {particles.map((pt) => {
                  const px = center.x + Math.cos(pt.angle) * pt.radius;
                  const py = center.y + Math.sin(pt.angle) * pt.radius;
                  return (
                    <circle
                      key={pt.id}
                      cx={px}
                      cy={py}
                      r={pt.size}
                      fill={pt.color}
                      style={{ filter: `drop-shadow(0 0 2px ${pt.color})` }}
                    />
                  );
                })}
              </g>
            ) : (
              // Intact or warping moon
              <g transform={`translate(${mX}, ${mY}) rotate(${rotationDeg})`}>
                <ellipse
                  cx={0}
                  cy={0}
                  rx={moonWidth + 3}
                  ry={moonHeight + 3}
                  fill={isDisintegrating ? "#ff5da8" : "#36c5d9"}
                  opacity="0.25"
                />
                <ellipse
                  cx={0}
                  cy={0}
                  rx={moonWidth}
                  ry={moonHeight}
                  fill={isDisintegrating ? "#ff5da8" : "#36c5d9"}
                  className="stroke-void stroke-0.5"
                  style={{
                    filter: `drop-shadow(0 0 6px ${isDisintegrating ? "#ff5da8" : "#36c5d9"})`,
                  }}
                />
              </g>
            )}
          </svg>
        </div>

        {/* HUD Indicator */}
        <div className="absolute top-16 left-4 bg-void/90 border border-border/40 rounded-xl p-3 min-w-[155px] z-10 shadow-lg">
          <h5 className="text-[10px] font-mono font-bold text-muted uppercase mb-1">STATUS</h5>
          <div className="text-xs font-mono font-semibold tracking-wide">
            {isShattered ? (
              <span className="text-magenta">{t("ring")}</span>
            ) : isDisintegrating ? (
              <span className="text-amber">{t("disintegrating")}</span>
            ) : (
              <span className="text-teal">{t("stable")}</span>
            )}
          </div>
          <div className="text-[9px] text-muted mt-1 font-mono">
            {t("radius")}: <span className="text-foreground">{radius.toFixed(2)} R</span>
          </div>
          <div className="text-[9px] text-muted mt-0.5 font-mono">
            {t("limit")}: <span className="text-foreground">{rocheLimitVal.toFixed(2)} R</span>
          </div>
        </div>

        {/* Bottom controls panel */}
        <div className="relative z-10 w-full flex items-center justify-between gap-4 mt-auto bg-void/65 backdrop-blur-md px-4 py-2 border border-border/30 rounded-xl">
          {/* Radius slider */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] font-mono text-muted uppercase whitespace-nowrap">
              {t("radius")}
            </span>
            <input
              type="range"
              min="0.7"
              max="3.0"
              step="0.05"
              value={radius}
              onChange={(e) => setRadius(Number.parseFloat(e.target.value))}
              className="w-full h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[10px] font-mono text-foreground w-10 text-right">
              {radius.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
