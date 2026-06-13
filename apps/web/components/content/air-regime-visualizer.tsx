"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface AirRegimeVisualizerProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL — Reynolds Number and Flow Regimes
//
// Re = ρ·v·L / μ
// High Re (>1e5): Inertial forces dominate. Clean, attached flow.
// Low Re (<1e3): Viscous forces dominate. Sticky syrup flow.
//
// This component replaces the static ReynoldsRegimeExplorer with an
// animated flow visualization. As you lower Re, the animated streamlines
// get thicker, chaotic, and detach into a leading-edge vortex.
// ─────────────────────────────────────────────────────────────────────

type World = "earth" | "pandora";

const DENSITY_FACTOR: Record<World, number> = { earth: 1, pandora: 1.2 };
const K = 7.5e4;
const L_MIN = -3;
const L_MAX = 0.7;

function reynolds(logL: number, world: World): number {
  const L = 10 ** logL;
  return K * DENSITY_FACTOR[world] * L ** 1.5;
}

function regimeKey(re: number): "viscous" | "transitional" | "inertial" {
  if (re < 1e3) return "viscous";
  if (re < 1e5) return "transitional";
  return "inertial";
}

const W_SVG = 400;
const H_SVG = 220;

export function AirRegimeVisualizer({ caption, className }: AirRegimeVisualizerProps) {
  const uid = useId();
  const t = useTranslations("viz.airRegime");
  const isReducedMotion = useReducedMotionSafe();
  const [world, setWorld] = useState<World>("pandora");
  const [logL, setLogL] = useState<number>(0);

  const { phase } = usePhaseLoop({ period: 2, playing: !isReducedMotion });

  const re = reynolds(logL, world);
  const regime = regimeKey(re);
  const lengthM = 10 ** logL;

  const regimeTone = regime === "viscous" ? "var(--magenta)" : regime === "transitional" ? "var(--amber)" : "var(--cyan)";

  // Flow animation parameters
  // At high Re: thin lines, straight flow, attached.
  // At low Re: thick lines, wavy, detached vortex.
  const isViscous = regime === "viscous";
  const lineWeight = isViscous ? 3 : regime === "transitional" ? 2 : 1.5;
  const turbulence = isViscous ? 20 : regime === "transitional" ? 8 : 0;
  
  // Airfoil in center
  const wingPath = "M 120 110 C 150 90, 200 90, 260 110 C 200 120, 150 120, 120 110 Z";

  // Streamlines
  const lines = [40, 70, 95, 125, 150, 180];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="cyan"
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("mode")}
          value={world}
          onChange={setWorld}
          options={[
            { value: "earth", label: t("earth") },
            { value: "pandora", label: t("pandora") },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-4">
        {/* Animated Flow SVG */}
        <div className="overflow-hidden rounded-xl border border-border bg-void/50">
          <svg viewBox={`0 0 ${W_SVG} ${H_SVG}`} className="w-full" role="img" aria-label={t("title")}>
            <GlowDefs idBase={uid} tones={["cyan", "amber", "magenta"]} />
            
            {/* Background wash matching regime */}
            <rect width={W_SVG} height={H_SVG} fill={`color-mix(in oklab, ${regimeTone} 5%, transparent)`} />

            {/* Streamlines */}
            {lines.map((yBase, i) => {
              // Generate wavy path
              const pts = [];
              for(let x=0; x<=W_SVG; x+=20) {
                // Wave based on x, phase, and turbulence
                let y = yBase;
                if (x > 100 && x < 300) {
                  // Deflect around wing
                  const deflect = (x > 120 && x < 260 && Math.abs(yBase - 110) < 40) ? (yBase < 110 ? -20 : 20) : 0;
                  // Add turbulence wake if past wing and viscous
                  const wake = (x > 200 && turbulence > 0) ? Math.sin(x*0.1 - phase*Math.PI*2 + i) * turbulence * ((x-200)/100) : 0;
                  y += deflect + wake;
                }
                pts.push(`${x===0 ? 'M' : 'L'} ${x} ${y}`);
              }

              // Dash offset for flow animation
              const dashLength = isViscous ? 40 : 100;
              const dashGap = isViscous ? 20 : 50;
              const offset = -(phase * (dashLength + dashGap) * 4); // Speed multiplier

              return (
                <path
                  key={i}
                  d={pts.join(" ")}
                  fill="none"
                  stroke={regimeTone}
                  strokeWidth={lineWeight}
                  strokeLinecap="round"
                  strokeOpacity={0.6}
                  strokeDasharray={`${dashLength} ${dashGap}`}
                  strokeDashoffset={offset}
                  filter={glowUrl(uid, "bloom")}
                />
              );
            })}

            {/* Leading Edge Vortex (LEV) - only visible in viscous/transitional */}
            {re < 5e4 && (
              <g transform="translate(140, 95)" opacity={(5e4 - re) / 5e4}>
                <path
                  d="M0 0 C 10 -20, 30 -20, 20 0 C 10 10, 0 5, 5 -5"
                  fill="none"
                  stroke="var(--magenta)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  strokeDashoffset={-phase * 20}
                  filter={glowUrl(uid, "bloom")}
                />
                <VizText x={25} y={-25} size="micro" tone="magenta">{t("vortex")}</VizText>
              </g>
            )}

            {/* Airfoil profile */}
            <path d={wingPath} fill="var(--void)" stroke="var(--border-strong)" strokeWidth={2} />
          </svg>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <VizSlider
              label={t("sizeLabel")}
              display={lengthM >= 1 ? t("metres", { n: lengthM.toFixed(1) }) : t("millimetres", { n: Math.round(lengthM * 1000) })}
              min={L_MIN}
              max={L_MAX}
              step={0.01}
              value={logL}
              onChange={setLogL}
              tone={regimeTone}
            />
          </div>
          <div className="flex flex-col gap-2">
            <VizReadout
              label={t("reLabel")}
              value={`Re ≈ ${formatRe(re)}`}
              tone={regimeTone}
              tinted
            />
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: `color-mix(in oklab, ${regimeTone} 30%, transparent)`, background: `color-mix(in oklab, ${regimeTone} 10%, transparent)`}}>
              <p className="font-sans text-xs font-bold uppercase tracking-wider" style={{ color: regimeTone }}>
                {t(`${regime}Label`)}
              </p>
              <p className="mt-1 font-serif text-[0.85rem] text-muted">
                {t(`${regime}Desc`)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </VizFigure>
  );
}

function formatRe(re: number): string {
  const exp = Math.floor(Math.log10(re));
  const mant = re / 10 ** exp;
  return `${mant.toFixed(1)}×10${superscript(exp)}`;
}

function superscript(n: number): string {
  const map: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  return String(n).split("").map((c) => map[c] ?? c).join("");
}
