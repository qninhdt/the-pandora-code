"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

interface CountercurrentExchangeProps {
  caption?: string;
  className?: string;
}

type Mode = "concurrent" | "countercurrent";

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

// A glowing chevron marking the outflow end of a lane — points in the travel
// direction (dir = +1 right, -1 left), so the opposing flow reads instantly.
function FlowArrow({
  x,
  y,
  dir,
  color,
  bloom,
}: {
  x: number;
  y: number;
  dir: 1 | -1;
  color: string;
  bloom: string;
}) {
  return (
    <path
      d={`M ${x - 7 * dir} ${y - 6} L ${x + 3 * dir} ${y} L ${x - 7 * dir} ${y + 6}`}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      filter={bloom}
    />
  );
}

function Particle({
  y,
  fromX,
  toX,
  color,
  delay,
  reduced,
  bloom,
}: {
  y: number;
  fromX: number;
  toX: number;
  color: string;
  delay: number;
  reduced: boolean;
  bloom: string;
}) {
  if (reduced) {
    return <circle cx={(fromX + toX) / 2} cy={y} r={3.5} fill={color} filter={bloom} />;
  }
  return (
    <motion.circle
      cy={y}
      r={3.5}
      fill={color}
      filter={bloom}
      initial={{ cx: fromX, opacity: 0 }}
      animate={{ cx: [fromX, toX], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 3.4, delay, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    />
  );
}

export function CountercurrentExchange({ caption, className }: CountercurrentExchangeProps) {
  const t = useTranslations("viz.countercurrent");
  const reduced = useReducedMotionSafe();
  const uid = useId();
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
  }, [target, reduced]);

  const bloodFrom = counter ? X1 : X0;
  const bloodTo = counter ? X0 : X1;

  return (
    <VizFigure
      title={t("title")}
      caption={caption}
      tone="cyan"
      className={className}
      hint={counter ? t("countercurrentNote") : t("concurrentNote")}
      controls={
        <SegmentedToggle<Mode>
          ariaLabel={t("title")}
          value={mode}
          onChange={setMode}
          options={[
            { value: "concurrent", label: t("concurrent"), tone: "var(--muted)" },
            { value: "countercurrent", label: t("countercurrent"), tone: "var(--cyan)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} 210`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={`${t("extraction")}: ${target}%`}
        >
          <GlowDefs idBase={uid} tones={["cyan", "magenta", "teal"]} />
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
          {/* glowing flow-direction terminals: water always → , blood reverses with mode */}
          <FlowArrow x={X1} y={WATER_Y} dir={1} color="var(--cyan)" bloom={glowUrl(uid, "bloom")} />
          <FlowArrow
            x={bloodTo}
            y={BLOOD_Y}
            dir={counter ? -1 : 1}
            color="var(--magenta)"
            bloom={glowUrl(uid, "bloom")}
          />
          <VizText x={X0} y={WATER_Y - 12} size="small" tone="subtle">
            {t("water")} →
          </VizText>
          <VizText x={X0} y={BLOOD_Y + 22} size="small" tone="subtle">
            {t("blood")} {counter ? "←" : "→"}
          </VizText>

          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Particle
              key={`w${i}`}
              y={WATER_Y}
              fromX={X0}
              toX={X1}
              color="var(--cyan)"
              delay={i * 0.56}
              reduced={reduced}
              bloom={glowUrl(uid, "bloom")}
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
              bloom={glowUrl(uid, "bloom")}
            />
          ))}

          {/* slope bars: the local oxygen gradient along the frond */}
          <VizText x={X0} y={SLOPE_BASE + 18} size="micro" tone="subtle">
            {t("slope")}
          </VizText>
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
                filter={alive ? glowUrl(uid, "bloom") : undefined}
              />
            );
          })}
        </svg>

        <div className="flex flex-col justify-center gap-3 sm:w-2/5">
          <VizReadout
            label={t("extraction")}
            tone="var(--teal)"
            tinted
            value={
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-display text-3xl font-700 text-teal">{shown}%</span>
                <div className="h-2 w-full overflow-hidden rounded-full bg-void">
                  <motion.div
                    className="h-full rounded-full bg-teal"
                    initial={false}
                    animate={{ width: `${target}%` }}
                    transition={
                      reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                    }
                    style={{ boxShadow: "var(--glow-teal)" }}
                  />
                </div>
              </div>
            }
          />
        </div>
      </div>
    </VizFigure>
  );
}
