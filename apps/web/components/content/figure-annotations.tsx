"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export interface ResolvedLabel {
  /** Anchor position as a percentage of the image box. */
  x: number;
  y: number;
  /** Short callout title (already localized). */
  label?: string;
  /** Optional second line (already localized). */
  note?: string;
}

// A single anchor point. Hover (desktop), focus (keyboard), or tap (touch)
// reveals its callout in a small popover that flips to whichever side keeps it
// in view. No number — the dot itself is the affordance. The popover lives
// inside the dot's wrapper so moving the pointer onto it keeps it open.
function AnnotationDot({ label }: { label: ResolvedLabel }) {
  const [open, setOpen] = useState(false);
  const flipX = label.x > 55; // open leftward near the right edge
  const flipY = label.y > 65; // open upward near the bottom edge

  return (
    <div
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${label.x}%`, top: `${label.y}%` }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label.label}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="block size-3.5 rounded-full ring-2 ring-white/30 transition-transform hover:scale-125 focus:outline-none focus-visible:scale-125"
        style={{ background: "var(--cyan)", boxShadow: "0 0 12px 1px var(--cyan)" }}
      />
      {open && (label.label || label.note) && (
        <div
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute z-30 w-48 max-w-[60vw] rounded-lg border border-border-strong bg-void/95 p-2.5 text-left shadow-xl backdrop-blur",
            flipX ? "right-5" : "left-5",
            flipY ? "bottom-2" : "top-2",
          )}
        >
          {label.label && (
            <p className="font-sans text-xs font-semibold leading-snug text-cyan">{label.label}</p>
          )}
          {label.note && (
            <p className="mt-1 font-serif text-xs leading-snug text-muted">{label.note}</p>
          )}
        </div>
      )}
    </div>
  );
}

// An overlay of annotation dots positioned over an image. Rendered as a layer
// that itself ignores pointer events (so the image beneath stays clickable),
// while each dot re-enables them for its own popover.
export function AnnotationLayer({
  labels,
  className,
}: {
  labels: ResolvedLabel[];
  className?: string;
}) {
  if (!labels?.length) return null;
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-10", className)}>
      {labels.map((l, i) => (
        <AnnotationDot key={`${l.x}-${l.y}-${i}`} label={l} />
      ))}
    </div>
  );
}

// Parse the JSON labels carried on a lightbox image's data attribute.
export function parseLabels(raw: string | null | undefined): ResolvedLabel[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as ResolvedLabel[]) : [];
  } catch {
    return [];
  }
}
