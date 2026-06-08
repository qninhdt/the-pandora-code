import { designTokens } from "@/lib/design-tokens";

// Tuning for the living bioluminescent atmosphere. Two profiles: `full` for the
// landing (most alive) and `calm` for the reader (so it never competes with
// long-form text). Densities scale down by device tier at runtime.

export type AtmosphereProfile = "full" | "calm";

export interface AtmosphereSettings {
  /** Spore count on a capable desktop. Scaled down for weaker devices. */
  spores: number;
  /** Drift speed multiplier. */
  speed: number;
  /** Cursor repulsion strength. */
  pointerForce: number;
  /** Volumetric haze opacity (0–1). */
  hazeOpacity: number;
}

export const ATMOSPHERE_PROFILES: Record<AtmosphereProfile, AtmosphereSettings> = {
  full: { spores: 460, speed: 1, pointerForce: 0, hazeOpacity: 0.1 },
  calm: { spores: 180, speed: 0.45, pointerForce: 0, hazeOpacity: 0.05 },
};

// Hard caps applied on top of profile counts for weaker devices.
export const TIER_SPORE_CAP = {
  webgl: Number.POSITIVE_INFINITY,
  tablet: 380,
} as const;

export const DPR_RANGE: [number, number] = [1, 2];

// The three biolum hues the spores are tinted between (from the STYLE BIBLE).
export const SPORE_HUES = [
  designTokens.biolum.cyan,
  designTokens.biolum.teal,
  designTokens.biolum.magenta,
] as const;

// Resolve the effective settings for a profile given a coarse device hint.
export function resolveSettings(profile: AtmosphereProfile, weaker: boolean): AtmosphereSettings {
  const base = ATMOSPHERE_PROFILES[profile];
  if (!weaker) return base;
  return { ...base, spores: Math.min(base.spores, TIER_SPORE_CAP.tablet) };
}
