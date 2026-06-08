"use client";

import { useEffect, useRef } from "react";

export interface PointerTarget {
  /** Normalized -1..1 across the viewport; smoothed by the consumer. */
  x: number;
  y: number;
}

// Track the pointer as a normalized vec2 written to a ref (never triggers a
// React re-render - the canvas reads it inside useFrame). On coarse pointers
// (touch), no listener is attached and the target slowly idles at center so the
// field still breathes without input.
export function usePointerUniform(): React.RefObject<PointerTarget> {
  const target = useRef<PointerTarget>({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const flush = () => {
      if (pending) {
        target.current.x = pending.x;
        target.current.y = pending.y;
        pending = null;
      }
      frame = 0;
    };

    const onMove = (e: PointerEvent) => {
      pending = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
      if (frame === 0) frame = requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return target;
}
