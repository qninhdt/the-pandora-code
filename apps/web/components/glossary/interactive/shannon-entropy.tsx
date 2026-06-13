"use client";

import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GlossaryFrame } from "./shared/frame";

interface ShannonEntropyProps {
  locale: string;
}

export default function ShannonEntropy({ locale }: ShannonEntropyProps) {
  const t = useTranslations("viz.shannonEntropy");

  const [p, setP] = useState(0.5); // Probability of Heads
  const [flips, setFlips] = useState<string[]>([]);
  const [isAutoFlipping, setIsAutoFlipping] = useState(false);

  // Compute binary entropy: H(p) = -p*log2(p) - (1-p)*log2(1-p)
  const entropy = useMemo(() => {
    if (p <= 0 || p >= 1) return 0;
    return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  }, [p]);

  const handleFlip = useCallback(() => {
    const isHeads = Math.random() < p;
    setFlips((prev) => [isHeads ? "H" : "T", ...prev].slice(0, 16));
  }, [p]);

  useEffect(() => {
    if (!isAutoFlipping) return;
    const interval = setInterval(() => {
      handleFlip();
    }, 200);
    return () => clearInterval(interval);
  }, [isAutoFlipping, handleFlip]);

  const handleReset = () => {
    setP(0.5);
    setFlips([]);
    setIsAutoFlipping(false);
  };

  // Generate SVG path for the entropy curve
  const curvePath = useMemo(() => {
    const points: string[] = [];
    const width = 200;
    const height = 90;
    const padding = 10;

    for (let x = 0; x <= 100; x++) {
      const pct = x / 100;
      let hVal = 0;
      if (pct > 0 && pct < 1) {
        hVal = -pct * Math.log2(pct) - (1 - pct) * Math.log2(pct); // Wait, -pct*log2(pct) - (1-pct)*log2(1-pct)
        // Let's write it correctly:
        hVal = -pct * Math.log2(pct) - (1 - pct) * Math.log2(1 - pct);
      }
      const plotX = padding + pct * (width - 2 * padding);
      const plotY = height - padding - hVal * (height - 2 * padding);
      points.push(`${x === 0 ? "M" : "L"} ${plotX} ${plotY}`);
    }
    return points.join(" ");
  }, []);

  const currentX = 10 + p * 180;
  const currentY = 80 - entropy * 70;

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={handleReset}
      onPlayPause={() => setIsAutoFlipping(!isAutoFlipping)}
      isPlaying={isAutoFlipping}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Entropy Graph and Coin Flipping area */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-2">
          <div className="relative w-full h-full bg-void/50 border border-border/20 rounded-xl overflow-hidden flex flex-row p-3 gap-3">
            {/* Entropy Curve Chart (Left side) */}
            <div className="flex-1 h-full relative">
              <svg viewBox="0 0 200 100" className="w-full h-full select-none">
                <title>Binary Entropy Function Curve H(p)</title>
                {/* Grid Axes */}
                <line x1="10" y1="80" x2="190" y2="80" className="stroke-border/30 stroke-1" />
                <line x1="10" y1="10" x2="10" y2="80" className="stroke-border/30 stroke-1" />
                <line
                  x1="190"
                  y1="10"
                  x2="190"
                  y2="80"
                  className="stroke-border/10 stroke-[0.5]"
                  strokeDasharray="2,2"
                />
                <line
                  x1="100"
                  y1="10"
                  x2="100"
                  y2="80"
                  className="stroke-border/10 stroke-[0.5]"
                  strokeDasharray="2,2"
                />

                {/* X Axis labels */}
                <text
                  x="10"
                  y="92"
                  className="fill-muted font-mono text-[6.5px]"
                  textAnchor="middle"
                >
                  0.0
                </text>
                <text
                  x="100"
                  y="92"
                  className="fill-muted font-mono text-[6.5px]"
                  textAnchor="middle"
                >
                  p=0.5
                </text>
                <text
                  x="190"
                  y="92"
                  className="fill-muted font-mono text-[6.5px]"
                  textAnchor="middle"
                >
                  1.0
                </text>

                {/* Y Axis labels */}
                <text x="6" y="82" className="fill-muted font-mono text-[6.5px]" textAnchor="end">
                  0
                </text>
                <text x="6" y="14" className="fill-muted font-mono text-[6.5px]" textAnchor="end">
                  1.0 bit
                </text>

                {/* The curve */}
                <path d={curvePath} fill="none" className="stroke-cyan/40 stroke-2" />

                {/* Current state point */}
                <circle
                  cx={currentX}
                  cy={currentY}
                  r="4.5"
                  className="fill-cyan"
                  style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }}
                />

                {/* Hover line to x axis */}
                <line
                  x1={currentX}
                  y1={currentY}
                  x2={currentX}
                  y2="80"
                  className="stroke-cyan/25 stroke-[0.5]"
                  strokeDasharray="2,2"
                />
              </svg>
              <div className="absolute bottom-1 right-2 text-[7.5px] font-mono text-muted">
                {t("entropyLabel") || "Entropy (H)"}
              </div>
            </div>

            {/* Coin Flip Simulation (Right side) */}
            <div className="w-1/3 border-l border-border/15 pl-3 flex flex-col justify-between h-full">
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-mono text-muted uppercase">
                  {t("streamLabel") || "Outcome Stream"}
                </span>
                <div className="flex flex-wrap gap-1 min-h-[40px] content-start">
                  {flips.length === 0 ? (
                    <span className="text-muted/40 font-mono text-[9px] italic">—</span>
                  ) : (
                    flips.map((flip, i) => (
                      <span
                        key={i}
                        className={`font-mono text-[9.5px] font-bold px-1 rounded transition-all duration-300 ${
                          flip === "H"
                            ? "bg-cyan/15 text-cyan border border-cyan/30"
                            : "bg-border/20 text-muted border border-border/30"
                        }`}
                        style={{
                          opacity: Math.max(0.2, 1.0 - i * 0.05),
                        }}
                      >
                        {flip}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Spin one manual flip button */}
              <button
                type="button"
                onClick={handleFlip}
                className="w-full py-1 bg-void/50 border border-border/40 hover:border-cyan/50 text-[8.5px] font-mono rounded hover:bg-surface-overlay select-none active:scale-95 transition-all text-center"
              >
                {t("flipBtn") || "Flip Coin"}
              </button>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono">
          {/* Readout outputs */}
          <div className="flex items-center justify-between text-[8.5px] pb-1.5 border-b border-border/15">
            <div>
              <span className="text-muted mr-1">{t("probLabel") || "P(Heads)"}:</span>
              <span className="text-cyan font-bold">{p.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted mr-1">P(Tails):</span>
              <span className="text-muted font-bold">{(1 - p).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted mr-1">{t("entropyLabel") || "Entropy"}:</span>
              <span className="text-cyan font-bold">{entropy.toFixed(3)} bits</span>
            </div>
          </div>

          {/* Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
              {t("probLabel") || "Probability"}:
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={p}
              onChange={(e) => setP(Number.parseFloat(e.target.value))}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-foreground w-8 text-right font-bold">{Math.round(p * 100)}%</span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
