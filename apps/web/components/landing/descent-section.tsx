"use client";

import { GlassPanel } from "@/components/codex/glass-panel";
import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { Parallax } from "@/components/motion/parallax";

interface DescentSectionProps {
  kicker: string;
  heading: string;
  body: string;
  note: string;
}

// The "descent into Pandora": layered parallax depth with the premise floating
// in a glass panel at mid-depth, a scientific note drifting at a different rate.
export function DescentSection({ kicker, heading, body, note }: DescentSectionProps) {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-32">
      <div className="grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
        <Parallax offset={50}>
          <FadeInOnScroll>
            <p className="mb-4 font-sans text-xs uppercase tracking-[0.3em] text-teal">{kicker}</p>
            <h2 className="font-display text-4xl font-700 leading-tight tracking-tight text-foreground sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-muted">{body}</p>
          </FadeInOnScroll>
        </Parallax>

        <Parallax offset={-40}>
          <FadeInOnScroll delay={0.15}>
            <GlassPanel depth={3} glow="cyan" className="p-6">
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-subtle">
                Field note
              </p>
              <p className="mt-3 font-serif text-base leading-relaxed text-foreground/90">{note}</p>
            </GlassPanel>
          </FadeInOnScroll>
        </Parallax>
      </div>
    </section>
  );
}
