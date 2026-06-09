"use client";

import { LINEAGES } from "@/components/content/glow-origins-tree.data";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { branchCurve } from "@/components/content/viz/tree";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

interface GlowOriginsTreeProps {
  caption?: string;
  className?: string;
}

const W = 300;
const ROOT_X = 30;
const FORK_X = 96;
const TIP_X = 150;
const TOP = 30;
const GAP = 38;

export function GlowOriginsTree({ caption, className }: GlowOriginsTreeProps) {
  const t = useTranslations("viz.glowOriginsTree");
  const locale = useLocale();
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [active, setActive] = useState<string | null>(null);
  const isVi = locale === "vi";
  const sel = LINEAGES.find((l) => l.key === active) ?? null;
  const rootY = TOP + ((LINEAGES.length - 1) * GAP) / 2;
  const H = TOP * 2 + (LINEAGES.length - 1) * GAP;

  return (
    <VizFigure
      title={t("title")}
      caption={caption}
      tone="teal"
      className={className}
      hint={t("hint")}
      controls={
        <span
          className="flex items-baseline gap-1 rounded-full px-2.5 py-0.5"
          style={{
            background: "color-mix(in oklab, var(--teal) 16%, transparent)",
            color: "var(--teal)",
          }}
        >
          <span className="font-display text-sm font-700">40–50+</span>
          <span className="font-sans text-xs">{t("tagline")}</span>
        </span>
      }
    >
      <div className="rounded-xl border border-border bg-void/30 p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("title")}>
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />
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
            filter={glowUrl(uid, "soft-shadow")}
          />
          <VizText x={ROOT_X} y={rootY - 14} size="micro" tone="subtle" anchor="middle">
            {t("ancestor")}
          </VizText>

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
                aria-label={isVi ? l.nameVi : l.nameEn}
              >
                <path
                  d={branchCurve({ x: FORK_X, y: rootY }, { x: TIP_X, y })}
                  fill="none"
                  stroke={tone}
                  strokeWidth={on ? 3 : 2}
                  strokeLinecap="round"
                  strokeOpacity={on ? 1 : 0.55}
                  filter={on ? glowUrl(uid, "bloom") : undefined}
                />
                {/* tip blooms in on load, staggered per lineage — each origin lighting on its own */}
                <motion.circle
                  cx={TIP_X}
                  cy={y}
                  fill={tone}
                  stroke={tone}
                  strokeWidth={2}
                  filter={glowUrl(uid, on ? "bloom-strong" : "bloom")}
                  initial={reduced ? { r: on ? 8 : 6 } : { scale: 0, opacity: 0, r: on ? 8 : 6 }}
                  animate={{ scale: 1, opacity: 1, r: on ? 8 : 6 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { delay: 0.25 + i * 0.45, type: "spring", stiffness: 320, damping: 16 }
                  }
                  style={{ transformOrigin: `${TIP_X}px ${y}px` }}
                />
                <VizText
                  x={TIP_X + 14}
                  y={y + 4}
                  size="small"
                  tone={on ? "var(--foreground)" : "var(--muted)"}
                >
                  {isVi ? l.nameVi : l.nameEn}
                </VizText>
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
              <p className="font-sans text-xs uppercase tracking-wider text-subtle">
                {t("fuelLabel")}
              </p>
              <p className="mt-0.5 font-sans text-xs font-700" style={{ color: sel.tone }}>
                {isVi ? sel.fuelVi : sel.fuelEn}
              </p>
            </div>
            <div>
              <p className="font-sans text-xs uppercase tracking-wider text-subtle">
                {t("enzymeLabel")}
              </p>
              <p className="mt-0.5 font-sans text-xs font-700" style={{ color: sel.tone }}>
                {isVi ? sel.enzymeVi : sel.enzymeEn}
              </p>
            </div>
          </div>
        ) : (
          <p className="font-sans text-xs text-muted">{t("note")}</p>
        )}
      </div>
    </VizFigure>
  );
}
