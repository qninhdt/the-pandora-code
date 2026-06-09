"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** CSS color (var or hex) used for the active tint + text. Defaults to cyan. */
  tone?: string;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible group label. */
  ariaLabel: string;
  className?: string;
}

/**
 * Accessible segmented control (2-3 options). Replaces the ad-hoc toggle
 * markup that several visualizations were each duplicating. Behaves as a
 * radiogroup: arrow keys move and activate the adjacent option.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedToggleProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKey(e: React.KeyboardEvent, index: number) {
    const isPrev = e.key === "ArrowLeft" || e.key === "ArrowUp";
    const isNext = e.key === "ArrowRight" || e.key === "ArrowDown";
    if (!isPrev && !isNext) return;
    e.preventDefault();
    const delta = isNext ? 1 : -1;
    const nextIndex = (index + delta + options.length) % options.length;
    onChange(options[nextIndex].value);
    refs.current[nextIndex]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("flex rounded-lg border border-border bg-void/40 p-0.5", className)}
    >
      {options.map((opt, i) => {
        const active = value === opt.value;
        const tone = opt.tone ?? "var(--cyan)";
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            // biome-ignore lint/a11y/useSemanticElements: styled segmented control needs a button with radio semantics; native radio inputs can't carry this visual treatment
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKey(e, i)}
            className="rounded-md px-3 py-2 font-sans text-xs font-600 transition-all duration-200"
            style={{
              background: active ? `color-mix(in oklab, ${tone} 18%, transparent)` : "transparent",
              color: active ? tone : "var(--subtle)",
              boxShadow: active
                ? `inset 0 0 0 1px color-mix(in oklab, ${tone} 45%, transparent), 0 0 16px -6px color-mix(in oklab, ${tone} 80%, transparent)`
                : "none",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
