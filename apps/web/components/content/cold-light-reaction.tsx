"use client";

import { VizFigure } from "@/components/content/viz/viz-figure";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ColdLightReactionProps {
  locale?: "vi" | "en";
  caption?: string;
  className?: string;
}

const STRINGS = {
  vi: {
    title: "Phản ứng của ánh sáng lạnh",
    step: "Bước",
    play: "Chạy",
    pause: "Dừng",
    steps: [
      {
        label: "Luciferin + O₂",
        body: "Enzyme luciferase nắm lấy một phân tử nhiên liệu nhỏ — luciferin — rồi ghép nó với oxy. Chưa có ánh sáng, chỉ là khâu nạp đạn.",
      },
      {
        label: "Trung gian cao năng",
        body: "Phản ứng oxy hóa tạo ra một vòng peroxide căng thẳng (dioxetanone). Khi vòng vỡ, nó nhả CO₂ và đẩy sản phẩm lên trạng thái điện tử bị kích thích.",
      },
      {
        label: "Photon",
        body: "Electron bị kích thích rơi về trạng thái nền. Toàn bộ phần năng lượng chênh lệch thoát ra dưới dạng một hạt ánh sáng — gần như không nhiệt thừa. Đó là ánh sáng lạnh.",
      },
    ],
    effTitle: "Năng lượng đi đâu",
    eff: [
      { name: "Bóng đèn sợi đốt", light: 5, heat: "≈95% hao thành nhiệt" },
      { name: "Đèn LED", light: 40, heat: "phần lớn thành điện-nhiệt" },
      { name: "Đom đóm (sinh học)", light: 90, heat: "gần như không nhiệt" },
    ],
    legendLight: "Thành ánh sáng",
  },
  en: {
    title: "The cold-light reaction",
    step: "Step",
    play: "Play",
    pause: "Pause",
    steps: [
      {
        label: "Luciferin + O₂",
        body: "The enzyme luciferase takes a small fuel molecule — luciferin — and joins it to oxygen. No light yet; this is only loading the chamber.",
      },
      {
        label: "High-energy intermediate",
        body: "Oxidation builds a strained peroxide ring (a dioxetanone). When the ring snaps, it sheds CO₂ and kicks the product up into an excited electronic state.",
      },
      {
        label: "Photon",
        body: "The excited electron drops back to its ground state. The whole energy difference leaves as a single particle of light — with almost no waste heat. That is cold light.",
      },
    ],
    effTitle: "Where the energy goes",
    eff: [
      { name: "Incandescent bulb", light: 5, heat: "≈95% lost as heat" },
      { name: "LED", light: 40, heat: "much lost to heat" },
      { name: "Firefly (biology)", light: 90, heat: "almost no heat" },
    ],
    legendLight: "Becomes light",
  },
} as const;

const W = 320;
const MID = 58;

function ReactionTrack({ stage, reduced }: { stage: number; reduced: boolean }) {
  const cyan = "var(--cyan)";
  const teal = "var(--teal)";
  const amber = "var(--amber)";
  const dim = "var(--subtle)";
  return (
    <svg viewBox={`0 0 ${W} 120`} className="w-full" aria-hidden={true}>
      <line x1={24} y1={MID} x2={296} y2={MID} stroke="var(--border)" strokeWidth={2} />

      {/* stage 0: luciferin + O2 loading */}
      <circle
        cx={48}
        cy={MID}
        r={13}
        fill={`color-mix(in oklab, ${teal} 22%, transparent)`}
        stroke={stage >= 0 ? teal : dim}
        strokeWidth={2}
        style={stage >= 0 ? { filter: `drop-shadow(0 0 5px ${teal})` } : undefined}
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
        markerEnd="url(#cl-arrow)"
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
        style={{
          transformOrigin: `146px ${MID}px`,
          filter: stage >= 1 ? `drop-shadow(0 0 5px ${amber})` : undefined,
        }}
      />
      <path
        d="M 178 58 L 208 58"
        stroke={stage >= 2 ? cyan : dim}
        strokeWidth={2}
        markerEnd="url(#cl-arrow)"
      />

      {/* stage 2: excited product + photon bloom */}
      <circle
        cx={232}
        cy={MID}
        r={12}
        fill={`color-mix(in oklab, ${teal} 20%, transparent)`}
        stroke={stage >= 2 ? teal : dim}
        strokeWidth={2}
      />
      <AnimatePresence>
        {stage >= 2 && (
          <motion.g
            key="photon"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: reduced ? 1 : [0.4, 1.25, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: `272px ${MID}px`, filter: `drop-shadow(0 0 10px ${cyan})` }}
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
        <marker id="cl-arrow" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
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
        <span className="font-sans text-[0.6rem] text-subtle">{heat}</span>
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

export function ColdLightReaction({ locale = "vi", caption, className }: ColdLightReactionProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const last = t.steps.length - 1;
  const current = t.steps[stage];

  // Auto-advance through the reaction while playing; loops back to the start.
  useEffect(() => {
    if (!playing || reduced) return;
    const id = setInterval(() => setStage((s) => (s >= last ? 0 : s + 1)), 1900);
    return () => clearInterval(id);
  }, [playing, reduced, last]);

  return (
    <VizFigure
      title={t.title}
      caption={caption}
      className={className}
      controls={
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          className="rounded-md border border-border px-3 py-1 font-sans text-xs transition-colors"
          style={{
            color: "var(--cyan)",
            background: playing
              ? "color-mix(in oklab, var(--cyan) 12%, transparent)"
              : "transparent",
          }}
        >
          {playing ? t.pause : t.play}
        </button>
      }
    >
      <div className="rounded-xl border border-border bg-void/30 p-3">
        <ReactionTrack stage={stage} reduced={reduced} />
      </div>

      {/* step scrubber */}
      <div className="mt-3 flex items-center gap-2">
        {t.steps.map((s, i) => (
          <button
            key={s.label}
            type="button"
            aria-label={`${t.step} ${i + 1}`}
            aria-current={stage === i}
            onClick={() => {
              setPlaying(false);
              setStage(i);
            }}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{
              background: i <= stage ? "var(--cyan)" : "var(--border-strong)",
              boxShadow: i <= stage ? "0 0 6px var(--cyan)" : "none",
            }}
          />
        ))}
        <span className="ml-1 shrink-0 font-sans text-[0.65rem] text-subtle">
          {t.step} {stage + 1}/{t.steps.length}
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
        <p className="mb-2 font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
          {t.effTitle}
        </p>
        <div className="flex flex-col gap-2.5">
          {t.eff.map((e) => (
            <EfficiencyBar key={e.name} {...e} legendLight={t.legendLight} reduced={reduced} />
          ))}
        </div>
      </div>
    </VizFigure>
  );
}
