"use client";

import { DecodeProgress } from "@/components/landing/decode-progress";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

const HERO_VISTA = "/images/pages/hero-vista.png";

interface HeroSurfaceProps {
  progressLabel: string;
  progressCount: string;
  chaptersDone: number;
  chaptersTotal: number;
  title: string;
  intro: string;
  ctaChapters: string;
  ctaGlossary: string;
  chaptersHref: string;
  glossaryHref: string;
}

// Full-screen opening, built in depth layers: a painted Pandora vista at the
// back, a bioluminescent aurora wash, grain, and a vignette for legibility. The
// title emerges from haze - blurred + faint + slightly scaled, settling into
// focus. Under reduced motion everything is still and the title simply appears.
export function HeroSurface({
  progressLabel,
  progressCount,
  chaptersDone,
  chaptersTotal,
  title,
  intro,
  ctaChapters,
  ctaGlossary,
  chaptersHref,
  glossaryHref,
}: HeroSurfaceProps) {
  const reduced = useReducedMotionSafe();
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24, filter: "blur(12px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 1, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Layer 1 - painted establishing vista at the back. */}
      <div aria-hidden className="absolute inset-0 -z-30">
        <img
          src={HERO_VISTA}
          alt=""
          className={`size-full object-cover ${reduced ? "" : "animate-ken-burns"}`}
        />
      </div>

      {/* Layer 2 - bioluminescent aurora wash. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-20 ${reduced ? "" : "animate-aurora"}`}
        style={{
          background:
            "radial-gradient(70% 55% at 22% 18%, color-mix(in oklab, var(--cyan) 26%, transparent), transparent 60%), radial-gradient(60% 50% at 82% 28%, color-mix(in oklab, var(--teal) 22%, transparent), transparent 60%), radial-gradient(50% 45% at 60% 92%, color-mix(in oklab, var(--magenta) 14%, transparent), transparent 60%)",
        }}
      />

      {/* Layer 3 - vignette + blend into the void below, and a grain tooth. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 35%, transparent 45%, color-mix(in oklab, var(--void) 70%, transparent) 100%), linear-gradient(to bottom, color-mix(in oklab, var(--void) 35%, transparent) 0%, transparent 28%, transparent 62%, var(--void) 100%)",
        }}
      />
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 -z-10" />

      {/* Content. */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          {...rise(0.1)}
          className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-border-strong/70 bg-void/40 px-4 py-1.5 backdrop-blur"
        >
          <span
            className="size-1.5 shrink-0 rounded-full bg-cyan"
            style={{ boxShadow: "0 0 10px 1px var(--cyan)" }}
          />
          <DecodeProgress
            label={progressLabel}
            countLabel={progressCount}
            done={chaptersDone}
            total={chaptersTotal}
          />
        </motion.div>

        <motion.h1
          {...rise(0.25)}
          className="max-w-4xl bg-clip-text font-display text-5xl font-800 leading-[0.98] tracking-tight text-transparent sm:text-7xl lg:text-8xl"
          style={{
            backgroundImage:
              "linear-gradient(180deg, var(--foreground) 30%, var(--accent-soft) 80%, var(--cyan) 100%)",
            filter: "drop-shadow(0 4px 40px color-mix(in oklab, var(--cyan) 35%, transparent))",
          }}
        >
          {title}
        </motion.h1>

        <motion.p
          {...rise(0.5)}
          className="mt-8 max-w-2xl font-serif text-lg leading-relaxed text-muted sm:text-xl"
        >
          {intro}
        </motion.p>

        <motion.div
          {...rise(0.7)}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href={chaptersHref}
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-bold transition-transform hover:scale-[1.03]"
            style={{
              background: "linear-gradient(120deg, var(--cyan), var(--teal))",
              color: "var(--void)",
              boxShadow: "0 0 30px -6px color-mix(in oklab, var(--cyan) 70%, transparent)",
            }}
          >
            {ctaChapters}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href={glossaryHref}
            className="inline-flex items-center rounded-full border px-6 py-3 font-sans text-sm font-semibold backdrop-blur transition-colors hover:bg-surface/70"
            style={{
              color: "var(--foreground)",
              borderColor: "color-mix(in oklab, var(--cyan) 45%, var(--border-strong))",
              background: "color-mix(in oklab, var(--void) 55%, transparent)",
            }}
          >
            {ctaGlossary}
          </Link>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        className="absolute bottom-8 z-10 text-subtle"
        animate={reduced ? undefined : { y: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <ChevronDown size={22} />
      </motion.div>
    </section>
  );
}
