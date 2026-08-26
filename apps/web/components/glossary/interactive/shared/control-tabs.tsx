"use client";

import { cn } from "@/lib/utils";

interface ControlTabOption<T extends string> {
  value: T;
  label: string;
}

interface ControlTabsProps<T extends string> {
  options: ReadonlyArray<ControlTabOption<T>>;
  value: T;
  onChange: (value: T) => void;
  // Optional accessible label for the group.
  ariaLabel?: string;
  className?: string;
}

// Segmented row-of-pills selector for switching mode/step/phase. One shared look
// across every figure that offers discrete choices; the active pill glows cyan.
export function ControlTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: ControlTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border/40 bg-void/70 p-1 backdrop-blur-md",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-lg px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide",
              "transition-colors duration-[--duration-fast] cursor-pointer",
              "focus-visible:outline-2 focus-visible:outline-cyan focus-visible:outline-offset-2",
              active ? "bg-cyan/15 text-cyan" : "text-muted hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
