"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

interface ChiralityProps {
  locale: string;
}

export default function Chirality({ locale }: ChiralityProps) {
  const t = useTranslations("viz.chirality");

  // State
  const [moleculeType, setMoleculeType] = useState<"L" | "D" | "racemic" | "none">("L");
  const [concentration, setConcentration] = useState(1.0); // 0.0 to 2.0
  const [analyzerAngle, setAnalyzerAngle] = useState(0); // -180 to 180 degrees

  // Base rotation constants (degrees per unit concentration)
  // L-form rotates negative (counter-clockwise), D-form rotates positive (clockwise)
  const rotationPerUnit = moleculeType === "L" ? -35 : moleculeType === "D" ? 35 : 0;
  const lightRotation = rotationPerUnit * concentration;

  // Normalized angles for Malus's Law calculation
  const thetaLightRad = (lightRotation * Math.PI) / 180;
  const thetaAnalyzerRad = (analyzerAngle * Math.PI) / 180;

  // Malus's law: Intensity = cos^2(theta_analyzer - theta_light)
  const intensity = Math.cos(thetaAnalyzerRad - thetaLightRad) ** 2;
  const brightnessPercent = Math.round(intensity * 100);

  // Molecular visual representation
  const renderMolecules = () => {
    if (moleculeType === "none") return null;

    const count = 12;
    const molecules = [];

    // Seeded random-like positioning inside the tube area x=[140, 240], y=[50, 110]
    for (let i = 0; i < count; i++) {
      const x = 145 + ((i * 8.5) % 90);
      const y = 55 + ((i * 13) % 50);
      const isLeft = moleculeType === "L" || (moleculeType === "racemic" && i % 2 === 0);

      molecules.push(
        <g key={i} className="opacity-70" transform={`translate(${x}, ${y}) scale(0.65)`}>
          {/* Central carbon */}
          <circle cx="0" cy="0" r="4" className="fill-muted" />

          {/* Chiral functional groups branches (symbolic tetrahedral asymmetry) */}
          {isLeft ? (
            <>
              {/* L-configuration shape (counter-clockwise order) */}
              <line x1="0" y1="0" x2="-8" y2="-6" stroke="var(--cyan)" strokeWidth="1.5" />
              <circle cx="-8" cy="-6" r="2.5" className="fill-cyan" />

              <line x1="0" y1="0" x2="8" y2="-4" stroke="var(--magenta)" strokeWidth="1.5" />
              <circle cx="8" cy="-4" r="2" className="fill-magenta" />

              <line x1="0" y1="0" x2="0" y2="10" stroke="var(--amber)" strokeWidth="1.5" />
              <circle cx="0" cy="10" r="1.5" className="fill-amber" />
            </>
          ) : (
            <>
              {/* D-configuration shape (clockwise/mirrored order) */}
              <line x1="0" y1="0" x2="8" y2="-6" stroke="var(--cyan)" strokeWidth="1.5" />
              <circle cx="8" cy="-6" r="2.5" className="fill-cyan" />

              <line x1="0" y1="0" x2="-8" y2="-4" stroke="var(--magenta)" strokeWidth="1.5" />
              <circle cx="-8" cy="-4" r="2" className="fill-magenta" />

              <line x1="0" y1="0" x2="0" y2="10" stroke="var(--amber)" strokeWidth="1.5" />
              <circle cx="0" cy="10" r="1.5" className="fill-amber" />
            </>
          )}
        </g>,
      );
    }
    return molecules;
  };

  const handleReset = () => {
    setMoleculeType("L");
    setConcentration(1.0);
    setAnalyzerAngle(0);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={handleReset}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Polarimeter Diagram */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-4">
          <svg viewBox="0 0 400 160" className="w-full h-full max-h-[85%] select-none">
            <title>Optical Rotation Polarimeter</title>

            {/* Ambient beam track */}
            <rect x="40" y="70" width="320" height="20" className="fill-void/25 stroke-none" />

            {/* 1. Light Source */}
            <circle cx="50" cy="80" r="14" className="fill-void/60 stroke-border-strong stroke-2" />
            <circle
              cx="50"
              cy="80"
              r="6"
              className="fill-amber animate-pulse"
              style={{ filter: "drop-shadow(0 0 6px var(--amber))" }}
            />
            {/* Unpolarized rays */}
            <g className="stroke-amber/40 stroke-1">
              <line x1="50" y1="60" x2="50" y2="64" />
              <line x1="50" y1="96" x2="50" y2="100" />
              <line x1="30" y1="80" x2="34" y2="80" />
              <line x1="70" y1="80" x2="66" y2="80" />
              <line x1="36" y1="66" x2="40" y2="70" />
              <line x1="64" y1="94" x2="60" y2="90" />
              <line x1="64" y1="66" x2="60" y2="70" />
              <line x1="36" y1="94" x2="40" y2="90" />
            </g>

            {/* Wave 1: Unpolarized multidirectional rays */}
            <g className="stroke-amber/70 stroke-[1.5] fill-none">
              <path d="M 50 80 Q 70 65 90 80 T 110 80" />
              <path d="M 50 80 Q 70 95 90 80 T 110 80" className="opacity-40" />
            </g>

            {/* 2. Polarizing Filter (Vertical) */}
            <g transform="translate(110, 50)">
              <rect
                x="0"
                y="0"
                width="12"
                height="60"
                rx="3"
                className="fill-surface stroke-border stroke-1"
              />
              <line x1="6" y1="5" x2="6" y2="55" className="stroke-amber stroke-[1.5]" />
              <line x1="3" y1="10" x2="3" y2="50" className="stroke-muted/30 stroke-1" />
              <line x1="9" y1="10" x2="9" y2="50" className="stroke-muted/30 stroke-1" />
            </g>
            <text
              x="116"
              y="45"
              className="fill-muted font-mono text-[7px] text-center"
              textAnchor="middle"
            >
              POLARIZER
            </text>

            {/* Wave 2: Linearly Polarized Vertical Wave */}
            <path
              d="M 122 80 Q 130 68 138 80 T 146 80"
              fill="none"
              className="stroke-amber stroke-[1.5]"
            />

            {/* 3. Sample Chamber (Tube) */}
            <g>
              {/* Liquid chamber */}
              <rect
                x="146"
                y="55"
                width="108"
                height="50"
                rx="4"
                className="fill-teal/10 stroke-border/40 stroke-1"
              />
              {/* Glass ends */}
              <line x1="146" y1="55" x2="146" y2="105" className="stroke-cyan stroke-2" />
              <line x1="254" y1="55" x2="254" y2="105" className="stroke-cyan stroke-2" />
              {/* Cap */}
              <rect
                x="190"
                y="48"
                width="20"
                height="7"
                className="fill-surface stroke-border stroke-1"
              />
            </g>

            {/* Draw Chiral Molecules */}
            {renderMolecules()}

            {/* Wave 3: Rotated Wave emerging from tube */}
            <g transform={`translate(254, 80) rotate(${lightRotation}) translate(-254, -80)`}>
              <path
                d="M 254 80 Q 268 70 282 80 T 310 80"
                fill="none"
                className="stroke-cyan stroke-[2.5]"
                style={{ filter: "drop-shadow(0 0 3px rgba(54, 197, 217, 0.5))" }}
              />
            </g>

            {/* 4. Analyzer Filter (Rotatable) */}
            <g transform={`translate(310, 80) rotate(${analyzerAngle}) translate(-310, -80)`}>
              <rect
                x="304"
                y="50"
                width="12"
                height="60"
                rx="3"
                className="fill-surface stroke-border stroke-1"
              />
              <line
                x1="310"
                y1="5"
                x2="310"
                y2="55"
                className="stroke-cyan stroke-[1.5] stroke-dasharray-[2,2]"
              />
            </g>
            <text
              x="310"
              y="45"
              className="fill-muted font-mono text-[7px] text-center"
              textAnchor="middle"
            >
              ANALYZER
            </text>

            {/* 5. Detector Screen / Output */}
            <rect
              x="350"
              y="60"
              width="25"
              height="40"
              rx="2"
              className="fill-void/80 stroke-border stroke-1"
            />
            <circle
              cx="362.5"
              cy="80"
              r="10"
              fill="var(--cyan)"
              style={{
                opacity: 0.15 + intensity * 0.85,
                filter: `drop-shadow(0 0 ${intensity * 10}px rgba(54, 197, 217, 0.8))`,
              }}
            />

            {/* Labels overlay */}
            <text
              x="50"
              y="145"
              className="fill-muted font-mono text-[8px] text-center"
              textAnchor="middle"
            >
              {locale === "vi" ? "Nguồn sáng" : "Light Source"}
            </text>
            <text
              x="200"
              y="145"
              className="fill-muted font-mono text-[8px] text-center"
              textAnchor="middle"
            >
              {locale === "vi" ? "Ống đựng mẫu" : "Sample Tube"}
            </text>
            <text
              x="362"
              y="145"
              className="fill-muted font-mono text-[8px] text-center"
              textAnchor="middle"
            >
              {t("brightness") || "Light"}
            </text>
          </svg>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-3 z-10">
          {/* Molecule selectors */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMoleculeType("L")}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: moleculeType === "L" ? "var(--cyan)" : "transparent",
                color: moleculeType === "L" ? "var(--background)" : "var(--foreground)",
                borderColor: moleculeType === "L" ? "var(--cyan)" : "var(--border)",
                boxShadow: moleculeType === "L" ? "0 0 6px rgba(54, 197, 217, 0.3)" : "none",
              }}
            >
              {t("lAmino") || "L-Amino Acids"}
            </button>

            <button
              type="button"
              onClick={() => setMoleculeType("D")}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: moleculeType === "D" ? "var(--magenta)" : "transparent",
                color: moleculeType === "D" ? "var(--background)" : "var(--foreground)",
                borderColor: moleculeType === "D" ? "var(--magenta)" : "var(--border)",
                boxShadow: moleculeType === "D" ? "0 0 6px rgba(255, 93, 168, 0.3)" : "none",
              }}
            >
              {t("dAmino") || "D-Amino Acids"}
            </button>

            <button
              type="button"
              onClick={() => setMoleculeType("racemic")}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: moleculeType === "racemic" ? "var(--amber)" : "transparent",
                color: moleculeType === "racemic" ? "var(--background)" : "var(--foreground)",
                borderColor: moleculeType === "racemic" ? "var(--amber)" : "var(--border)",
                boxShadow: moleculeType === "racemic" ? "0 0 6px rgba(255, 180, 84, 0.3)" : "none",
              }}
            >
              {t("racemic") || "Racemic"}
            </button>

            <button
              type="button"
              onClick={() => setMoleculeType("none")}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: moleculeType === "none" ? "var(--muted)" : "transparent",
                color: moleculeType === "none" ? "var(--background)" : "var(--foreground)",
                borderColor: moleculeType === "none" ? "var(--muted)" : "var(--border)",
              }}
            >
              {t("empty") || "Water (None)"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-border/20 pt-2.5">
            {/* Slider 1: Analyzer Angle */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
                {t("analyzerAngle") || "Analyzer angle"}:
              </span>
              <input
                type="range"
                min="-90"
                max="90"
                step="1"
                value={analyzerAngle}
                onChange={(e) => setAnalyzerAngle(Number.parseInt(e.target.value))}
                className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
              />
              <span className="text-[9px] font-mono text-foreground w-8 text-right">
                {analyzerAngle}°
              </span>
            </div>

            {/* Slider 2: Concentration (if moleculeType != none) */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
                {t("concentration") || "Concentration"}:
              </span>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                disabled={moleculeType === "none"}
                value={concentration}
                onChange={(e) => setConcentration(Number.parseFloat(e.target.value))}
                className={`flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan ${
                  moleculeType === "none" ? "opacity-30 cursor-not-allowed" : ""
                }`}
              />
              <span className="text-[9px] font-mono text-foreground w-8 text-right">
                {moleculeType === "none" ? "0.0" : concentration.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Result Readout */}
          <div className="flex justify-between items-center border-t border-border/10 pt-2 text-[9px] font-mono">
            <div>
              <span className="text-muted mr-1">
                {locale === "vi" ? "Góc quay của ánh sáng:" : "Light rotation plane:"}
              </span>
              <span className="text-cyan font-bold">{lightRotation.toFixed(1)}°</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted">{t("brightness") || "Detector light"}:</span>
              <span
                className={`font-bold text-[10px] ${brightnessPercent > 80 ? "text-teal animate-pulse" : "text-cyan"}`}
              >
                {brightnessPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
