"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useRef } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function LotkaVolterra() {
  const t = useTranslations("viz.lotkaVolterra");

  const [isPlaying, setIsPlaying] = useState(true);

  // Model parameters
  const [alpha, setAlpha] = useState(0.8); // prey birth rate
  const [beta, setBeta] = useState(0.04); // predation rate
  const [delta, setDelta] = useState(0.02); // predator growth rate
  const [gamma, setGamma] = useState(0.6); // predator death rate

  // Advanced switches
  const [hasK, setHasK] = useState(false); // Finite carrying capacity (K)
  const [carryingCapacity, setCarryingCapacity] = useState(150);
  const [hasSwitching, setHasSwitching] = useState(false); // Prey-switching stabilization

  // Population history for plotting
  const [history, setHistory] = useState<{ prey: number; predator: number }[]>([]);

  // Current populations
  const [prey, setPrey] = useState(50);
  const [predator, setPredator] = useState(15);

  const simulationRef = useRef({ prey, predator, history });

  // Keep ref updated to avoid stale state in useEffect
  useEffect(() => {
    simulationRef.current = { prey, predator, history };
  }, [prey, predator, history]);

  // Initial populate of history
  useEffect(() => {
    const initialHistory = Array.from({ length: 80 }, (_, i) => ({
      prey: 50,
      predator: 15,
    }));
    setHistory(initialHistory);
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!isPlaying) return;

    const dt = 0.05; // time step

    const interval = setInterval(() => {
      const { prey: p, predator: w, history: hist } = simulationRef.current;

      // Lotka-Volterra equations with optional K and switching
      // Prey-switching factor: predator efficiency scales down when prey density is low
      const switchingFactor = hasSwitching ? p / (p + 15) : 1;

      // Prey growth rate
      const preyGrowth = alpha * p * (hasK ? 1 - p / carryingCapacity : 1);

      // Interaction term
      const predation = beta * p * w * switchingFactor;

      // Predator dynamics
      const predatorGrowth = delta * p * w * switchingFactor;
      const predatorDecay = gamma * w;

      // Euler integration step (clamped to prevent negative or infinite growth)
      const nextPrey = Math.max(0.5, Math.min(250, p + (preyGrowth - predation) * dt));
      const nextPredator = Math.max(0.5, Math.min(100, w + (predatorGrowth - predatorDecay) * dt));

      setPrey(nextPrey);
      setPredator(nextPredator);

      // Append to history, limit history length
      setHistory((prev) => {
        const updated = [...prev.slice(1), { prey: nextPrey, predator: nextPredator }];
        return updated;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isPlaying, alpha, beta, delta, gamma, hasK, carryingCapacity, hasSwitching]);

  // Reset function
  const handleReset = () => {
    setPrey(50);
    setPredator(15);
    setAlpha(0.8);
    setBeta(0.04);
    setDelta(0.02);
    setGamma(0.6);
    setHasK(false);
    setCarryingCapacity(150);
    setHasSwitching(false);

    const initialHistory = Array.from({ length: 80 }, () => ({
      prey: 50,
      predator: 15,
    }));
    setHistory(initialHistory);
  };

  // SVG dimensions
  const svgWidth = 320;
  const svgHeight = 120;
  const padding = 10;

  // Scaling factors for plotting
  const maxVal = 160; // Max population value for scale

  const getPreyPoints = () => {
    if (history.length === 0) return "";
    return history
      .map((d, index) => {
        const x = padding + (index / (history.length - 1)) * (svgWidth - 2 * padding);
        const y = svgHeight - padding - (d.prey / maxVal) * (svgHeight - 2 * padding);
        return `${x},${Math.max(padding, Math.min(svgHeight - padding, y))}`;
      })
      .join(" ");
  };

  const getPredatorPoints = () => {
    if (history.length === 0) return "";
    return history
      .map((d, index) => {
        const x = padding + (index / (history.length - 1)) * (svgWidth - 2 * padding);
        const y = svgHeight - padding - (d.predator / maxVal) * (svgHeight - 2 * padding);
        return `${x},${Math.max(padding, Math.min(svgHeight - padding, y))}`;
      })
      .join(" ");
  };

  const preyPoints = getPreyPoints();
  const predatorPoints = getPredatorPoints();

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
        {/* Real-time Oscillating Chart */}
        <div className="w-full flex-1 flex flex-col justify-center pb-28 pt-8">
          <div className="relative w-full h-full bg-void/40 border border-border/20 rounded-xl overflow-hidden p-2">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full select-none">
              <title>Lotka-Volterra Population Oscillation</title>

              {/* Grid Lines */}
              <line
                x1={padding}
                y1={svgHeight / 2}
                x2={svgWidth - padding}
                y2={svgHeight / 2}
                className="stroke-border/10 stroke-1"
                strokeDasharray="3,3"
              />
              <line
                x1={padding}
                y1={svgHeight - padding}
                x2={svgWidth - padding}
                y2={svgHeight - padding}
                className="stroke-border/30 stroke-1"
              />
              <line
                x1={padding}
                y1={padding}
                x2={padding}
                y2={svgHeight - padding}
                className="stroke-border/30 stroke-1"
              />

              {/* Prey Area & Path */}
              {preyPoints && (
                <>
                  <polyline
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth="2.5"
                    points={preyPoints}
                    style={{ filter: "drop-shadow(0 0 4px rgba(54, 197, 217, 0.4))" }}
                  />
                  {/* Glowing end point */}
                  {history.length > 0 && (
                    <circle
                      cx={padding + (svgWidth - 2 * padding)}
                      cy={svgHeight - padding - (prey / maxVal) * (svgHeight - 2 * padding)}
                      r="4"
                      className="fill-cyan animate-ping"
                    />
                  )}
                </>
              )}

              {/* Predator Area & Path */}
              {predatorPoints && (
                <>
                  <polyline
                    fill="none"
                    stroke="var(--magenta)"
                    strokeWidth="2.5"
                    points={predatorPoints}
                    style={{ filter: "drop-shadow(0 0 4px rgba(255, 93, 168, 0.4))" }}
                  />
                  {/* Glowing end point */}
                  {history.length > 0 && (
                    <circle
                      cx={padding + (svgWidth - 2 * padding)}
                      cy={svgHeight - padding - (predator / maxVal) * (svgHeight - 2 * padding)}
                      r="4"
                      className="fill-magenta animate-ping"
                    />
                  )}
                </>
              )}
            </svg>

            {/* Float values overlay */}
            <div className="absolute top-2 left-2 flex gap-4 text-[9px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan inline-block" />
                <span className="text-cyan font-bold">
                  {t("prey")}: {Math.round(prey)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-magenta inline-block" />
                <span className="text-magenta font-bold">
                  {t("predator")}: {Math.round(predator)}
                </span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="absolute top-2 right-2 text-[8px] font-mono text-muted/80 uppercase">
              {hasK && prey > carryingCapacity * 0.9 && prey - carryingCapacity < 10
                ? t("nearCapacity")
                : isPlaying
                  ? t("simulating")
                  : t("pausedStatus")}
            </div>
          </div>
        </div>

        {/* HUD Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10">
          {/* Main Sliders */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {/* Prey birth rate (Alpha) */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted w-16 truncate uppercase">
                {t("preyBirth")}
              </span>
              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.05"
                value={alpha}
                onChange={(e) => setAlpha(Number.parseFloat(e.target.value))}
                className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
              />
              <span className="text-[8px] font-mono text-foreground w-6 text-right">
                {alpha.toFixed(2)}
              </span>
            </div>

            {/* Predation efficiency (Beta) */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted w-16 truncate uppercase">
                {t("predation")}
              </span>
              <input
                type="range"
                min="0.01"
                max="0.1"
                step="0.005"
                value={beta}
                onChange={(e) => setBeta(Number.parseFloat(e.target.value))}
                className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
              />
              <span className="text-[8px] font-mono text-foreground w-6 text-right">
                {beta.toFixed(3)}
              </span>
            </div>

            {/* Predator growth (Delta) */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted w-16 truncate uppercase">
                {t("predBirth")}
              </span>
              <input
                type="range"
                min="0.005"
                max="0.06"
                step="0.002"
                value={delta}
                onChange={(e) => setDelta(Number.parseFloat(e.target.value))}
                className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-magenta"
              />
              <span className="text-[8px] font-mono text-foreground w-6 text-right">
                {delta.toFixed(3)}
              </span>
            </div>

            {/* Predator decay (Gamma) */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted w-16 truncate uppercase">
                {t("predDeath")}
              </span>
              <input
                type="range"
                min="0.2"
                max="1.2"
                step="0.05"
                value={gamma}
                onChange={(e) => setGamma(Number.parseFloat(e.target.value))}
                className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-magenta"
              />
              <span className="text-[8px] font-mono text-foreground w-6 text-right">
                {gamma.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Interactive feature toggles */}
          <div className="flex gap-2 border-t border-border/20 pt-2">
            {/* Prey-switching toggle */}
            <button
              type="button"
              onClick={() => setHasSwitching(!hasSwitching)}
              className="flex-1 py-1 px-1.5 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: hasSwitching ? "var(--teal)" : "transparent",
                color: hasSwitching ? "var(--background)" : "var(--foreground)",
                borderColor: hasSwitching ? "var(--teal)" : "var(--border)",
                boxShadow: hasSwitching ? "0 0 6px rgba(43, 212, 168, 0.3)" : "none",
              }}
            >
              {t("preySwitching")}
            </button>

            {/* Paradox of enrichment K toggle */}
            <button
              type="button"
              onClick={() => setHasK(!hasK)}
              className="flex-1 py-1 px-1.5 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: hasK ? "var(--amber)" : "transparent",
                color: hasK ? "var(--background)" : "var(--foreground)",
                borderColor: hasK ? "var(--amber)" : "var(--border)",
                boxShadow: hasK ? "0 0 6px rgba(255, 180, 84, 0.3)" : "none",
              }}
            >
              {t("carryingCapacityLabel")}
            </button>
          </div>

          {/* Additional details for K if active */}
          {hasK && (
            <div className="flex items-center gap-2 border-t border-border/10 pt-1.5">
              <span className="text-[8px] font-mono text-amber uppercase w-28 truncate">
                {t("carryingCapacity") || "Carrying Capacity (K)"}:
              </span>
              <input
                type="range"
                min="60"
                max="240"
                step="10"
                value={carryingCapacity}
                onChange={(e) => setCarryingCapacity(Number.parseInt(e.target.value))}
                className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-amber"
              />
              <span className="text-[8px] font-mono text-amber w-6 text-right">
                {carryingCapacity}
              </span>
            </div>
          )}
        </div>
      </div>
    </GlossaryFrame>
  );
}
