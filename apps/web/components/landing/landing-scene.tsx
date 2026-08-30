"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { staticUrl } from "@/lib/static-url";
import Image from "next/image";
import type { ReactNode } from "react";

type LandingSceneVariant = "hero" | "descent" | "field" | "closing";

interface LandingSceneProps {
  variant: LandingSceneVariant;
  children: ReactNode;
}

const ART: Partial<Record<LandingSceneVariant, string>> = {
  hero: "/images/pages/hero-vista.png",
  descent: "/images/pages/descent-deep.webp",
  closing: "/images/pages/cta-horizon.webp",
};

const VEIL: Record<LandingSceneVariant, string> = {
  hero: "radial-gradient(75% 58% at 22% 18%, color-mix(in oklab, var(--cyan) 25%, transparent), transparent 64%), radial-gradient(58% 52% at 82% 28%, color-mix(in oklab, var(--teal) 20%, transparent), transparent 64%), linear-gradient(to bottom, color-mix(in oklab, var(--void) 30%, transparent) 0%, transparent 45%, var(--void) 74%, var(--void) 100%)",
  descent:
    "linear-gradient(to bottom, var(--void) 0%, color-mix(in oklab, var(--void) 48%, transparent) 20%, color-mix(in oklab, var(--void) 36%, transparent) 52%, var(--void) 82%, var(--void) 100%), linear-gradient(to right, var(--void) 6%, color-mix(in oklab, var(--void) 56%, transparent) 54%, transparent 100%)",
  field:
    "linear-gradient(to bottom, var(--void) 0, var(--void) 6rem, color-mix(in oklab, var(--void) 72%, transparent) 12rem, transparent 22rem), linear-gradient(to bottom, transparent calc(100% - 22rem), color-mix(in oklab, var(--void) 72%, transparent) calc(100% - 12rem), var(--void) calc(100% - 6rem), var(--void) 100%), radial-gradient(80% 38% at 18% 7%, color-mix(in oklab, var(--cyan) 12%, transparent), transparent 68%), radial-gradient(70% 42% at 82% 34%, color-mix(in oklab, var(--teal) 10%, transparent), transparent 72%), radial-gradient(65% 34% at 50% 92%, color-mix(in oklab, var(--magenta) 7%, transparent), transparent 72%), var(--void)",
  closing:
    "radial-gradient(95% 75% at 50% 52%, transparent 30%, color-mix(in oklab, var(--void) 74%, transparent) 100%), linear-gradient(to bottom, var(--void) 0%, var(--void) 12%, color-mix(in oklab, var(--void) 22%, transparent) 28%, transparent 46%, color-mix(in oklab, var(--void) 50%, transparent) 66%, var(--void) 82%, var(--void) 100%)",
};

// Landing scenes own every painted background. Their content may grow freely;
// no child component is allowed to extend an image past its own scene boundary.
export function LandingScene({ variant, children }: LandingSceneProps) {
  const reduced = useReducedMotionSafe();
  const art = ART[variant];

  return (
    <div className="relative overflow-hidden" data-landing-scene={variant}>
      {art && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={staticUrl(art)}
            alt=""
            fill
            priority={variant === "hero"}
            loading={variant === "hero" ? undefined : "lazy"}
            decoding="async"
            sizes="100vw"
            quality={variant === "hero" ? 78 : 68}
            className={`size-full object-cover ${reduced ? "" : "animate-ken-burns"}`}
          />
        </div>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: VEIL[variant] }}
      />
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
