"use client";

import { useEffect, useState } from "react";

interface ReadingProgressProps {
  /** Element to measure scroll progress against. Defaults to the whole page. */
  targetSelector?: string;
}

// Slim bioluminescent bar pinned to the top, tracking reading progress through
// the target (the chapter <main> by default). Transform-only, rAF-throttled,
// decorative (aria-hidden).
export function ReadingProgress({ targetSelector = "main" }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    let raf = 0;
    const update = () => {
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const pct = total <= 0 ? 0 : Math.max(0, Math.min(1, -rect.top / total));
      setProgress(pct);
      raf = 0;
    };
    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetSelector]);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
      <div
        className="h-full origin-left"
        style={{
          transform: `scaleX(${progress})`,
          background: "linear-gradient(90deg, var(--cyan), var(--teal))",
          boxShadow: "0 0 12px 0 color-mix(in oklab, var(--cyan) 70%, transparent)",
        }}
      />
    </div>
  );
}
