"use client";

import { motion, useInView } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

interface FadeInOnScrollProps {
  children: ReactNode;
  /** Seconds of delay before the animation begins. */
  delay?: number;
  /** Pixels to travel upward into place. */
  y?: number;
  className?: string;
  /** Re-run each time it enters the viewport instead of once. */
  repeat?: boolean;
}

// Fade + rise a block into view on scroll. Transform/opacity only (no layout
// thrash). Collapses to a no-op under prefers-reduced-motion.
export function FadeInOnScroll({
  children,
  delay = 0,
  y = 28,
  className,
  repeat = false,
}: FadeInOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: !repeat, margin: "0px 0px -12% 0px" });
  const reduced = useReducedMotionSafe();

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
