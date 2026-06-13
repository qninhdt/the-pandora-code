"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

interface BioluminescenceProps {
  locale: string;
}

export default function Bioluminescence({ locale }: BioluminescenceProps) {
  const t = useTranslations("viz.coldLight");
  const [currentStep, setCurrentStep] = useState(0);

  // Steps data mapped from translation next-intl
  const stepLabels = [t("steps.0.label"), t("steps.1.label"), t("steps.2.label")];

  const stepBodies = [t("steps.0.body"), t("steps.1.body"), t("steps.2.body")];

  // Glow factors
  let glowOpacity = 0.05;
  let particleColor = "var(--border)";
  let isExcited = false;

  if (currentStep === 1) {
    glowOpacity = 0.25;
    particleColor = "var(--amber)";
    isExcited = true;
  } else if (currentStep === 2) {
    glowOpacity = 0.85;
    particleColor = "var(--cyan)";
  }

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={stepBodies[currentStep]}
      onReset={() => setCurrentStep(0)}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* SVG Reaction Chamber */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-36">
          <svg viewBox="0 0 400 200" className="w-full h-full max-h-[85%] select-none">
            <title>Reaction Chamber</title>
            <defs>
              {/* Cyan light wash */}
              <radialGradient id="cyanWash" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#36c5d9" stopOpacity={glowOpacity} />
                <stop offset="60%" stopColor="#36c5d9" stopOpacity={glowOpacity * 0.4} />
                <stop offset="100%" stopColor="#36c5d9" stopOpacity="0" />
              </radialGradient>
              {/* Amber excitement wash */}
              <radialGradient id="amberWash" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffb454" stopOpacity={glowOpacity} />
                <stop offset="60%" stopColor="#ffb454" stopOpacity={glowOpacity * 0.4} />
                <stop offset="100%" stopColor="#ffb454" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Chamber Box */}
            <rect
              x="80"
              y="30"
              width="240"
              height="140"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              className="rx-lg"
            />
            <text x="90" y="45" className="fill-muted/40 text-[7px] font-mono">
              REACTION CHAMBER
            </text>

            {/* Glowing Wash Background */}
            <circle
              cx="200"
              cy="100"
              r="80"
              fill={currentStep === 1 ? "url(#amberWash)" : "url(#cyanWash)"}
            />

            {/* Molecules inside the chamber */}
            {currentStep === 0 && (
              // Step 1: Separate Luciferin & O2
              <g>
                {/* Luciferin (complex molecule) */}
                <path
                  d="M 150 90 L 170 85 L 180 100 L 160 105 Z"
                  fill="none"
                  stroke="var(--border-strong)"
                  strokeWidth="2"
                />
                <circle cx="150" cy="90" r="5" fill="#8a93a8" />
                <circle cx="170" cy="85" r="5" fill="#8a93a8" />
                <text x="145" y="75" className="fill-muted text-[8px] font-mono">
                  LUCIFERIN
                </text>

                {/* Oxygen (O2) */}
                <circle cx="240" cy="110" r="4" fill="var(--cyan)" />
                <circle cx="248" cy="113" r="4" fill="var(--cyan)" />
                <line x1="240" y1="110" x2="248" y2="113" stroke="var(--cyan)" strokeWidth="2" />
                <text x="240" y="100" className="fill-cyan text-[8px] font-mono">
                  O₂
                </text>
              </g>
            )}

            {currentStep === 1 && (
              // Step 2: High-energy intermediate (peroxide ring)
              <g>
                <rect
                  x="170"
                  y="80"
                  width="60"
                  height="40"
                  fill="rgba(255, 180, 84, 0.1)"
                  stroke="var(--amber)"
                  strokeWidth="2"
                  className="rx-md animate-pulse"
                />
                <circle cx="170" cy="80" r="5" fill="var(--amber)" />
                <circle cx="230" cy="80" r="5" fill="var(--amber)" />
                <circle cx="230" cy="120" r="5" fill="var(--amber)" />
                <circle cx="170" cy="120" r="5" fill="var(--amber)" />
                <text
                  x="200"
                  y="70"
                  className="fill-amber text-[8px] font-mono"
                  textAnchor="middle"
                >
                  DIOXETANONE RING
                </text>
              </g>
            )}

            {currentStep === 2 && (
              // Step 3: Snapping ring, CO2 shed, Photon emitted
              <g>
                {/* CO2 gas bubble floating away */}
                <g className="animate-bounce" style={{ animationDuration: "3s" }}>
                  <circle cx="140" cy="70" r="3" fill="var(--border-strong)" />
                  <circle cx="148" cy="70" r="2" fill="var(--border-strong)" />
                  <circle cx="132" cy="70" r="2" fill="var(--border-strong)" />
                  <text
                    x="140"
                    y="60"
                    className="fill-muted/70 text-[6px] font-mono"
                    textAnchor="middle"
                  >
                    CO₂
                  </text>
                </g>

                {/* Photon rays */}
                <g>
                  <path
                    d="M 200 100 L 160 60 M 200 100 L 240 60 M 200 100 L 160 140 M 200 100 L 240 140"
                    stroke="var(--cyan)"
                    strokeWidth="1.5"
                    className="stroke-dasharray-[3,3]"
                  />
                  <circle
                    cx="200"
                    cy="100"
                    r="12"
                    fill="var(--cyan)"
                    style={{ filter: "drop-shadow(0 0 12px var(--cyan))" }}
                  />
                  <text
                    x="200"
                    y="130"
                    className="fill-cyan text-[8px] font-mono font-bold"
                    textAnchor="middle"
                  >
                    PHOTON EMITTED
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* HUD readout for steps */}
        <div className="absolute top-16 left-4 right-4 flex justify-between gap-4 pointer-events-none z-10">
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 flex-1 pointer-events-auto min-h-[72px] shadow-lg flex flex-col justify-center">
            <h5
              className="text-[10px] font-mono font-bold uppercase mb-0.5"
              style={{ color: particleColor }}
            >
              {t("step")} {currentStep + 1}: {stepLabels[currentStep]}
            </h5>
            <p className="text-[11px] text-muted leading-snug font-sans">
              {stepBodies[currentStep]}
            </p>
          </div>
        </div>

        {/* Controls Slider */}
        <div className="relative z-10 w-full bg-void/65 backdrop-blur-md px-4 py-3 border border-border/30 rounded-xl flex gap-3 mt-auto">
          {stepLabels.map((label, idx) => {
            const isActive = currentStep === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className="flex-1 py-1.5 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay truncate"
                style={{
                  backgroundColor: isActive ? particleColor : "transparent",
                  color: isActive ? "var(--background)" : "var(--foreground)",
                  borderColor: isActive ? particleColor : "var(--border)",
                  boxShadow: isActive ? `0 0 8px ${particleColor}` : "none",
                }}
              >
                {locale === "vi" ? `Bước ${idx + 1}` : `STEP ${idx + 1}`}
              </button>
            );
          })}
        </div>
      </div>
    </GlossaryFrame>
  );
}
