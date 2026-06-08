"use client";

import { motion, useInView } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

interface StaggerChildrenProps {
  children: ReactNode;
  /** Seconds between each child entering. */
  stagger?: number;
  className?: string;
}

// Reveal a list/grid one item at a time on scroll-into-view. Wrap each child in
// <StaggerItem>. No-op (renders children plainly) under reduced motion.
export function StaggerChildren({ children, stagger = 0.08, className }: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
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
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotionSafe();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
