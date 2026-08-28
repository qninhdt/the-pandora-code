"use client";

import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { Parallax } from "@/components/motion/parallax";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CTA_BG = "/images/pages/cta-horizon.webp";
const CTA_EDGE_MASK = "linear-gradient(to bottom, transparent 0%, black 14%, black 100%)";

interface ClosingCallProps {
  kicker: string;
  heading: string;
  body: string;
  cta: string;
  secondaryCta: string;
  chaptersHref: string;
  glossaryHref: string;
}

// The closing invitation: a full-bleed painted Pandoran horizon with the
// gas-giant and aurora, drifting gently, capped with a gradient so the headline
// and CTAs sit on a calm dark base. The last thing the reader sees before the
// footer.
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
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-visible px-6 py-32 text-center">
      {/* Painted horizon backdrop with a slow parallax push. */}
      <Parallax offset={70} className="absolute inset-x-0 top-0 -bottom-24 -z-20 overflow-hidden">
        <Image
          src={CTA_BG}
          alt=""
          aria-hidden
          fill
          loading="lazy"
          decoding="async"
          sizes="100vw"
          quality={68}
          className="size-full scale-[1.35] object-cover"
          style={{ maskImage: CTA_EDGE_MASK, WebkitMaskImage: CTA_EDGE_MASK }}
        />
      </Parallax>
      {/* Legibility + blend into the void above and below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-24 -z-10"
        style={{
          background:
            "radial-gradient(110% 75% at 50% 55%, transparent 35%, color-mix(in oklab, var(--void) 78%, transparent) 100%), linear-gradient(to bottom, var(--void) 0%, transparent 30%, transparent 100%)",
          maskImage: CTA_EDGE_MASK,
          WebkitMaskImage: CTA_EDGE_MASK,
        }}
      />
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 -z-10" />
      <FadeInOnScroll className="relative z-10">
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
