"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useState } from "react";

type World = "earth" | "pandora";

interface GlowBiogeographyToggleProps {
  locale?: "vi" | "en";
  caption?: string;
  className?: string;
}

// A vertical slice of the world, sky at top to abyss at bottom. Each zone has a
// `dim` value (how chronically dark it is, 0..1) and a `glow` value per world.
// Glow tracks dimness: it floods wherever it is dark enough for a photon to pay.
interface Zone {
  key: string;
  labelVi: string;
  labelEn: string;
  dim: number;
  earth: number;
  pandora: number;
}

const ZONES: Zone[] = [
  { key: "sky", labelVi: "Trời", labelEn: "Sky", dim: 0.05, earth: 0.02, pandora: 0.05 },
  { key: "land", labelVi: "Đất liền", labelEn: "Land", dim: 0.15, earth: 0.08, pandora: 0.78 },
  {
    key: "shallow",
    labelVi: "Biển nông",
    labelEn: "Shallows",
    dim: 0.45,
    earth: 0.35,
    pandora: 0.7,
  },
  { key: "deep", labelVi: "Biển sâu", labelEn: "Deep sea", dim: 0.95, earth: 0.92, pandora: 0.95 },
];

const STRINGS = {
  vi: {
    title: "Nơi nào phát sáng — và vì sao",
    earth: "Trái Đất",
    pandora: "Pandora",
    axisDim: "Càng xuống càng tối",
    axisGlow: "Mật độ phát sáng",
    insight:
      "Cùng một quy luật, lật ngược: ánh sáng sinh học bùng nổ ở bất cứ đâu tù mù triền miên và tín hiệu thị giác đáng giá. Trên Trái Đất nơi đó là biển sâu; đêm tù mù dưới ánh Polyphemus biến cả mặt đất Pandora thành 'biển sâu'.",
  },
  en: {
    title: "Where glow happens — and why",
    earth: "Earth",
    pandora: "Pandora",
    axisDim: "Darker with depth",
    axisGlow: "Glow density",
    insight:
      "One rule, flipped: bioluminescence floods wherever it is chronically dim and a visual signal pays. On Earth that is the deep sea; dim Polyphemus-lit nights turn Pandora's land into the deep sea too.",
  },
} as const;

const W = 360;
const ZONE_H = 52;
const PAD = 8;

export function GlowBiogeographyToggle({
  locale = "vi",
  caption,
  className,
}: GlowBiogeographyToggleProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const [world, setWorld] = useState<World>("earth");
  const H = PAD * 2 + ZONES.length * ZONE_H;

  return (
    <VizFigure
      title={t.title}
      caption={caption}
      className={className}
      controls={
        <SegmentedToggle<World>
          ariaLabel={t.title}
          value={world}
          onChange={setWorld}
          options={[
            { value: "earth", label: t.earth, tone: "var(--muted)" },
            { value: "pandora", label: t.pandora, tone: "var(--cyan)" },
          ]}
        />
      }
    >
      <div className="flex gap-3">
        {/* dimness axis */}
        <div className="flex w-5 shrink-0 flex-col items-center justify-between py-1">
          <span
            className="font-sans text-[0.55rem] uppercase tracking-wider text-subtle"
            style={{ writingMode: "vertical-rl" }}
          >
            {t.axisDim}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`${world === "earth" ? t.earth : t.pandora}: ${t.axisGlow}`}
        >
          <defs>
            <linearGradient id="gb-depth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="color-mix(in oklab, var(--cyan) 8%, var(--surface))" />
              <stop offset="100%" stopColor="var(--void)" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={H} rx={10} fill="url(#gb-depth)" />

          {ZONES.map((z, i) => {
            const y = PAD + i * ZONE_H;
            const glow = world === "earth" ? z.earth : z.pandora;
            const barW = 12 + glow * (W - 150);
            return (
              <g key={z.key}>
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
                <text
                  x={16}
                  y={y + ZONE_H / 2 + 4}
                  className="font-sans"
                  style={{ fontSize: 11, fill: "var(--muted)" }}
                >
                  {locale === "vi" ? z.labelVi : z.labelEn}
                </text>

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
                  style={{
                    filter:
                      glow > 0.25 ? `drop-shadow(0 0 ${4 + glow * 10}px var(--teal))` : "none",
                  }}
                />
                <motion.text
                  x={104 + 8}
                  y={y + ZONE_H / 2 + 4}
                  className="font-sans"
                  initial={false}
                  animate={{ opacity: glow > 0.3 ? 1 : 0.4 }}
                  style={{ fontSize: 10, fill: "var(--void)", fontWeight: 700 }}
                >
                  {Math.round(glow * 100)}%
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-1 text-center font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
        {t.axisGlow} →
      </p>

      <div
        className="mt-3 rounded-lg border px-3 py-2"
        style={{
          borderColor: "color-mix(in oklab, var(--cyan) 40%, transparent)",
          background: "color-mix(in oklab, var(--cyan) 9%, transparent)",
        }}
      >
        <p className="font-sans text-xs text-muted">{t.insight}</p>
      </div>
    </VizFigure>
  );
}
