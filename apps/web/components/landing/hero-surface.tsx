"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { FloatingMountainFallback } from "@/components/three/floating-mountain-fallback";
import { FloatingMountainScene } from "@/components/three/floating-mountain-scene";
import { Scene3D } from "@/components/three/scene-3d";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

interface HeroSurfaceProps {
  eyebrow: string;
  title: string;
  intro: string;
  ctaChapters: string;
  ctaGlossary: string;
  chaptersHref: string;
  glossaryHref: string;
}

// Full-screen opening. The title emerges from haze: blurred + faint + slightly
// scaled, settling into focus. Under reduced motion it just appears.
export function HeroSurface({
  eyebrow,
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
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Living 3D backdrop — floating mountains drifting behind the title. */}
      <Scene3D
        className="absolute inset-0 -z-10"
        fallback={<FloatingMountainFallback />}
        camera={{ position: [0, 0, 6], fov: 55 }}
      >
        <FloatingMountainScene />
      </Scene3D>

      <motion.p
        {...rise(0.1)}
        className="mb-6 font-sans text-xs uppercase tracking-[0.4em] text-cyan"
      >
        {eyebrow}
      </motion.p>

      <motion.h1
        {...rise(0.25)}
        className="max-w-4xl font-display text-5xl font-800 leading-[0.98] tracking-tight text-foreground sm:text-7xl lg:text-8xl"
      >
        {title}
      </motion.h1>

      <motion.p
        {...rise(0.5)}
        className="mt-8 max-w-2xl font-serif text-lg leading-relaxed text-muted sm:text-xl"
      >
        {intro}
      </motion.p>

      <motion.div {...rise(0.7)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={chaptersHref}
          className="group inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-semibold text-void transition-transform hover:scale-[1.03]"
          style={{
            background: "linear-gradient(120deg, var(--cyan), var(--teal))",
            boxShadow: "0 0 30px -6px color-mix(in oklab, var(--cyan) 70%, transparent)",
          }}
        >
          {ctaChapters}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href={glossaryHref}
          className="inline-flex items-center rounded-full border border-border-strong px-6 py-3 font-sans text-sm font-medium text-foreground transition-colors hover:bg-surface/60"
        >
          {ctaGlossary}
        </Link>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        className="absolute bottom-8 text-subtle"
        animate={reduced ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <ChevronDown size={22} />
      </motion.div>
    </section>
  );
}
