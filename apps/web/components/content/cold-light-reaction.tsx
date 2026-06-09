"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

interface ColdLightReactionProps {
  caption?: string;
  className?: string;
}

interface Step {
  label: string;
  body: string;
}

// Light yield per source — fixed scientific data, not UI copy. The display
// name + heat caption come from messages; the percentage stays in code.
const EFF_KEYS = ["incandescent", "led", "firefly"] as const;
const EFF_LIGHT: Record<(typeof EFF_KEYS)[number], number> = {
  incandescent: 5,
  led: 40,
  firefly: 90,
};

const W = 320;
const MID = 58;

function ReactionTrack({ stage, reduced, uid }: { stage: number; reduced: boolean; uid: string }) {
  const cyan = "var(--cyan)";
  const teal = "var(--teal)";
  const amber = "var(--amber)";
  const dim = "var(--subtle)";
  return (
    <svg viewBox={`0 0 ${W} 120`} className="w-full" aria-hidden={true}>
      <GlowDefs idBase={uid} tones={["cyan", "teal", "amber"]} />
      {/* radial wash behind the photon focal point — blooms in as the reaction fires */}
      <AnimatePresence>
        {stage >= 2 && (
          <motion.circle
            key="wash"
            cx={272}
            cy={MID}
            r={48}
            fill={glowUrl(uid, "wash-cyan")}
            initial={{ opacity: 0 }}
            animate={{ opacity: reduced ? 0.9 : [0.4, 1, 0.7] }}
            exit={{ opacity: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 1.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }
            }
          />
        )}
      </AnimatePresence>
      <line x1={24} y1={MID} x2={296} y2={MID} stroke="var(--border)" strokeWidth={2} />

      {/* stage 0: luciferin + O2 loading — blooms strongest while it is active */}
      <circle
        cx={48}
        cy={MID}
        r={13}
        fill={`color-mix(in oklab, ${teal} 22%, transparent)`}
        stroke={stage >= 0 ? teal : dim}
        strokeWidth={2}
        filter={stage >= 0 ? glowUrl(uid, stage === 0 ? "bloom-strong" : "bloom") : undefined}
      />
      <circle
        cx={72}
        cy={MID - 16}
        r={6}
        fill="none"
        stroke={stage >= 0 ? cyan : dim}
        strokeWidth={2}
      />
      <path
        d="M 92 58 L 122 58"
        stroke={stage >= 1 ? cyan : dim}
        strokeWidth={2}
        markerEnd={`url(#${uid}-cl-arrow)`}
      />

      {/* stage 1: strained ring — pulses while it is the active step */}
      <motion.rect
        x={132}
        y={MID - 14}
        width={28}
        height={28}
        rx={4}
        transform={`rotate(45 146 ${MID})`}
        fill={`color-mix(in oklab, ${amber} 18%, transparent)`}
        stroke={stage >= 1 ? amber : dim}
        strokeWidth={2}
        animate={stage === 1 && !reduced ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{
          duration: 0.7,
          repeat: stage === 1 && !reduced ? Number.POSITIVE_INFINITY : 0,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: `146px ${MID}px` }}
        filter={stage >= 1 ? glowUrl(uid, "bloom") : undefined}
      />
      <path
        d="M 178 58 L 208 58"
        stroke={stage >= 2 ? cyan : dim}
        strokeWidth={2}
        markerEnd={`url(#${uid}-cl-arrow)`}
      />

      {/* stage 2: excited product + photon bloom */}
      <circle
        cx={232}
        cy={MID}
        r={12}
        fill={`color-mix(in oklab, ${teal} 20%, transparent)`}
        stroke={stage >= 2 ? teal : dim}
        strokeWidth={2}
        filter={stage >= 2 ? glowUrl(uid, "bloom") : undefined}
      />
      <AnimatePresence>
        {stage >= 2 && (
          <motion.g
            key="photon"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: reduced ? 1 : [0.4, 1.25, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: `272px ${MID}px` }}
            filter={glowUrl(uid, "bloom-strong")}
          >
            <circle cx={272} cy={MID} r={9} fill={cyan} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
              const r = (a * Math.PI) / 180;
              return (
                <line
                  key={a}
                  x1={272 + Math.cos(r) * 14}
                  y1={MID + Math.sin(r) * 14}
                  x2={272 + Math.cos(r) * 22}
                  y2={MID + Math.sin(r) * 22}
                  stroke={cyan}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              );
            })}
          </motion.g>
        )}
      </AnimatePresence>

      <defs>
        <marker
          id={`${uid}-cl-arrow`}
          markerWidth={8}
          markerHeight={8}
          refX={6}
          refY={3}
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--cyan)" />
        </marker>
      </defs>
    </svg>
  );
}

function EfficiencyBar({
  name,
  light,
  heat,
  legendLight,
  reduced,
}: { name: string; light: number; heat: string; legendLight: string; reduced: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-sans text-xs text-foreground">{name}</span>
        <span className="font-sans text-xs text-subtle">{heat}</span>
      </div>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--amber)_35%,var(--surface))]"
        role="img"
        aria-label={`${name}: ${light}% ${legendLight}`}
      >
        <motion.div
          initial={false}
          animate={{ width: `${light}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: "var(--teal)", boxShadow: "var(--glow-teal)" }}
        />
      </div>
    </div>
  );
}

export function ColdLightReaction({ caption, className }: ColdLightReactionProps) {
  const t = useTranslations("viz.coldLight");
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const steps = t.raw("steps") as Step[];
  const [stage, setStage] = useState(0);
  // Deterministic initial play state → SSR-safe; the loop self-gates on reduced.
  const [playing, setPlaying] = useState(true);
  const last = steps.length - 1;
  const current = steps[stage];

  // Auto-advance through the reaction while playing; loops back to the start.
  useEffect(() => {
    if (!playing || reduced) return;
    const id = setInterval(() => setStage((s) => (s >= last ? 0 : s + 1)), 1900);
    return () => clearInterval(id);
  }, [playing, reduced, last]);

  return (
    <VizFigure
      title={t("title")}
      caption={caption}
      tone="cyan"
      className={className}
      controls={
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1 font-sans text-xs font-600 transition-all duration-200"
          style={{
            color: "var(--cyan)",
            borderColor: playing
              ? "color-mix(in oklab, var(--cyan) 45%, transparent)"
              : "var(--border)",
            background: playing
              ? "color-mix(in oklab, var(--cyan) 12%, transparent)"
              : "transparent",
            boxShadow: playing
              ? "0 0 16px -6px color-mix(in oklab, var(--cyan) 80%, transparent)"
              : "none",
          }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--cyan)",
              boxShadow: playing ? "0 0 6px var(--cyan)" : "none",
              opacity: playing ? 1 : 0.4,
            }}
          />
          {playing ? t("pause") : t("play")}
        </button>
      }
    >
      <div className="rounded-xl border border-border bg-void/30 p-3">
        <ReactionTrack stage={stage} reduced={reduced} uid={uid} />
      </div>

      {/* step scrubber — taller hit target with an inner fill bar so it reads as
          a tactile progress control, not a hairline */}
      <div className="mt-3 flex items-center gap-2">
        {steps.map((s, i) => {
          const done = i <= stage;
          return (
            <button
              key={s.label}
              type="button"
              aria-label={`${t("step")} ${i + 1}`}
              aria-current={stage === i}
              onClick={() => {
                setPlaying(false);
                setStage(i);
              }}
              className="group flex h-5 flex-1 items-center rounded-full px-0.5 transition-colors"
              style={{
                background: "color-mix(in oklab, var(--cyan) 8%, var(--void))",
                boxShadow: done
                  ? "inset 0 0 0 1px color-mix(in oklab, var(--cyan) 45%, transparent)"
                  : "inset 0 0 0 1px var(--border)",
              }}
            >
              <span
                className="h-1.5 w-full rounded-full transition-all"
                style={{
                  background: done ? "var(--cyan)" : "var(--border-strong)",
                  boxShadow: done ? "0 0 8px var(--cyan)" : "none",
                }}
              />
            </button>
          );
        })}
        <span className="ml-1 shrink-0 font-sans text-xs text-subtle">
          {t("step")} {stage + 1}/{steps.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={reduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="mt-3 rounded-lg border px-3 py-2"
          style={{
            borderColor: "color-mix(in oklab, var(--teal) 40%, transparent)",
            background: "color-mix(in oklab, var(--teal) 9%, transparent)",
          }}
        >
          <p className="font-sans text-xs font-700" style={{ color: "var(--teal)" }}>
            {current.label}
          </p>
          <p className="mt-0.5 font-sans text-xs text-muted">{current.body}</p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4">
        <p className="mb-2 font-sans text-xs uppercase tracking-wider text-subtle">
          {t("effTitle")}
        </p>
        <div className="flex flex-col gap-2.5">
          {EFF_KEYS.map((key) => (
            <EfficiencyBar
              key={key}
              name={t(`eff.${key}.name`)}
              heat={t(`eff.${key}.heat`)}
              light={EFF_LIGHT[key]}
              legendLight={t("legendLight")}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </VizFigure>
  );
}
