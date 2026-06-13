"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

interface HoxGenesProps {
  locale: string;
}

interface Gene {
  id: number;
  geneName: string;
  color: string;
  glowColor: string;
  en: { region: string; note: string };
  vi: { region: string; note: string };
  // SVG points or attributes for highlighting
  cx: number;
  cy: number;
  r: number;
  pathD?: string;
}

const GENES: Gene[] = [
  {
    id: 1,
    geneName: "Hox-1",
    color: "#36c5d9", // Pandora Cyan
    glowColor: "rgba(54, 197, 217, 0.6)",
    en: { region: "Head & Jaw", note: "Specifies head structure and double sensory organs." },
    vi: { region: "Đầu & Hàm", note: "Xác định cấu trúc đầu và các cơ quan cảm giác kép." },
    cx: 80,
    cy: 120,
    r: 18,
  },
  {
    id: 2,
    geneName: "Hox-2",
    color: "#2bd4a8", // Living Teal
    glowColor: "rgba(43, 212, 168, 0.6)",
    en: {
      region: "Neck & Spiracles",
      note: "Addresses the breathing vents and primary neck segments.",
    },
    vi: { region: "Cổ & Lỗ thở", note: "Xác định các van hô hấp và các đốt cổ chính." },
    cx: 120,
    cy: 120,
    r: 16,
  },
  {
    id: 3,
    geneName: "Hox-3",
    color: "#ffb454", // Ember Amber
    glowColor: "rgba(255, 180, 84, 0.6)",
    en: {
      region: "Forelimbs (Wings)",
      note: "Switches on the first pair of appendages, forming wings.",
    },
    vi: {
      region: "Chi trước (Cánh)",
      note: "Kích hoạt cặp chi đầu tiên, tạo thành đôi cánh chính.",
    },
    cx: 160,
    cy: 100,
    r: 22,
    pathD: "M 150 120 C 120 70, 160 50, 180 80 Z",
  },
  {
    id: 4,
    geneName: "Hox-4",
    color: "#8a93a8", // Stone/Midtone
    glowColor: "rgba(138, 147, 168, 0.4)",
    en: {
      region: "Mid-body Thorax",
      note: "Forms the central ribcage and carbon-composite support skeleton.",
    },
    vi: {
      region: "Thân giữa (Ngực)",
      note: "Hình thành lồng ngực trung tâm và khung xương hỗ trợ sợi carbon.",
    },
    cx: 200,
    cy: 120,
    r: 20,
  },
  {
    id: 5,
    geneName: "Hox-5",
    color: "#ff5da8", // Biolum Magenta
    glowColor: "rgba(255, 93, 168, 0.6)",
    en: { region: "Hindlimbs", note: "Controls development of the rear crawling/clinging claws." },
    vi: { region: "Chi sau", note: "Kiểm soát sự phát triển của cặp chân bám/bò phía sau." },
    cx: 245,
    cy: 135,
    r: 15,
    pathD: "M 240 125 C 230 150, 250 160, 255 140 Z",
  },
  {
    id: 6,
    geneName: "Hox-6",
    color: "#143b46", // Ocean Teal
    glowColor: "rgba(20, 59, 70, 0.6)",
    en: {
      region: "Tail End & Queue",
      note: "Specifies the tail tip and neural queue connection interface.",
    },
    vi: {
      region: "Đuôi & Bím tóc",
      note: "Xác định phần chóp đuôi và giao diện kết nối dây thần kinh.",
    },
    cx: 300,
    cy: 120,
    r: 16,
  },
];

export default function HoxGenes({ locale }: HoxGenesProps) {
  const t = useTranslations("viz.hoxMap");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const activeGene = activeIdx !== null ? GENES[activeIdx] : null;
  const isVi = locale === "vi";

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={() => setActiveIdx(null)}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-end p-4">
        {/* SVG Visualization */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-36">
          <svg viewBox="0 0 400 200" className="w-full h-full max-h-[85%] select-none">
            <title>Hox Genes body plan</title>

            {/* Draw Creature Silhouette Grid */}
            <g opacity="0.15">
              {/* Reference Grid lines */}
              <line x1="40" y1="120" x2="360" y2="120" className="stroke-muted stroke-[1]" />
              <line x1="160" y1="50" x2="160" y2="170" className="stroke-muted stroke-[0.5]" />
              <line x1="240" y1="50" x2="240" y2="170" className="stroke-muted stroke-[0.5]" />
            </g>

            {/* Spine (connecting all segments) */}
            <path
              d="M 70 120 Q 180 110 320 120"
              fill="none"
              stroke={activeIdx !== null ? "var(--border-strong)" : "var(--border)"}
              strokeWidth="3"
              className="transition-all duration-300"
            />

            {/* Draw Segments */}
            {GENES.map((g, idx) => {
              const isActive = activeIdx === idx;
              return (
                <g key={g.geneName} className="transition-all duration-300">
                  {/* Outer Highlight Aura */}
                  {isActive && (
                    <circle
                      cx={g.cx}
                      cy={g.cy}
                      r={g.r + 12}
                      fill="none"
                      stroke={g.color}
                      strokeWidth="2"
                      strokeDasharray="4,3"
                      className="animate-spin"
                      style={{ animationDuration: "12s" }}
                    />
                  )}

                  {/* Segment Body Core */}
                  {g.pathD ? (
                    <path
                      d={g.pathD}
                      fill={isActive ? g.color : "transparent"}
                      stroke={isActive ? g.color : "var(--border)"}
                      strokeWidth={isActive ? 3 : 1.5}
                      className="transition-all duration-300"
                      style={
                        isActive ? { filter: `drop-shadow(0 0 10px ${g.glowColor})` } : undefined
                      }
                    />
                  ) : (
                    <circle
                      cx={g.cx}
                      cy={g.cy}
                      r={g.r}
                      fill={isActive ? g.color : "var(--surface)"}
                      stroke={isActive ? g.color : "var(--border)"}
                      strokeWidth={isActive ? 3 : 1.5}
                      className="transition-all duration-300"
                      style={
                        isActive ? { filter: `drop-shadow(0 0 10px ${g.glowColor})` } : undefined
                      }
                    />
                  )}
                </g>
              );
            })}

            {/* Custom overlays for wings or tails */}
            <g>
              {/* Head sensory eyes */}
              <circle
                cx="68"
                cy="114"
                r="2"
                fill="var(--cyan)"
                opacity={activeIdx === 0 ? 1 : 0.4}
              />
              <circle
                cx="68"
                cy="126"
                r="2"
                fill="var(--cyan)"
                opacity={activeIdx === 0 ? 1 : 0.4}
              />
              {/* Queue neural lines at tail */}
              <path
                d="M 314 120 Q 340 125 350 145"
                fill="none"
                stroke="var(--magenta)"
                strokeWidth="1.5"
                opacity={activeIdx === 5 ? 1 : 0.3}
                className="stroke-dasharray-[2,2]"
              />
            </g>
          </svg>
        </div>

        {/* Info Box HUD */}
        <div className="absolute top-16 left-4 right-4 flex justify-between gap-4 pointer-events-none z-10">
          <div className="bg-void/90 border border-border/40 rounded-xl p-3 flex-1 pointer-events-auto min-h-[72px] shadow-lg flex flex-col justify-center">
            {activeGene ? (
              <>
                <h5
                  className="text-[10px] font-mono font-bold uppercase mb-0.5"
                  style={{ color: activeGene.color }}
                >
                  {activeGene.geneName} &rarr; {isVi ? activeGene.vi.region : activeGene.en.region}
                </h5>
                <p className="text-[11px] text-muted leading-relaxed font-sans">
                  {isVi ? activeGene.vi.note : activeGene.en.note}
                </p>
              </>
            ) : (
              <p className="text-[10px] font-mono text-muted/80 text-center py-2">{t("prompt")}</p>
            )}
          </div>
        </div>

        {/* Chromosome Gene shelf slider controller */}
        <div className="relative z-10 w-full bg-void/65 backdrop-blur-md px-4 py-3 border border-border/30 rounded-xl flex flex-col gap-2 mt-auto">
          <div className="text-[8px] font-mono text-muted uppercase tracking-wider text-center">
            {t("shelf")}
          </div>

          <div className="grid grid-cols-6 gap-2">
            {GENES.map((g, idx) => {
              const isActive = activeIdx === idx;
              return (
                <button
                  type="button"
                  key={g.geneName}
                  onClick={() => setActiveIdx(isActive ? null : idx)}
                  className="py-2 px-1 rounded border font-mono text-xs text-center transition-all duration-200 select-none hover:bg-surface-overlay"
                  style={{
                    backgroundColor: isActive ? g.color : "transparent",
                    color: isActive ? "var(--background)" : "var(--foreground)",
                    borderColor: isActive ? g.color : "var(--border)",
                    boxShadow: isActive ? `0 0 10px ${g.glowColor}` : "none",
                  }}
                >
                  {g.geneName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
