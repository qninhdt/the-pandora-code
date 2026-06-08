"use client";

import { useReducedMotion } from "framer-motion";

// Single source for the reduced-motion decision. All motion primitives gate on
// this so honoring `prefers-reduced-motion` lives in one place (DRY). Motion is
// always an enhancement here — content never depends on it.
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}
