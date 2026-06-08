"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useEffect, useState } from "react";

export type AtmosphereTier = "pending" | "webgl" | "fallback";

interface TierState {
  tier: AtmosphereTier;
  /** True on capable-but-not-powerful devices (scale density down). */
  weaker: boolean;
}

// Decide whether to run the WebGL atmosphere or the 2D fallback. Starts
// `pending` (renders nothing) so neither the canvas nor the poster flashes
// before the device decision is made on mount - avoids the F5 image flash.
export function useAtmosphereTier(): TierState {
  const reduced = useReducedMotionSafe();
  const [state, setState] = useState<TierState>({
    tier: "pending",
    weaker: false,
  });

  useEffect(() => {
    if (reduced) {
      setState({ tier: "fallback", weaker: false });
      return;
    }
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 8;
    const cores = nav.hardwareConcurrency ?? 8;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 768;

    if (!hasWebGL2() || memory <= 4 || cores <= 4 || (coarse && small)) {
      setState({ tier: "fallback", weaker: false });
      return;
    }
    // Mid devices still get WebGL but with reduced density.
    const weaker = memory <= 8 || cores <= 8 || coarse;
    setState({ tier: "webgl", weaker });
  }, [reduced]);

  return state;
}

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}
