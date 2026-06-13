"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

interface CladogramProps {
  locale: string;
}

export default function Cladogram({ locale }: CladogramProps) {
  const t = useTranslations("viz.characterMatrix");
  const [isParsimony, setIsParsimony] = useState(true);

  const stepsCount = isParsimony ? 2 : 4;
  const isVi = locale === "vi";

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={() => setIsParsimony(true)}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* SVG Cladogram Tree */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-36">
          <svg viewBox="0 0 400 200" className="w-full h-full max-h-[85%] select-none">
            <title>Cladistic Tree builder</title>

            {/* Base of the tree */}
            <line x1="200" y1="180" x2="200" y2="150" className="stroke-border stroke-2" />

            {isParsimony ? (
              // Parsimonious Tree: Na'vi nested inside Pandoran six-limbed branch
              <g className="transition-all duration-500">
                {/* Branches */}
                <path
                  d="M 200 150 L 100 80 L 50 40"
                  fill="none"
                  stroke="var(--border-strong)"
                  strokeWidth="2"
                />
                <path d="M 100 80 L 150 40" fill="none" stroke="var(--border)" strokeWidth="1.5" />
                <path
                  d="M 200 150 L 300 80 L 350 40"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                />
                <path d="M 300 80 L 250 40" fill="none" stroke="var(--border)" strokeWidth="1.5" />

                {/* Leaf Labels */}
                <text
                  x="50"
                  y="30"
                  className="fill-cyan font-mono text-[9px] font-bold"
                  textAnchor="middle"
                >
                  NA'VI
                </text>
                <text
                  x="150"
                  y="30"
                  className="fill-muted text-[8px] font-mono"
                  textAnchor="middle"
                >
                  PROLEMURIS
                </text>
                <text
                  x="250"
                  y="30"
                  className="fill-muted text-[8px] font-mono"
                  textAnchor="middle"
                >
                  VIPERWOLF
                </text>
                <text
                  x="350"
                  y="30"
                  className="fill-muted text-[8px] font-mono"
                  textAnchor="middle"
                >
                  HUMAN
                </text>

                {/* Trait indicators (Mutations / Steps) */}
                {/* Step 1: Six Limbs (Common ancestor of Na'vi, Prolemuris, Viperwolf) */}
                <line x1="150" y1="115" x2="165" y2="100" stroke="var(--cyan)" strokeWidth="3" />
                <text x="175" y="112" className="fill-cyan text-[7px] font-mono text-left">
                  Six Limbs
                </text>

                {/* Step 2: Neural Queue (Ancestor of Na'vi & Prolemuris) */}
                <line x1="100" y1="80" x2="115" y2="65" stroke="var(--magenta)" strokeWidth="3" />
                <text x="125" y="77" className="fill-magenta text-[7px] font-mono text-left">
                  Queue
                </text>
              </g>
            ) : (
              // Phenetic/Similarity Tree: Na'vi pulled closer to Humans due to similarity (bipedal, 4 limbs)
              <g className="transition-all duration-500">
                {/* Branches */}
                <path
                  d="M 200 150 L 100 80 L 50 40"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                />
                <path d="M 100 80 L 150 40" fill="none" stroke="var(--border)" strokeWidth="1.5" />
                <path
                  d="M 200 150 L 300 80 L 350 40"
                  fill="none"
                  stroke="var(--border-strong)"
                  strokeWidth="2"
                />
                <path d="M 300 80 L 250 40" fill="none" stroke="var(--border)" strokeWidth="1.5" />

                {/* Leaf Labels */}
                <text x="50" y="30" className="fill-muted text-[8px] font-mono" textAnchor="middle">
                  PROLEMURIS
                </text>
                <text
                  x="150"
                  y="30"
                  className="fill-muted text-[8px] font-mono"
                  textAnchor="middle"
                >
                  VIPERWOLF
                </text>
                <text
                  x="250"
                  y="30"
                  className="fill-cyan font-mono text-[9px] font-bold"
                  textAnchor="middle"
                >
                  NA'VI
                </text>
                <text
                  x="350"
                  y="30"
                  className="fill-muted text-[8px] font-mono"
                  textAnchor="middle"
                >
                  HUMAN
                </text>

                {/* Trait indicators (Homoplasies - Independent convergent mutations) */}
                {/* Step 1: Six Limbs (evolves in Viperwolf) */}
                <line x1="125" y1="60" x2="140" y2="45" stroke="var(--cyan)" strokeWidth="3" />
                <text x="148" y="56" className="fill-cyan text-[6px] font-mono">
                  Six Limbs
                </text>

                {/* Step 2: Six Limbs (evolves in Prolemuris) */}
                <line x1="75" y1="60" x2="90" y2="45" stroke="var(--cyan)" strokeWidth="3" />
                <text x="50" y="56" className="fill-cyan text-[6px] font-mono">
                  Six Limbs
                </text>

                {/* Step 3: Neural Queue (evolves in Prolemuris) */}
                <line x1="88" y1="70" x2="103" y2="55" stroke="var(--magenta)" strokeWidth="3" />
                <text x="75" y="78" className="fill-magenta text-[6px] font-mono">
                  Queue
                </text>

                {/* Step 4: Neural Queue (evolves independently in Na'vi) */}
                <line x1="275" y1="60" x2="290" y2="45" stroke="var(--magenta)" strokeWidth="3" />
                <text x="298" y="56" className="fill-magenta text-[6px] font-mono">
                  Queue
                </text>

                {/* Flashing Warning for Homoplasy */}
                <rect
                  x="220"
                  y="10"
                  width="160"
                  height="20"
                  fill="rgba(255, 93, 168, 0.1)"
                  stroke="var(--magenta)"
                  strokeWidth="1"
                  className="rx-md"
                />
                <text
                  x="300"
                  y="22"
                  className="fill-magenta text-[7px] font-mono font-bold animate-pulse"
                  textAnchor="middle"
                >
                  WARNING: 2x HOMOPLASY DETECTED
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* HUD readout for parsimony steps */}
        <div className="absolute top-16 left-4 right-4 flex justify-between gap-4 pointer-events-none z-10">
          {/* Steps Indicator */}
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 w-[150px] pointer-events-auto shadow-lg flex flex-col justify-center">
            <h5 className="text-[9px] font-mono font-bold text-muted uppercase mb-0.5">
              {t("steps")}
            </h5>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl font-display font-bold tabular-nums ${isParsimony ? "text-teal" : "text-magenta"}`}
              >
                {stepsCount}
              </span>
              <span className="text-[8px] font-mono text-muted">
                {isParsimony ? "MINIMUM" : "EXPLODED"}
              </span>
            </div>
            <div className="w-full bg-surface h-1 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-500 ${isParsimony ? "bg-teal" : "bg-magenta"}`}
                style={{ width: `${(stepsCount / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Description note */}
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 flex-1 pointer-events-auto shadow-lg flex flex-col justify-center max-w-[180px]">
            <h6 className="text-[8px] font-mono font-bold text-muted uppercase mb-0.5">
              {isParsimony ? t("parsimony") : t("phenetic")}
            </h6>
            <p className="text-[8px] text-muted leading-relaxed font-sans">
              {isParsimony ? t("stepsParsimony") : t("stepsPhenetic")}
            </p>
          </div>
        </div>

        {/* Dynamic toggle buttons */}
        <div className="relative z-10 w-full bg-void/65 backdrop-blur-md px-4 py-3 border border-border/30 rounded-xl flex gap-3 mt-auto">
          {/* Parsimony Button */}
          <button
            type="button"
            onClick={() => setIsParsimony(true)}
            className="flex-1 py-2 px-1 rounded border font-mono text-xs text-center transition-all duration-200 select-none hover:bg-surface-overlay"
            style={{
              backgroundColor: isParsimony ? "var(--teal)" : "transparent",
              color: isParsimony ? "var(--background)" : "var(--foreground)",
              borderColor: isParsimony ? "var(--teal)" : "var(--border)",
              boxShadow: isParsimony ? "0 0 8px rgba(43, 212, 168, 0.4)" : "none",
            }}
          >
            {isVi ? "Tối giản (Parsimony)" : "MAXIMUM PARSIMONY"}
          </button>

          {/* Phenetic Similarity Button */}
          <button
            type="button"
            onClick={() => setIsParsimony(false)}
            className="flex-1 py-2 px-1 rounded border font-mono text-xs text-center transition-all duration-200 select-none hover:bg-surface-overlay"
            style={{
              backgroundColor: !isParsimony ? "var(--magenta)" : "transparent",
              color: !isParsimony ? "var(--background)" : "var(--foreground)",
              borderColor: !isParsimony ? "var(--magenta)" : "var(--border)",
              boxShadow: !isParsimony ? "0 0 8px rgba(255, 93, 168, 0.4)" : "none",
            }}
          >
            {isVi ? "Tương đồng (Phenetic)" : "PHENETIC SIMILARITY"}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
