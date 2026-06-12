"use client";

import { recordReading } from "@/lib/engagement/storage";
import { useEffect, useRef, useState } from "react";

interface ReadingProgressProps {
  /** Element to measure scroll progress against. Defaults to the whole page. */
  targetSelector?: string;
  /** When provided, scroll progress is persisted to reading history (debounced). */
  entry?: { slug: string; locale: "vi" | "en"; title: string };
}

// Slim bioluminescent bar pinned to the top, tracking reading progress through
// the target (the chapter <main> by default). Transform-only, rAF-throttled,
// decorative (aria-hidden). When `entry` is set, it also persists the latest
// scroll percentage to reading history (debounced ~1s) so the reader can pick
// up where they left off across sessions.
export function ReadingProgress({ targetSelector = "main", entry }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const pctRef = useRef(0);

  useEffect(() => {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    let raf = 0;
    const update = () => {
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      // A chapter shorter than the viewport can't scroll — treat it as fully
      // read (1) rather than 0, so it doesn't linger in "continue reading".
      const pct = total <= 0 ? 1 : Math.max(0, Math.min(1, -rect.top / total));
      setProgress(pct);
      pctRef.current = pct;
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

  // Persist the latest scroll percentage on a debounce. Reads from a ref so the
  // interval doesn't re-subscribe on every scroll tick. Skips the write when the
  // position hasn't meaningfully moved, so an idle open chapter isn't re-writing
  // localStorage (and waking every subscriber) every tick.
  useEffect(() => {
    if (!entry) return;
    let lastWritten = -1;
    const persist = () => {
      const pct = pctRef.current;
      if (Math.abs(pct - lastWritten) < 0.01) return;
      lastWritten = pct;
      recordReading({ ...entry, scrollPct: pct });
    };
    const handle = setInterval(persist, 1500);
    // Capture a final position when leaving the page (force a write).
    const onLeave = () => {
      lastWritten = -1;
      persist();
    };
    window.addEventListener("pagehide", onLeave);
    return () => {
      clearInterval(handle);
      window.removeEventListener("pagehide", onLeave);
      onLeave();
    };
  }, [entry]);

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
