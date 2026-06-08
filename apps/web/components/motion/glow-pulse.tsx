"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

interface GlowPulseProps {
  children: ReactNode;
  /** Token color name for the bloom (cyan | teal | magenta | amber). */
  color?: "cyan" | "teal" | "magenta" | "amber";
  /** Seconds for one breathe cycle. */
  duration?: number;
  className?: string;
}

// A slow bioluminescent breathe — drifting drop-shadow bloom on living elements
// (glowing icons, hero accents). Static glow under prefers-reduced-motion.
export function GlowPulse({ children, color = "cyan", duration = 4.5, className }: GlowPulseProps) {
  const reduced = useReducedMotionSafe();
  const c = `var(--${color})`;
  const soft = `drop-shadow(0 0 6px color-mix(in oklab, ${c} 40%, transparent))`;
  const bright = `drop-shadow(0 0 16px color-mix(in oklab, ${c} 70%, transparent))`;

  if (reduced) {
    return (
      <div className={className} style={{ filter: soft }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ filter: soft }}
      animate={{ filter: [soft, bright, soft] }}
      transition={{ duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
