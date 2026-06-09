"use client";

import { LINEAGES } from "@/components/content/glow-origins-tree.data";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useState } from "react";

interface GlowOriginsTreeProps {
  locale?: "vi" | "en";
  caption?: string;
  className?: string;
}

const STRINGS = {
  vi: {
    title: "Cùng một thủ thuật, phát minh hàng chục lần",
    ancestor: "Tổ tiên chung",
    tagline: "lần khởi nguồn độc lập",
    fuelLabel: "Nhiên liệu (luciferin)",
    enzymeLabel: "Enzyme",
    hint: "Chạm vào một nhánh để xem nhiên liệu và enzyme riêng của nó.",
    note: "Mỗi nhánh phát sáng bằng một phân tử nhiên liệu khác nhau, với một enzyme khác nhau. Chúng không thừa kế khả năng phát sáng từ tổ tiên chung — mỗi dòng dõi tự mò ra nó.",
  },
  en: {
    title: "One trick, invented dozens of times",
    ancestor: "Common ancestor",
    tagline: "independent origins",
    fuelLabel: "Fuel (luciferin)",
    enzymeLabel: "Enzyme",
    hint: "Tap a branch to see its own fuel and enzyme.",
    note: "Each branch glows with a different fuel molecule and a different enzyme. They did not inherit light from a shared glowing ancestor — every lineage stumbled onto it on its own.",
  },
} as const;

const W = 300;
const ROOT_X = 30;
const FORK_X = 96;
const TIP_X = 150;
const TOP = 30;
const GAP = 38;

export function GlowOriginsTree({ locale = "vi", caption, className }: GlowOriginsTreeProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const [active, setActive] = useState<string | null>(null);
  const sel = LINEAGES.find((l) => l.key === active) ?? null;
  const rootY = TOP + ((LINEAGES.length - 1) * GAP) / 2;
  const H = TOP * 2 + (LINEAGES.length - 1) * GAP;

  return (
    <VizFigure
      title={t.title}
      caption={caption}
      className={className}
      controls={
        <span
          className="flex items-baseline gap-1 rounded-full px-2.5 py-0.5"
          style={{
            background: "color-mix(in oklab, var(--teal) 16%, transparent)",
            color: "var(--teal)",
          }}
        >
          <span className="font-display text-sm font-700">40–50+</span>
          <span className="font-sans text-[0.6rem]">{t.tagline}</span>
        </span>
      }
    >
      <p className="mb-2 font-sans text-[0.65rem] text-subtle">{t.hint}</p>

      <div className="rounded-xl border border-border bg-void/30 p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t.title}>
          <line
            x1={ROOT_X}
            y1={rootY}
            x2={FORK_X}
            y2={rootY}
            stroke="var(--border-strong)"
            strokeWidth={2}
          />
          <circle
            cx={ROOT_X}
            cy={rootY}
            r={6}
            fill="var(--surface-overlay)"
            stroke="var(--subtle)"
            strokeWidth={2}
          />
          <text
            x={ROOT_X}
            y={rootY - 14}
            textAnchor="middle"
            className="font-sans"
            style={{ fontSize: 9, fill: "var(--subtle)" }}
          >
            {t.ancestor}
          </text>

          {LINEAGES.map((l, i) => {
            const y = TOP + l.slot * GAP;
            const on = active === l.key;
            const tone = l.tone;
            return (
              <g
                key={l.key}
                onClick={() => setActive(on ? null : l.key)}
                style={{ cursor: "pointer" }}
                // biome-ignore lint/a11y/useSemanticElements: an SVG <g> cannot be a native <button>; button role is the correct ARIA mapping for a clickable tree node
                role="button"
                aria-pressed={on}
                aria-label={locale === "vi" ? l.nameVi : l.nameEn}
              >
                <path
                  d={`M ${FORK_X} ${rootY} L ${FORK_X} ${y} L ${TIP_X} ${y}`}
                  fill="none"
                  stroke={tone}
                  strokeWidth={on ? 3 : 2}
                  strokeLinecap="round"
                  strokeOpacity={on ? 1 : 0.55}
                  style={on ? { filter: `drop-shadow(0 0 5px ${tone})` } : undefined}
                />
                {/* tip blooms in on load, staggered per lineage — each origin lighting on its own */}
                <motion.circle
                  cx={TIP_X}
                  cy={y}
                  fill={tone}
                  stroke={tone}
                  strokeWidth={2}
                  initial={reduced ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, r: on ? 8 : 6 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { delay: 0.25 + i * 0.45, type: "spring", stiffness: 320, damping: 16 }
                  }
                  style={{
                    filter: `drop-shadow(0 0 ${on ? 9 : 4}px ${tone})`,
                    transformOrigin: `${TIP_X}px ${y}px`,
                  }}
                />
                <text
                  x={TIP_X + 14}
                  y={y + 4}
                  className="font-sans"
                  style={{ fontSize: 11, fill: on ? "var(--foreground)" : "var(--muted)" }}
                >
                  {locale === "vi" ? l.nameVi : l.nameEn}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        className="mt-3 rounded-lg border px-3 py-2 transition-colors"
        style={{
          borderColor: sel
            ? `color-mix(in oklab, ${sel.tone} 45%, transparent)`
            : "color-mix(in oklab, var(--teal) 40%, transparent)",
          background: sel
            ? `color-mix(in oklab, ${sel.tone} 9%, transparent)`
            : "color-mix(in oklab, var(--teal) 9%, transparent)",
        }}
      >
        {sel ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
                {t.fuelLabel}
              </p>
              <p className="mt-0.5 font-sans text-xs font-700" style={{ color: sel.tone }}>
                {locale === "vi" ? sel.fuelVi : sel.fuelEn}
              </p>
            </div>
            <div>
              <p className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
                {t.enzymeLabel}
              </p>
              <p className="mt-0.5 font-sans text-xs font-700" style={{ color: sel.tone }}>
                {locale === "vi" ? sel.enzymeVi : sel.enzymeEn}
              </p>
            </div>
          </div>
        ) : (
          <p className="font-sans text-xs text-muted">{t.note}</p>
        )}
      </div>
    </VizFigure>
  );
}
