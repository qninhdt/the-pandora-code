"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useState } from "react";

interface BreathingModeToggleProps {
  locale?: "vi" | "en";
  caption?: string;
  className?: string;
}

type Mode = "tidal" | "unidirectional";

const STRINGS = {
  vi: {
    title: "Hai cách thở, một bài toán",
    tidal: "Thủy triều",
    unidirectional: "Một chiều",
    freshLabel: "Bề mặt trao đổi",
    fresh: "luôn tươi",
    stale: "có vùng tù đọng",
    costLabel: "Chi phí đảo chiều",
    costHigh: "cao",
    costNone: "không",
    deadSpace: "Khí tù",
    ram: "Thông gió động: BẬT khi bay nhanh",
    tidalNote:
      "Thủy triều: khí vào rồi ra cùng một cửa, để lại một túi khí tù không bao giờ thoát; mỗi nhịp phải hãm lại và đảo chiều cả khối khí nặng. Trong bầu khí quyển đặc của Pandora, cái giá ấy rất đắt.",
    unidirectionalNote:
      "Một chiều: khí chảy thẳng một hướng qua bề mặt luôn tươi, không ngừng, không đảo. Khe thở hướng ra trước để chính tốc độ con vật bơm khí — gần như miễn phí.",
  },
  en: {
    title: "Two ways to breathe, one problem",
    tidal: "Tidal",
    unidirectional: "One-way",
    freshLabel: "Exchange surface",
    fresh: "always fresh",
    stale: "has a stale pocket",
    costLabel: "Cost to reverse",
    costHigh: "high",
    costNone: "none",
    deadSpace: "Stale air",
    ram: "Ram-ventilation: ON at speed",
    tidalNote:
      "Tidal: air in and back out the same door, leaving a pocket of stale air that never clears; every breath stops and reverses a heavy mass of gas. In Pandora's dense air, that cost is steep.",
    unidirectionalNote:
      "One-way: air streams a single direction across an always-fresh surface, never pausing, never reversing. Forward-facing intakes let the animal's own speed do the pumping — almost free.",
  },
} as const;

const W = 380;
const H = 184;
const CX = 190;
const CY = 90;

export function BreathingModeToggle({
  locale = "vi",
  caption,
  className,
}: BreathingModeToggleProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const [mode, setMode] = useState<Mode>("unidirectional");
  const oneWay = mode === "unidirectional";
  const accent = oneWay ? "var(--teal)" : "var(--amber)";

  // Tidal air oscillates in/out the one door; one-way streams straight through.
  const tidalX = reduced ? [110] : [70, 150, 70];
  const flowX = reduced ? [CX] : [80, 300];

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
            { value: "tidal", label: t.tidal, tone: "var(--amber)" },
            { value: "unidirectional", label: t.unidirectional, tone: "var(--teal)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={oneWay ? t.unidirectional : t.tidal}
        >
          {/* lung body */}
          <ellipse
            cx={CX}
            cy={CY}
            rx={104}
            ry={46}
            fill="var(--surface-overlay)"
            stroke="var(--border-strong)"
            strokeWidth={2}
          />

          {oneWay ? (
            <>
              {/* always-fresh exchange band */}
              <motion.rect
                x={CX - 84}
                y={CY + 24}
                height={6}
                rx={3}
                fill="var(--teal)"
                initial={false}
                animate={{ opacity: reduced ? 0.8 : [0.45, 0.9, 0.45], width: 168 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
                }
                style={{ filter: "drop-shadow(0 0 6px var(--teal))" }}
              />
              {/* rear intake → front vent, single direction */}
              <circle
                cx={84}
                cy={CY}
                r={6}
                fill="var(--cyan)"
                style={{ filter: "drop-shadow(0 0 5px var(--cyan))" }}
              />
              <circle
                cx={296}
                cy={CY}
                r={6}
                fill="var(--teal)"
                style={{ filter: "drop-shadow(0 0 5px var(--teal))" }}
              />
              {[0, 1, 2, 3].map((i) => (
                <motion.circle
                  key={`f${i}`}
                  cy={CY}
                  r={4}
                  fill="var(--cyan)"
                  style={{ filter: "drop-shadow(0 0 5px var(--cyan))" }}
                  initial={{ cx: flowX[0], opacity: 0 }}
                  animate={{ cx: flowX, opacity: reduced ? 1 : [0, 1, 1, 0] }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: 2.4,
                          delay: i * 0.6,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }
                  }
                />
              ))}
            </>
          ) : (
            <>
              {/* single door + trapped stale pocket at the blind end */}
              <circle
                cx={84}
                cy={CY}
                r={6}
                fill="var(--amber)"
                style={{ filter: "drop-shadow(0 0 5px var(--amber))" }}
              />
              <ellipse cx={CX + 62} cy={CY} rx={30} ry={26} fill="var(--amber)" opacity={0.16} />
              <text
                x={CX + 62}
                y={CY + 4}
                fill="var(--amber)"
                fontSize={9}
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {t.deadSpace}
              </text>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={`tdl${i}`}
                  cy={CY}
                  r={4}
                  fill="var(--amber)"
                  style={{ filter: "drop-shadow(0 0 5px var(--amber))" }}
                  initial={{ cx: tidalX[0] }}
                  animate={{ cx: tidalX, opacity: reduced ? 1 : [0.3, 1, 0.3] }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: 2.8,
                          delay: i * 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }
                  }
                />
              ))}
            </>
          )}
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <div className="grid grid-cols-2 gap-2">
            <Stat label={t.freshLabel} value={oneWay ? t.fresh : t.stale} color={accent} />
            <Stat label={t.costLabel} value={oneWay ? t.costNone : t.costHigh} color={accent} />
          </div>
          {oneWay && (
            <p
              className="rounded-lg border px-3 py-1.5 font-sans text-[0.7rem]"
              style={{
                borderColor: "color-mix(in oklab, var(--cyan) 40%, transparent)",
                background: "color-mix(in oklab, var(--cyan) 9%, transparent)",
                color: "var(--accent-soft)",
              }}
            >
              {t.ram}
            </p>
          )}
          <p className="font-sans text-xs leading-relaxed text-subtle">
            {oneWay ? t.unidirectionalNote : t.tidalNote}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-void/30 px-3 py-2">
      <p className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">{label}</p>
      <p className="font-display text-sm font-700" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
