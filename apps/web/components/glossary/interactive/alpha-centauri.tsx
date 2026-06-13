"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function AlphaCentauri() {
  const t = useTranslations("viz.alphaCentauri");
  const [speed, setSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStar, setActiveStar] = useState<string | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    let animationId: number;
    const tick = () => {
      setTime((prev) => prev + 0.02 * speed);
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, speed]);

  const starData: Record<string, { name: string; type: string; temp: string; dist: string }> = {
    A: {
      name: t("starA.name"),
      type: t("starA.type"),
      temp: "5,790 K",
      dist: "1.1 R☉",
    },
    B: {
      name: t("starB.name"),
      type: t("starB.type"),
      temp: "5,260 K",
      dist: "0.86 R☉",
    },
    Proxima: {
      name: t("starProxima.name"),
      type: t("starProxima.type"),
      temp: "3,040 K",
      dist: "0.15 R☉",
    },
  };

  // Coordinates calculated based on time, speed, and zoom
  const center = { x: 200, y: 150 };

  // Binary orbit parameters (A and B orbit barycenter)
  const binaryOrbitRadius = 35 * zoom;
  const aX = center.x + Math.cos(time) * binaryOrbitRadius;
  const aY = center.y + Math.sin(time) * binaryOrbitRadius;

  const bX = center.x - Math.cos(time) * binaryOrbitRadius;
  const bY = center.y - Math.sin(time) * binaryOrbitRadius;

  // Polyphemus orbiting star A
  const polyphemusRadius = 15 * zoom;
  const polyX = aX + Math.cos(time * 3) * polyphemusRadius;
  const polyY = aY + Math.sin(time * 3) * polyphemusRadius;

  // Proxima Centauri orbiting barycenter far away
  const proximaOrbitRadius = 110 * zoom;
  // Moves much slower
  const proxX = center.x + Math.cos(time * 0.1) * proximaOrbitRadius;
  const proxY = center.y + Math.sin(time * 0.1) * proximaOrbitRadius;

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("infoText")}
      onReset={() => {
        setSpeed(1);
        setZoom(1);
        setTime(0);
        setIsPlaying(true);
        setActiveStar(null);
      }}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* The Orrery Canvas */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <svg viewBox="0 0 400 300" className="w-full h-full max-h-[85%] select-none">
            <title>Alpha Centauri Orrery</title>
            {/* Barycenter marker */}
            <circle cx={center.x} cy={center.y} r={2} className="fill-muted/40" />

            {/* Binary orbit path */}
            <circle
              cx={center.x}
              cy={center.y}
              r={binaryOrbitRadius}
              className="fill-none stroke-border/20 stroke-dasharray-[3,3]"
            />

            {/* Proxima orbit path */}
            <circle
              cx={center.x}
              cy={center.y}
              r={proximaOrbitRadius}
              className="fill-none stroke-border/10 stroke-dasharray-[4,4]"
            />

            {/* Polyphemus orbit path around A */}
            <circle
              cx={aX}
              cy={aY}
              r={polyphemusRadius}
              className="fill-none stroke-cyan/10 stroke-1"
            />

            {/* Orbit lines from center to stars for visual aid */}
            <line
              x1={center.x}
              y1={center.y}
              x2={aX}
              y2={aY}
              className="stroke-border/10 stroke-1"
            />
            <line
              x1={center.x}
              y1={center.y}
              x2={bX}
              y2={bY}
              className="stroke-border/10 stroke-1"
            />

            {/* Star A (Yellow Dwarf) */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveStar(activeStar === "A" ? null : "A")}
            >
              <circle cx={aX} cy={aY} r={12} className="fill-yellow-400 opacity-20 animate-pulse" />
              <circle
                cx={aX}
                cy={aY}
                r={8}
                className="fill-yellow-300 hover:fill-yellow-200 transition-colors"
              />
            </g>

            {/* Star B (Orange Dwarf) */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveStar(activeStar === "B" ? null : "B")}
            >
              <circle cx={bX} cy={bY} r={10} className="fill-orange-500 opacity-20 animate-pulse" />
              <circle
                cx={bX}
                cy={bY}
                r={6.5}
                className="fill-orange-400 hover:fill-orange-300 transition-colors"
              />
            </g>

            {/* Proxima Centauri (Red Dwarf) */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveStar(activeStar === "Proxima" ? null : "Proxima")}
            >
              <circle
                cx={proxX}
                cy={proxY}
                r={6}
                className="fill-red-600 opacity-30 animate-pulse"
              />
              <circle
                cx={proxX}
                cy={proxY}
                r={3.5}
                className="fill-red-500 hover:fill-red-400 transition-colors"
              />
            </g>

            {/* Polyphemus (Gas Giant) */}
            <circle
              cx={polyX}
              cy={polyY}
              r={2.5}
              className="fill-cyan"
              style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }}
            />
          </svg>
        </div>

        {/* HUD Overlay for active star details */}
        {activeStar && (
          <div className="absolute top-16 left-4 bg-void/95 border border-border/50 rounded-xl p-3 max-w-[200px] z-10 shadow-lg">
            <h5 className="text-xs font-mono font-bold text-cyan mb-1">
              {starData[activeStar].name}
            </h5>
            <p className="text-[10px] text-muted mb-0.5">{starData[activeStar].type}</p>
            <p className="text-[10px] text-muted mb-0.5">
              Temp: <span className="text-foreground">{starData[activeStar].temp}</span>
            </p>
            <p className="text-[10px] text-muted">
              Radius: <span className="text-foreground">{starData[activeStar].dist}</span>
            </p>
          </div>
        )}

        {/* Bottom controls panel */}
        <div className="relative z-10 w-full flex items-center justify-between gap-4 mt-auto bg-void/60 backdrop-blur-sm px-4 py-2 border border-border/30 rounded-xl">
          <div className="flex items-center gap-4 flex-1">
            {/* Speed slider */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] font-mono text-muted uppercase">{t("speed")}</span>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
                className="w-full h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
              />
              <span className="text-[10px] font-mono text-foreground w-6 text-right">{speed}x</span>
            </div>

            {/* Zoom slider */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] font-mono text-muted uppercase">{t("zoom")}</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
                className="w-full h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
              />
              <span className="text-[10px] font-mono text-foreground w-6 text-right">{zoom}x</span>
            </div>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
