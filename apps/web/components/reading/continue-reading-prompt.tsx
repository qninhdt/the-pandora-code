"use client";

import { useReadingLocation } from "@/lib/engagement/reading-store";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

export interface ContinueReadingPromptProps {
  locale: string;
  slug: string;
  targetSelector?: string;
  className?: string;
  label?: string;
  busyLabel?: string;
  progressLabel?: string;
  onRestored?: () => void;
}

function articleRoot(targetSelector: string) {
  return (
    document.querySelector<HTMLElement>(targetSelector) ??
    document.querySelector<HTMLElement>("[data-reading-root]")
  );
}

async function waitForReaderLayout(root: HTMLElement) {
  if (document.fonts?.ready) {
    await Promise.race([
      document.fonts.ready,
      new Promise<void>((resolve) => window.setTimeout(resolve, 1200)),
    ]);
  }

  const images = [...root.querySelectorAll<HTMLImageElement>("img")];
  await Promise.all(
    images.map(async (image) => {
      try {
        if (typeof image.decode === "function") await image.decode();
      } catch {
        // A failed image should not prevent a reader from continuing.
      }
    }),
  );
}

function scrollToRatio(root: HTMLElement, progress: number) {
  const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
  const rootTop = root.getBoundingClientRect().top + window.scrollY;
  const top = rootTop + Math.min(1, Math.max(0, progress)) * maxScroll;
  window.scrollTo({ top, behavior: "auto" });
}

function scrollToOffset(scrollY: number) {
  const requested = Math.max(0, scrollY);
  const maxDocumentScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const top = maxDocumentScroll > 0 ? Math.min(requested, maxDocumentScroll) : requested;
  window.scrollTo({ top, behavior: "auto" });
}

async function restoreRatioWithCorrection(root: HTMLElement, progress: number) {
  scrollToRatio(root, progress);
  if (typeof ResizeObserver === "undefined") return;

  await new Promise<void>((resolve) => {
    let corrections = 0;
    let settled = false;
    const observer = new ResizeObserver(() => {
      if (settled || corrections >= 4) return;
      corrections += 1;
      scrollToRatio(root, progress);
    });
    const finish = () => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      window.clearTimeout(timeout);
      resolve();
    };
    const timeout = window.setTimeout(finish, 320);
    observer.observe(root);
    window.requestAnimationFrame(() => scrollToRatio(root, progress));
  });
}

async function restoreOffsetWithCorrection(root: HTMLElement, scrollY: number) {
  scrollToOffset(scrollY);
  if (typeof ResizeObserver === "undefined") return;

  await new Promise<void>((resolve) => {
    let corrections = 0;
    let settled = false;
    const observer = new ResizeObserver(() => {
      if (settled || corrections >= 4) return;
      corrections += 1;
      scrollToOffset(scrollY);
    });
    const finish = () => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      window.clearTimeout(timeout);
      resolve();
    };
    const timeout = window.setTimeout(finish, 320);
    observer.observe(root);
    window.requestAnimationFrame(() => scrollToOffset(scrollY));
  });
}

async function restoreReadingPositionWithCorrection(
  root: HTMLElement,
  progress: number,
  scrollY?: number,
) {
  // `scrollY` is exact for the same chapter and viewport. Older entries only
  // have a ratio, which remains the safe fallback after content/layout shifts.
  if (typeof scrollY === "number" && Number.isFinite(scrollY) && scrollY > 0) {
    await restoreOffsetWithCorrection(root, scrollY);
    return;
  }
  await restoreRatioWithCorrection(root, progress);
}

export function ContinueReadingPrompt({
  locale,
  slug,
  targetSelector = "[data-reading-root]",
  className,
  label = "Continue reading",
  busyLabel = "Restoring position…",
  progressLabel = "{percent}% read",
  onRestored,
}: ContinueReadingPromptProps) {
  const location = useReadingLocation(locale, slug);
  const [restoring, setRestoring] = useState(false);
  const progressPercent = Math.round((location?.progress ?? 0) * 100);

  const restore = useCallback(async () => {
    if (!location || restoring) return;
    const root = articleRoot(targetSelector);
    if (!root) return;
    setRestoring(true);
    try {
      await waitForReaderLayout(root);
      await restoreReadingPositionWithCorrection(root, location.progress, location.scrollY);
      onRestored?.();
    } finally {
      setRestoring(false);
    }
  }, [location, onRestored, restoring, targetSelector]);

  if (!location || location.completed || location.progress <= 0.01) {
    return <div className={cn("min-h-16", className)} aria-hidden="true" />;
  }

  return (
    <div
      className={cn(
        "flex min-h-16 items-center justify-between gap-4 rounded-xl border border-cyan/30 bg-surface/80 px-4 py-3 font-sans text-sm backdrop-blur-sm",
        className,
      )}
      aria-live="polite"
    >
      <span className="text-muted">
        {progressLabel
          .replace("{percent}", String(progressPercent))
          .replace("__PERCENT__", String(progressPercent))}
      </span>
      <button
        type="button"
        onClick={restore}
        disabled={restoring}
        className="rounded-md border border-cyan/50 px-3 py-1.5 text-cyan transition-colors hover:bg-cyan/10 disabled:cursor-wait disabled:opacity-60"
      >
        {restoring ? busyLabel : label}
      </button>
    </div>
  );
}

export {
  restoreOffsetWithCorrection,
  restoreRatioWithCorrection,
  restoreReadingPositionWithCorrection,
  scrollToOffset,
  waitForReaderLayout,
};
