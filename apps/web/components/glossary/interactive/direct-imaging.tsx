"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function DirectImaging() {
  const t = useTranslations("viz.directImaging");
  const [maskOn, setMaskOn] = useState(false);
  const [contrast, setContrast] = useState(50); // Exposure / Contrast (1..100)

  const starCenter = { x: 200, y: 130 };
  const planetCenter = { x: 275, y: 110 };

  // Glare radius scales with exposure (contrast)
  const glareRadius = 40 + contrast * 1.5;

  // Planet visibility depends on mask state and exposure level
  // Too low exposure: too dark to see. Too high exposure: background noise is too high.
  // Best exposure is around 40-75% when mask is ON
  let planetOpacity = 0;
  let detectStatus = t("starGlare");
  let statusClass = "text-magenta";

  if (maskOn) {
    if (contrast < 20) {
      planetOpacity = contrast / 20; // Faint
      detectStatus = t("underexposed");
      statusClass = "text-muted";
    } else if (contrast > 85) {
      planetOpacity = Math.max(0, 1 - (contrast - 85) / 15); // Glared out again
      detectStatus = t("instrumentGlare");
      statusClass = "text-amber";
    } else {
      planetOpacity = 1.0;
      detectStatus = t("planetDetected");
      statusClass = "text-teal";
    }
  }

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={() => {
        setMaskOn(false);
        setContrast(50);
      }}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* Sky View */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-20 bg-void/50">
          <svg viewBox="0 0 400 260" className="w-full h-full max-h-[85%] select-none">
            <title>Direct Imaging & Coronagraph Mask</title>
            <defs>
              {/* Star Glare Gradient */}
              <radialGradient id="starGlareGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <stop offset="10%" stopColor="#fff" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#ffeaad" stopOpacity="0.5" />
                <stop offset="75%" stopColor="#ffb454" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ffb454" stopOpacity="0" />
              </radialGradient>

              {/* Instrument diffraction ring glow when masked */}
              <radialGradient id="diffractGlow" cx="50%" cy="50%" r="50%">
                <stop offset="40%" stopColor="rgba(255, 180, 84, 0)" />
                <stop offset="70%" stopColor="rgba(255, 180, 84, 0.3)" />
                <stop offset="90%" stopColor="rgba(255, 180, 84, 0.1)" />
                <stop offset="100%" stopColor="rgba(255, 180, 84, 0)" />
              </radialGradient>
            </defs>

            {/* Background stars (simulating field of view) */}
            <g opacity="0.3">
              <circle cx="80" cy="50" r="0.8" fill="#fff" />
              <circle cx="330" cy="70" r="0.6" fill="#fff" />
              <circle cx="120" cy="180" r="0.7" fill="#fff" />
              <circle cx="290" cy="220" r="0.8" fill="#fff" />
              <circle cx="50" cy="140" r="0.5" fill="#fff" />
            </g>

            {/* Unmasked Star Glare */}
            {!maskOn && (
              <circle
                cx={starCenter.x}
                cy={starCenter.y}
                r={glareRadius}
                fill="url(#starGlareGrad)"
                className="transition-all duration-200"
              />
            )}

            {/* Diffracted Light Ring around mask (if masked) */}
            {maskOn && (
              <circle
                cx={starCenter.x}
                cy={starCenter.y}
                r={36 + contrast * 0.1}
                fill="url(#diffractGlow)"
                className="transition-all duration-200"
              />
            )}

            {/* Coronagraph Mask Shield */}
            {maskOn && (
              <g>
                {/* Support structure line */}
                <line
                  x1={starCenter.x}
                  y1={0}
                  x2={starCenter.x}
                  y2={starCenter.y}
                  className="stroke-border/40 stroke-2"
                />
                {/* Physical opaque disk */}
                <circle
                  cx={starCenter.x}
                  cy={starCenter.y}
                  r={26}
                  fill="#070912"
                  className="stroke-border/60 stroke-1"
                />
                <circle cx={starCenter.x} cy={starCenter.y} r={23} fill="#0e1320" />
              </g>
            )}

            {/* Faint Exoplanet */}
            <g opacity={planetOpacity} className="transition-opacity duration-300">
              <circle
                cx={planetCenter.x}
                cy={planetCenter.y}
                r={6}
                fill="#36c5d9"
                opacity="0.3"
                className="animate-pulse"
              />
              <circle
                cx={planetCenter.x}
                cy={planetCenter.y}
                r={2.5}
                fill="#36c5d9"
                style={{ filter: "drop-shadow(0 0 3px var(--cyan))" }}
              />
              {/* Point identifier rings */}
              <circle
                cx={planetCenter.x}
                cy={planetCenter.y}
                r={10}
                className="fill-none stroke-cyan/30 stroke-0.5 stroke-dasharray-[2,2]"
              />
            </g>
          </svg>
        </div>

        {/* HUD Indicator */}
        <div className="absolute top-16 left-4 bg-void/90 border border-border/40 rounded-xl p-3 min-w-[150px] z-10 shadow-lg">
          <h5 className="text-[10px] font-mono font-bold text-muted uppercase mb-1">IMAGING HUD</h5>
          <div className="text-xs font-mono font-semibold tracking-wide">
            <span className={statusClass}>{detectStatus}</span>
          </div>
          <div className="text-[9px] text-muted mt-1 font-mono">
            Coronagraph: <span className="text-foreground">{maskOn ? "ON" : "OFF"}</span>
          </div>
          <div className="text-[9px] text-muted mt-0.5 font-mono">
            {t("contrast")}: <span className="text-foreground">{contrast}%</span>
          </div>
        </div>

        {/* Bottom controls panel */}
        <div className="relative z-10 w-full flex items-center justify-between gap-6 mt-auto bg-void/65 backdrop-blur-md px-4 py-2.5 border border-border/30 rounded-xl">
          {/* Coronagraph Mask Toggle */}
          <button
            type="button"
            onClick={() => setMaskOn(!maskOn)}
            className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg border cursor-pointer transition-all ${
              maskOn
                ? "bg-cyan/10 border-cyan text-cyan"
                : "bg-surface border-border hover:border-cyan/50 text-muted"
            }`}
          >
            {t("maskToggle")}
          </button>

          {/* Exposure slider */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] font-mono text-muted uppercase whitespace-nowrap">
              {t("contrast")}
            </span>
            <input
              type="range"
              min="10"
              max="95"
              value={contrast}
              onChange={(e) => setContrast(Number.parseInt(e.target.value))}
              className="w-full h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[10px] font-mono text-foreground w-10 text-right">
              {contrast}%
            </span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
