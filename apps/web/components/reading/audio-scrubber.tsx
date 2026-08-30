"use client";

import type { AudioSection } from "@/lib/content/loader/audio-loader";
import { cn } from "@/lib/utils";
import { type KeyboardEvent, type PointerEvent, useCallback, useRef } from "react";

interface AudioScrubberProps {
  duration: number;
  currentTime: number;
  sections: AudioSection[];
  activeIndex: number;
  onSeek: (time: number) => void;
  ariaLabel: string;
  valueText: string;
  className?: string;
}

const SEEK_STEP_SECONDS = 5;

/**
 * A single-track scrubber that draws one tick per section, so a chapter reads as
 * one continuous audio while still exposing where each part begins. Segments are
 * flex-sized by duration; a pointer anywhere on the bar seeks to that time.
 */
export function AudioScrubber({
  duration,
  currentTime,
  sections,
  activeIndex,
  onSeek,
  ariaLabel,
  valueText,
  className,
}: AudioScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const span = Math.max(duration, 1);
  const progress = Math.min(Math.max(currentTime / span, 0), 1);

  const seekToClientX = useCallback(
    (clientX: number) => {
      const element = trackRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.width <= 0) return;
      const ratio = (clientX - bounds.left) / bounds.width;
      onSeek(Math.min(Math.max(ratio, 0), 1) * span);
    },
    [onSeek, span],
  );

  // Pointer capture keeps the drag alive when the cursor leaves the thin bar.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    seekToClientX(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    seekToClientX(event.clientX);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const jump: Record<string, number> = {
      ArrowLeft: -SEEK_STEP_SECONDS,
      ArrowRight: SEEK_STEP_SECONDS,
      PageDown: -SEEK_STEP_SECONDS * 6,
      PageUp: SEEK_STEP_SECONDS * 6,
    };
    if (event.key === "Home") onSeek(0);
    else if (event.key === "End") onSeek(span);
    else if (jump[event.key] !== undefined) onSeek(currentTime + jump[event.key]);
    else return;
    event.preventDefault();
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={Math.round(span)}
      aria-valuenow={Math.round(currentTime)}
      aria-valuetext={valueText}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative h-6 min-w-16 flex-1 cursor-pointer touch-none select-none focus-visible:outline-none",
        className,
      )}
    >
      {/* Segment rail: one cell per section, sized by its share of the track. */}
      <div className="absolute inset-x-0 top-1/2 flex h-1.5 -translate-y-1/2 gap-px overflow-hidden rounded-full">
        {sections.length > 0 ? (
          sections.map((section, index) => (
            <span
              key={section.sectionId}
              aria-hidden
              className={cn(
                "h-full bg-surface transition-colors",
                index === activeIndex && "bg-surface-overlay",
              )}
              style={{ flex: `${Math.max(section.end - section.start, 0.001)} 0 0` }}
            />
          ))
        ) : (
          <span aria-hidden className="h-full flex-1 bg-surface" />
        )}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-cyan"
        style={{ width: `${progress * 100}%` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan bg-void shadow-[0_0_10px_color-mix(in_oklab,var(--cyan)_65%,transparent)] transition-transform group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-cyan/50"
        style={{ left: `${progress * 100}%` }}
      />
    </div>
  );
}
