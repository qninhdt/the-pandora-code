"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function Exomoon() {
  const t = useTranslations("viz.exomoon");

  // Heat sources values (0..100)
  const [starlight, setStarlight] = useState(25);
  const [planetshine, setPlanetshine] = useState(10);
  const [giantIR, setGiantIR] = useState(15);
  const [tidal, setTidal] = useState(10);

  const totalHeat = starlight + planetshine + giantIR + tidal;

  // Habitable bounds: total energy must sit between 45 and 75
  const minHabitable = 45;
  const maxHabitable = 75;

  let stateKey: "frozen" | "habitable" | "scorched" = "frozen";
  let statusClass = "text-muted";
  let statusText = t("frozen");
  let moonColor = "#8a93a8"; // Frozen/ice color
  let activeGlow = "rgba(138, 147, 168, 0.4)";

  if (totalHeat > maxHabitable) {
    stateKey = "scorched";
    statusClass = "text-magenta";
    statusText = t("scorched");
    moonColor = "#ff5da8"; // Lava/scorched color
    activeGlow = "rgba(255, 93, 168, 0.6)";
  } else if (totalHeat >= minHabitable) {
    stateKey = "habitable";
    statusClass = "text-teal";
    statusText = t("habitable");
    moonColor = "#2bd4a8"; // Living Teal
    activeGlow = "rgba(43, 212, 168, 0.6)";
  }

  // Layout center coordinates
  const polyCenter = { x: 100, y: 130 };
  const moonCenter = { x: 260, y: 130 };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={() => {
        setStarlight(25);
        setPlanetshine(10);
        setGiantIR(15);
        setTidal(10);
      }}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* Interactive canvas / visualization */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-28">
          <svg viewBox="0 0 400 240" className="w-full h-full max-h-[80%] select-none">
            <title>Exomoon Energy Balance</title>
            <defs>
              {/* Polyphemus glow */}
              <radialGradient id="polyGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0e1320" />
                <stop offset="70%" stopColor="#143b46" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#143b46" stopOpacity="0" />
              </radialGradient>

              {/* Moon glow */}
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={moonColor} />
                <stop offset="40%" stopColor={moonColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={moonColor} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Direct Starlight rays (coming from right) */}
            <g opacity={starlight / 100}>
              <path
                d="M 370 70 L 300 100"
                className="stroke-amber/30 stroke-2 stroke-dasharray-[4,4]"
              />
              <path
                d="M 370 130 L 290 130"
                className="stroke-amber/30 stroke-2 stroke-dasharray-[4,4]"
              />
              <path
                d="M 370 190 L 300 160"
                className="stroke-amber/30 stroke-2 stroke-dasharray-[4,4]"
              />
            </g>

            {/* Gas Giant - Polyphemus */}
            <circle cx={polyCenter.x} cy={polyCenter.y} r={70} fill="url(#polyGlow)" />
            <circle
              cx={polyCenter.x}
              cy={polyCenter.y}
              r={55}
              fill="#070912"
              className="stroke-cyan/30 stroke-2"
              style={{ filter: "drop-shadow(0 0 15px rgba(54, 197, 217, 0.2))" }}
            />
            {/* Polyphemus atmospheric bands */}
            <path d="M 50 110 Q 100 115 150 110" className="stroke-cyan/15 stroke-1 fill-none" />
            <path d="M 47 130 Q 100 135 153 130" className="stroke-cyan/20 stroke-1.5 fill-none" />
            <path d="M 50 150 Q 100 155 150 150" className="stroke-cyan/15 stroke-1 fill-none" />

            {/* Planetshine rays (reflected starlight from Polyphemus to moon) */}
            <g opacity={planetshine / 100}>
              <path
                d="M 155 130 Q 200 110 240 125"
                className="stroke-cyan/40 stroke-1.5 stroke-dasharray-[3,3] fill-none"
              />
              <path
                d="M 155 135 Q 200 135 240 132"
                className="stroke-cyan/40 stroke-1.5 stroke-dasharray-[3,3] fill-none"
              />
            </g>

            {/* Gas Giant IR thermal radiation (red/purple heatwaves) */}
            <g opacity={giantIR / 100}>
              <circle
                cx={polyCenter.x}
                cy={polyCenter.y}
                r={65}
                className="fill-none stroke-magenta/10 stroke-2 animate-pulse"
              />
              <path
                d="M 155 120 C 180 115, 200 125, 235 120"
                className="stroke-magenta/25 stroke-1 fill-none"
              />
              <path
                d="M 155 140 C 180 145, 200 135, 235 140"
                className="stroke-magenta/25 stroke-1 fill-none"
              />
            </g>

            {/* Orbit path line */}
            <circle
              cx={polyCenter.x}
              cy={polyCenter.y}
              r={160}
              className="fill-none stroke-border/10 stroke-1"
            />

            {/* Exomoon representation */}
            <g>
              {/* Tidal heating internal core glow */}
              <circle
                cx={moonCenter.x}
                cy={moonCenter.y}
                r={16}
                fill="url(#moonGlow)"
                className="transition-all duration-300"
              />
              <circle
                cx={moonCenter.x}
                cy={moonCenter.y}
                r={8}
                fill={moonColor}
                className="transition-colors duration-300"
                style={{ filter: `drop-shadow(0 0 8px ${activeGlow})` }}
              />
              {/* Core tidal heat point inside the moon */}
              {tidal > 15 && (
                <circle
                  cx={moonCenter.x}
                  cy={moonCenter.y}
                  r={2.5}
                  fill="#ffb454"
                  className="animate-ping"
                />
              )}
            </g>

            {/* Labels */}
            <text
              x={polyCenter.x}
              y={polyCenter.y - 65}
              className="fill-muted/50 text-[8px] font-mono text-center"
              textAnchor="middle"
            >
              POLYPHEMUS
            </text>
            <text
              x={moonCenter.x}
              y={moonCenter.y - 24}
              className="fill-muted/50 text-[8px] font-mono text-center"
              textAnchor="middle"
            >
              EXOMOON
            </text>
          </svg>
        </div>

        {/* HUD Indicator showing thermometer and status */}
        <div className="absolute top-16 left-4 right-4 flex justify-between gap-4 pointer-events-none z-10">
          {/* State Readout */}
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 min-w-[140px] pointer-events-auto shadow-lg">
            <h5 className="text-[10px] font-mono font-bold text-muted uppercase mb-1">
              {t("status")}
            </h5>
            <div className="text-xs font-mono font-semibold tracking-wide">
              <span className={statusClass}>{statusText}</span>
            </div>
            <div className="text-[9px] text-muted mt-1 font-mono">
              Total Heat: <span className="text-foreground">{totalHeat} W/m²</span>
            </div>
          </div>

          {/* Thermometer Bar */}
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 w-[160px] pointer-events-auto flex flex-col justify-center shadow-lg">
            <div className="flex justify-between text-[9px] font-mono text-muted mb-1">
              <span>HEAT INDEX</span>
              <span className="text-foreground">{totalHeat}/120</span>
            </div>
            <div className="relative w-full h-3 rounded bg-surface border border-border/20 overflow-hidden">
              {/* Habitable Range overlay */}
              <div
                className="absolute top-0 bottom-0 bg-teal/15 border-x border-teal/20"
                style={{
                  left: `${(minHabitable / 120) * 100}%`,
                  right: `${100 - (maxHabitable / 120) * 100}%`,
                }}
              />
              {/* Aggregated value bar */}
              <div
                className={`h-full transition-all duration-300 ${
                  stateKey === "habitable"
                    ? "bg-teal"
                    : stateKey === "scorched"
                      ? "bg-magenta"
                      : "bg-muted"
                }`}
                style={{ width: `${Math.min(100, (totalHeat / 120) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[7px] font-mono text-muted/60 mt-1">
              <span>0 (Cold)</span>
              <span className="text-teal/75">TEMPERATE</span>
              <span>120 (Hot)</span>
            </div>
          </div>
        </div>

        {/* Bottom sliders control panel */}
        <div className="relative z-10 w-full grid grid-cols-2 gap-x-6 gap-y-2 mt-auto bg-void/65 backdrop-blur-md px-4 py-3 border border-border/30 rounded-xl">
          {/* Starlight */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted uppercase w-16 truncate">
              {t("starlight")}
            </span>
            <input
              type="range"
              min="0"
              max="50"
              value={starlight}
              onChange={(e) => setStarlight(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[9px] font-mono text-foreground w-6 text-right">{starlight}</span>
          </div>

          {/* Planetshine */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted uppercase w-16 truncate">
              {t("planetshine")}
            </span>
            <input
              type="range"
              min="0"
              max="20"
              value={planetshine}
              onChange={(e) => setPlanetshine(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[9px] font-mono text-foreground w-6 text-right">
              {planetshine}
            </span>
          </div>

          {/* Giant IR */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted uppercase w-16 truncate">
              {t("giantIR")}
            </span>
            <input
              type="range"
              min="0"
              max="30"
              value={giantIR}
              onChange={(e) => setGiantIR(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[9px] font-mono text-foreground w-6 text-right">{giantIR}</span>
          </div>

          {/* Tidal */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted uppercase w-16 truncate">
              {t("tidalHeating")}
            </span>
            <input
              type="range"
              min="0"
              max="30"
              value={tidal}
              onChange={(e) => setTidal(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded-lg bg-surface border border-border/20 appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[9px] font-mono text-foreground w-6 text-right">{tidal}</span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
