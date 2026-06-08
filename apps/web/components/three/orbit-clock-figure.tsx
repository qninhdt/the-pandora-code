"use client";

import { Scene3D } from "./scene-3d";
import { OrbitClockFallback } from "./orbit-clock-fallback";
import { OrbitClockScene } from "./orbit-clock-scene";

interface OrbitClockProps {
  /** Optional generated poster shown as the 2D fallback on low-power devices. */
  poster?: string;
  caption?: string;
}

// MDX-usable wrapper: the tidal-lock orbit clock routed through the Scene3D
// gateway (lazy mount, capped DPR, demand frameloop) with its 2D poster/gradient
// fallback for low-power + reduced-motion. A wide box, the moon wheeling once
// around the fixed planet to show that on a locked world the day is the orbit.
export function OrbitClock({ poster, caption }: OrbitClockProps) {
  return (
    <figure className="my-8 lg:-mx-24">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-abyss">
        <Scene3D
          className="absolute inset-0"
          camera={{ position: [0, 3.4, 6.2], fov: 50 }}
          fallback={<OrbitClockFallback poster={poster} />}
        >
          <OrbitClockScene />
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
