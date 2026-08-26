"use client";

import { FloatingMountainFallback } from "./floating-mountain-fallback";
import { FloatingMountainScene } from "./floating-mountain-scene";
import { Scene3D } from "./scene-3d";

interface FloatingMountainFigureProps {
  /** Optional generated poster shown as the 2D fallback on low-power devices. */
  poster?: string;
  caption?: string;
}

// MDX-usable wrapper: the floating-mountain 3D hero routed through the Scene3D
// gateway (lazy mount, capped DPR, demand frameloop) with its 2D poster/gradient
// fallback for low-power + reduced-motion. Sits in a wide aspect box.
export function FloatingMountainFigure({ poster, caption }: FloatingMountainFigureProps) {
  return (
    <figure className="my-8 lg:-mx-24">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-abyss">
        <Scene3D
          className="absolute inset-0"
          camera={{ position: [0, 0, 6], fov: 50 }}
          fallback={<FloatingMountainFallback poster={poster} />}
        >
          <FloatingMountainScene />
        </Scene3D>
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 font-serif text-sm italic text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
