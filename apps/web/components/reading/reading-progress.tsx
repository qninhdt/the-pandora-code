"use client";

import { type ReaderChapterKey, saveReadingLocation } from "@/lib/engagement/reading-store";
import { useEffect, useState } from "react";

interface ReadingProgressProps {
  /** Element to measure scroll progress against. Defaults to the explicit article root. */
  targetSelector?: string;
  /** Optional route identity. Persistence is disabled until both values exist. */
  chapter?: ReaderChapterKey;
  /** Convenience props for route integrations that already have separate values. */
  locale?: string;
  slug?: string;
}

/** Calculate progress in document coordinates, not viewport coordinates. */
export function calculateReadingProgress({
  scrollY,
  articleTop,
  articleHeight,
  viewportHeight,
}: {
  scrollY: number;
  articleTop: number;
  articleHeight: number;
  viewportHeight: number;
}): number {
  const top = Math.max(0, articleTop);
  const scrollable = Math.max(0, articleHeight - viewportHeight);
  if (scrollable === 0) return scrollY >= top ? 1 : 0;
  return Math.max(0, Math.min(1, (scrollY - top) / scrollable));
}

// Slim bioluminescent bar pinned to the top, tracking reading progress through
// the target (the chapter <main> by default). Transform-only, rAF-throttled,
// decorative (aria-hidden).
export function ReadingProgress({
  targetSelector = "[data-reading-root]",
  chapter,
  locale,
  slug,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.querySelector(targetSelector) ?? document.querySelector("main");
    if (!target) return;
    const article = target as HTMLElement;
    const chapterKey = chapter ?? (locale && slug ? { locale, slug } : undefined);
    let raf = 0;
    let lastPersistedAt = 0;
    // Do not persist the initial measurement. On a return visit it is usually
    // made at scrollY=0 and would overwrite the saved Continue Reading state
    // before that prompt hydrates. A real scroll event opts into persistence.
    let hasUserScrolled = window.scrollY > 0;
    let pending: { progress: number; completed: boolean; scrollY: number } | null = null;

    const persist = (force = false) => {
      if (!chapterKey || !pending) return;
      const now = Date.now();
      if (!force && now - lastPersistedAt < 750) return;
      lastPersistedAt = now;
      saveReadingLocation({ ...chapterKey, ...pending });
      pending = null;
    };

    const update = () => {
      const rect = article.getBoundingClientRect();
      const scrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const pct = calculateReadingProgress({
        scrollY,
        articleTop: rect.top + scrollY,
        articleHeight: article.scrollHeight,
        viewportHeight: window.innerHeight,
      });
      setProgress(pct);
      if (chapterKey && hasUserScrolled) {
        pending = {
          progress: pct,
          completed: pct >= 0.95,
          scrollY,
        };
        persist();
      }
      raf = 0;
    };
    const onScroll = () => {
      hasUserScrolled = true;
      if (raf === 0) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };
    const flush = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        update();
      }
      persist(true);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      flush();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, [chapter, locale, slug, targetSelector]);

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
