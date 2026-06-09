"use client";

import { GlowDefs, glowId, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  AMBIENT,
  FIGURES,
  FOOTSTEP,
  FRONDS,
  GLOW_POINTS,
  GROUND_Y,
  LENS_TONE,
  type Lens,
  SCENE_H,
  SCENE_W,
  TREES,
  fieldPath,
} from "./umwelt-scene";

interface UmweltLensProps {
  caption?: string;
  className?: string;
}

// The chapter's thesis made tactile: one fixed patch of night forest — layered
// canopy, understorey, a glowing floor, two figures, a footstep cascade, a magnetic
// field threading the whole scene — re-seen through four perceptual lenses. Nothing
// in the geometry moves between modes; only the per-lens visibility table (in
// umwelt-scene.ts) changes, and with it the entire world. Reduced motion collapses
// the cross-fade to an instant cut.

export function UmweltLens({ caption, className }: UmweltLensProps) {
  const t = useTranslations("viz.umweltLens");
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [lens, setLens] = useState<Lens>("human");

  const dur = reduced ? 0 : 0.55;
  const ease = [0.22, 1, 0.36, 1] as const;
  const tone = LENS_TONE[lens];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={tone}
      hint={t(`hint.${lens}`)}
      controls={
        <SegmentedToggle<Lens>
          ariaLabel={t("title")}
          value={lens}
          onChange={setLens}
          options={[
            { value: "human", label: t("lens.human"), tone: "var(--amber)" },
            { value: "navi", label: t("lens.navi"), tone: "var(--teal)" },
            { value: "magnetic", label: t("lens.magnetic"), tone: "var(--magenta)" },
            { value: "biolum", label: t("lens.biolum"), tone: "var(--cyan)" },
          ]}
        />
      }
    >
      <svg
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        className="w-full"
        role="img"
        aria-label={`${t(`lens.${lens}`)}: ${t("subtitle")}`}
      >
        <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />
        <defs>
          <linearGradient id={glowId(uid, "sky")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="color-mix(in oklab, var(--cyan) 6%, var(--void))" />
            <stop offset="100%" stopColor="var(--void)" />
          </linearGradient>
          <linearGradient id={glowId(uid, "floor")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="color-mix(in oklab, var(--teal) 7%, var(--void))" />
            <stop offset="100%" stopColor="var(--void)" />
          </linearGradient>
        </defs>

        {/* shared frame — the same patch of forest in every mode */}
        <rect
          x={0}
          y={0}
          width={SCENE_W}
          height={SCENE_H}
          rx={12}
          fill={`url(#${glowId(uid, "sky")})`}
        />
        {/* forest floor plane */}
        <rect
          x={0}
          y={GROUND_Y}
          width={SCENE_W}
          height={SCENE_H - GROUND_Y}
          fill={`url(#${glowId(uid, "floor")})`}
        />

        {/* ambient lift — Na'vi night-eye floods the frame; others stay dark */}
        <motion.rect
          x={0}
          y={0}
          width={SCENE_W}
          height={SCENE_H}
          rx={12}
          fill="var(--mist)"
          initial={false}
          animate={{ opacity: AMBIENT[lens] }}
          transition={{ duration: dur, ease }}
        />

        {/* trees — back layer first so front trees overlap them (depth) */}
        {[...TREES]
          .sort((a, b) => Number(b.back) - Number(a.back))
          .map((tr, i) => {
            const v = tr.vis[lens];
            const op = 0.06 + v * 0.34;
            return (
              <motion.g
                key={`tree-${i}`}
                initial={false}
                animate={{ opacity: op }}
                transition={{ duration: dur, ease }}
              >
                {/* crown */}
                <ellipse
                  cx={tr.x}
                  cy={tr.trunkTop}
                  rx={tr.crownR}
                  ry={tr.crownR * 0.78}
                  fill={
                    tr.back ? "var(--stone)" : "color-mix(in oklab, var(--teal) 16%, var(--stone))"
                  }
                />
                {/* trunk */}
                <path
                  d={`M ${tr.x - tr.trunkW / 2} ${GROUND_Y} L ${tr.x - tr.trunkW / 2.6} ${tr.trunkTop} L ${tr.x + tr.trunkW / 2.6} ${tr.trunkTop} L ${tr.x + tr.trunkW / 2} ${GROUND_Y} Z`}
                  fill="var(--stone)"
                />
              </motion.g>
            );
          })}

        {/* understorey fronds — low arcs */}
        {FRONDS.map((f, i) => (
          <motion.path
            key={`frond-${i}`}
            d={`M ${f.x - f.w / 2} ${f.y} Q ${f.x} ${f.y - f.h} ${f.x + f.w / 2} ${f.y}`}
            fill="none"
            stroke="color-mix(in oklab, var(--teal) 40%, var(--stone))"
            strokeWidth={2}
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: 0.08 + f.vis[lens] * 0.5 }}
            transition={{ duration: dur, ease }}
          />
        ))}

        {/* magnetic field lines — only the magnetoreceptive lens draws them */}
        {[0, 1, 2, 3, 4].map((k) => (
          <motion.path
            key={`field-${k}`}
            d={fieldPath(k)}
            fill="none"
            stroke="var(--magenta)"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: lens === "magnetic" ? 0.7 : 0 }}
            transition={{ duration: dur, ease }}
            filter={glowUrl(uid, "bloom")}
          />
        ))}

        {/* bioluminescent points */}
        {GLOW_POINTS.map((p, i) => {
          const v = p.vis[lens];
          const lit = v > 0.4;
          return (
            <motion.circle
              key={`glow-${i}`}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill="var(--cyan)"
              initial={false}
              animate={{ opacity: 0.1 + v * 0.9, scale: 0.85 + v * 0.25 }}
              transition={{ duration: dur, ease }}
              filter={lit ? glowUrl(uid, "bloom") : glowUrl(uid, "soft-shadow")}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            />
          );
        })}

        {/* footstep cascade — three staggered rings, loudest in the biolum lens */}
        {[0, 1, 2].map((ring) => {
          const big = lens === "biolum";
          const baseR = big ? 16 + ring * 16 : 6;
          const op = big ? 0.7 - ring * 0.2 : lens === "navi" ? 0.22 : 0.05;
          return (
            <motion.circle
              key={`ring-${ring}`}
              cx={FOOTSTEP.x}
              cy={FOOTSTEP.y}
              fill="none"
              stroke="var(--teal)"
              strokeWidth={2.5 - ring * 0.6}
              initial={false}
              animate={{ r: baseR, opacity: op }}
              transition={{ duration: dur, ease, delay: big && !reduced ? ring * 0.08 : 0 }}
              filter={glowUrl(uid, "bloom-strong")}
            />
          );
        })}
        <motion.circle
          cx={FOOTSTEP.x}
          cy={FOOTSTEP.y}
          r={5}
          fill="var(--teal)"
          initial={false}
          animate={{ opacity: lens === "biolum" ? 1 : lens === "navi" ? 0.4 : 0.06 }}
          transition={{ duration: dur, ease }}
          filter={glowUrl(uid, "bloom")}
        />

        {/* the two figures — each lifts in its own lens */}
        <motion.circle
          cx={FIGURES.navi.x}
          cy={FIGURES.navi.y}
          r={FIGURES.navi.r}
          fill="var(--teal)"
          initial={false}
          animate={{ opacity: lens === "navi" ? 0.92 : 0.24 }}
          transition={{ duration: dur, ease }}
          filter={glowUrl(uid, "soft-shadow")}
        />
        <motion.circle
          cx={FIGURES.human.x}
          cy={FIGURES.human.y}
          r={FIGURES.human.r}
          fill="var(--amber)"
          initial={false}
          animate={{ opacity: lens === "human" ? 0.82 : 0.2 }}
          transition={{ duration: dur, ease }}
          filter={glowUrl(uid, "soft-shadow")}
        />

        <VizText x={SCENE_W / 2} y={22} size="small" tone="muted" anchor="middle">
          {t("umgebung")}
        </VizText>
      </svg>
    </VizFigure>
  );
}
