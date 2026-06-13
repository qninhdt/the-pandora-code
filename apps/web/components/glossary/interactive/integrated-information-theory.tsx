"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useMemo } from "react";
import { GlossaryFrame } from "./shared/frame";

interface IntegratedInformationTheoryProps {
  locale: string;
}

interface Point {
  x: number;
  y: number;
}

export default function IntegratedInformationTheory({ locale }: IntegratedInformationTheoryProps) {
  const t = useTranslations("viz.integrationVsSize");

  const [recurrence, setRecurrence] = useState(0); // 0 to 1
  const [isPlaying, setIsPlaying] = useState(true);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Animation logic for signals flowing
  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;

    const tick = () => {
      setPulsePhase((prev) => (prev + 0.005) % 1.0);
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  const handleReset = () => {
    setRecurrence(0);
    setIsPlaying(true);
  };

  const isMesh = recurrence < 0.5;

  // 1. Mesh topology: 4 columns x 3 rows (12 nodes)
  const meshNodes = useMemo(() => {
    const cols = 4;
    const rows = 3;
    const pts: Point[] = [];
    const startX = 60;
    const gapX = 85;
    const startY = 25;
    const gapY = 40;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        pts.push({ x: startX + c * gapX, y: startY + r * gapY });
      }
    }
    return pts;
  }, []);

  const meshEdges = useMemo(() => {
    const edges: { from: number; to: number }[] = [];
    // Wire column i to column i+1
    for (let col = 0; col < 3; col++) {
      for (let rowA = 0; rowA < 3; rowA++) {
        for (let rowB = 0; rowB < 3; rowB++) {
          edges.push({
            from: col * 3 + rowA,
            to: (col + 1) * 3 + rowB,
          });
        }
      }
    }
    return edges;
  }, []);

  // 2. Loop topology: 6 nodes in a ring
  const loopNodes = useMemo(() => {
    const n = 6;
    const cx = 187;
    const cy = 65;
    const radius = 42;
    const pts: Point[] = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      pts.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
    return pts;
  }, []);

  // Loop edges: fully connected bidirectional ring
  const loopEdges = useMemo(() => {
    const edges: { from: number; to: number }[] = [];
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (i !== j) {
          edges.push({ from: i, to: j });
        }
      }
    }
    return edges;
  }, []);

  // deciles for continuous crossfades
  const meshOpacity = Math.max(0, 1 - recurrence * 1.5);
  const loopOpacity = Math.max(0, (recurrence - 0.25) * 1.33);

  // Compute connections and Phi
  const connCount = Math.round(120 * (1 - 0.15 * recurrence));
  const phiVal = Number((recurrence ** 2.5 * 9.4).toFixed(1));
  const isConscious = phiVal >= 4.0;

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={isMesh ? t("meshNote") : t("loopNote")}
      onReset={handleReset}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Network visualizer panel */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-2">
          <div className="relative w-full h-full bg-void/50 border border-border/20 rounded-xl overflow-hidden">
            <svg viewBox="0 0 375 130" className="w-full h-full select-none">
              <title>IIT Architecture Comparison (Mesh vs Recurrent Loop)</title>

              {/* 1. Draw Feed-Forward Mesh */}
              {meshOpacity > 0 && (
                <g opacity={meshOpacity} className="transition-all duration-300">
                  {/* Edges */}
                  {meshEdges.map((edge, index) => {
                    const fromPt = meshNodes[edge.from];
                    const toPt = meshNodes[edge.to];
                    return (
                      <line
                        key={`m-edge-${index}`}
                        x1={fromPt.x}
                        y1={fromPt.y}
                        x2={toPt.x}
                        y2={toPt.y}
                        className="stroke-amber/15 stroke-[0.5]"
                      />
                    );
                  })}

                  {/* Flow pulses */}
                  {isPlaying &&
                    meshEdges.map((edge, index) => {
                      if (index % 3 !== 0) return null; // limit pulse density
                      const fromPt = meshNodes[edge.from];
                      const toPt = meshNodes[edge.to];
                      const px = fromPt.x + (toPt.x - fromPt.x) * pulsePhase;
                      const py = fromPt.y + (toPt.y - fromPt.y) * pulsePhase;
                      return (
                        <circle
                          key={`m-pulse-${index}`}
                          cx={px}
                          cy={py}
                          r="1.5"
                          className="fill-amber"
                          style={{ filter: "drop-shadow(0 0 2px var(--amber))" }}
                        />
                      );
                    })}

                  {/* Nodes */}
                  {meshNodes.map((pt, index) => {
                    // Staggered pulsing
                    const col = Math.floor(index / 3);
                    const active = (pulsePhase * 4) % 4 >= col && (pulsePhase * 4) % 4 < col + 1;
                    return (
                      <circle
                        key={`m-node-${index}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        className={`transition-colors duration-300 ${
                          active ? "fill-amber" : "fill-amber/40"
                        }`}
                        style={{
                          filter: active ? "drop-shadow(0 0 3px var(--amber))" : "none",
                        }}
                      />
                    );
                  })}

                  {/* Label */}
                  <text
                    x="187"
                    y="120"
                    textAnchor="middle"
                    className="fill-amber/60 font-mono text-[7.5px]"
                  >
                    {t("oneWay")}
                  </text>
                </g>
              )}

              {/* 2. Draw Recurrent Loop */}
              {loopOpacity > 0 && (
                <g opacity={loopOpacity} className="transition-all duration-300">
                  {/* Edges */}
                  {loopEdges.map((edge, index) => {
                    const fromPt = loopNodes[edge.from];
                    const toPt = loopNodes[edge.to];
                    return (
                      <line
                        key={`l-edge-${index}`}
                        x1={fromPt.x}
                        y1={fromPt.y}
                        x2={toPt.x}
                        y2={toPt.y}
                        className="stroke-teal/20 stroke-[0.8]"
                      />
                    );
                  })}

                  {/* Reverberating pulses */}
                  {isPlaying &&
                    loopEdges.map((edge, index) => {
                      if (index % 4 !== 0) return null; // limit loop pulse density
                      const fromPt = loopNodes[edge.from];
                      const toPt = loopNodes[edge.to];
                      // Reverse direction support for bidirectional feel
                      const travel = (pulsePhase + index / 30) % 1.0;
                      const px = fromPt.x + (toPt.x - fromPt.x) * travel;
                      const py = fromPt.y + (toPt.y - fromPt.y) * travel;
                      return (
                        <circle
                          key={`l-pulse-${index}`}
                          cx={px}
                          cy={py}
                          r="1.8"
                          className="fill-teal"
                          style={{ filter: "drop-shadow(0 0 3px var(--teal))" }}
                        />
                      );
                    })}

                  {/* Nodes */}
                  {loopNodes.map((pt, index) => {
                    const active = (pulsePhase * 6 + index) % 3 < 1.5;
                    return (
                      <circle
                        key={`l-node-${index}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="5.5"
                        className={`transition-colors duration-300 ${
                          active ? "fill-teal" : "fill-teal/40"
                        }`}
                        style={{
                          filter: active ? "drop-shadow(0 0 5px var(--teal))" : "none",
                        }}
                      />
                    );
                  })}

                  {/* Label */}
                  <text
                    x="187"
                    y="120"
                    textAnchor="middle"
                    className="fill-teal/60 font-mono text-[7.5px]"
                  >
                    {t("talksBack")}
                  </text>
                </g>
              )}
            </svg>

            {/* Readouts HUD top overlay */}
            <div className="absolute top-2 left-2 flex gap-3 text-[8.5px] font-mono pointer-events-none">
              <div>
                <span className="text-muted mr-1">{t("countLabel") || "Connections"}:</span>
                <span className="text-foreground font-bold">{connCount}</span>
              </div>
              <div>
                <span className="text-muted mr-1">{t("phiLabel") || "Integration (Φ)"}:</span>
                <span
                  className={`font-bold transition-colors duration-300 ${
                    isConscious ? "text-teal" : "text-amber"
                  }`}
                >
                  {phiVal < 0.05 ? "≈ 0" : phiVal.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="absolute top-2 right-2 text-[8.5px] font-mono pointer-events-none">
              <span className="text-muted mr-1">{t("verdictLabel") || "Conscious?"}:</span>
              <span
                className={`font-bold transition-colors duration-300 ${
                  isConscious ? "text-teal" : "text-amber"
                }`}
              >
                {isConscious ? t("conscious") || "Candidate Mind" : t("unconscious") || "Zombie"}
              </span>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRecurrence(0);
              }}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: recurrence === 0 ? "var(--amber)" : "transparent",
                color: recurrence === 0 ? "var(--background)" : "var(--foreground)",
                borderColor: recurrence === 0 ? "var(--amber)" : "var(--border)",
              }}
            >
              {t("mesh") || "Feed-Forward Mesh"}
            </button>

            <button
              type="button"
              onClick={() => {
                setRecurrence(1);
              }}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: recurrence === 1 ? "var(--teal)" : "transparent",
                color: recurrence === 1 ? "var(--background)" : "var(--foreground)",
                borderColor: recurrence === 1 ? "var(--teal)" : "var(--border)",
                boxShadow: recurrence === 1 ? "0 0 6px rgba(43, 212, 168, 0.3)" : "none",
              }}
            >
              {t("loop") || "Recurrent Loop"}
            </button>
          </div>

          {/* Recurrence Slider */}
          <div className="flex items-center gap-3 border-t border-border/15 pt-2">
            <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
              {t("recurrenceLabel") || "Recurrence"}:
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={recurrence}
              onChange={(e) => setRecurrence(Number.parseFloat(e.target.value))}
              className={`flex-1 h-1 rounded bg-surface appearance-none cursor-pointer ${
                isMesh ? "accent-amber" : "accent-teal"
              }`}
            />
            <span className="text-foreground w-8 text-right">{Math.round(recurrence * 100)}%</span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
