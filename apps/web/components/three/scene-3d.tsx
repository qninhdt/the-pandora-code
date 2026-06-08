"use client";

import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";
import { useInViewMount } from "./use-in-view-mount";
import { useLowPower } from "./use-low-power";

interface Scene3DProps {
  /** The 3D scene contents (r3f elements). */
  children: ReactNode;
  /** 2D fallback shown on low-power devices, reduced-motion, or before mount. */
  fallback: ReactNode;
  /** Aspect-ratio box; the canvas fills it. */
  className?: string;
  camera?: { position?: [number, number, number]; fov?: number };
}

// The single gateway every 3D scene goes through. It enforces the mobile policy
// in one place: render the 2D fallback on low-power / reduced-motion devices and
// until the scene scrolls into view; otherwise mount an r3f canvas with capped
// DPR that only renders frames on demand and pauses when scrolled offscreen.
export function Scene3D({ children, fallback, className, camera }: Scene3DProps) {
  const lowPower = useLowPower();
  const { ref, mounted, inView } = useInViewMount<HTMLDivElement>();

  const showCanvas = !lowPower && mounted;

  return (
    <div ref={ref} className={className}>
      {showCanvas ? (
        <Canvas
          frameloop={inView ? "always" : "never"}
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: "low-power", alpha: true }}
          camera={{ position: camera?.position ?? [0, 0, 6], fov: camera?.fov ?? 50 }}
          style={{ width: "100%", height: "100%" }}
        >
          {children}
        </Canvas>
      ) : (
        fallback
      )}
    </div>
  );
}
