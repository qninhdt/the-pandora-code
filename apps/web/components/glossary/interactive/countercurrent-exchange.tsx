"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function CountercurrentExchange() {
  const t = useTranslations("viz.countercurrent");
  const [isCounter, setIsCounter] = useState(true);

  // Saturation levels at 5 key points along the frond
  // Concurrent (Same way): water 100->50, blood 0->50
  const concurrentWater = [100, 75, 60, 52, 50];
  const concurrentBlood = [0, 25, 40, 48, 50];

  // Countercurrent (Opposed): water 100<-10, blood 90<-0 (opposite direction)
  // Shown left-to-right:
  // Water flows right-to-left: 10% (left) <- 100% (right)
  // Blood flows left-to-right: 0% (left) -> 90% (right)
  const counterWater = [10, 30, 50, 75, 100];
  const counterBlood = [0, 22, 45, 68, 90];

  const activeWater = isCounter ? counterWater : concurrentWater;
  const activeBlood = isCounter ? counterBlood : concurrentBlood;
  const extractionVal = isCounter ? 90 : 50;

  // Diffusion particles animation state
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={isCounter ? t("countercurrentNote") : t("concurrentNote")}
      onReset={() => setIsCounter(true)}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* SVG Flow diagram */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-36">
          <svg viewBox="0 0 400 200" className="w-full h-full max-h-[85%] select-none">
            <title>Gas exchange flow</title>

            {/* Membrane boundary line */}
            <line
              x1="50"
              y1="100"
              x2="350"
              y2="100"
              className="stroke-border stroke-2"
              strokeDasharray="4,4"
            />
            <text x="355" y="103" className="fill-muted/40 text-[7px] font-mono">
              MEMBRANE
            </text>

            {/* WATER FROND (Top tube) */}
            <g>
              {/* Tube outline */}
              <rect
                x="50"
                y="40"
                width="300"
                height="40"
                fill="rgba(54, 197, 217, 0.05)"
                className="stroke-cyan/15 stroke-[1]"
              />

              {/* Flow Direction Arrow */}
              {isCounter ? (
                // Right to left flow
                <path
                  d="M 330 60 L 310 60 M 315 55 L 310 60 L 315 65"
                  fill="none"
                  stroke="var(--cyan)"
                  strokeWidth="1.5"
                />
              ) : (
                // Left to right flow
                <path
                  d="M 70 60 L 90 60 M 85 55 L 90 60 L 85 65"
                  fill="none"
                  stroke="var(--cyan)"
                  strokeWidth="1.5"
                />
              )}

              {/* Water Label */}
              <text x="60" y="55" className="fill-cyan font-mono text-[9px] font-bold">
                {t("water").toUpperCase()}
              </text>

              {/* Saturation values labels */}
              {activeWater.map((val, i) => (
                <text
                  key={`wat-${i}`}
                  x={50 + 75 * i}
                  y="73"
                  className="fill-cyan/95 text-[9px] font-mono font-semibold"
                  textAnchor="middle"
                >
                  {val}%
                </text>
              ))}
            </g>

            {/* BLOOD VESSEL (Bottom tube) */}
            <g>
              {/* Tube outline */}
              <rect
                x="50"
                y="120"
                width="300"
                height="40"
                fill="rgba(255, 93, 168, 0.05)"
                className="stroke-magenta/15 stroke-[1]"
              />

              {/* Blood flow direction (Always left-to-right) */}
              <path
                d="M 70 140 L 90 140 M 85 135 L 90 140 L 85 145"
                fill="none"
                stroke="var(--magenta)"
                strokeWidth="1.5"
              />

              {/* Blood Label */}
              <text x="60" y="135" className="fill-magenta font-mono text-[9px] font-bold">
                {t("blood").toUpperCase()}
              </text>

              {/* Saturation values labels */}
              {activeBlood.map((val, i) => (
                <text
                  key={`bld-${i}`}
                  x={50 + 75 * i}
                  y="153"
                  className="fill-magenta/95 text-[9px] font-mono font-semibold"
                  textAnchor="middle"
                >
                  {val}%
                </text>
              ))}
            </g>

            {/* Oxygen molecules diffusing across membrane */}
            <g opacity="0.8">
              {[0, 1, 2, 3].map((i) => {
                // Determine horizontal positions for moving molecules
                const offset = (tick + i * 25) % 100;
                const pct = offset / 100;

                // Concurrent has diffusion only on the left side
                // Countercurrent has active diffusion across the entire span
                const isDiffusing = !isCounter ? pct < 0.55 : true;

                if (!isDiffusing) return null;

                const x = 70 + pct * 240;
                const y = 80 + (offset % 10) * 4; // drifting downwards

                return (
                  <circle
                    key={`o2-${i}`}
                    cx={x}
                    cy={y}
                    r="2.5"
                    fill="var(--cyan)"
                    style={{ filter: "drop-shadow(0 0 3px var(--cyan))" }}
                  />
                );
              })}
            </g>
          </svg>
        </div>

        {/* HUD readout for efficiency */}
        <div className="absolute top-16 left-4 right-4 flex justify-between gap-4 pointer-events-none z-10">
          {/* Efficiency indicator */}
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 w-[150px] pointer-events-auto shadow-lg flex flex-col justify-center">
            <h5 className="text-[9px] font-mono font-bold text-muted uppercase mb-0.5">
              {t("extraction")}
            </h5>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl font-display font-bold tabular-nums ${isCounter ? "text-teal" : "text-amber"}`}
              >
                {extractionVal}%
              </span>
              <span className="text-[8px] font-mono text-muted">MAX</span>
            </div>
            <div className="w-full bg-surface h-1 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-500 ${isCounter ? "bg-teal" : "bg-amber"}`}
                style={{ width: `${extractionVal}%` }}
              />
            </div>
          </div>

          {/* Mode label */}
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 flex-1 pointer-events-auto shadow-lg flex flex-col justify-center max-w-[180px]">
            <h6 className="text-[8px] font-mono font-bold text-muted uppercase mb-0.5">
              {t("slope")}
            </h6>
            <div className="text-[10px] font-mono font-semibold text-foreground">
              {isCounter ? "Constant Delta" : "Decaying Delta"}
            </div>
            <div className="text-[8px] text-muted/80 leading-relaxed font-sans mt-0.5">
              {isCounter
                ? "Oxygen flows across the entire length."
                : "Diffusion stops at 50% equilibration."}
            </div>
          </div>
        </div>

        {/* Dynamic toggle buttons */}
        <div className="relative z-10 w-full bg-void/65 backdrop-blur-md px-4 py-3 border border-border/30 rounded-xl flex gap-3 mt-auto">
          {/* Concurrent Button */}
          <button
            type="button"
            onClick={() => setIsCounter(false)}
            className="flex-1 py-2 px-1 rounded border font-mono text-xs text-center transition-all duration-200 select-none hover:bg-surface-overlay"
            style={{
              backgroundColor: !isCounter ? "var(--amber)" : "transparent",
              color: !isCounter ? "var(--background)" : "var(--foreground)",
              borderColor: !isCounter ? "var(--amber)" : "var(--border)",
              boxShadow: !isCounter ? "0 0 8px rgba(255, 180, 84, 0.4)" : "none",
            }}
          >
            {t("concurrent")}
          </button>

          {/* Countercurrent Button */}
          <button
            type="button"
            onClick={() => setIsCounter(true)}
            className="flex-1 py-2 px-1 rounded border font-mono text-xs text-center transition-all duration-200 select-none hover:bg-surface-overlay"
            style={{
              backgroundColor: isCounter ? "var(--teal)" : "transparent",
              color: isCounter ? "var(--background)" : "var(--foreground)",
              borderColor: isCounter ? "var(--teal)" : "var(--border)",
              boxShadow: isCounter ? "0 0 8px rgba(43, 212, 168, 0.4)" : "none",
            }}
          >
            {t("countercurrent")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
