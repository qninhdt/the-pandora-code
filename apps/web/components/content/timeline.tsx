import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  kind?: "canon" | "inference" | "speculation" | "real_science";
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const tierVar: Record<NonNullable<TimelineEvent["kind"]>, string> = {
  canon: "--canon",
  inference: "--inference",
  speculation: "--speculation",
  real_science: "--real-science",
};

// A glowing chronology rail: a luminous spine with tier-colored nodes, each
// event in the dark bioluminescent style.
export function Timeline({ events, className }: TimelineProps) {
  return (
    <ol
      className={cn("relative my-8 ml-4 space-y-7 border-l pl-7", className)}
      style={{ borderColor: "color-mix(in oklab, var(--cyan) 25%, var(--border))" }}
    >
      {events.map((e) => {
        const c = `var(${tierVar[e.kind ?? "canon"]})`;
        return (
          <li key={e.id} className="relative">
            <span
              aria-hidden
              className="absolute -left-[37px] top-1 size-3.5 rounded-full"
              style={{
                background: c,
                boxShadow: `0 0 12px 1px ${c}`,
                outline: "4px solid var(--void)",
              }}
            />
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-subtle">
              {e.date}
            </p>
            <h4 className="mt-1 font-display text-base font-700 text-foreground">{e.title}</h4>
            {e.description && (
              <p className="mt-1 font-serif text-sm leading-relaxed text-muted">{e.description}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
