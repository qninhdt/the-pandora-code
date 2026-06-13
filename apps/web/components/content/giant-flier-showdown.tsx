"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface GiantFlierShowdownProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// Scale comparison of fliers, drawn as wing-spread silhouettes.
// Tapping a creature reveals its stat card. Replaces the static
// FlierWingspanLadder bar chart with something visceral.
// ─────────────────────────────────────────────────────────────────────

type World = "earth" | "pandora";

interface Flier {
  key: string;
  span: number; // m
  mass: number; // kg
  world: World;
  era: string;
  launch: string;
  // Simple simplified SVG paths for top-down wing silhouettes
  path: string;
}

const FLIERS: Flier[] = [
  {
    key: "pelagornis",
    span: 7,
    mass: 30,
    world: "earth",
    era: "25 Mya",
    launch: "bipedal",
    path: "M0 0 Q-3.5 -1 -3.5 -0.5 Q-1 1.5 0 2 Q1 1.5 3.5 -0.5 Q3.5 -1 0 0", // Glider shape
  },
  {
    key: "argentavis",
    span: 7,
    mass: 72,
    world: "earth",
    era: "6 Mya",
    launch: "bipedal",
    path: "M0 0 Q-3.5 -1.5 -3.5 -0.5 Q-1 2 0 2.5 Q1 2 3.5 -0.5 Q3.5 -1.5 0 0", // Broader bird
  },
  {
    key: "quetzalcoatlus",
    span: 11,
    mass: 250,
    world: "earth",
    era: "68 Mya",
    launch: "quadrupedal",
    path: "M0 -1 L-0.2 -0.2 L-5.5 -1 L-5.5 -0.5 L-0.5 1 L0 3 L0.5 1 L5.5 -0.5 L5.5 -1 L0.2 -0.2 Z", // Pterosaur
  },
  {
    key: "ikran",
    span: 13.9,
    mass: 450,
    world: "pandora",
    era: "Contemporary",
    launch: "quadrupedal",
    path: "M0 -1 L-0.5 0 L-6.95 -1.5 L-6.5 -0.5 L-0.8 1.5 L0 3.5 L0.8 1.5 L6.5 -0.5 L6.95 -1.5 L0.5 0 Z", // Banshee
  },
  {
    key: "toruk",
    span: 25,
    mass: 1200,
    world: "pandora",
    era: "Contemporary",
    launch: "quadrupedal",
    path: "M0 -2 L-1 -0.5 L-12.5 -2.5 L-11.5 -1 L-1.5 2.5 L0 5 L1.5 2.5 L11.5 -1 L12.5 -2.5 L1 -0.5 Z", // Great Leonopteryx
  },
];

const W_SVG = 380;
const H_SVG = 280;
const PAD_X = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 40;
const EARTH_CEILING = 11; // Quetzalcoatlus marks the wall

export function GiantFlierShowdown({ caption, className }: GiantFlierShowdownProps) {
  const uid = useId();
  const t = useTranslations("viz.flierShowdown");
  const [sel, setSel] = useState<string>("toruk");

  const selected = FLIERS.find((f) => f.key === sel) || FLIERS[0];

  // Scale: we need to fit 25m span into W_SVG - 2*PAD_X
  const pxPerM = (W_SVG - 2 * PAD_X) / 28; // pad a bit past 25m
  const yBase = H_SVG - PAD_BOTTOM;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="cyan"
      className={className}
    >
      <svg viewBox={`0 0 ${W_SVG} ${H_SVG}`} className="w-full" role="img" aria-label={t("title")}>
        <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta"]} />

        {/* Earth ceiling marker */}
        <rect
          x={PAD_X + EARTH_CEILING * pxPerM}
          y={PAD_TOP}
          width={W_SVG - PAD_X - EARTH_CEILING * pxPerM}
          height={H_SVG - PAD_TOP - PAD_BOTTOM}
          fill="color-mix(in oklab, var(--magenta) 8%, transparent)"
        />
        <line
          x1={PAD_X + EARTH_CEILING * pxPerM}
          y1={PAD_TOP}
          x2={PAD_X + EARTH_CEILING * pxPerM}
          y2={H_SVG - PAD_BOTTOM}
          stroke="var(--magenta)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <VizText
          x={PAD_X + EARTH_CEILING * pxPerM + 4}
          y={PAD_TOP + 10}
          size="micro"
          tone="magenta"
          weight={700}
        >
          {t("earthCeiling")}
        </VizText>

        {/* Flier silhouettes */}
        {FLIERS.map((f, i) => {
          const isSelected = sel === f.key;
          const tone = f.world === "pandora" ? "cyan" : "teal";
          // Stack them vertically by translating y based on index
          const yPos = PAD_TOP + 20 + i * 36;
          const xPos = PAD_X + (f.span / 2) * pxPerM; // left aligned (spans from 0 to span)

          return (
            <g
              key={f.key}
              transform={`translate(${PAD_X + (f.span / 2) * pxPerM}, ${yPos}) scale(${pxPerM})`}
              onClick={() => setSel(f.key)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={t(f.key)}
            >
              <path
                d={f.path}
                fill={
                  isSelected
                    ? `var(--${tone})`
                    : `color-mix(in oklab, var(--${tone}) 30%, transparent)`
                }
                stroke={`var(--${tone})`}
                strokeWidth={0.5 / pxPerM}
                filter={isSelected ? glowUrl(uid, "bloom") : undefined}
                style={{ transition: "all 0.2s ease" }}
              />
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1={PAD_X}
          y1={yBase}
          x2={W_SVG - PAD_X}
          y2={yBase}
          stroke="var(--border-strong)"
          strokeWidth={1}
        />
        {[0, 5, 10, 15, 20, 25].map((m) => (
          <g key={m}>
            <line
              x1={PAD_X + m * pxPerM}
              y1={yBase}
              x2={PAD_X + m * pxPerM}
              y2={yBase + 4}
              stroke="var(--subtle)"
            />
            <VizTick x={PAD_X + m * pxPerM} y={yBase + 16}>
              {m}
            </VizTick>
          </g>
        ))}
        <VizText x={W_SVG - PAD_X} y={yBase + 28} size="micro" anchor="end" tone="subtle">
          {t("spanAxis")}
        </VizText>

        {/* Labels next to silhouettes */}
        {FLIERS.map((f, i) => {
          const isSelected = sel === f.key;
          const tone = f.world === "pandora" ? "cyan" : "teal";
          const yPos = PAD_TOP + 20 + i * 36;
          return (
            <VizText
              key={f.key}
              x={PAD_X + f.span * pxPerM + 8}
              y={yPos + 4}
              size="micro"
              tone={isSelected ? tone : "subtle"}
              weight={isSelected ? 700 : 400}
            >
              {t(f.key)}
            </VizText>
          );
        })}
      </svg>

      {/* Selected stat card */}
      <div
        className="mt-4 rounded-xl border border-border bg-void/50 p-4"
        style={{
          borderColor: `color-mix(in oklab, var(--${selected.world === "pandora" ? "cyan" : "teal"}) 40%, transparent)`,
        }}
      >
        <h4
          className="font-display text-lg font-700"
          style={{ color: `var(--${selected.world === "pandora" ? "cyan" : "teal"})` }}
        >
          {t(selected.key)}
        </h4>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <VizReadout label={t("span")} value={`${selected.span} m`} />
          <VizReadout label={t("mass")} value={`~${selected.mass} kg`} />
          <VizReadout label={t("era")} value={t(`eras.${selected.era.replace(" ", "")}`)} />
          <VizReadout label={t("launch")} value={t(`launches.${selected.launch}`)} />
        </div>
      </div>
    </VizFigure>
  );
}
