"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";

// A compact "decoding" status that replaces the old eyebrow: a label, a thin
// glowing progress bar, and a live count of how many chapters are decoded
// (published) out of the planned total. It tells the reader the book is a
// living archive still being decoded, rather than repeating the title.
interface DecodeProgressProps {
  label: string;
  countLabel: string;
  done: number;
  total: number;
}

export function DecodeProgress({ label, countLabel, done, total }: DecodeProgressProps) {
  const reduced = useReducedMotionSafe();
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <span className="inline-flex items-center gap-2.5 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-cyan">
      <span className="whitespace-nowrap">{label}</span>

      <span
        aria-hidden
        className="relative h-1 w-12 overflow-hidden rounded-full sm:w-16"
        style={{ background: "color-mix(in oklab, var(--cyan) 18%, transparent)" }}
      >
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--teal), var(--cyan))",
            boxShadow: "0 0 10px 0 color-mix(in oklab, var(--cyan) 80%, transparent)",
          }}
          initial={reduced ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={
            reduced ? { duration: 0 } : { duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </span>

      <span className="whitespace-nowrap tabular-nums text-foreground/80">{countLabel}</span>
    </span>
  );
}
