"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

interface ForestLayer {
  id: string;
  color: string;
  glowColor: string;
  y: number;
  height: number;
}

const LAYERS: ForestLayer[] = [
  {
    id: "canopy",
    color: "#36c5d9", // Pandora Cyan
    glowColor: "rgba(54, 197, 217, 0.4)",
    y: 20,
    height: 45,
  },
  {
    id: "midstory",
    color: "#2bd4a8", // Living Teal
    glowColor: "rgba(43, 212, 168, 0.4)",
    y: 75,
    height: 60,
  },
  {
    id: "floor",
    color: "#ff5da8", // Biolum Magenta
    glowColor: "rgba(255, 93, 168, 0.4)",
    y: 145,
    height: 45,
  },
];

export default function NichePartitioning() {
  const t = useTranslations("viz.nichePartition");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const selectedLayer = selectedLayerId ? LAYERS.find((l) => l.id === selectedLayerId) : null;

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={() => setSelectedLayerId(null)}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* SVG Diagram of Forest Layers */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-36">
          <svg viewBox="0 0 400 200" className="w-full h-full max-h-[85%] select-none">
            <title>Niche Partitioning layers</title>

            {/* Tree trunk representation */}
            <path
              d="M 120 200 L 120 10 L 130 10 L 130 200 Z"
              fill="#0e1320"
              stroke="var(--border)"
              strokeWidth="1"
            />
            {/* Tree roots */}
            <path
              d="M 120 180 Q 90 200 60 200 M 130 180 Q 160 200 190 200"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
            />

            {/* Render Forest Layers */}
            {LAYERS.map((layer) => {
              const isSelected = selectedLayerId === layer.id;
              const nameText = t(`glossaryLayers.${layer.id}.name`);
              return (
                <g
                  key={layer.id}
                  onClick={() => setSelectedLayerId(isSelected ? null : layer.id)}
                  className="cursor-pointer transition-all duration-300"
                >
                  {/* Layer visual guide rectangle */}
                  <rect
                    x="40"
                    y={layer.y}
                    width="320"
                    height={layer.height}
                    fill={isSelected ? layer.glowColor : "transparent"}
                    stroke={isSelected ? layer.color : "var(--border)"}
                    strokeWidth={isSelected ? 2 : 1}
                    className="rx-lg transition-colors duration-200"
                    style={{ strokeDasharray: isSelected ? "none" : "5,4" }}
                  />

                  {/* Leaf clusters or indicators representing canopy / midstory */}
                  {layer.id === "canopy" && (
                    <path
                      d="M 80 40 Q 120 15 160 40 M 240 40 Q 280 15 320 40"
                      fill="none"
                      stroke={isSelected ? layer.color : "var(--border-strong)"}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                  )}

                  {layer.id === "midstory" && (
                    <path
                      d="M 100 105 Q 125 90 150 105 M 220 105 Q 245 90 270 105"
                      fill="none"
                      stroke={isSelected ? layer.color : "var(--border-strong)"}
                      strokeWidth={isSelected ? 1.5 : 1}
                    />
                  )}

                  {/* Layer text label */}
                  <text
                    x="350"
                    y={layer.y + layer.height / 2 + 3}
                    className="text-[9px] font-mono select-none"
                    style={{ fill: isSelected ? layer.color : "var(--muted)" }}
                    textAnchor="end"
                  >
                    {nameText}
                  </text>
                </g>
              );
            })}

            {/* Glowing active dots representing feeding creatures in selected zones */}
            <g pointerEvents="none">
              <circle
                cx="100"
                cy="40"
                r="3"
                fill="var(--cyan)"
                className="animate-ping"
                opacity={selectedLayerId === "canopy" ? 1 : 0}
              />
              <circle
                cx="280"
                cy="40"
                r="3"
                fill="var(--cyan)"
                opacity={selectedLayerId === "canopy" ? 0.8 : 0.2}
              />

              <circle
                cx="110"
                cy="100"
                r="2.5"
                fill="var(--teal)"
                className="animate-pulse"
                opacity={selectedLayerId === "midstory" ? 1 : 0.2}
              />
              <circle
                cx="250"
                cy="110"
                r="2.5"
                fill="var(--teal)"
                opacity={selectedLayerId === "midstory" ? 0.8 : 0.2}
              />

              <circle
                cx="180"
                cy="175"
                r="3"
                fill="var(--magenta)"
                className="animate-bounce"
                style={{ animationDuration: "2.5s" }}
                opacity={selectedLayerId === "floor" ? 1 : 0}
              />
              <circle
                cx="290"
                cy="175"
                r="3"
                fill="var(--magenta)"
                opacity={selectedLayerId === "floor" ? 0.8 : 0.2}
              />
            </g>
          </svg>
        </div>

        {/* Info Box HUD */}
        <div className="absolute top-16 left-4 right-4 flex justify-between gap-4 pointer-events-none z-10">
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 flex-1 pointer-events-auto min-h-[72px] shadow-lg flex flex-col justify-center">
            {selectedLayer ? (
              <>
                <h5
                  className="text-[10px] font-mono font-bold uppercase mb-0.5"
                  style={{ color: selectedLayer.color }}
                >
                  {t(`glossaryLayers.${selectedLayer.id}.species`)}
                </h5>
                <p className="text-[11px] text-muted leading-snug font-sans">
                  {t(`glossaryLayers.${selectedLayer.id}.role`)}
                </p>
                <div className="text-[8px] font-mono text-muted/60 mt-1">
                  {t("earthLabel")}:{" "}
                  <span className="text-foreground">
                    {t(`glossaryLayers.${selectedLayer.id}.analog`)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-[10px] font-mono text-muted/80 text-center py-2">{t("prompt")}</p>
            )}
          </div>
        </div>

        {/* Horizontal controls */}
        <div className="relative z-10 w-full bg-void/65 backdrop-blur-md px-4 py-3 border border-border/30 rounded-xl flex justify-between gap-2 mt-auto">
          {LAYERS.map((layer) => {
            const isSelected = selectedLayerId === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setSelectedLayerId(isSelected ? null : layer.id)}
                className="flex-1 py-1.5 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay truncate"
                style={{
                  backgroundColor: isSelected ? layer.color : "transparent",
                  color: isSelected ? "var(--background)" : "var(--foreground)",
                  borderColor: isSelected ? layer.color : "var(--border)",
                  boxShadow: isSelected ? `0 0 8px ${layer.glowColor}` : "none",
                }}
              >
                {t(`glossaryLayers.${layer.id}.btnLabel`)}
              </button>
            );
          })}
        </div>
      </div>
    </GlossaryFrame>
  );
}
