"use client";

import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function QuantumLocking() {
  const t = useTranslations("viz.superconductor");

  const [temp, setTemp] = useState(150); // 50K to 200K
  const [position, setPosition] = useState(0.2); // Position along track 0 to 1
  const [isDragging, setIsDragging] = useState(false);

  const tc = 92; // Critical temperature
  const isSuperconducting = temp <= tc;

  const resistance = isSuperconducting ? 0 : (temp - tc) * 0.15;

  const handleReset = () => {
    setTemp(150);
    setPosition(0.2);
  };

  // Convert position (0 to 1) into elliptical path coordinates (x, y)
  // Track center=200,100, rx=120, ry=35
  const angle = position * 2 * Math.PI;
  const trackX = 200 + 120 * Math.cos(angle);
  const trackY = 100 + 35 * Math.sin(angle);

  // Height above track: levitates if superconducting
  const levitationHeight = isSuperconducting ? 18 : 0;
  const blockX = trackX;
  const blockY = trackY - levitationHeight;

  // Dragging logic
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;

    // Relative mouse X
    const mouseX = e.clientX - rect.left;
    const dx = mouseX - 200;

    // Approximate position on the ellipse circle based on X position
    const cosAngle = Math.max(-1, Math.min(1, dx / 120));
    // Determine if we are on front or back half based on mouse Y if possible,
    // or just map smoothly. Let's do simple angular mapping.
    let newAngle = Math.acos(cosAngle);
    if (e.clientY - rect.top > 100) {
      newAngle = 2 * Math.PI - newAngle;
    }
    setPosition(newAngle / (2 * Math.PI));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={handleReset}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Levitation Track Viewport */}
        <div className="w-full flex-1 flex flex-col justify-start pb-28 pt-4">
          <div className="relative w-full h-full bg-void/30 border border-border/15 rounded-xl overflow-hidden">
            <svg
              viewBox="0 0 400 170"
              className="w-full h-full select-none touch-none"
              onPointerMove={handlePointerMove}
            >
              <title>Quantum locking levitation track</title>

              {/* 1. Track Magnet Ring */}
              <ellipse
                cx="200"
                y="100"
                rx="120"
                ry="35"
                fill="none"
                className="stroke-border-strong stroke-[12]"
                style={{ opacity: 0.8 }}
              />
              <ellipse
                cx="200"
                y="100"
                rx="120"
                ry="35"
                fill="none"
                className="stroke-surface stroke-[8]"
              />

              {/* 2. Magnetic Flux Lines (Only visible when superconducting) */}
              {isSuperconducting && (
                <g className="stroke-amber opacity-40 stroke-[0.8]" fill="none">
                  {/* Arc loops around the block position */}
                  <path
                    d={`M ${blockX - 10} ${trackY} Q ${blockX} ${blockY - 15} ${blockX + 10} ${trackY}`}
                  />
                  <path
                    d={`M ${blockX - 18} ${trackY} Q ${blockX} ${blockY - 22} ${blockX + 18} ${trackY}`}
                    strokeDasharray="2,2"
                  />
                  {/* Secondary loops */}
                  <path
                    d={`M ${blockX - 5} ${trackY - 2} Q ${blockX} ${blockY - 8} ${blockX + 5} ${trackY - 2}`}
                  />
                </g>
              )}

              {/* 3. Levitating Superconductor Block */}
              <g
                transform={`translate(${blockX}, ${blockY})`}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                className="cursor-grab active:cursor-grabbing"
              >
                {/* Visual shadow on track */}
                {isSuperconducting && (
                  <ellipse
                    cx="0"
                    cy={levitationHeight}
                    rx="12"
                    ry="4"
                    className="fill-void/60 stroke-none"
                  />
                )}

                {/* Superconductor Bar */}
                <rect
                  x="-16"
                  y="-8"
                  width="32"
                  height="16"
                  rx="2"
                  fill={isSuperconducting ? "var(--cyan)" : "var(--border)"}
                  className="stroke-border stroke-1"
                  style={{
                    filter: isSuperconducting
                      ? "drop-shadow(0 0 8px rgba(54, 197, 217, 0.7))"
                      : "none",
                    transition: "fill 0.3s, filter 0.3s",
                  }}
                />

                {/* Cooling fog particles */}
                {isSuperconducting && (
                  <g className="fill-cyan/30 animate-pulse">
                    <circle cx="-10" cy="12" r="3" />
                    <circle cx="10" cy="10" r="2.5" />
                    <circle cx="0" cy="14" r="2" />
                  </g>
                )}
              </g>

              {/* Guide instruction text */}
              <text
                x="200"
                y="155"
                className="fill-muted/70 font-mono text-[7.5px] text-center"
                textAnchor="middle"
              >
                {isSuperconducting ? t("dragToMove") : t("lowerToLevitate")}
              </text>
            </svg>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono">
          {/* Temperature Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
              {t("temp") || "Temperature"}:
            </span>
            <input
              type="range"
              min="50"
              max="200"
              step="2"
              value={temp}
              onChange={(e) => setTemp(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
            />
            <span
              className={`text-[9.5px] font-mono w-14 text-right font-bold ${temp <= tc ? "text-cyan" : "text-foreground"}`}
            >
              {temp} K
            </span>
          </div>

          {/* Stats & Tc indicator */}
          <div className="flex justify-between items-center border-t border-border/15 pt-2 text-[9px] font-mono">
            <div>
              <span className="text-muted mr-1">{t("resistance") || "Electrical Resistance"}:</span>
              <span className={isSuperconducting ? "text-cyan font-bold" : "text-foreground"}>
                {resistance === 0 ? "0.000 Ω (ZERO)" : `${resistance.toFixed(3)} Ω`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-muted">{t("state") || "State"}:</span>
              <span className={isSuperconducting ? "text-teal font-bold" : "text-muted"}>
                {isSuperconducting ? t("levitating") || "LEVITATING" : t("resting") || "RESTING"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
