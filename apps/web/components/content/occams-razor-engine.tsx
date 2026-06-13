"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

export function OccamsRazorEngine({ caption, className }: { caption?: string; className?: string }) {
  const uid = useId();
  const t = useTranslations("viz.occamsRazor");
  
  const [a, setA] = useState(1);
  const [b, setB] = useState(4);

  const W = 340;
  const H = 220;
  const CX = W / 2;
  const CY = H - 80;
  const BEAM_W = 180;

  // The heavier side sinks.
  const maxDiff = 10;
  const diff = Math.max(-maxDiff, Math.min(maxDiff, b - a));
  const angle = diff * 4; // degrees
  
  const winner = a < b ? "A" : b < a ? "B" : "Tie";
  const tone = winner === "A" ? "cyan" : winner === "B" ? "magenta" : "subtle";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone={tone}
      className={className}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full lg:w-[60%]" role="img">
          <GlowDefs idBase={uid} tones={["teal", "cyan", "magenta", "subtle"]} />
          
          {/* Base */}
          <path d={`M ${CX - 15} ${H - 20} L ${CX + 15} ${H - 20} L ${CX} ${CY} Z`} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={2} />
          
          <g style={{ transformOrigin: `${CX}px ${CY}px`, transform: `rotate(${angle}deg)`, transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            {/* Beam */}
            <line x1={CX - BEAM_W/2} y1={CY} x2={CX + BEAM_W/2} y2={CY} stroke="var(--border-strong)" strokeWidth={3} strokeLinecap="round" />
            
            {/* Left Pan (Theory A) */}
            <g transform={`translate(${CX - BEAM_W/2}, ${CY})`}>
              <g style={{ transform: `rotate(${-angle}deg)`, transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                 <line x1={0} y1={0} x2={-20} y2={40} stroke="var(--border-strong)" strokeWidth={1.5} />
                 <line x1={0} y1={0} x2={20} y2={40} stroke="var(--border-strong)" strokeWidth={1.5} />
                 <path d="M -25 40 Q 0 50 25 40 Z" fill={a < b ? "color-mix(in oklab, var(--cyan) 20%, transparent)" : "var(--surface)"} stroke={a < b ? "var(--cyan)" : "var(--border-strong)"} filter={a < b ? glowUrl(uid, "bloom") : undefined} />
                 <VizText x={0} y={60} size="small" anchor="middle" tone={a < b ? "cyan" : "subtle"} weight={700}>
                   {t("theoryA")}
                 </VizText>
                 {/* Weights for A */}
                 {Array.from({ length: a }).map((_, i) => (
                   <rect key={i} x={-13 + (i % 3) * 9} y={28 - Math.floor(i / 3) * 9} width={8} height={8} fill="var(--cyan)" rx={1} />
                 ))}
              </g>
            </g>

            {/* Right Pan (Theory B) */}
            <g transform={`translate(${CX + BEAM_W/2}, ${CY})`}>
              <g style={{ transform: `rotate(${-angle}deg)`, transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                 <line x1={0} y1={0} x2={-20} y2={40} stroke="var(--border-strong)" strokeWidth={1.5} />
                 <line x1={0} y1={0} x2={20} y2={40} stroke="var(--border-strong)" strokeWidth={1.5} />
                 <path d="M -25 40 Q 0 50 25 40 Z" fill={b < a ? "color-mix(in oklab, var(--magenta) 20%, transparent)" : "var(--surface)"} stroke={b < a ? "var(--magenta)" : "var(--border-strong)"} filter={b < a ? glowUrl(uid, "bloom") : undefined} />
                 <VizText x={0} y={60} size="small" anchor="middle" tone={b < a ? "magenta" : "subtle"} weight={700}>
                   {t("theoryB")}
                 </VizText>
                 {/* Weights for B */}
                 {Array.from({ length: b }).map((_, i) => (
                   <rect key={i} x={-13 + (i % 3) * 9} y={28 - Math.floor(i / 3) * 9} width={8} height={8} fill="var(--magenta)" rx={1} />
                 ))}
              </g>
            </g>
            
            {/* Pivot Point */}
            <circle cx={CX} cy={CY} r={4} fill="var(--border-strong)" />
          </g>

        </svg>

        <div className="flex flex-col justify-center gap-4 lg:w-[40%]">
          <VizSlider
            label={t("theoryA")}
            display={`${a} ${t("assumptions")}`}
            min={0} max={12} step={1}
            value={a}
            onChange={setA}
            tone="var(--cyan)"
          />
          <VizSlider
            label={t("theoryB")}
            display={`${b} ${t("assumptions")}`}
            min={0} max={12} step={1}
            value={b}
            onChange={setB}
            tone="var(--magenta)"
          />
          
          <div className="mt-4">
             <VizReadout
                label={t("verdict")}
                value={winner === "A" ? t("verdictA") : winner === "B" ? t("verdictB") : t("verdictTie")}
                note={winner === "A" ? t("noteA") : winner === "B" ? t("noteB") : t("noteTie")}
                tone={winner === "A" ? "var(--cyan)" : winner === "B" ? "var(--magenta)" : "var(--subtle)"}
                tinted
             />
           </div>
        </div>
      </div>
    </VizFigure>
  )
}
