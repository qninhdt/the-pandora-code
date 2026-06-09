"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useEffect, useRef, useState } from "react";

interface UsePhaseLoopOptions {
  /** Seconds for one full 0→1 cycle. */
  period: number;
  /** Whether the loop is advancing. */
  playing: boolean;
  /** Deterministic starting phase (keep stable for SSR). */
  initial?: number;
}

interface PhaseLoop {
  /** Current phase in [0, 1). */
  phase: number;
  /** Manually set the phase (e.g. from a scrub slider). */
  setPhase: (p: number) => void;
}

// Drives a normalized 0→1 phase with requestAnimationFrame, wrapping the loop
// that detection-scope, eclipse-day-clock, half-life-decay, isochron-plot, and
// superconductor-cooldown each re-rolled. Reduced-motion freezes advancement
// (the phase stays at its current value; scrubbing still works), so motion stays
// a pure enhancement. The initial phase is deterministic for SSR safety.
export function usePhaseLoop({ period, playing, initial = 0 }: UsePhaseLoopOptions): PhaseLoop {
  const reduced = useReducedMotionSafe();
  const [phase, setPhase] = useState(initial);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing || reduced || period <= 0) {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      last.current = null;
      return;
    }
    const step = (now: number) => {
      if (last.current !== null) {
        const dt = (now - last.current) / 1000;
        setPhase((p) => (p + dt / period) % 1);
      }
      last.current = now;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [playing, reduced, period]);

  return { phase, setPhase };
}
