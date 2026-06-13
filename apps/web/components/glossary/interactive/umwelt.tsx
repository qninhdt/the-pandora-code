"use client";

import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

export default function Umwelt() {
  const t = useTranslations("viz.umwelt");

  // State: sensory mode
  // 'human' | 'biolum' | 'echo' | 'magnetic' | 'thermal'
  const [sensorMode, setSensorMode] = useState<
    "human" | "biolum" | "echo" | "magnetic" | "thermal"
  >("human");

  const handleReset = () => {
    setSensorMode("human");
  };

  // SVG parameters
  const viewWidth = 400;
  const viewHeight = 160;

  // Background and element styles based on selected sensor goggles
  const bgClass = "bg-void transition-colors duration-500";
  let sceneStyle: React.CSSProperties = {};

  if (sensorMode === "human") {
    sceneStyle = { background: "radial-gradient(circle, #0e1320 0%, #070912 100%)" };
  } else if (sensorMode === "biolum") {
    sceneStyle = { background: "#030408" };
  } else if (sensorMode === "echo") {
    sceneStyle = { background: "#010204" };
  } else if (sensorMode === "magnetic") {
    sceneStyle = { background: "#05060f" };
  } else if (sensorMode === "thermal") {
    sceneStyle = { background: "#110b24" };
  }

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={handleReset}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Perception viewport */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-4">
          <div
            className="relative w-full h-full border border-border/20 rounded-xl overflow-hidden shadow-2xl transition-colors duration-500"
            style={sceneStyle}
          >
            <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-full select-none">
              <title>Ecosystem seen through different sensory filters</title>

              {/* 1. MAGNETIC FIELD LINES (rendered in background if magnetic mode is on) */}
              {sensorMode === "magnetic" && (
                <g className="stroke-amber/35 fill-none stroke-[0.8] animate-pulse">
                  <path d="M -20 80 Q 100 -20 200 80 T 420 80" strokeDasharray="3,3" />
                  <path d="M -20 80 Q 100 20 200 80 T 420 80" />
                  <path d="M -20 80 Q 100 60 200 80 T 420 80" />
                  <path d="M -20 80 Q 100 100 200 80 T 420 80" />
                  <path d="M -20 80 Q 100 140 200 80 T 420 80" strokeDasharray="3,3" />
                </g>
              )}

              {/* 2. BACKGROUND FOREST TREES */}
              {/* Silhouette Trees */}
              <g
                className="transition-all duration-500"
                style={{
                  opacity: sensorMode === "echo" ? 0.3 : 0.7,
                  filter: sensorMode === "thermal" ? "hue-rotate(180deg) saturate(0.5)" : "none",
                }}
              >
                {/* Tree Left */}
                <path
                  d="M 10 160 L 35 30 L 55 30 L 80 160 Z"
                  fill={
                    sensorMode === "human"
                      ? "#0a1f26"
                      : sensorMode === "biolum"
                        ? "#02080a"
                        : sensorMode === "magnetic"
                          ? "#06141a"
                          : "#1a0f30"
                  }
                />
                <circle
                  cx="45"
                  cy="30"
                  r="25"
                  fill={
                    sensorMode === "human"
                      ? "#0c2830"
                      : sensorMode === "biolum"
                        ? "#01080a"
                        : sensorMode === "magnetic"
                          ? "#071c24"
                          : "#22123d"
                  }
                />

                {/* Tree Right */}
                <path
                  d="M 320 160 L 335 10 L 350 10 L 375 160 Z"
                  fill={
                    sensorMode === "human"
                      ? "#0a1f26"
                      : sensorMode === "biolum"
                        ? "#02080a"
                        : sensorMode === "magnetic"
                          ? "#06141a"
                          : "#1a0f30"
                  }
                />
                <circle
                  cx="342"
                  cy="20"
                  r="30"
                  fill={
                    sensorMode === "human"
                      ? "#0c2830"
                      : sensorMode === "biolum"
                        ? "#01080a"
                        : sensorMode === "magnetic"
                          ? "#071c24"
                          : "#22123d"
                  }
                />
              </g>

              {/* 3. BIOLUMINESCENT PLANTS / SPORES (glows bright cyan in biolum and human, thermal in thermal, off in echo) */}
              {(sensorMode === "human" || sensorMode === "biolum" || sensorMode === "thermal") && (
                <g className="transition-all duration-500">
                  {/* Glowing Spore particles on left tree */}
                  <circle
                    cx="35"
                    cy="40"
                    r="2.5"
                    fill={sensorMode === "thermal" ? "#ff4040" : "var(--cyan)"}
                    className={sensorMode !== "human" ? "animate-pulse" : ""}
                    style={{
                      filter: `drop-shadow(0 0 3px ${sensorMode === "thermal" ? "#ff4040" : "var(--cyan)"})`,
                    }}
                  />
                  <circle
                    cx="55"
                    cy="25"
                    r="1.8"
                    fill={sensorMode === "thermal" ? "#ff6040" : "var(--teal)"}
                    style={{
                      filter: `drop-shadow(0 0 2px ${sensorMode === "thermal" ? "#ff6040" : "var(--teal)"})`,
                    }}
                  />

                  {/* Glowing Spore particles on right tree */}
                  <circle
                    cx="330"
                    cy="35"
                    r="2.2"
                    fill={sensorMode === "thermal" ? "#ff4040" : "var(--cyan)"}
                    style={{
                      filter: `drop-shadow(0 0 3px ${sensorMode === "thermal" ? "#ff4040" : "var(--cyan)"})`,
                    }}
                  />
                  <circle
                    cx="350"
                    cy="15"
                    r="3"
                    fill={sensorMode === "thermal" ? "#ffaa40" : "var(--cyan)"}
                    className={sensorMode !== "human" ? "animate-pulse" : ""}
                    style={{
                      filter: `drop-shadow(0 0 5px ${sensorMode === "thermal" ? "#ff5000" : "var(--cyan)"})`,
                    }}
                  />
                </g>
              )}

              {/* 4. PREY (Hexapede silhouette & perception) */}
              <g transform="translate(100, 30)">
                {/* Silhouette / Body outline */}
                <path
                  d="M 160 110 Q 155 75 140 75 Q 125 75 120 100 Q 110 80 100 80 L 100 70 L 95 72 L 95 85 Q 90 90 92 105 L 85 110 Q 75 90 70 95 L 75 110 L 75 130 L 80 130 L 82 110 L 92 110 L 90 130 L 95 130 L 98 108 M 125 100 L 122 130 L 127 130 L 131 104 M 140 100 L 138 130 L 143 130 L 145 102 M 155 102 L 152 130 L 157 130 Z"
                  fill={
                    sensorMode === "human"
                      ? "#112e38"
                      : sensorMode === "biolum"
                        ? "#020c0e"
                        : sensorMode === "echo"
                          ? "none"
                          : sensorMode === "magnetic"
                            ? "#05161c"
                            : "#ff3a00" // Thermal (Prey is warm-blooded red/orange)
                  }
                  stroke={
                    sensorMode === "echo"
                      ? "var(--cyan)"
                      : sensorMode === "magnetic"
                        ? "var(--border)"
                        : "none"
                  }
                  strokeWidth={sensorMode === "echo" ? 1.5 : 0}
                  className="transition-all duration-500"
                />

                {/* Bioluminescent stripes on Prey (Human or Biolum mode) */}
                {(sensorMode === "human" || sensorMode === "biolum") && (
                  <g
                    className="fill-none stroke-cyan stroke-[1.2]"
                    style={{ filter: "drop-shadow(0 0 2px var(--cyan))" }}
                  >
                    <path d="M 120 90 Q 125 80 130 92" />
                    <path d="M 130 90 Q 135 82 140 92" />
                    <path d="M 140 90 Q 145 84 150 92" />
                  </g>
                )}

                {/* Magnetosome indicators inside Prey (Magnetic mode) */}
                {sensorMode === "magnetic" && (
                  <g className="fill-amber animate-pulse">
                    <circle cx="102" cy="88" r="1.5" />
                    <circle cx="118" cy="85" r="1.5" />
                    <circle cx="132" cy="88" r="1.5" />
                    {/* Magnetic alignment vector */}
                    <line
                      x1="90"
                      y1="88"
                      x2="150"
                      y2="88"
                      className="stroke-amber/40 stroke-1"
                      strokeDasharray="2,2"
                    />
                  </g>
                )}
              </g>

              {/* 5. PREDATOR (Viperwolf crouching & stalking) */}
              <g transform="translate(40, 50)">
                {/* Silhouette / Body outline */}
                <path
                  d="M 190 110 Q 210 90 235 90 Q 255 90 265 110 L 270 102 L 278 102 Q 284 85 292 85 Q 298 90 295 105 L 305 108 L 308 102 Q 312 95 318 95 L 322 97 L 316 106 Q 320 110 314 116 L 316 120 L 310 120 L 304 114 Q 280 112 268 114 M 225 105 L 222 120 L 227 120 L 230 108 M 240 106 L 238 120 L 243 120 L 245 108 M 282 110 L 278 120 L 283 120 L 286 112 M 294 111 L 290 120 L 295 120 L 298 113 Z"
                  fill={
                    sensorMode === "human"
                      ? "#1b192e"
                      : sensorMode === "biolum"
                        ? "#080512"
                        : sensorMode === "echo"
                          ? "none"
                          : sensorMode === "magnetic"
                            ? "#0c0817"
                            : "#ffcc00" // Thermal (Predator is actively warm-blooded yellow/orange)
                  }
                  stroke={
                    sensorMode === "echo"
                      ? "var(--magenta)"
                      : sensorMode === "magnetic"
                        ? "var(--border)"
                        : "none"
                  }
                  strokeWidth={sensorMode === "echo" ? 1.5 : 0}
                  className="transition-all duration-500"
                />

                {/* Active eyes glowing */}
                <circle
                  cx="312"
                  cy="100"
                  r="1.8"
                  fill={sensorMode === "thermal" ? "#ffffff" : "var(--magenta)"}
                  style={{
                    filter: `drop-shadow(0 0 2px ${sensorMode === "thermal" ? "#ffffff" : "var(--magenta)"})`,
                  }}
                />

                {/* Bioluminescent markings on Predator (Human/Biolum mode) */}
                {(sensorMode === "human" || sensorMode === "biolum") && (
                  <g
                    className="fill-none stroke-magenta/80 stroke-[1]"
                    style={{ filter: "drop-shadow(0 0 2.5px var(--magenta))" }}
                  >
                    <circle cx="230" cy="98" r="1" className="fill-magenta" />
                    <circle cx="240" cy="98" r="1" className="fill-magenta" />
                    <circle cx="250" cy="99" r="1" className="fill-magenta" />
                    <circle cx="260" cy="101" r="1" className="fill-magenta" />
                    <circle cx="270" cy="103" r="1" className="fill-magenta" />
                  </g>
                )}
              </g>

              {/* 6. ECHOLOCATION CONCENTRIC CONTUOR RINGS (rendered in echo mode) */}
              {sensorMode === "echo" && (
                <g className="stroke-cyan fill-none stroke-1 opacity-70">
                  {/* Concentric sound rings expanding from hexapede ears */}
                  <circle
                    cx="200"
                    cy="110"
                    r="15"
                    className="animate-ping"
                    style={{ animationDuration: "3s" }}
                  />
                  <circle
                    cx="200"
                    cy="110"
                    r="30"
                    className="animate-ping"
                    style={{ animationDuration: "3s", animationDelay: "0.75s" }}
                  />
                  <circle
                    cx="200"
                    cy="110"
                    r="50"
                    className="animate-ping"
                    style={{ animationDuration: "3s", animationDelay: "1.5s" }}
                  />

                  {/* concentric echoes returning from predator */}
                  <circle
                    cx="340"
                    cy="155"
                    r="25"
                    className="stroke-magenta"
                    strokeDasharray="3,3"
                  />
                </g>
              )}
            </svg>

            {/* Viewport label overlay */}
            <div className="absolute top-2.5 left-2.5 bg-void/70 backdrop-blur-sm px-2 py-0.5 border border-border/20 rounded font-mono text-[9px] text-muted">
              {sensorMode === "human" && t("humanVisible")}
              {sensorMode === "biolum" && t("biolumFilter")}
              {sensorMode === "echo" && t("echoFilter")}
              {sensorMode === "magnetic" && t("magneticFilter")}
              {sensorMode === "thermal" && t("thermalFilter")}
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-2.5 border border-border/30 rounded-xl flex flex-col gap-2 z-10">
          <span className="text-[8px] font-mono text-muted uppercase tracking-wider block border-b border-border/15 pb-1">
            {t("gogglesLabel")}
          </span>

          <div className="flex flex-wrap gap-1.5">
            {/* Human Visible */}
            <button
              type="button"
              onClick={() => setSensorMode("human")}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: sensorMode === "human" ? "var(--muted)" : "transparent",
                color: sensorMode === "human" ? "var(--background)" : "var(--foreground)",
                borderColor: sensorMode === "human" ? "var(--muted)" : "var(--border)",
              }}
            >
              {t("humanFilter") || "Human"}
            </button>

            {/* Biolum */}
            <button
              type="button"
              onClick={() => setSensorMode("biolum")}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: sensorMode === "biolum" ? "var(--cyan)" : "transparent",
                color: sensorMode === "biolum" ? "var(--background)" : "var(--foreground)",
                borderColor: sensorMode === "biolum" ? "var(--cyan)" : "var(--border)",
                boxShadow: sensorMode === "biolum" ? "0 0 6px rgba(54, 197, 217, 0.3)" : "none",
              }}
            >
              {t("biolumFilter") || "Biolum"}
            </button>

            {/* Echolocation */}
            <button
              type="button"
              onClick={() => setSensorMode("echo")}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: sensorMode === "echo" ? "var(--magenta)" : "transparent",
                color: sensorMode === "echo" ? "var(--background)" : "var(--foreground)",
                borderColor: sensorMode === "echo" ? "var(--magenta)" : "var(--border)",
                boxShadow: sensorMode === "echo" ? "0 0 6px rgba(255, 93, 168, 0.3)" : "none",
              }}
            >
              {t("echoFilter") || "Echoloc"}
            </button>

            {/* Magnetic */}
            <button
              type="button"
              onClick={() => setSensorMode("magnetic")}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: sensorMode === "magnetic" ? "var(--amber)" : "transparent",
                color: sensorMode === "magnetic" ? "var(--background)" : "var(--foreground)",
                borderColor: sensorMode === "magnetic" ? "var(--amber)" : "var(--border)",
                boxShadow: sensorMode === "magnetic" ? "0 0 6px rgba(255, 180, 84, 0.3)" : "none",
              }}
            >
              {t("magneticFilter") || "Magnetic"}
            </button>

            {/* Thermal */}
            <button
              type="button"
              onClick={() => setSensorMode("thermal")}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: sensorMode === "thermal" ? "var(--teal)" : "transparent",
                color: sensorMode === "thermal" ? "var(--background)" : "var(--foreground)",
                borderColor: sensorMode === "thermal" ? "var(--teal)" : "var(--border)",
                boxShadow: sensorMode === "thermal" ? "0 0 6px rgba(43, 212, 168, 0.3)" : "none",
              }}
            >
              {t("thermalFilter") || "Thermal"}
            </button>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
