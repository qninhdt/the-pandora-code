"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface VizFigureProps {
  /** Short heading shown top-left of the figure chrome. */
  title: string;
  /** Optional control slot rendered top-right (toggles, play buttons, sliders). */
  controls?: ReactNode;
  /** Italic figure caption rendered below the frame. */
  caption?: string;
  /** The visualization body. */
  children: ReactNode;
  className?: string;
}

/**
 * Shared chrome for interactive chapter visualizations: the rounded
 * bioluminescent surface card, a title + controls header row, and a serif
 * figcaption. Extracted so every viz reads as one consistent object in the
 * world instead of each component re-rolling the same shell.
 */
export function VizFigure({ title, controls, caption, children, className }: VizFigureProps) {
  return (
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <p className="font-display text-sm font-700 tracking-tight text-foreground">{title}</p>
          {controls ? <div className="flex shrink-0 items-center gap-2">{controls}</div> : null}
        </div>
        <div className="p-4">{children}</div>
      </div>
      {caption ? (
        <figcaption className="mt-3 px-1 font-serif text-sm italic leading-relaxed text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
