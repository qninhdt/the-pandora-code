"use client";

import type { LockState } from "./infection-barrier-gauntlet-model";

// The written half of the gauntlet: each lock stated plainly, with what it asks
// of the visitor and how this pairing answered. Cleared locks light in their own
// tone; the one that ended the chain stands out in magenta; untried locks stay
// dim so the reader can see how far there is still to go.

const STATE_TONE: Record<LockState, string> = {
  clears: "var(--teal)",
  narrow: "var(--amber)",
  unknown: "var(--cyan)",
  blocked: "var(--magenta)",
};

export interface LockRow {
  id: string;
  name: string;
  detail: string;
  state: LockState;
  /** The reader has opened this one. */
  opened: boolean;
  /** This is the lock that ended the chain. */
  stopped: boolean;
  /** Localized state word shown on the right. */
  stateLabel: string;
}

export function LockList({ rows }: { rows: LockRow[] }) {
  return (
    <ol className="mt-4 flex flex-col gap-2">
      {rows.map((row) => {
        const reached = row.opened || row.stopped;
        const tone = row.stopped ? STATE_TONE.blocked : STATE_TONE[row.state];
        return (
          <li
            key={row.id}
            className="rounded-lg border px-3 py-2 transition-all duration-200"
            style={{
              borderColor: reached
                ? `color-mix(in oklab, ${tone} 40%, transparent)`
                : "var(--border)",
              background: reached ? `color-mix(in oklab, ${tone} 8%, var(--void))` : "transparent",
              opacity: reached ? 1 : 0.55,
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-sm font-700 text-foreground">{row.name}</span>
              <span
                className="font-sans text-[0.65rem] uppercase tracking-wider"
                style={{ color: reached ? tone : "var(--subtle)" }}
              >
                {row.stateLabel}
              </span>
            </div>
            <p className="mt-1 font-sans text-xs text-muted">{row.detail}</p>
          </li>
        );
      })}
    </ol>
  );
}

// The routes that never needed a lock opened. This panel is the point of the
// figure as much as the corridor is: "cannot infect" and "cannot harm" are
// different claims, and only the first one the locks decide.
export function HarmRoutes({
  title,
  lead,
  routes,
}: {
  title: string;
  lead: string;
  routes: string[];
}) {
  return (
    <div className="mt-4 rounded-lg border border-border px-3 py-2">
      <p className="font-display text-sm font-700 text-foreground">{title}</p>
      <p className="mt-1 font-sans text-xs text-muted">{lead}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {routes.map((route) => (
          <li
            key={route}
            className="rounded-full border px-2.5 py-1 font-sans text-[0.7rem]"
            style={{
              borderColor: "color-mix(in oklab, var(--magenta) 35%, transparent)",
              color: "var(--magenta)",
            }}
          >
            {route}
          </li>
        ))}
      </ul>
    </div>
  );
}
