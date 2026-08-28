"use client";

import { GlassPanel } from "@/components/codex/glass-panel";
import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { Parallax } from "@/components/motion/parallax";
import Image from "next/image";

const DESCENT_BG = "/images/pages/descent-deep.webp";
const DESCENT_EDGE_MASK =
  "linear-gradient(to bottom, transparent 0%, black 14%, black 78%, transparent 100%)";

interface DescentSectionProps {
  kicker: string;
  heading: string;
  body: string;
  note: string;
}

// The "descent into Pandora": a painted ravine plunges behind the copy at a
// slower parallax rate, layered haze gradients keep the text legible, and the
// premise floats in a glass panel at mid-depth with the field note drifting at
// a different rate.
export function DescentSection({ kicker, heading, body, note }: DescentSectionProps) {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      {/* Painted ravine backdrop, drifting slower than the foreground. */}
      <Parallax offset={60} className="absolute inset-0 -z-20">
        <Image
          src={DESCENT_BG}
          alt=""
          aria-hidden
          fill
          loading="lazy"
          decoding="async"
          sizes="100vw"
          quality={68}
          className="size-full scale-[1.3] object-cover opacity-40"
          style={{ maskImage: DESCENT_EDGE_MASK, WebkitMaskImage: DESCENT_EDGE_MASK }}
        />
      </Parallax>
      {/* Haze gradients: blend the band into the void above/below and dim the
          right side where the copy column sits. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--void) 0%, transparent 22%, transparent 78%, var(--void) 100%), linear-gradient(to right, var(--void) 12%, color-mix(in oklab, var(--void) 55%, transparent) 55%, transparent 100%)",
          maskImage: DESCENT_EDGE_MASK,
          WebkitMaskImage: DESCENT_EDGE_MASK,
        }}
      />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.3fr_1fr]">
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
