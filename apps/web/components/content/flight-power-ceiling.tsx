"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface FlightPowerCeilingProps {
  caption?: string;
  className?: string;
}

// Two curves decide whether an animal can flap its way into the air. The power
// its muscles can SUPPLY scales as ~M^0.73 (muscle mass, tempered by metabolic
// limits). The power flight DEMANDS scales faster, ~M^1.17 (heavier bodies need
// more lift, flown faster). Where the rising demand overtakes supply is the
// flight ceiling - the heaviest a powered flapper can be. On Earth that wall
// sits near ~250 kg (Quetzalcoatlus). Pandora's lower gravity + denser air cut
// the power demanded, sliding the crossing point to a heavier mass: a rideable
// ikran clears a bar that grounds any Earth flyer.
const SUPPLY_EXP = 0.73;
const DEMAND_EXP = 1.17;

// Demand coefficient differs by world; supply is the animal's own physiology.
// Tuned so the Earth crossing lands near ~250 kg and Pandora pushes it heavier.
const SUPPLY_K = 4.2;
const DEMAND_K = { earth: 0.95, pandora: 0.66 } as const;

const supplyP = (m: number) => SUPPLY_K * m ** SUPPLY_EXP;
const demandP = (m: number, world: "earth" | "pandora") => DEMAND_K[world] * m ** DEMAND_EXP;

// Crossing mass: SUPPLY_K·M^0.73 = DEMAND_K·M^1.17  →  M^(0.44) = SUPPLY_K/DEMAND_K
function ceilingMass(world: "earth" | "pandora"): number {
  return (SUPPLY_K / DEMAND_K[world]) ** (1 / (DEMAND_EXP - SUPPLY_EXP));
}

const W = 300;
const H = 200;
const PAD = 24;
const MASS_MAX = 600; // kg, plotting span

export function FlightPowerCeiling({ caption, className }: FlightPowerCeilingProps) {
  const t = useTranslations("viz.flightCeiling");
  const uid = useId();
  // Deterministic initial render → SSR-safe.
  const [world, setWorld] = useState<"earth" | "pandora">("pandora");

  const ceiling = ceilingMass(world);
  // Vertical span from the curves we draw; normalise to the supply curve's top.
  const pMax = supplyP(MASS_MAX) * 1.15;

  const xFor = (m: number) => PAD + (m / MASS_MAX) * (W - 2 * PAD);
  const yFor = (p: number) => H - PAD - (p / pMax) * (H - 2 * PAD);

  const N = 48;
  const supplyPath = Array.from({ length: N + 1 }, (_, i) => {
    const m = (i / N) * MASS_MAX;
    return `${i === 0 ? "M" : "L"} ${xFor(m).toFixed(1)} ${yFor(supplyP(m)).toFixed(1)}`;
  }).join(" ");
  const demandPath = Array.from({ length: N + 1 }, (_, i) => {
    const m = (i / N) * MASS_MAX;
    return `${i === 0 ? "M" : "L"} ${xFor(m).toFixed(1)} ${yFor(demandP(m, world)).toFixed(1)}`;
  }).join(" ");

  const cx = xFor(ceiling);
  const cy = yFor(supplyP(ceiling));
  const labelX = Math.min(cx + 6, W - PAD - 92);

  // Feasibility region: the lens between the two curves while supply still
  // exceeds demand (mass 0 → ceiling). Filled to read as the "can fly" zone.
  const ceilMass = Math.min(ceiling, MASS_MAX);
  const M = 32;
  const feasibleTop = Array.from({ length: M + 1 }, (_, i) => {
    const m = (i / M) * ceilMass;
    return `${i === 0 ? "M" : "L"} ${xFor(m).toFixed(1)} ${yFor(supplyP(m)).toFixed(1)}`;
  });
  const feasibleBottom = Array.from({ length: M + 1 }, (_, i) => {
    const m = ((M - i) / M) * ceilMass;
    return `L ${xFor(m).toFixed(1)} ${yFor(demandP(m, world)).toFixed(1)}`;
  });
  const feasiblePath = `${feasibleTop.join(" ")} ${feasibleBottom.join(" ")} Z`;

  return (
    <VizFigure
      title={t("title")}
      hint={t("hint")}
      caption={caption}
      tone="amber"
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("title")}
          value={world}
          onChange={setWorld}
          options={[
            { value: "earth", label: t("earth") },
            { value: "pandora", label: t("pandora") },
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("title")}>
        <GlowDefs idBase={uid} tones={["teal", "amber", "cyan"]} />
        {/* grid backdrop for depth */}
        <rect
          x={PAD}
          y={PAD}
          width={W - 2 * PAD}
          height={H - 2 * PAD}
          fill={glowUrl(uid, "grid")}
          opacity={0.5}
        />
        {/* axes */}
        <line
          x1={PAD}
          y1={H - PAD}
          x2={W - PAD}
          y2={H - PAD}
          stroke="var(--border-strong)"
          strokeWidth={1}
          strokeOpacity={0.6}
        />
        <line
          x1={PAD}
          y1={PAD}
          x2={PAD}
          y2={H - PAD}
          stroke="var(--border-strong)"
          strokeWidth={1}
          strokeOpacity={0.6}
        />

        {/* feasibility region — surplus power where supply outruns demand */}
        <path
          d={feasiblePath}
          fill="color-mix(in oklab, var(--teal) 16%, transparent)"
          stroke="none"
          filter={glowUrl(uid, "bloom")}
        />

        {/* supply curve (teal) */}
        <path
          d={supplyPath}
          fill="none"
          stroke="var(--teal)"
          strokeWidth={2.5}
          filter={glowUrl(uid, "bloom")}
        />
        {/* demand curve (amber) */}
        <path
          d={demandPath}
          fill="none"
          stroke="var(--amber)"
          strokeWidth={2.5}
          filter={glowUrl(uid, "bloom")}
        />

        {/* ceiling crossing */}
        {cx < W - PAD && (
          <>
            <line
              x1={cx}
              y1={PAD}
              x2={cx}
              y2={H - PAD}
              stroke="var(--cyan)"
              strokeWidth={1}
              strokeDasharray="3 3"
              strokeOpacity={0.7}
            />
            {/* radial wash behind the focal crossing point */}
            <circle cx={cx} cy={cy} r={20} fill={glowUrl(uid, "wash-cyan")} opacity={0.8} />
            <circle
              cx={cx}
              cy={cy}
              r={5}
              fill="var(--cyan)"
              filter={glowUrl(uid, "bloom-strong")}
            />
            <VizText x={labelX} y={PAD + 10} size="small" tone="cyan" numeric>
              {t("ceiling")} ≈ {ceiling.toFixed(0)} kg
            </VizText>
          </>
        )}

        {/* axis label */}
        <VizTick x={W - PAD} y={H - PAD + 14} anchor="end">
          {t("massAxis")}
        </VizTick>
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5 font-sans text-xs text-teal">
          <span className="inline-block h-0.5 w-4 rounded bg-[var(--teal)]" />
          {t("supply")}
        </span>
        <span className="flex items-center gap-1.5 font-sans text-xs text-amber">
          <span className="inline-block h-0.5 w-4 rounded bg-[var(--amber)]" />
          {t("demand")}
        </span>
      </div>

      {/* The crossing mass is the figure's answer — highlighted result box. */}
      <VizReadout
        className="mt-3"
        label={t("ceiling")}
        value={`${ceiling.toFixed(0)} kg`}
        tone="var(--cyan)"
        tinted
      />
    </VizFigure>
  );
}
