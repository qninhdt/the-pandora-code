"use client";

import { CONTROL_ORDER, type ControlId } from "./isotope-tracer-audit-model";

interface ControlToggleGridProps {
  controls: Record<ControlId, boolean>;
  onToggle: (id: ControlId) => void;
  /** Human name for a control, from the figure's translations. */
  name: (id: ControlId) => string;
  /** One-line explanation of what the control closes off. */
  detail: (id: ControlId) => string;
  onLabel: string;
  offLabel: string;
}

// The five switches the reader flips to assemble the experiment. Kept beside the
// figure rather than inside it so the audit component stays readable; the parent
// owns the state and supplies the translated strings.
export function ControlToggleGrid({
  controls,
  onToggle,
  name,
  detail,
  onLabel,
  offLabel,
}: ControlToggleGridProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {CONTROL_ORDER.map((id) => {
        const on = controls[id];
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(id)}
            className="rounded-lg border px-3 py-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            style={{
              borderColor: on
                ? "color-mix(in oklab, var(--teal) 45%, transparent)"
                : "var(--border)",
              background: on
                ? "color-mix(in oklab, var(--teal) 8%, var(--void))"
                : "color-mix(in oklab, var(--void) 30%, transparent)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-sm font-700 text-foreground">{name(id)}</span>
              <span
                className="font-sans text-[0.65rem] uppercase tracking-wider"
                style={{ color: on ? "var(--teal)" : "var(--subtle)" }}
              >
                {on ? onLabel : offLabel}
              </span>
            </div>
            <p className="mt-1 font-sans text-xs text-muted">{detail(id)}</p>
          </button>
        );
      })}
    </div>
  );
}
