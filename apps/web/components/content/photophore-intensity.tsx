"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface PhotophoreIntensityProps {
  caption?: string;
  className?: string;
}

const W = 150;
const H = 240;
const HUE = "var(--accent-soft)"; // single blue-white photophore colour, never varies

// Photophore positions along the vascular/neural lines — anatomical layout, not
// UI copy. Bilateral pairs flanking a central row, as the chapter describes.
const DOTS: { x: number; y: number; r: number }[] = [
  { x: 75, y: 40, r: 2.2 },
  { x: 75, y: 60, r: 2.6 },
  { x: 75, y: 84, r: 2.4 },
  { x: 75, y: 110, r: 2.6 },
  { x: 75, y: 138, r: 2.3 },
  { x: 56, y: 70, r: 2.4 },
  { x: 52, y: 96, r: 2.6 },
  { x: 54, y: 124, r: 2.3 },
  { x: 60, y: 150, r: 2.1 },
  { x: 94, y: 70, r: 2.4 },
  { x: 98, y: 96, r: 2.6 },
  { x: 96, y: 124, r: 2.3 },
  { x: 90, y: 150, r: 2.1 },
  { x: 68, y: 26, r: 1.8 },
  { x: 82, y: 26, r: 1.8 },
];

function NaviGlow({ level, reduced, uid }: { level: number; reduced: boolean; uid: string }) {
  const alpha = 0.22 + level * 0.78;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden={true}>
      <GlowDefs idBase={uid} tones={["cyan"]} />
      {/* radial aura behind the body — grows and brightens with arousal so the
          whole figure visibly breathes light as the slider climbs */}
      <motion.ellipse
        cx={75}
        cy={108}
        fill={glowUrl(uid, "wash-cyan")}
        initial={false}
        animate={{
          opacity: 0.22 + level * 0.66,
          rx: 46 + level * 30,
          ry: 86 + level * 40,
        }}
        transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      <path
        d="M75 14 C66 14 60 20 60 30 C60 38 64 43 68 46 L54 60 C44 70 42 96 46 128 C49 152 54 176 58 206 L70 206 C68 176 66 150 66 132 L66 168 L84 168 L84 132 C84 150 82 176 80 206 L92 206 C96 176 101 152 104 128 C108 96 106 70 96 60 L82 46 C86 43 90 38 90 30 C90 20 84 14 75 14 Z"
        fill="color-mix(in oklab, var(--surface-overlay) 80%, transparent)"
        stroke="var(--border-strong)"
        strokeWidth={1.5}
      />
      {["M75 36 L75 142", "M58 64 C50 92 52 124 60 152", "M92 64 C100 92 98 124 90 152"].map(
        (d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="color-mix(in oklab, var(--accent-soft) 18%, transparent)"
            strokeWidth={1}
          />
        ),
      )}
      <g filter={glowUrl(uid, "bloom-strong")}>
        {DOTS.map((dot) => (
          <motion.circle
            key={`${dot.x}-${dot.y}`}
            cx={dot.x}
            cy={dot.y}
            fill={HUE}
            initial={false}
            animate={{
              r: dot.r * (1 + level * 0.5),
              opacity: reduced ? alpha : [alpha, Math.min(1, alpha + 0.12), alpha],
            }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    duration: 2.2 + (dot.y % 4) * 0.3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </g>
    </svg>
  );
}

export function PhotophoreIntensity({ caption, className }: PhotophoreIntensityProps) {
  const t = useTranslations("viz.photophore");
  const reduced = useReducedMotionSafe();
  const uid = useId();
  // Deterministic initial render → SSR-safe.
  const [level, setLevel] = useState(0.2);
  const pct = Math.round(level * 100);

  return (
    <VizFigure title={t("title")} caption={caption} tone="cyan" className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[150px_1fr] sm:items-center">
        <div className="mx-auto w-[150px] rounded-xl border border-border bg-void/40 p-2">
          <NaviGlow level={level} reduced={reduced} uid={uid} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <VizReadout label={t("intensity")} value={`${pct}%`} tone={HUE} tinted />
            <VizReadout
              label={t("hue")}
              tone={HUE}
              value={
                <span className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ background: HUE, boxShadow: `0 0 8px ${HUE}` }}
                    aria-hidden
                  />
                  <span className="font-display text-sm font-700" style={{ color: HUE }}>
                    {t("hueValue")}
                  </span>
                </span>
              }
            />
          </div>

          <div>
            <VizSlider
              label={t("slider")}
              display={`${pct}%`}
              min={0}
              max={1}
              step={0.01}
              value={level}
              onChange={setLevel}
              tone={HUE}
            />
            <div className="mt-1 flex justify-between font-sans text-xs text-subtle">
              <span>{t("calm")}</span>
              <span>{t("aroused")}</span>
            </div>
          </div>

          <p className="font-sans text-xs leading-relaxed text-muted">{t("note")}</p>

          <div
            className="rounded-lg border px-3 py-2"
            style={{
              borderColor: "color-mix(in oklab, var(--amber) 40%, transparent)",
              background: "color-mix(in oklab, var(--amber) 9%, transparent)",
            }}
          >
            <p className="font-sans text-xs uppercase tracking-wider text-subtle">{t("monoTag")}</p>
            <p className="mt-0.5 font-sans text-xs text-muted">{t("mono")}</p>
          </div>
        </div>
      </div>
    </VizFigure>
  );
}
