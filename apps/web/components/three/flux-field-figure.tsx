"use client";

import { Scene3D } from "./scene-3d";
import { FieldViz } from "./field-viz";
import { FieldVizFallback } from "./field-viz-fallback";

interface FluxFieldFigureProps {
  caption?: string;
}

// MDX-usable wrapper: the magnetic-flux field visualization routed through the
// Scene3D gateway with its CSS-ring 2D fallback. Square aspect - it reads as a
// vortex/field diagram beside the superconductivity prose.
export function FluxFieldFigure({ caption }: FluxFieldFigureProps) {
  return (
    <figure className="my-8">
      <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-2xl border border-border bg-abyss">
        <Scene3D
          className="absolute inset-0"
          camera={{ position: [0, 0, 5], fov: 50 }}
          fallback={<FieldVizFallback />}
        >
          <FieldViz />
        </Scene3D>
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 text-center font-serif text-sm italic text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
