"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface HydraulicLimitSimulatorProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL — Cohesion-Tension Hydraulic Limit
//
// A tree has no pump. It lifts water by cohesion-tension: evaporation
// from leaves (transpiration) pulls an unbroken thread of water up
// the xylem. The water potential at height h drops by:
//   Ψ(h) = Ψ_soil − ρ·g·h − f·h
// where ρ·g·h is the hydrostatic weight and f·h is frictional loss.
// When Ψ drops too low, turgor falls to zero → leaves can't expand →
// net carbon gain = 0 → the tree can grow no taller.
//
// Koch & Sillett (2004, Nature) measured this ceiling at ~122–130 m
// in coast redwoods.
//
// Pandora's advantage:
// 1. Lower gravity (0.8g) lightens the water column: reach ∝ 1/g
// 2. CO₂-rich, humid air cuts transpiration: stomata barely open,
//    less water spent, less tension → higher reach
// ─────────────────────────────────────────────────────────────────────
const EARTH_CEILING = 130; // m, Koch & Sillett upper bound
const GRAVITY_REL = { earth: 1, pandora: 0.8 } as const;
const ATMO_GAIN = { earth: 1, pandora: 1.45 } as const;

function ceilingFor(world: "earth" | "pandora"): number {
  return EARTH_CEILING * (1 / GRAVITY_REL[world]) * ATMO_GAIN[world];
}

// Turgor (vigour) at height h for a given world: nonlinear drop
// modelled as a power curve (more realistic than linear). Near the
// ceiling the decline accelerates — leaves become stunted.
function turgor(h: number, world: "earth" | "pandora"): number {
  const c = ceilingFor(world);
  if (h >= c) return 0;
  const ratio = h / c;
  // Concave decline: turgor drops faster near the top (exponent > 1)
  return Math.max(0, (1 - ratio ** 1.6) * 100);
}

// Water tension (relative, 0–100): inverse of turgor
function tension(h: number, world: "earth" | "pandora"): number {
  return 100 - turgor(h, world);
}

// ─────────────────────────────────────────────────────────────────────
// Landmarks
const HYPERION = 116; // tallest living redwood
const HOMETREE = 300; // Omatikaya canonical
const H_MAX = 340; // plotting span

// SVG dimensions
const W = 330;
const SVG_H = 250;
const PAD_L = 48;
const PAD_R = 16;
const PAD_T = 18;
const PAD_B = 24;

function xFor(m: number): number {
  return PAD_L + (m / H_MAX) * (W - PAD_L - PAD_R);
}

function yFor(v: number): number {
  return SVG_H - PAD_B - (v / 100) * (SVG_H - PAD_T - PAD_B);
}

export function HydraulicLimitSimulator({ caption, className }: HydraulicLimitSimulatorProps) {
  const uid = useId();
  const t = useTranslations("viz.hydraulicLimit");
  const [world, setWorld] = useState<"earth" | "pandora">("pandora");
  const [probe, setProbe] = useState(116); // m

  const ceiling = ceilingFor(world);
  const probeTurgor = turgor(probe, world);
  const probeTension = tension(probe, world);
  const isCavitated = probe > ceiling;
  const tone = world === "pandora" ? "teal" : "cyan";
  const toneVar = `var(--${tone})`;

  // Plot mapping
  // Turgor curve: sample 80 points up to the ceiling
  const turgorPath = useMemo(() => {
    const pts: string[] = [];
    const n = 80;
    const limit = Math.min(ceiling, H_MAX);
    for (let i = 0; i <= n; i++) {
      const h = (i / n) * limit;
      const v = turgor(h, world);
      pts.push(`${i === 0 ? "M" : "L"} ${xFor(h).toFixed(1)} ${yFor(v).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [world, ceiling]);

  // Fill beneath the turgor curve (viable zone)
  const fillPath = useMemo(() => {
    const limit = Math.min(ceiling, H_MAX);
    return `${turgorPath} L ${xFor(limit).toFixed(1)} ${yFor(0).toFixed(1)} L ${xFor(0).toFixed(1)} ${yFor(0).toFixed(1)} Z`;
  }, [turgorPath, ceiling]);

  // Water column segments: visualize the xylem at left, drawn as
  // a vertical strip that gets thinner (more strained) near the top
  const columnX = 22;
  const columnW = 10;

  const cx = xFor(probe);
  const cy = yFor(probeTurgor);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("worldLabel")}
          value={world}
          onChange={setWorld}
          options={[
            { value: "earth", label: t("earth"), tone: "var(--cyan)" },
            { value: "pandora", label: t("pandora"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${SVG_H}`}
          className="w-full lg:w-[60%]"
          role="img"
          aria-label={t("title")}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "magenta", "amber"]} />

          {/* Grid backdrop */}
          <rect
            x={PAD_L}
            y={PAD_T}
            width={W - PAD_L - PAD_R}
            height={SVG_H - PAD_T - PAD_B}
            fill={glowUrl(uid, "grid")}
            opacity={0.4}
          />

          {/* Axes */}
          <line
            x1={PAD_L}
            y1={SVG_H - PAD_B}
            x2={W - PAD_R}
            y2={SVG_H - PAD_B}
            stroke="var(--border-strong)"
            strokeWidth={1}
            strokeOpacity={0.6}
          />
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={SVG_H - PAD_B}
            stroke="var(--border-strong)"
            strokeWidth={1}
            strokeOpacity={0.6}
          />

          {/* Dead zone beyond ceiling — where cavitation occurs */}
          {ceiling < H_MAX && (
            <rect
              x={xFor(ceiling)}
              y={PAD_T}
              width={W - PAD_R - xFor(ceiling)}
              height={SVG_H - PAD_T - PAD_B}
              fill="color-mix(in oklab, var(--magenta) 10%, transparent)"
            />
          )}

          {/* Viable zone fill */}
          <path
            d={fillPath}
            fill={`color-mix(in oklab, ${toneVar} 14%, transparent)`}
            stroke="none"
            filter={glowUrl(uid, "bloom")}
          />

          {/* Turgor curve */}
          <path
            d={turgorPath}
            fill="none"
            stroke={toneVar}
            strokeWidth={2.5}
            filter={glowUrl(uid, "bloom")}
          />

          {/* Ceiling marker */}
          {ceiling < H_MAX && (
            <>
              <line
                x1={xFor(ceiling)}
                y1={PAD_T}
                x2={xFor(ceiling)}
                y2={SVG_H - PAD_B}
                stroke="var(--magenta)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                strokeOpacity={0.8}
              />
              <VizText
                x={xFor(ceiling) - 4}
                y={PAD_T + 12}
                size="micro"
                anchor="end"
                tone="magenta"
                weight={700}
              >
                {t("ceiling")} ~{Math.round(ceiling)}m
              </VizText>
            </>
          )}

          {/* Landmark markers */}
          {[
            { m: HYPERION, key: "hyperion", tn: "subtle" },
            { m: HOMETREE, key: "hometree", tn: "teal" },
          ].map((r) => (
            <g key={r.key}>
              <line
                x1={xFor(r.m)}
                y1={SVG_H - PAD_B}
                x2={xFor(r.m)}
                y2={SVG_H - PAD_B - 6}
                stroke={`var(--${r.tn})`}
                strokeWidth={1.5}
              />
              <VizTick x={xFor(r.m)} y={SVG_H - PAD_B + 14}>
                {t(r.key)}
              </VizTick>
            </g>
          ))}

          {/* Water column visualization at left — gets thinner near top */}
          {(() => {
            const colTop = yFor(Math.min(probe, ceiling));
            const colBot = yFor(0);
            const segments = 20;
            return Array.from({ length: segments }, (_, i) => {
              const frac = i / segments;
              const segY = colBot + (colTop - colBot) * frac;
              const segH = (colBot - colTop) / segments;
              // Width narrows as tension increases
              const segTension = tension(frac * Math.min(probe, ceiling), world);
              const w = columnW * (1 - segTension * 0.006);
              const alpha = isCavitated && frac > 0.85 ? 0.2 : 0.5 + (1 - segTension / 100) * 0.4;
              return (
                <rect
                  key={i}
                  x={columnX - w / 2}
                  y={segY - segH}
                  width={w}
                  height={segH + 0.5}
                  rx={1}
                  fill={toneVar}
                  opacity={alpha}
                />
              );
            });
          })()}

          {/* Cavitation bubble if past ceiling */}
          {isCavitated && (
            <g>
              <circle
                cx={columnX}
                cy={yFor(100) + 10}
                r={4}
                fill="var(--void)"
                stroke="var(--magenta)"
                strokeWidth={1.5}
                filter={glowUrl(uid, "bloom-strong")}
              />
              <VizText x={columnX + 8} y={yFor(100) + 14} size="micro" tone="magenta" weight={700}>
                {t("snap")}
              </VizText>
            </g>
          )}

          {/* Probe point on curve */}
          <circle
            cx={cx}
            cy={cy}
            r={18}
            fill={glowUrl(uid, isCavitated ? "wash-magenta" : `wash-${tone}`)}
            opacity={0.7}
          />
          <circle
            cx={cx}
            cy={cy}
            r={5}
            fill={isCavitated ? "var(--magenta)" : toneVar}
            filter={glowUrl(uid, "bloom-strong")}
          />

          {/* Axis labels */}
          <VizTick x={W - PAD_R} y={SVG_H - PAD_B + 22} anchor="end">
            {t("heightAxis")}
          </VizTick>
          {/* Changed anchor to start and x to PAD_L + 6 so it's inside the grid and not cut off */}
          <VizText x={PAD_L + 6} y={PAD_T + 4} size="micro" anchor="start" tone="subtle">
            {t("turgorAxis")}
          </VizText>
        </svg>

        <div className="flex flex-col justify-center gap-4 lg:w-[40%]">
          {/* Gravity & atmosphere dials — the two levers that move the ceiling */}
          <div className="grid grid-cols-2 gap-2">
            <VizReadout
              label={t("gravityLabel")}
              value={`${GRAVITY_REL[world]}g`}
              note={t("gravityNote")}
              tone={toneVar}
            />
            <VizReadout
              label={t("atmoLabel")}
              value={`×${ATMO_GAIN[world].toFixed(2)}`}
              note={t("atmoNote")}
              tone={toneVar}
            />
          </div>

          <VizSlider
            label={t("heightLabel")}
            display={`${probe} m`}
            min={10}
            max={H_MAX}
            step={5}
            value={probe}
            onChange={setProbe}
            tone={isCavitated ? "var(--magenta)" : toneVar}
          />

          {/* Turgor readout — the leaf cell filling */}
          <VizReadout
            label={t("turgorLabel")}
            value={isCavitated ? t("dead") : `${Math.round(probeTurgor)}%`}
            note={isCavitated ? t("snapNote") : t("turgorNote")}
            tone={isCavitated ? "var(--magenta)" : toneVar}
            tinted
          />

          <p className="font-sans text-xs leading-relaxed text-subtle">
            {isCavitated ? t("verdictOver") : t("verdictOk")}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
