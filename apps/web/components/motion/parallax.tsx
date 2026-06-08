"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

interface ParallaxProps {
  children: ReactNode;
  /** Vertical drift in px across the scroll range. Negative drifts upward. */
  offset?: number;
  className?: string;
}

// Drift a layer at a different rate than the scroll for depth. Used by hero
// scenes and section backdrops. Disabled under prefers-reduced-motion.
export function Parallax({ children, offset = 80, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
