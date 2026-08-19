"use client";

import { useEffect, useRef } from "react";

interface RafLoopOptions {
  // When false, the loop is suspended (e.g. user paused, or figure off-screen).
  active?: boolean;
}

// requestAnimationFrame driver that hands the callback a delta in seconds and
// the absolute elapsed time. Auto-suspends while the tab is hidden so a
// backgrounded page burns no frames; combine `active` with `useInView` to also
// idle when scrolled off-screen. Delta is clamped so a long pause (tab return)
// can't produce one giant jump.
export function useRafLoop(
  callback: (deltaSeconds: number, elapsedSeconds: number) => void,
  { active = true }: RafLoopOptions = {},
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  const frameRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    let hidden = typeof document !== "undefined" && document.hidden;

    const onVisibility = () => {
      hidden = document.hidden;
      // Reset the clock on resume so delta doesn't include hidden time.
      if (!hidden) lastRef.current = null;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const tick = (now: number) => {
      frameRef.current = requestAnimationFrame(tick);
      if (hidden) return;
      if (lastRef.current == null) {
        lastRef.current = now;
        return;
      }
      const rawDelta = (now - lastRef.current) / 1000;
      lastRef.current = now;
      const delta = Math.min(rawDelta, 1 / 15); // clamp to ~66ms max step
      elapsedRef.current += delta;
      cbRef.current(delta, elapsedRef.current);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      lastRef.current = null;
    };
  }, [active]);
}
