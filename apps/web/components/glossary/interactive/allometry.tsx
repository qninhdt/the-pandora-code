"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function Allometry() {
  const t = useTranslations("viz.allometry");
  const [scale, setScale] = useState(1); // Scale factor 1x to 4x
  const [isAllometric, setIsAllometric] = useState(true);

  // Math equations for scaling
  const baseWeightKg = 400; // base direhorse weight
  const baseBoneWidth = 8; // base bone thickness in SVG

  const lengthMultiple = scale;
  const weightKg = Math.round(baseWeightKg * scale ** 3);

  // Isometric: bone width scales linearly (scale)
  // Allometric: bone width scales to maintain strength-to-weight ratio (scale^1.5 or scale^1.7)
  const boneWidth = isAllometric ? baseBoneWidth * scale ** 1.5 : baseBoneWidth * scale;

  const strengthFactor = scale ** 2; // bone cross-sectional area
  const stressFactor = scale ** 3 / strengthFactor; // stress = force / area = scale

  const boneStressPercent = Math.min(100, Math.round(stressFactor * 25));

  let statusText = t("statusStable");
  let statusClass = "text-teal";

  if (!isAllometric && scale > 1.8) {
    statusText = t("statusOverloaded");
    statusClass = "text-magenta animate-pulse";
  }

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={isAllometric ? t("infoAllometric") : t("infoIsometric")}
      onReset={() => {
        setScale(1);
        setIsAllometric(true);
      }}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* SVG Skeleton Diagram */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-36">
          <svg viewBox="0 0 400 200" className="w-full h-full max-h-[85%] select-none">
            <title>Skeletal bone scaling</title>

            {/* Ground line */}
            <line x1="40" y1="180" x2="360" y2="180" className="stroke-border stroke-1" />

            {/* Stylized Quadrupedal animal frame */}
            <g className="transition-all duration-300">
              {/* Back spine bone */}
              <path
                d="M 120 100 Q 200 90 280 110"
                fill="none"
                stroke="var(--border-strong)"
                strokeWidth="3"
              />

              {/* Head profile */}
              <circle
                cx="100"
                cy="80"
                r="15"
                fill="none"
                stroke="var(--border)"
                strokeWidth="1.5"
              />
              <line x1="100" y1="80" x2="120" y2="100" stroke="var(--border)" strokeWidth="2" />

              {/* Legs (Bones showing thickness) */}
              {/* Foreleg */}
              <line
                x1="150"
                y1="100"
                x2="150"
                y2="180"
                stroke="var(--cyan)"
                strokeWidth={boneWidth}
                strokeLinecap="round"
                className="transition-all duration-300"
                style={{ filter: "drop-shadow(0 0 5px rgba(54, 197, 217, 0.3))" }}
              />

              {/* Hind leg */}
              <line
                x1="250"
                y1="105"
                x2="250"
                y2="180"
                stroke="var(--cyan)"
                strokeWidth={boneWidth}
                strokeLinecap="round"
                className="transition-all duration-300"
                style={{ filter: "drop-shadow(0 0 5px rgba(54, 197, 217, 0.3))" }}
              />

              {/* Weight pressure lines (downward arrows) */}
              {scale > 1.2 && (
                <g
                  className="stroke-magenta fill-none stroke-[1.5] animate-bounce"
                  style={{ animationDuration: "2s" }}
                >
                  <path d="M 200 60 L 200 85 M 195 80 L 200 85 L 205 80" />
                  {scale > 2.5 && (
                    <>
                      <path d="M 170 65 L 170 85 M 167 80 L 170 85 L 173 80" />
                      <path d="M 230 65 L 230 85 M 227 80 L 230 85 L 233 80" />
                    </>
                  )}
                </g>
              )}
            </g>
          </svg>
        </div>

        {/* HUD Readout */}
        <div className="absolute top-16 left-4 right-4 flex justify-between gap-4 pointer-events-none z-10">
          {/* Stats Box */}
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 w-[150px] pointer-events-auto shadow-lg flex flex-col justify-center">
            <h5 className="text-[9px] font-mono font-bold text-muted uppercase mb-0.5">
              {t("mass")}
            </h5>
            <div className="text-sm font-mono font-bold text-foreground">
              {weightKg} kg{" "}
              <span className="text-[9px] text-muted">({lengthMultiple.toFixed(1)}x size)</span>
            </div>
            <div className="text-[8px] text-muted/80 mt-1 font-mono">
              {t("boneWidth")}{" "}
              <span className="text-cyan">{Math.round(boneWidth * 10) / 10}px</span>
            </div>
          </div>

          {/* Stress Meter */}
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 flex-1 pointer-events-auto shadow-lg flex flex-col justify-center max-w-[180px]">
            <h6 className="text-[8px] font-mono font-bold text-muted uppercase mb-0.5">
              {t("boneStress")}
            </h6>
            <div className="text-[10px] font-mono font-semibold tracking-wide mb-1">
              <span className={statusClass}>{statusText}</span>
            </div>
            <div className="relative w-full h-2 rounded bg-surface border border-border/20 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  !isAllometric && scale > 1.8 ? "bg-magenta animate-pulse" : "bg-teal"
                }`}
                style={{ width: `${boneStressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 w-full bg-void/65 backdrop-blur-md px-4 py-3 border border-border/30 rounded-xl flex flex-col gap-3 mt-auto">
          {/* Scale slider */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted uppercase w-20 truncate">
              {t("sizeLabel")}
            </span>
            <input
              type="range"
              min="1"
              max="4"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Number.parseFloat(e.target.value))}
              className="flex-1 h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[9px] font-mono text-foreground w-6 text-right">
              {scale.toFixed(1)}x
            </span>
          </div>

          {/* Mode toggle button */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsAllometric(false)}
              className="flex-1 py-1.5 px-1 rounded border font-mono text-[10px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: !isAllometric ? "var(--amber)" : "transparent",
                color: !isAllometric ? "var(--background)" : "var(--foreground)",
                borderColor: !isAllometric ? "var(--amber)" : "var(--border)",
                boxShadow: !isAllometric ? "0 0 8px rgba(255, 180, 84, 0.4)" : "none",
              }}
            >
              ISOMETRY (Linear)
            </button>

            <button
              type="button"
              onClick={() => setIsAllometric(true)}
              className="flex-1 py-1.5 px-1 rounded border font-mono text-[10px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: isAllometric ? "var(--teal)" : "transparent",
                color: isAllometric ? "var(--background)" : "var(--foreground)",
                borderColor: isAllometric ? "var(--teal)" : "var(--border)",
                boxShadow: isAllometric ? "0 0 8px rgba(43, 212, 168, 0.4)" : "none",
              }}
            >
              ALLOMETRY (Non-linear)
            </button>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
