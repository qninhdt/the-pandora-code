"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const landing = /^\/(?:en|vi)\/?$/.test(pathname);
  // Landing particles are a sibling fixed layer in the layout. Keep the
  // landing route transparent to the root stacking context so its z-10 copy
  // can sit above those particles while painted backdrops stay below them.
  const stackClass = landing ? "relative" : "relative isolate";

  // Keep an isolated stacking context for reader routes: their page-level
  // backgrounds use negative z-index values and must stay above the body
  // background. The landing route opts out so its copy can layer over the
  // fixed particle canvas owned by the layout.
  if (reduced || landing) {
    return <div className={stackClass}>{children}</div>;
  }

  return (
    <motion.div
      className={stackClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
