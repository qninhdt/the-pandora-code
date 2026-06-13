"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useMemo } from "react";
import { GlossaryFrame } from "./shared/frame";

interface HalfLifeProps {
  locale: string;
}

export default function HalfLife({ locale }: HalfLifeProps) {
  const t = useTranslations("viz.halfLife");

  const [isPlaying, setIsPlaying] = useState(true);
  const [halfLivesElapsed, setHalfLivesElapsed] = useState(0); // 0 to 4 half-lives

  // Animation tick
  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;

    const tick = () => {
      setHalfLivesElapsed((prev) => {
        const next = prev + 0.01;
        if (next >= 4) {
          setIsPlaying(false);
          return 4;
        }
        return next;
      });
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  // Seeded thresholds for 100 atoms to make slider movement deterministic
  const atomThresholds = useMemo(() => {
    const thresholds: number[] = [];
    // Simple LCG pseudo-random numbers generator
    let seed = 42;
    for (let i = 0; i < 100; i++) {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      thresholds.push(seed / 4294967296);
    }
    return thresholds;
  }, []);

  const fractionRemaining = 0.5 ** halfLivesElapsed;
  const parentPercentage = Math.round(fractionRemaining * 100);

  const handleReset = () => {
    setHalfLivesElapsed(0);
    setIsPlaying(false);
  };

  // SVG grid settings
  const gridSize = 10;
  const spacing = 11;
  const offset = 8;

  // Plot variables
  const plotWidth = 140;
  const plotHeight = 90;
  const plotPadding = 10;

  // Generate path for the exponential decay curve: y = 100 * 0.5^x
  const getCurvePath = () => {
    const pts = [];
    for (let x = 0; x <= 40; x++) {
      const h = x / 10; // half lives
      const yVal = 0.5 ** h;
      const px = plotPadding + (h / 4) * (plotWidth - 2 * plotPadding);
      const py = plotHeight - plotPadding - yVal * (plotHeight - 2 * plotPadding);
      pts.push(`${px},${py}`);
    }
    return `M ${pts.join(" L ")}`;
  };

  // Coordinates of current point on the plot
  const dotX = plotPadding + (halfLivesElapsed / 4) * (plotWidth - 2 * plotPadding);
  const dotY = plotHeight - plotPadding - fractionRemaining * (plotHeight - 2 * plotPadding);

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
        {/* Visualizers Area */}
        <div className="w-full flex-1 flex gap-6 justify-between pb-28 pt-4">
          {/* Left: 10x10 Atom Grid */}
          <div className="flex-1 flex flex-col items-center justify-center bg-void/30 border border-border/15 rounded-xl p-3">
            <svg viewBox="0 0 120 120" className="w-full max-w-[120px] select-none">
              <title>Radioactive parent and daughter atom grid</title>
              {atomThresholds.map((threshold, index) => {
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                const cx = offset + col * spacing;
                const cy = offset + row * spacing;

                const isParent = threshold < fractionRemaining;

                return (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r="4"
                    className={`transition-colors duration-200 ${
                      isParent ? "fill-amber" : "fill-cyan"
                    }`}
                    style={{
                      filter: isParent
                        ? "drop-shadow(0 0 3px rgba(255, 180, 84, 0.4))"
                        : "drop-shadow(0 0 3px rgba(54, 197, 217, 0.4))",
                    }}
                  />
                );
              })}
            </svg>

            {/* Micro legends */}
            <div className="flex justify-center gap-4 text-[7.5px] font-mono mt-3">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber inline-block" />
                <span className="text-amber">{t("parent") || "Parent"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan inline-block" />
                <span className="text-cyan">{t("daughter") || "Daughter"}</span>
              </div>
            </div>
          </div>

          {/* Right: Exponential Decay Curve Plot */}
          <div className="flex-1 flex flex-col items-center justify-center bg-void/30 border border-border/15 rounded-xl p-3">
            <svg viewBox={`0 0 ${plotWidth} ${plotHeight}`} className="w-full select-none">
              <title>Exponential decay plot</title>

              {/* Axes */}
              <line
                x1={plotPadding}
                y1={plotHeight - plotPadding}
                x2={plotWidth - plotPadding}
                y2={plotHeight - plotPadding}
                className="stroke-border/30 stroke-1"
              />
              <line
                x1={plotPadding}
                y1={plotPadding}
                x2={plotPadding}
                y2={plotHeight - plotPadding}
                className="stroke-border/30 stroke-1"
              />

              {/* Curve line */}
              <path d={getCurvePath()} fill="none" className="stroke-muted/50 stroke-1" />

              {/* Highlighted active portion */}
              <path
                d={(() => {
                  const pts = [];
                  const limit = Math.round(halfLivesElapsed * 10);
                  for (let x = 0; x <= limit; x++) {
                    const h = x / 10;
                    const yVal = 0.5 ** h;
                    const px = plotPadding + (h / 4) * (plotWidth - 2 * plotPadding);
                    const py = plotHeight - plotPadding - yVal * (plotHeight - 2 * plotPadding);
                    pts.push(`${px},${py}`);
                  }
                  return pts.length > 0 ? `M ${pts.join(" L ")}` : "";
                })()}
                fill="none"
                className="stroke-amber stroke-2"
                style={{ filter: "drop-shadow(0 0 3px rgba(255, 180, 84, 0.6))" }}
              />

              {/* Ticks & Labels */}
              <line
                x1={plotPadding + (1 / 4) * (plotWidth - 2 * plotPadding)}
                y1={plotHeight - plotPadding}
                x2={plotPadding + (1 / 4) * (plotWidth - 2 * plotPadding)}
                y2={plotHeight - plotPadding + 3}
                className="stroke-border/30 stroke-1"
              />
              <line
                x1={plotPadding + (2 / 4) * (plotWidth - 2 * plotPadding)}
                y1={plotHeight - plotPadding}
                x2={plotPadding + (2 / 4) * (plotWidth - 2 * plotPadding)}
                y2={plotHeight - plotPadding + 3}
                className="stroke-border/30 stroke-1"
              />
              <line
                x1={plotPadding + (3 / 4) * (plotWidth - 2 * plotPadding)}
                y1={plotHeight - plotPadding}
                x2={plotPadding + (3 / 4) * (plotWidth - 2 * plotPadding)}
                y2={plotHeight - plotPadding + 3}
                className="stroke-border/30 stroke-1"
              />
              <line
                x1={plotWidth - plotPadding}
                y1={plotHeight - plotPadding}
                x2={plotWidth - plotPadding}
                y2={plotHeight - plotPadding + 3}
                className="stroke-border/30 stroke-1"
              />

              <text
                x={plotPadding + (2 / 4) * (plotWidth - 2 * plotPadding)}
                y={plotHeight - 1}
                className="fill-muted font-mono text-[6px] text-center"
                textAnchor="middle"
              >
                {t("timeLabel") || "Time (half-lives)"}
              </text>

              {/* Current value dot */}
              <circle
                cx={dotX}
                cy={dotY}
                r="3.5"
                className="fill-amber"
                style={{ filter: "drop-shadow(0 0 4px var(--amber))" }}
              />
            </svg>

            {/* Readouts */}
            <div className="flex flex-col gap-0.5 text-[8px] font-mono mt-3 text-center">
              <div>
                <span className="text-muted">{t("elapsed") || "Elapsed"}:</span>{" "}
                <span className="text-cyan font-bold">
                  {halfLivesElapsed.toFixed(2)} {t("halfLives") || "half-lives"}
                </span>
              </div>
              <div>
                <span className="text-muted">{t("parentLeft") || "Parent Left"}:</span>{" "}
                <span className="text-amber font-bold">{parentPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10">
          {/* Half-lives elapsed slider */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
              {locale === "vi" ? "Thời gian" : "Time Slider"}:
            </span>
            <input
              type="range"
              min="0"
              max="4"
              step="0.05"
              value={halfLivesElapsed}
              onChange={(e) => {
                setHalfLivesElapsed(Number.parseFloat(e.target.value));
                setIsPlaying(false); // Pause when manual slide
              }}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-amber"
            />
            <span className="text-[9px] font-mono text-foreground w-12 text-right">
              {halfLivesElapsed.toFixed(2)} t½
            </span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
