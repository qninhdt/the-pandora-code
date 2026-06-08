"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useEffect, useState } from "react";

// Decide whether a 3D scene should run at all. Returns true (use 2D fallback)
// when the user prefers reduced motion or the device looks low-powered. Starts
// true on the server / first paint and relaxes after mount - so SSR is always
// the cheap fallback and there is no hydration mismatch.
export function useLowPower(): boolean {
  const reduced = useReducedMotionSafe();
  const [lowPower, setLowPower] = useState(true);

  useEffect(() => {
    if (reduced) {
      setLowPower(true);
      return;
    }
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 8;
    const cores = nav.hardwareConcurrency ?? 8;
    const noWebGL2 = !hasWebGL2();
    setLowPower(noWebGL2 || memory <= 4 || cores <= 4);
  }, [reduced]);

  return lowPower;
}

function hasWebGL2(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}
