"use client";

import { DecodeProgress } from "@/components/landing/decode-progress";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

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

// Full-screen opening. LandingScene owns the artwork and field layers so this
// component only controls the introductory content and its entrance motion.
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
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center">
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
    </section>
  );
}
