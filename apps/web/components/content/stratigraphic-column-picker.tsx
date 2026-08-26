"use client";

import { cn } from "@/lib/utils";
import { type FeatureId, READING_ORDER } from "./stratigraphic-column-model";

// The one set of controls for the wall. Every feature is a real labelled button
// in reading order (youngest first, the way you'd scan the outcrop from the top
// down), and each carries the same relation colour the wall paints it — so the
// list doubles as the legend and a keyboard user never has to interpret the SVG.

interface PickerProps {
  legend: string;
  selected: FeatureId;
  onSelect: (id: FeatureId) => void;
  /** Relation colour for a feature, given the current selection. */
  toneOf: (id: FeatureId) => string;
  /** Localized name for a feature. */
  nameOf: (id: FeatureId) => string;
}

export function StratigraphicColumnPicker({
  legend,
  selected,
  onSelect,
  toneOf,
  nameOf,
}: PickerProps) {
  return (
    <fieldset className="rounded-lg border border-border px-3 py-2">
      <legend className="px-1 font-sans text-xs text-muted">{legend}</legend>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {READING_ORDER.map((id) => {
          const active = id === selected;
          const swatch = toneOf(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-pressed={active}
              className={cn(
                "rounded-md border px-2 py-1 font-sans text-[0.7rem] font-600 transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan",
              )}
              style={{
                borderColor: `color-mix(in oklab, ${swatch} ${active ? 70 : 28}%, var(--border))`,
                background: active
                  ? `color-mix(in oklab, ${swatch} 16%, transparent)`
                  : "transparent",
                color: active ? swatch : "var(--muted)",
              }}
            >
              {nameOf(id)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
