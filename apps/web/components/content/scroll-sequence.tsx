"use client";

import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { cn } from "@/lib/utils";

interface SequenceStep {
  title: string;
  body: string;
}

interface ScrollSequenceProps {
  steps: SequenceStep[];
  className?: string;
}

// A scroll-told multi-step explainer: numbered steps revealed one by one as the
// reader scrolls, connected by a glowing spine. For walking through a process
// (e.g. how flux pinning locks a mountain in place).
export function ScrollSequence({ steps, className }: ScrollSequenceProps) {
  return (
    <div
      className={cn("relative my-10 ml-5 space-y-10 border-l pl-8", className)}
      style={{ borderColor: "color-mix(in oklab, var(--cyan) 22%, var(--border))" }}
    >
      {steps.map((s, i) => (
        <FadeInOnScroll key={i} className="relative">
          <span
            aria-hidden
            className="absolute -left-[46px] grid size-7 place-items-center rounded-full border font-sans text-xs font-bold tabular-nums"
            style={{
              borderColor: "var(--cyan)",
              color: "var(--cyan)",
              background: "var(--void)",
              boxShadow: "0 0 14px -2px var(--cyan)",
            }}
          >
            {i + 1}
          </span>
          <h4 className="font-display text-lg font-700 text-foreground">{s.title}</h4>
          <p className="mt-1.5 font-serif text-[0.95rem] leading-relaxed text-muted">{s.body}</p>
        </FadeInOnScroll>
      ))}
    </div>
  );
}
