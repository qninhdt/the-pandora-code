"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function HadleyCell() {
  const t = useTranslations("viz.circulationBands");

  const [isPlaying, setIsPlaying] = useState(true);
  const [isSlowSpin, setIsSlowSpin] = useState(true); // Slow spin (Pandora) vs Fast spin (Earth)
  const [heating, setHeating] = useState(1.0); // Heating factor 0.5 to 1.5
  const [particleOffset, setParticleOffset] = useState(0);

  // Animation ticks for air flow particles
  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;

    const tick = () => {
      setParticleOffset((prev) => (prev + 0.01 * heating) % 1.0);
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, heating]);

  const handleReset = () => {
    setIsPlaying(true);
    setIsSlowSpin(true);
    setHeating(1.0);
  };

  // Dimensions
  const viewWidth = 400;
  const viewHeight = 150;
  const ySurface = 120;

  // Boundary where air sinks
  // Fast spin (Earth) -> Sinks at 30 degrees latitude (x=150)
  // Slow spin (Pandora) -> Sinks at 55 degrees latitude (x=270)
  const xSink = isSlowSpin ? 280 : 150;

  // Render wind circulation loops
  const renderCirculationLoops = () => {
    // We draw circles or smooth pill loops for the Hadley cell
    const loops = [];
    const particleCount = 10;

    for (let i = 0; i < particleCount; i++) {
      const p = (particleOffset + i / particleCount) % 1.0;

      // Calculate coordinates along the rectangular loop (Equator at x=40 to x=xSink, y=55 to y=110)
      let px = 40;
      let py = 110;

      if (p < 0.25) {
        // 1. Rising at Equator (x=40, y goes from 110 to 55)
        const sub = p / 0.25;
        px = 40;
        py = 110 - sub * 55;
      } else if (p < 0.5) {
        // 2. High-altitude flow (y=55, x goes from 40 to xSink)
        const sub = (p - 0.25) / 0.25;
        px = 40 + sub * (xSink - 40);
        py = 55;
      } else if (p < 0.75) {
        // 3. Sinking at horse latitudes (x=xSink, y goes from 55 to 110)
        const sub = (p - 0.5) / 0.25;
        px = xSink;
        py = 55 + sub * 55;
      } else {
        // 4. Return trade winds along surface (y=110, x goes from xSink to 40)
        const sub = (p - 0.75) / 0.25;
        px = xSink - sub * (xSink - 40);
        py = 110;
      }

      loops.push(
        <circle
          key={i}
          cx={px}
          cy={py}
          r="2.5"
          fill={py > 80 ? "var(--cyan)" : "var(--amber)"}
          style={{
            filter:
              py > 80
                ? "drop-shadow(0 0 3px rgba(54, 197, 217, 0.6))"
                : "drop-shadow(0 0 3px rgba(255, 180, 84, 0.6))",
            opacity: 0.8,
          }}
        />,
      );
    }
    return loops;
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("intro")}
      onReset={handleReset}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Hadley Cell Cross section */}
        <div className="w-full flex-1 flex flex-col justify-start pb-28 pt-2">
          <div className="relative w-full h-full bg-void/30 border border-border/15 rounded-xl overflow-hidden">
            <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-full select-none">
              <title>Atmospheric Hadley cell circulation loops</title>

              {/* Surface ground line */}
              <line
                x1="20"
                y1={ySurface}
                x2="380"
                y2={ySurface}
                className="stroke-border-strong stroke-2"
              />

              {/* Biome green zone (Rainforest) under rising air at x=40 */}
              <rect
                x="25"
                y={ySurface - 4}
                width={xSink - 30}
                height="4"
                className="fill-teal transition-all duration-500"
                style={{ filter: "drop-shadow(0 0 4px var(--teal))" }}
              />

              {/* Biome desert zone (Dry land) under sinking air at x=xSink */}
              <rect
                x={xSink - 15}
                y={ySurface - 4}
                width="40"
                className="fill-amber transition-all duration-500"
                style={{ filter: "drop-shadow(0 0 4px var(--amber))" }}
              />

              {/* Equator rising heat wave representation */}
              <g className="stroke-magenta/30 fill-none stroke-[1.5]">
                <path d="M 28 120 Q 33 100 28 80 T 28 40" className="animate-pulse" />
                <path d="M 40 120 Q 45 100 40 80 T 40 40" />
                <path d="M 52 120 Q 57 100 52 80 T 52 40" className="animate-pulse" />
              </g>

              {/* Hadley Cell Loop path guides */}
              <rect
                x="40"
                y="55"
                width={xSink - 40}
                height="55"
                fill="none"
                className="stroke-border/10 stroke-[0.8]"
                strokeDasharray="2,2"
              />

              {/* Rising Air label (Equator) */}
              <text
                x="40"
                y="32"
                className="fill-cyan font-mono text-[7px] text-center"
                textAnchor="middle"
              >
                {t("rising") || "Air Rises"}
              </text>
              <text
                x="40"
                y="138"
                className="fill-muted font-mono text-[8.5px] text-center"
                textAnchor="middle"
              >
                {t("equator") || "Equator"} (0°)
              </text>

              {/* Sinking Air label */}
              <text
                x={xSink}
                y="32"
                className="fill-amber font-mono text-[7px] text-center"
                textAnchor="middle"
              >
                {t("sinking") || "Air Sinks"}
              </text>
              <text
                x={xSink}
                y="138"
                className="fill-muted font-mono text-[8.5px] text-center"
                textAnchor="middle"
              >
                {isSlowSpin ? "55° Lat" : "30° Lat"}
              </text>

              {/* Render wind loop particles */}
              {renderCirculationLoops()}

              {/* Biome text labels overlay */}
              <text
                x={(xSink + 40) / 2}
                y={ySurface - 10}
                className="fill-teal font-mono text-[7.5px] text-center"
                textAnchor="middle"
              >
                {t("rainforest") || "Rainforest"}
              </text>
              <text
                x={xSink + 5}
                y={ySurface - 10}
                className="fill-amber font-mono text-[7.5px] text-center"
                textAnchor="middle"
              >
                {t("desert") || "Desert"}
              </text>
            </svg>

            {/* Cell scale description tag */}
            <div className="absolute top-2.5 left-2.5 bg-void/70 backdrop-blur-sm px-2 py-0.5 border border-border/20 rounded font-mono text-[8.5px] text-muted">
              {isSlowSpin
                ? t("pandoraSpin") || "Slow Spin (26h day)"
                : t("earthSpin") || "Fast Spin (24h day)"}
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono">
          {/* Planet Spin speed toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsSlowSpin(false)}
              className="flex-1 py-1.5 px-1 rounded border font-mono text-[10px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: !isSlowSpin ? "var(--muted)" : "transparent",
                color: !isSlowSpin ? "var(--background)" : "var(--foreground)",
                borderColor: !isSlowSpin ? "var(--muted)" : "var(--border)",
              }}
            >
              {t("earth") || "Fast Spin (Earth)"}
            </button>

            <button
              type="button"
              onClick={() => setIsSlowSpin(true)}
              className="flex-1 py-1.5 px-1 rounded border font-mono text-[10px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: isSlowSpin ? "var(--cyan)" : "transparent",
                color: isSlowSpin ? "var(--background)" : "var(--foreground)",
                borderColor: isSlowSpin ? "var(--cyan)" : "var(--border)",
                boxShadow: isSlowSpin ? "0 0 8px rgba(54, 197, 217, 0.4)" : "none",
              }}
            >
              {t("pandora") || "Slow Spin (Pandora)"}
            </button>
          </div>

          {/* Equator heating intensity slider */}
          <div className="flex items-center gap-3 border-t border-border/15 pt-2">
            <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
              {t("equatorHeating")}:
            </span>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={heating}
              onChange={(e) => setHeating(Number.parseFloat(e.target.value))}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-foreground w-8 text-right">{Math.round(heating * 100)}%</span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
