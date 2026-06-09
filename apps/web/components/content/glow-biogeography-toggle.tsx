"use client";

import { GlowDefs, glowId, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText, vizTextScale } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type World = "earth" | "pandora";

interface GlowBiogeographyToggleProps {
  caption?: string;
  className?: string;
}

// A vertical slice of the world, sky at top to abyss at bottom. Each zone has a
// `dim` value (how chronically dark it is, 0..1) and a `glow` value per world.
// Glow tracks dimness: it floods wherever it is dark enough for a photon to pay.
// Scientific data — the zone label comes from messages, keyed by `key`.
interface Zone {
  key: string;
  dim: number;
  earth: number;
  pandora: number;
}

const ZONES: Zone[] = [
  { key: "sky", dim: 0.05, earth: 0.02, pandora: 0.05 },
  { key: "land", dim: 0.15, earth: 0.08, pandora: 0.78 },
  { key: "shallow", dim: 0.45, earth: 0.35, pandora: 0.7 },
  { key: "deep", dim: 0.95, earth: 0.92, pandora: 0.95 },
];

const W = 360;
const ZONE_H = 52;
const PAD = 8;

export function GlowBiogeographyToggle({ caption, className }: GlowBiogeographyToggleProps) {
  const t = useTranslations("viz.glowBiogeography");
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [world, setWorld] = useState<World>("earth");
  const H = PAD * 2 + ZONES.length * ZONE_H;

  return (
    <VizFigure
      title={t("title")}
      caption={caption}
      tone="teal"
      className={className}
      hint={t("insight")}
      controls={
        <SegmentedToggle<World>
          ariaLabel={t("title")}
          value={world}
          onChange={setWorld}
          options={[
            { value: "earth", label: t("earth"), tone: "var(--muted)" },
            { value: "pandora", label: t("pandora"), tone: "var(--cyan)" },
          ]}
        />
      }
    >
      <div className="flex gap-3">
        {/* dimness axis */}
        <div className="flex w-5 shrink-0 flex-col items-center justify-between py-1">
          <span
            className="font-sans text-xs uppercase tracking-wider text-subtle"
            style={{ writingMode: "vertical-rl" }}
          >
            {t("axisDim")}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`${world === "earth" ? t("earth") : t("pandora")}: ${t("axisGlow")}`}
        >
          <GlowDefs idBase={uid} tones={["teal"]} />
          <defs>
            <linearGradient id={glowId(uid, "depth")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="color-mix(in oklab, var(--cyan) 8%, var(--surface))" />
              <stop offset="100%" stopColor="var(--void)" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={H} rx={10} fill={`url(#${glowId(uid, "depth")})`} />

          {ZONES.map((z, i) => {
            const y = PAD + i * ZONE_H;
            const glow = world === "earth" ? z.earth : z.pandora;
            const barW = 12 + glow * (W - 150);
            const lit = glow > 0.25;
            return (
              <g key={z.key}>
                {/* zone band — a faint depth-tinted slab so layers read as stacked
                    strata rather than text floating on one flat field */}
                <rect
                  x={6}
                  y={y}
                  width={W - 12}
                  height={ZONE_H}
                  rx={6}
                  fill={`color-mix(in oklab, var(--void) ${20 + z.dim * 55}%, transparent)`}
                />
                {i > 0 && (
                  <line
                    x1={8}
                    y1={y}
                    x2={W - 8}
                    y2={y}
                    stroke="var(--border)"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                  />
                )}
                <VizText x={16} y={y + ZONE_H / 2 + 4} size="small" tone="muted">
                  {t(`zone.${z.key}`)}
                </VizText>

                {/* glow-density bar: width + bloom track this zone's glow in this world */}
                <motion.rect
                  x={104}
                  y={y + ZONE_H / 2 - 9}
                  height={18}
                  rx={9}
                  fill="var(--teal)"
                  initial={false}
                  animate={{ width: barW, opacity: 0.35 + glow * 0.65 }}
                  transition={
                    reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                  }
                  filter={lit ? glowUrl(uid, "bloom") : glowUrl(uid, "soft-shadow")}
                />
                <motion.text
                  x={104 + 8}
                  y={y + ZONE_H / 2 + 4}
                  className="font-sans tabular-nums"
                  initial={false}
                  animate={{ opacity: glow > 0.3 ? 1 : 0.4 }}
                  style={{ fontSize: vizTextScale.micro, fill: "var(--void)", fontWeight: 700 }}
                >
                  {Math.round(glow * 100)}%
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-1 text-center font-sans text-xs uppercase tracking-wider text-subtle">
        {t("axisGlow")} →
      </p>
    </VizFigure>
  );
}
