"use client";

import { resolveReducedMotion, useReadingPreferences } from "@/lib/engagement/preferences-store";
import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// `useReducedMotion` can observe the browser media query during the very first
// client render, while the server necessarily renders without it. That makes
// a component which branches on the value hydrate different HTML. The
// external-store contract gives React a stable server snapshot and applies the
// browser value immediately after hydration.
function subscribeToSystemMotion(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  const listener = () => onChange();
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }
  const legacyMedia = media as MediaQueryList & {
    addListener: (callback: () => void) => void;
    removeListener: (callback: () => void) => void;
  };
  legacyMedia.addListener(listener);
  return () => legacyMedia.removeListener(listener);
}

function getSystemMotionSnapshot(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerMotionSnapshot(): boolean {
  return false;
}

function useSystemReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToSystemMotion,
    getSystemMotionSnapshot,
    getServerMotionSnapshot,
  );
}

// System-level reduced motion for local animation primitives. The persisted
// reader switch is intentionally scoped to parallax and Three.js scenes via
// useReducedMotionForScene below, so interactive chapter controls stay intact.
export function useReducedMotionSafe(): boolean {
  return useSystemReducedMotion();
}

// The reader preference is a scene-level performance switch: it replaces
// parallax/WebGL with a static rendering, without changing the DOM or behavior
// of the interactive figures that happen to live on the same page.
export function useReducedMotionForScene(): boolean {
  const systemReduced = useSystemReducedMotion();
  const { reducedMotion } = useReadingPreferences();
  return resolveReducedMotion(systemReduced, reducedMotion);
}
