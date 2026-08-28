"use client";

import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ClosingCallProps {
  kicker: string;
  heading: string;
  body: string;
  cta: string;
  secondaryCta: string;
  chaptersHref: string;
  glossaryHref: string;
}

// The closing invitation. LandingScene owns its painted horizon and fades it
// into the terminal footer field within one bounded scene.
export function ClosingCall({
  kicker,
  heading,
  body,
  cta,
  secondaryCta,
  chaptersHref,
  glossaryHref,
}: ClosingCallProps) {
  return (
    <section className="flex min-h-[80vh] items-center justify-center px-6 py-32 text-center">
      <FadeInOnScroll>
        <div className="flex max-w-3xl flex-col items-center">
          <p className="mb-5 font-sans text-xs uppercase tracking-[0.4em] text-amber">{kicker}</p>
          <h2 className="font-display text-4xl font-800 leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            {heading}
          </h2>
          <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-muted sm:text-xl">
            {body}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={chaptersHref}
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-sans text-sm font-bold transition-transform hover:scale-[1.03]"
              style={{
                background: "linear-gradient(120deg, var(--cyan), var(--teal))",
                color: "var(--void)",
                boxShadow: "0 0 36px -6px color-mix(in oklab, var(--cyan) 75%, transparent)",
              }}
            >
              {cta}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={glossaryHref}
              className="inline-flex items-center rounded-full border px-7 py-3.5 font-sans text-sm font-semibold backdrop-blur transition-colors hover:bg-surface/70"
              style={{
                color: "var(--foreground)",
                borderColor: "color-mix(in oklab, var(--cyan) 45%, var(--border-strong))",
                background: "color-mix(in oklab, var(--void) 55%, transparent)",
              }}
            >
              {secondaryCta}
            </Link>
          </div>
        </div>
      </FadeInOnScroll>
    </section>
  );
}
