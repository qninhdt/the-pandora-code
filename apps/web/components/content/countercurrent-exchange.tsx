"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CountercurrentExchangeProps {
  locale?: "vi" | "en";
  caption?: string;
  className?: string;
}

type Mode = "concurrent" | "countercurrent";

const STRINGS = {
  vi: {
    title: "Phiến mang: đổi chiều dòng máu",
    water: "Nước",
    blood: "Máu",
    concurrent: "Cùng chiều",
    countercurrent: "Ngược chiều",
    extraction: "Oxy lấy được",
    slope: "Độ chênh oxy dọc phiến mang",
    concurrentNote:
      "Cùng chiều: nước và máu lao về một mức cân bằng tầm tầm rồi dừng — độ chênh tắt ở giữa chặng, oxy còn lại trôi tuột đi.",
    countercurrentNote:
      "Ngược chiều: máu luôn gặp dòng nước tươi hơn chính nó, nên độ chênh được giữ suốt chiều dài — oxy được lấy tới tận cùng.",
  },
  en: {
    title: "Gill lamella: flip the blood",
    water: "Water",
    blood: "Blood",
    concurrent: "Same way",
    countercurrent: "Opposed",
    extraction: "Oxygen extracted",
    slope: "Oxygen gradient along the frond",
    concurrentNote:
      "Same direction: water and blood rush to a shared, middling balance and stop — the slope dies at the halfway mark and the leftover oxygen drifts past untaken.",
    countercurrentNote:
      "Opposed: the blood always meets water fresher than itself, so the slope holds the whole length of the frond — oxygen is taken right to the end.",
  },
} as const;

const W = 380;
const X0 = 36;
const X1 = 344;
const WATER_Y = 44;
const BLOOD_Y = 104;
const SLOPE_BASE = 184;
const N_BARS = 9;

// Local water-minus-blood gradient sampled along the frond. Countercurrent
// holds a steady small slope end to end; concurrent collapses to zero by the
// midpoint and never recovers. These illustrative profiles are the whole point.
function slopeAt(p: number, counter: boolean): number {
  if (counter) return 0.34 + 0.06 * Math.sin(p * Math.PI); // gently held across
  return Math.max(0, 1 - 2 * p); // open at inlet, dead by the middle
}

function Particle({
  y,
  fromX,
  toX,
  color,
  delay,
  reduced,
}: {
  y: number;
  fromX: number;
  toX: number;
  color: string;
  delay: number;
  reduced: boolean;
}) {
  if (reduced) {
    return (
      <circle
        cx={(fromX + toX) / 2}
        cy={y}
        r={3.5}
        fill={color}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
    );
  }
  return (
    <motion.circle
      cy={y}
      r={3.5}
      fill={color}
      style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      initial={{ cx: fromX, opacity: 0 }}
      animate={{ cx: [fromX, toX], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 3.4, delay, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    />
  );
}

export function CountercurrentExchange({
  locale = "vi",
  caption,
  className,
}: CountercurrentExchangeProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const [mode, setMode] = useState<Mode>("countercurrent");
  const counter = mode === "countercurrent";
  const target = counter ? 88 : 50;
  const [shown, setShown] = useState(target);

  // Tween the headline number toward its target so the toggle feels alive.
  const raf = useRef<number | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `shown` is read once as the tween's start value; listing it would restart the animation every frame
  useEffect(() => {
    if (reduced) {
      setShown(target);
      return;
    }
    let start: number | null = null;
    const from = shown;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const k = Math.min(1, (ts - start) / 600);
      setShown(Math.round(from + (target - from) * (1 - (1 - k) ** 3)));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduced]);

  const bloodFrom = counter ? X1 : X0;
  const bloodTo = counter ? X0 : X1;

  return (
    <VizFigure
      title={t.title}
      caption={caption}
      className={className}
      controls={
        <SegmentedToggle<Mode>
          ariaLabel={t.title}
          value={mode}
          onChange={setMode}
          options={[
            { value: "concurrent", label: t.concurrent, tone: "var(--muted)" },
            { value: "countercurrent", label: t.countercurrent, tone: "var(--cyan)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} 210`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={`${t.extraction}: ${target}%`}
        >
          {/* lane rails */}
          <line
            x1={X0}
            y1={WATER_Y}
            x2={X1}
            y2={WATER_Y}
            stroke="var(--cyan)"
            strokeWidth={12}
            strokeLinecap="round"
            strokeOpacity={0.18}
          />
          <line
            x1={X0}
            y1={BLOOD_Y}
            x2={X1}
            y2={BLOOD_Y}
            stroke="var(--magenta)"
            strokeWidth={12}
            strokeLinecap="round"
            strokeOpacity={0.18}
          />
          <text x={X0} y={WATER_Y - 12} fill="var(--subtle)" fontSize={11} fontFamily="sans-serif">
            {t.water} →
          </text>
          <text x={X0} y={BLOOD_Y + 22} fill="var(--subtle)" fontSize={11} fontFamily="sans-serif">
            {t.blood} {counter ? "←" : "→"}
          </text>

          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Particle
              key={`w${i}`}
              y={WATER_Y}
              fromX={X0}
              toX={X1}
              color="var(--cyan)"
              delay={i * 0.56}
              reduced={reduced}
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Particle
              key={`b${mode}${i}`}
              y={BLOOD_Y}
              fromX={bloodFrom}
              toX={bloodTo}
              color="var(--magenta)"
              delay={i * 0.56}
              reduced={reduced}
            />
          ))}

          {/* slope bars: the local oxygen gradient along the frond */}
          <text
            x={X0}
            y={SLOPE_BASE + 18}
            fill="var(--subtle)"
            fontSize={10}
            fontFamily="sans-serif"
          >
            {t.slope}
          </text>
          {Array.from({ length: N_BARS }, (_, i) => {
            const p = i / (N_BARS - 1);
            const x = X0 + p * (X1 - X0);
            const h = slopeAt(p, counter) * 34;
            const alive = h > 1.5;
            return (
              <motion.rect
                key={`s${mode}${i}`}
                x={x - 5}
                width={10}
                rx={2}
                initial={false}
                animate={{ y: SLOPE_BASE - h, height: h }}
                transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                fill={alive ? "var(--teal)" : "var(--border-strong)"}
                style={{ filter: alive ? "drop-shadow(0 0 4px var(--teal))" : "none" }}
              />
            );
          })}
        </svg>

        <div className="flex flex-col justify-center gap-2 sm:w-2/5">
          <div className="rounded-lg border border-border bg-void/30 px-3 py-2">
            <p className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
              {t.extraction}
            </p>
            <p className="font-display text-3xl font-700 text-teal">{shown}%</p>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-void">
              <motion.div
                className="h-full rounded-full bg-teal"
                initial={false}
                animate={{ width: `${target}%` }}
                transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ boxShadow: "0 0 10px var(--teal)" }}
              />
            </div>
          </div>
          <p className="font-sans text-xs leading-relaxed text-subtle">
            {counter ? t.countercurrentNote : t.concurrentNote}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
