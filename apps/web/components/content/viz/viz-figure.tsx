"use client";

import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC-GLOW DESIGN CONTRACT (every interactive chapter figure follows this)
//
// 1. Chrome: wrap the figure body in <VizFigure>. It supplies the rounded
//    bioluminescent surface card, an ambient gradient wash + animated edge bloom,
//    the title/subtitle header, an optional controls slot, an optional hint line,
//    and the serif figcaption. Components never re-roll this shell.
// 2. SVG glow: mount one <GlowDefs idBase={useId()} /> per figure and reference
//    its bloom filters / radial washes by glowUrl(idBase, "bloom" | "wash-cyan" …)
//    instead of inlining per-element <filter> soup.
// 3. Hues: only design-token colors (var(--cyan|teal|magenta|amber) + depth/text
//    tokens). Active/living elements get a drop-shadow bloom; resting elements do
//    not. No raw hex.
// 4. Type: SVG text uses the <VizLabel>/<VizTick> scale (micro/small/base) — never
//    raw fontSize 8/9/10. HTML text uses the Tailwind type scale, no text-[0.6rem].
// 5. Motion: entrance via FadeInOnScroll (built into VizFigure); ongoing motion
//    (rAF loops, GlowPulse) must gate on useReducedMotionSafe(). Initial state is
//    deterministic for SSR.
// 6. i18n: all UI strings come from useTranslations("viz.<key>"); no STRINGS block
//    and no `locale` prop. Scientific-data arrays may stay in code.
// ─────────────────────────────────────────────────────────────────────────────

interface VizFigureProps {
  /** Short heading shown top-left of the figure chrome. */
  title: string;
  /** Optional one-line context under the title. */
  subtitle?: string;
  /** Optional control slot rendered top-right (toggles, play buttons). */
  controls?: ReactNode;
  /** Optional explanatory line rendered below the body, above the caption. */
  hint?: ReactNode;
  /** Italic figure caption rendered below the frame. */
  caption?: string;
  /** Ambient wash hue behind the card. Defaults to cyan. */
  tone?: "cyan" | "teal" | "magenta" | "amber";
  /** The visualization body. */
  children: ReactNode;
  className?: string;
}

// Shared chrome for interactive chapter visualizations. The card sits over a soft
// radial wash and a hairline gradient edge so each figure reads as one glowing
// object in the world rather than a flat box. See the design contract above.
export function VizFigure({
  title,
  subtitle,
  controls,
  hint,
  caption,
  tone = "cyan",
  children,
  className,
}: VizFigureProps) {
  const c = `var(--${tone})`;
  return (
    <FadeInOnScroll>
      <figure className={cn("group relative my-8", className)}>
        {/* ambient wash — a faint bloom bleeding out from behind the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[1.4rem] opacity-70 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, ${c} 22%, transparent), transparent 70%)`,
          }}
        />
        <div
          className="relative overflow-hidden rounded-2xl border bg-surface/60 backdrop-blur-sm"
          style={{
            borderColor: `color-mix(in oklab, ${c} 22%, var(--border))`,
            boxShadow: `inset 0 1px 0 0 color-mix(in oklab, ${c} 14%, transparent), 0 8px 40px -16px color-mix(in oklab, ${c} 40%, transparent)`,
          }}
        >
          {/* glowing top edge */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, color-mix(in oklab, ${c} 70%, transparent), transparent)`,
            }}
          />
          <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
            <div className="min-w-0">
              <p className="font-display text-sm font-700 tracking-tight text-foreground">
                {title}
              </p>
              {subtitle ? (
                <p className="mt-0.5 font-sans text-xs leading-snug text-subtle">{subtitle}</p>
              ) : null}
            </div>
            {controls ? <div className="flex shrink-0 items-center gap-2">{controls}</div> : null}
          </div>
          <div className="p-4">{children}</div>
          {hint ? (
            <div className="border-t border-border/50 px-4 py-3 font-sans text-xs leading-relaxed text-subtle">
              {hint}
            </div>
          ) : null}
        </div>
        {caption ? (
          <figcaption className="mt-3 px-1 font-serif text-sm italic leading-relaxed text-muted">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </FadeInOnScroll>
  );
}
