"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId } from "react";

interface FlierWingspanLadderProps {
  caption?: string;
  className?: string;
}

// A wingspan scale ladder: Earth's largest fliers against Pandora's. Each row is
// a bar whose length is the animal's wingspan in metres, drawn to one shared
// scale so the gap reads at a glance. Earth's ceiling (Quetzalcoatlus, ~11 m) is
// marked as a dashed line; everything to its right is airspace Earth's physics
// forbids - which is exactly where the banshee and toruk sit.
type World = "earth" | "pandora";
interface Flier {
  key: string;
  span: number; // metres, representative wingspan
  world: World;
}

// Representative spans (m). Earth: Pelagornis ~7, Argentavis ~7, Quetzalcoatlus
// ~11. Pandora: ikran low-teens, toruk ~25 (lower end of the 25-30 range).
const FLIERS: Flier[] = [
  { key: "pelagornis", span: 7, world: "earth" },
  { key: "argentavis", span: 7, world: "earth" },
  { key: "quetzalcoatlus", span: 11, world: "earth" },
  { key: "ikran", span: 13, world: "pandora" },
  { key: "toruk", span: 25, world: "pandora" },
];

const EARTH_CEILING = 11; // m — Quetzalcoatlus marks the wall

const W = 320;
const ROW_H = 30;
const PAD_X = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 26;
const LABEL_W = 96;
const SPAN_MAX = 28; // m, plotting span

export function FlierWingspanLadder({ caption, className }: FlierWingspanLadderProps) {
  const t = useTranslations("viz.wingspanLadder");
  const uid = useId();

  const H = PAD_TOP + FLIERS.length * ROW_H + PAD_BOTTOM;
  const plotX0 = PAD_X + LABEL_W;
  const plotW = W - plotX0 - PAD_X;
  const xFor = (m: number) => plotX0 + (m / SPAN_MAX) * plotW;

  const ceilX = xFor(EARTH_CEILING);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone="cyan"
      className={className}
      hint={t("hint")}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("title")}>
        <GlowDefs idBase={uid} tones={["teal", "amber", "cyan"]} />

        {/* Earth-ceiling band: everything to the right is forbidden on Earth */}
        <rect
          x={ceilX}
          y={PAD_TOP - 4}
          width={W - PAD_X - ceilX}
          height={H - PAD_TOP - PAD_BOTTOM + 8}
          fill="color-mix(in oklab, var(--amber) 9%, transparent)"
        />
        <line
          x1={ceilX}
          y1={PAD_TOP - 4}
          x2={ceilX}
          y2={H - PAD_BOTTOM + 4}
          stroke="var(--amber)"
          strokeWidth={1}
          strokeDasharray="3 3"
          strokeOpacity={0.8}
        />
        <VizText x={ceilX + 4} y={PAD_TOP + 6} size="micro" tone="amber">
          {t("ceiling")}
        </VizText>

        {FLIERS.map((f, i) => {
          const y = PAD_TOP + i * ROW_H + 6;
          const barH = 12;
          const tone = f.world === "pandora" ? "cyan" : "teal";
          const x1 = xFor(f.span);
          return (
            <g key={f.key}>
              <VizText
                x={plotX0 - 8}
                y={y + barH - 1}
                size="small"
                tone={tone}
                anchor="end"
              >
                {t(f.key)}
              </VizText>
              <rect
                x={plotX0}
                y={y}
                width={Math.max(1, x1 - plotX0)}
                height={barH}
                rx={2}
                fill={`var(--${tone})`}
                opacity={0.85}
                filter={glowUrl(uid, "bloom")}
              />
              <VizText
                x={x1 + 4}
                y={y + barH - 1}
                size="micro"
                tone={tone}
                numeric
              >
                {t("metres", { n: f.span })}
              </VizText>
            </g>
          );
        })}

        {/* x-axis ticks */}
        {[0, 10, 20].map((m) => (
          <VizTick key={m} x={xFor(m)} y={H - PAD_BOTTOM + 16}>
            {m}
          </VizTick>
        ))}
        <VizText x={W - PAD_X} y={H - 4} size="micro" anchor="end">
          {t("axis")}
        </VizText>
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5 font-sans text-xs text-teal">
          <span className="inline-block h-2 w-2 rounded-sm bg-[var(--teal)]" />
          {t("earth")}
        </span>
        <span className="flex items-center gap-1.5 font-sans text-xs text-cyan">
          <span className="inline-block h-2 w-2 rounded-sm bg-[var(--cyan)]" />
          {t("pandora")}
        </span>
      </div>
    </VizFigure>
  );
}
