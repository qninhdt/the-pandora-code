"use client";

import { ArrowRightLeft, Pause, Play, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GlossaryFrame } from "./shared/frame";

interface BiologicalMarketProps {
  locale: string;
}

interface Point {
  x: number;
  y: number;
}

export default function BiologicalMarket({ locale }: BiologicalMarketProps) {
  const t = useTranslations("viz.mycorrhizalMarket");

  const [carbon, setCarbon] = useState(60); // 0 to 100
  const [partner, setPartner] = useState<"generous" | "cheat">("generous");
  const [round, setRound] = useState(0);
  const [trust, setTrust] = useState(0.5);
  const [history, setHistory] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [particleOffset, setParticleOffset] = useState(0);

  // Compute round rewards/sanctions
  const tradeResult = useMemo(() => {
    const yieldRate = partner === "generous" ? 1.15 : 0.35;
    const trustGain = partner === "generous" ? 0.6 + 0.5 * trust : 1.0;
    const base = carbon * yieldRate * trustGain;
    const rewardBonus = partner === "generous" && carbon > 55 ? (carbon - 55) * 0.45 : 0;
    const phosphorus = Math.round(Math.min(base + rewardBonus, 160));
    const net = phosphorus - carbon;
    const nextTrust =
      partner === "cheat"
        ? Math.max(0, Math.min(1, trust - 0.16))
        : Math.max(0, Math.min(1, trust + (carbon >= 55 ? 0.12 : -0.12)));

    const verdict = partner === "cheat" ? "cheated" : net > 0 ? "reward" : "sanction";
    return { phosphorus, net, nextTrust, verdict };
  }, [carbon, partner, trust]);

  const handleStep = useCallback(() => {
    setRound((r) => r + 1);
    setHistory((prev) => [...prev, tradeResult.net].slice(-10));
    setTrust(tradeResult.nextTrust);
  }, [tradeResult]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      handleStep();
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying, handleStep]);

  // Particle flow animation
  useEffect(() => {
    let animationId: number;
    const tick = () => {
      setParticleOffset((prev) => (prev + 0.015) % 1.0);
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleReset = () => {
    setCarbon(60);
    setPartner("generous");
    setRound(0);
    setTrust(0.5);
    setHistory([]);
    setIsPlaying(false);
  };

  const flowTone = partner === "generous" ? "var(--teal)" : "var(--magenta)";
  const carbonDots = Math.max(2, Math.round(carbon / 20));
  const phosDots = Math.max(2, Math.round(tradeResult.phosphorus / 30));

  // Bezier curve calculations for SVG arcs
  // Plant at (60, 65)
  // Fungus at (315, 65)
  const getCarbonPt = (t: number): Point => {
    const x0 = 60;
    const y0 = 55;
    const x1 = 187;
    const y1 = 20;
    const x2 = 187;
    const y2 = 20;
    const x3 = 315;
    const y3 = 55;
    const u = 1 - t;
    return {
      x: u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
      y: u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
    };
  };

  const getPhosPt = (t: number): Point => {
    const x0 = 315;
    const y0 = 75;
    const x1 = 187;
    const y1 = 110;
    const x2 = 187;
    const y2 = 110;
    const x3 = 60;
    const y3 = 75;
    const u = 1 - t;
    return {
      x: u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
      y: u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
    };
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t(`verdict.${tradeResult.verdict}`)}
      onReset={handleReset}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Marketplace visualization */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-2">
          <div className="relative w-full h-full bg-void/50 border border-border/20 rounded-xl overflow-hidden">
            <svg viewBox="0 0 375 130" className="w-full h-full select-none">
              <title>Underground Mycorrhizal Market Interaction</title>

              {/* Carbon Flow Arc: Plant -> Fungus */}
              <path
                d="M 60 55 C 187 20, 187 20, 315 55"
                fill="none"
                className="stroke-amber/40 stroke-2"
                strokeDasharray="4,4"
              />

              {/* Phosphorus Flow Arc: Fungus -> Plant */}
              <path
                d="M 315 75 C 187 110, 187 110, 60 75"
                fill="none"
                style={{ stroke: flowTone }}
                className="stroke-2 opacity-40"
                strokeDasharray="4,4"
              />

              {/* Carbon flowing particles */}
              {Array.from({ length: carbonDots }).map((_, i) => {
                const tt = (particleOffset + i / carbonDots) % 1.0;
                const pt = getCarbonPt(tt);
                return (
                  <circle
                    key={`c-dot-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="2.5"
                    className="fill-amber"
                    style={{ filter: "drop-shadow(0 0 3px var(--amber))" }}
                  />
                );
              })}

              {/* Phosphorus flowing particles */}
              {Array.from({ length: phosDots }).map((_, i) => {
                const tt = (particleOffset + i / phosDots) % 1.0;
                const pt = getPhosPt(tt);
                return (
                  <circle
                    key={`p-dot-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="2.5"
                    style={{ fill: flowTone, filter: `drop-shadow(0 0 3px ${flowTone})` }}
                  />
                );
              })}

              {/* Plant Node */}
              <circle cx="60" cy="65" r="18" className="fill-cyan/15 stroke-cyan/40 stroke-2" />
              <circle
                cx="60"
                cy="65"
                r="8"
                className="fill-cyan"
                style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }}
              />
              <text
                x="60"
                y="95"
                textAnchor="middle"
                className="fill-muted font-mono text-[8px] font-semibold"
              >
                {t("plant") || "Plant"}
              </text>

              {/* Fungal Node */}
              <circle
                cx="315"
                cy="65"
                r="18"
                className="stroke-2 transition-all duration-300"
                style={{
                  fill:
                    partner === "generous"
                      ? "rgba(43, 212, 168, 0.15)"
                      : "rgba(255, 93, 168, 0.15)",
                  stroke:
                    partner === "generous" ? "rgba(43, 212, 168, 0.4)" : "rgba(255, 93, 168, 0.4)",
                }}
              />
              <circle
                cx="315"
                cy="65"
                r={6 + trust * 6}
                className="transition-all duration-300"
                style={{
                  fill: flowTone,
                  filter: `drop-shadow(0 0 5px ${flowTone})`,
                }}
              />
              <text
                x="315"
                y="95"
                textAnchor="middle"
                className="fill-muted font-mono text-[8px] font-semibold"
              >
                {t("fungus") || "Fungus"}
              </text>

              {/* Center Arrows */}
              <text
                x="187"
                y="38"
                textAnchor="middle"
                className="fill-amber/80 font-mono text-[7px]"
              >
                {t("carbonFlow") || "carbon →"}
              </text>
              <text
                x="187"
                y="102"
                textAnchor="middle"
                style={{ fill: flowTone }}
                className="font-mono text-[7px]"
              >
                {t("phosphorusFlow") || "← phosphorus"}
              </text>
            </svg>

            {/* Readouts overlay */}
            <div className="absolute top-2 left-2 flex gap-3 text-[8.5px] font-mono pointer-events-none">
              <div>
                <span className="text-muted mr-1">{t("phosphorusBack") || "Phos back"}:</span>
                <span className="text-foreground font-bold">{tradeResult.phosphorus}</span>
              </div>
              <div>
                <span className="text-muted mr-1">{t("netLabel") || "Net benefit"}:</span>
                <span
                  className={`font-bold ${tradeResult.net >= 0 ? "text-teal" : "text-magenta"}`}
                >
                  {tradeResult.net > 0 ? "+" : ""}
                  {tradeResult.net}
                </span>
              </div>
              <div>
                <span className="text-muted mr-1">{t("trust") || "Trust"}:</span>
                <span style={{ color: flowTone }} className="font-bold">
                  {Math.round(trust * 100)}%
                </span>
              </div>
            </div>

            <div className="absolute top-2 right-2 text-[8.5px] font-mono pointer-events-none">
              <span className="text-muted mr-1">{t("round") || "Round"}:</span>
              <span className="text-foreground font-bold">{round}</span>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono">
          {/* Partner and trade controls */}
          <div className="flex gap-2 items-center">
            {/* Fungal partner selectors */}
            <div className="flex flex-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setPartner("generous");
                  setRound(0);
                  setTrust(0.5);
                  setHistory([]);
                }}
                className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
                style={{
                  backgroundColor: partner === "generous" ? "var(--teal)" : "transparent",
                  color: partner === "generous" ? "var(--background)" : "var(--foreground)",
                  borderColor: partner === "generous" ? "var(--teal)" : "var(--border)",
                  boxShadow: partner === "generous" ? "0 0 6px rgba(43, 212, 168, 0.3)" : "none",
                }}
              >
                {t("generous") || "Generous Partner"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPartner("cheat");
                  setRound(0);
                  setTrust(0.5);
                  setHistory([]);
                }}
                className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
                style={{
                  backgroundColor: partner === "cheat" ? "var(--magenta)" : "transparent",
                  color: partner === "cheat" ? "var(--background)" : "var(--foreground)",
                  borderColor: partner === "cheat" ? "var(--magenta)" : "var(--border)",
                  boxShadow: partner === "cheat" ? "0 0 6px rgba(255, 93, 168, 0.3)" : "none",
                }}
              >
                {t("cheat") || "Cheat Partner"}
              </button>
            </div>

            {/* Run round button */}
            <button
              type="button"
              onClick={handleStep}
              className="px-2 py-1 bg-void/50 border border-border/40 hover:border-cyan/50 rounded flex items-center gap-1 select-none hover:bg-surface-overlay"
            >
              <ArrowRightLeft size={11} className="text-cyan animate-pulse" />
              <span>{t("step") || "Trade Round"}</span>
            </button>
          </div>

          {/* Carbon slider */}
          <div className="flex items-center gap-3 border-t border-border/15 pt-2">
            <span className="text-[9.5px] font-mono text-muted w-24 truncate uppercase">
              {t("carbonSlider") || "Carbon Sugar Paid"}:
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={carbon}
              onChange={(e) => setCarbon(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-amber"
            />
            <span className="text-amber w-8 text-right font-bold">{carbon}g</span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
