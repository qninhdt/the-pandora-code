"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export function TorukFlightEngine({ caption, className }: { caption?: string; className?: string }) {
  const uid = useId();
  const t = useTranslations("viz.torukFlight");
  
  const [atmo, setAtmo] = useState(false);
  const [gravity, setGravity] = useState(false);
  const [quad, setQuad] = useState(false);

  const score = (atmo ? 1 : 0) + (gravity ? 1 : 0) + (quad ? 1 : 0);
  const isAirborne = score === 3;

  const W_SVG = 300;
  const H_SVG = 220;

  const yGround = H_SVG - 40;

  // Toruk position depends on score
  const yToruk = isAirborne ? 60 : yGround - (score * 15);
  const tone = isAirborne ? "amber" : (score > 0 ? "teal" : "subtle");

  const torukPath = isAirborne 
    ? "M0 -10 L-25 -5 L-60 -20 L-40 0 L-5 10 L0 30 L5 10 L40 0 L60 -20 L25 -5 Z" // Flying majestically
    : "M0 -5 L-20 -2 L-30 5 L-15 10 L-5 15 L0 20 L5 15 L15 10 L30 5 L20 -2 Z"; // Squatted

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone={isAirborne ? "amber" : "cyan"}
      className={className}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
        <svg viewBox={`0 0 ${W_SVG} ${H_SVG}`} className="w-full sm:w-[55%]" role="img" aria-label={t("title")}>
          <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta", "subtle"]} />
          
          {/* Ground line */}
          <line x1={20} y1={yGround} x2={W_SVG - 20} y2={yGround} stroke="var(--border-strong)" strokeWidth={2} />
          <ellipse cx={W_SVG/2} cy={yGround + 4} rx={40} ry={4} fill="var(--void)" opacity={0.5} style={{ filter: "blur(3px)" }} />
          
          <g style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} transform={`translate(${W_SVG/2}, ${yToruk})`}>
            {/* Body */}
            <path d={torukPath} 
              fill={`color-mix(in oklab, var(--${tone}) ${isAirborne ? 40 : 20}%, transparent)`}
              stroke={`var(--${tone})`} strokeWidth={1.5}
              filter={glowUrl(uid, "bloom")} />
            
            {/* Center core */}
            <circle cx={0} cy={isAirborne ? 10 : 15} r={4} fill={`var(--${tone})`} />
          </g>
          
          {/* Air streams when airborne */}
          <g style={{ opacity: isAirborne ? 1 : 0, transition: 'opacity 0.8s ease' }}>
             <path d="M 50 150 Q 100 80 150 100 T 250 80" fill="none" stroke="var(--amber)" strokeOpacity={0.4} strokeWidth={1.5} filter={glowUrl(uid, "bloom")} />
             <path d="M 30 120 Q 80 50 150 70 T 280 50" fill="none" stroke="var(--amber)" strokeOpacity={0.2} strokeWidth={1} />
          </g>

          <VizText x={W_SVG/2} y={yGround + 24} size="small" tone={tone as any} anchor="middle" weight={700}>
            {isAirborne ? t("success") : t("fail")}
          </VizText>
        </svg>

        <div className="flex flex-col justify-center gap-4 sm:w-[45%]">
           <VizToggle label={t("switch1")} active={atmo} onClick={() => setAtmo(!atmo)} tone="cyan" />
           <VizToggle label={t("switch2")} active={gravity} onClick={() => setGravity(!gravity)} tone="teal" />
           <VizToggle label={t("switch3")} active={quad} onClick={() => setQuad(!quad)} tone="magenta" />
           
           <div className="mt-4">
             <VizReadout
                label={t("status")}
                value={isAirborne ? t("success") : t("fail")}
                note={isAirborne ? t("successDesc") : t("failDesc")}
                tone={isAirborne ? "var(--amber)" : "var(--subtle)"}
                tinted
             />
           </div>
        </div>
      </div>
    </VizFigure>
  )
}

function VizToggle({ label, active, onClick, tone }: { label: string, active: boolean, onClick: () => void, tone: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-all duration-300",
        active ? "bg-void/60" : "bg-void/20 border-border hover:border-border-strong text-muted"
      )}
      style={{ 
         borderColor: active ? `color-mix(in oklab, var(--${tone}) 50%, transparent)` : undefined,
         color: active ? `var(--${tone})` : undefined
      }}
    >
      <span className="font-sans font-600 pr-2 leading-tight">{label}</span>
      <span className={cn(
        "flex w-8 h-4 rounded-full p-0.5 transition-colors duration-300 shrink-0",
        active ? "" : "bg-border-strong"
      )}
      style={{ backgroundColor: active ? `var(--${tone})` : undefined }}>
        <span className={cn(
          "w-3 h-3 bg-void rounded-full transition-transform duration-300",
          active ? "translate-x-4" : "translate-x-0"
        )} />
      </span>
    </button>
  )
}
