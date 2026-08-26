"use client";

import { cn } from "@/lib/utils";

interface FactorGroupProps<T extends string> {
  legend: string;
  /** CSS color for the applied state. */
  tone: string;
  options: readonly T[];
  selected: T[];
  label: (key: T) => string;
  onToggle: (key: T) => void;
}

// One row of appraisal switches for EvidenceGradeLadder. Each factor is a toggle
// button rather than a checkbox so the tinted "applied" state reads at a glance,
// with pressed state announced to assistive tech. Labels arrive already
// translated from the parent, so this file needs no i18n of its own.
export function FactorGroup<T extends string>({
  legend,
  tone,
  options,
  selected,
  label,
  onToggle,
}: FactorGroupProps<T>) {
  return (
    <fieldset className="mt-4">
      <legend className="mb-1.5 font-sans text-xs uppercase tracking-wider text-subtle">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((key) => {
          const on = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(key)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 font-sans text-xs transition-all active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2",
              )}
              style={{
                borderColor: on ? `color-mix(in oklab, ${tone} 55%, transparent)` : "var(--border)",
                background: on ? `color-mix(in oklab, ${tone} 12%, var(--void))` : "transparent",
                color: on ? tone : "var(--muted)",
              }}
            >
              {label(key)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
