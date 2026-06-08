"use client";

import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { GlowPulse } from "@/components/motion/glow-pulse";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/stagger-children";
import { Sparkles } from "lucide-react";

// Live demos of the Phase 3 motion primitives for visual QA on /_design.
export function MotionDemos() {
  return (
    <div className="space-y-8">
      <FadeInOnScroll className="rounded-lg border border-border bg-surface p-5">
        <p className="font-sans text-sm text-muted">
          FadeInOnScroll - this block fades and rises into view.
        </p>
      </FadeInOnScroll>

      <div className="flex items-center gap-4">
        <GlowPulse color="cyan">
          <span className="grid size-12 place-items-center rounded-full bg-surface-raised text-cyan">
            <Sparkles size={20} />
          </span>
        </GlowPulse>
        <GlowPulse color="magenta">
          <span className="grid size-12 place-items-center rounded-full bg-surface-raised text-magenta">
            <Sparkles size={20} />
          </span>
        </GlowPulse>
        <p className="font-sans text-sm text-muted">
          GlowPulse - breathing bioluminescence.
        </p>
      </div>

      <StaggerChildren className="grid grid-cols-3 gap-3">
        {["one", "two", "three", "four", "five", "six"].map((n) => (
          <StaggerItem key={n}>
            <div className="rounded-md border border-border bg-surface p-4 text-center font-sans text-xs text-muted">
              {n}
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </div>
  );
}
