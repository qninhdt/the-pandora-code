"use client";

// The cinematic-glow backbone shared by every SVG figure. Renders a single
// <defs> block of reusable gradients, a soft-bloom blur filter, and a faint grid
// pattern — all keyed off a per-instance id base so multiple figures on one page
// never collide. Components reference these by url(#<idBase>-<name>) instead of
// each re-rolling their own filter/gradient soup.

export interface GlowDefsProps {
  /** Unique per-instance prefix (pass a useId()). */
  idBase: string;
  /** Token hues to emit radial gradients for. Defaults to the full palette. */
  tones?: GlowTone[];
}

export type GlowTone = "cyan" | "teal" | "magenta" | "amber";

const ALL_TONES: GlowTone[] = ["cyan", "teal", "magenta", "amber"];

/** url(#id) reference helpers so call sites stay terse and typo-safe. */
export function glowId(idBase: string, name: string): string {
  return `${idBase}-${name}`;
}
export function glowUrl(idBase: string, name: string): string {
  return `url(#${idBase}-${name})`;
}

export function GlowDefs({ idBase, tones = ALL_TONES }: GlowDefsProps) {
  return (
    <defs>
      {/* Soft bloom: blur a copy and lay the source back on top. Elements opt in
          via filter={glowUrl(idBase,"bloom")}. */}
      <filter id={glowId(idBase, "bloom")} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Stronger bloom for hero/active elements. */}
      <filter id={glowId(idBase, "bloom-strong")} x="-75%" y="-75%" width="250%" height="250%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Soft drop-shadow: gives flat dots/needles/markers depth without the
          full halo of a bloom. Elements opt in via filter={glowUrl(idBase,"soft-shadow")}. */}
      <filter id={glowId(idBase, "soft-shadow")} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow
          dx="0"
          dy="1"
          stdDeviation="1.6"
          floodColor="var(--void)"
          floodOpacity="0.55"
        />
      </filter>

      {/* Radial wash per tone — a fading disc used behind glowing nodes/stars. */}
      {tones.map((tone) => (
        <radialGradient key={tone} id={glowId(idBase, `wash-${tone}`)} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`var(--${tone})`} stopOpacity={0.55} />
          <stop offset="45%" stopColor={`var(--${tone})`} stopOpacity={0.18} />
          <stop offset="100%" stopColor={`var(--${tone})`} stopOpacity={0} />
        </radialGradient>
      ))}

      {/* Faint grid for plot backdrops. */}
      <pattern id={glowId(idBase, "grid")} width="24" height="24" patternUnits="userSpaceOnUse">
        <path
          d="M 24 0 L 0 0 0 24"
          fill="none"
          stroke="var(--border)"
          strokeWidth={0.5}
          strokeOpacity={0.5}
        />
      </pattern>
    </defs>
  );
}
