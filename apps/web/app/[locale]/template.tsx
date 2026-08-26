"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Next.js `template.tsx` re-mounts its children on every navigation (unlike
// `layout.tsx`, which persists), so wrapping the page here gives a fresh enter
// animation on each route change. Persistent chrome (the WebGL atmosphere, the
// floating dock) lives in layout.tsx and is intentionally left out so it never
// re-initializes on navigation.
//
// The transition is opacity-only on purpose: the pages render `position: fixed`
// full-bleed backdrops, and animating `transform`/`filter` on an ancestor would
// turn it into the containing block for those fixed layers and break them.
// Opacity creates a stacking context but not a containing block, so fixed stays
// anchored to the viewport.
export default function LocaleTemplate({ children }: { children: ReactNode }) {
  const reduced = useReducedMotionSafe();

  // Keep an isolated stacking context even when the enter animation is
  // skipped. Chapter/page backgrounds use z-index -2 and would otherwise be
  // painted underneath the body's background when this route wrapper becomes
  // a fragment.
  if (reduced) {
    return <div className="relative isolate">{children}</div>;
  }

  return (
    <motion.div
      className="relative isolate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
