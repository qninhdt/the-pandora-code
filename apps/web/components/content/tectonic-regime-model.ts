// Which convective regime a rocky world settles into. The physical claim is
// standard comparative planetology: a planet does not "have" or "lack" tectonics
// — its mantle convects, and the question is whether the convective stresses
// arriving at the base of the lithosphere can break it. Two numbers decide:
//
//   q   — surface heat flux (W/m²). Sets how thin and hot the lithosphere is,
//         and therefore how much stress convection can deliver to it.
//   σy  — lithospheric yield strength (MPa). How much stress the lid can take
//         before it fails. Water, faults and low friction lower it; a dry,
//         intact, hot-surfaced lid raises it.
//
// The stress proxy below is PEDAGOGICAL, not a published parameterization. The
// literature computes convective stress from full mantle-convection models with
// a plastic yield criterion; there is no closed form. What is robust — and what
// this reproduces — is the ordering: Earth fails its lid, Venus and Mars do not,
// and Io short-circuits the question entirely by venting its heat through melt.
// The proxy is calibrated so Earth lands just inside the mobile-lid field.
//
// Above roughly 1 W/m², conduction through a lid stops being the bottleneck:
// melt carries the heat instead, erupts, and buries the older surface. That is
// the heat-pipe regime, and it overrides the stress comparison.

export type Regime = "mobileLid" | "sluggishLid" | "stagnantLid" | "heatPipe";

export const REGIMES: Regime[] = ["mobileLid", "sluggishLid", "stagnantLid", "heatPipe"];

export const REGIME_TONE: Record<Regime, string> = {
  mobileLid: "var(--cyan)",
  sluggishLid: "var(--teal)",
  stagnantLid: "var(--subtle)",
  heatPipe: "var(--amber)",
};

/** Earth's mean surface heat flux (W/m²) — ~47 TW over the whole planet. */
export const EARTH_FLUX = 0.087;

/** Flux above which melt transport outruns conduction through the lid. */
export const HEAT_PIPE_FLUX = 1.0;

/** Reference convective stress at Earth's heat flux (MPa). */
const TAU_AT_EARTH = 150;

/** Convective stress delivered to the lid, as a monotone function of heat flux. */
export function convectiveStressMPa(flux: number): number {
  return TAU_AT_EARTH * Math.sqrt(flux / EARTH_FLUX);
}

export function regimeFor(flux: number, yieldMPa: number): Regime {
  if (flux >= HEAT_PIPE_FLUX) return "heatPipe";
  const ratio = convectiveStressMPa(flux) / yieldMPa;
  if (ratio >= 1) return "mobileLid";
  if (ratio >= 0.5) return "sluggishLid";
  return "stagnantLid";
}

/** Stress-to-strength ratio; ≥1 means convection can break the lid. */
export function failureRatio(flux: number, yieldMPa: number): number {
  return convectiveStressMPa(flux) / yieldMPa;
}

export interface BodyMarker {
  key: string;
  flux: number;
  yieldMPa: number;
}

// Measured or literature-estimated positions. Yield strengths are the rough
// values the regime literature invokes when explaining each body: Earth's
// lithosphere is wet and pervasively faulted, Venus's is desiccated by its
// runaway greenhouse, Mars's is cold, thick and dry.
export const BODIES: BodyMarker[] = [
  { key: "earth", flux: EARTH_FLUX, yieldMPa: 100 },
  { key: "venus", flux: 0.07, yieldMPa: 600 },
  { key: "mars", flux: 0.02, yieldMPa: 500 },
  { key: "io", flux: 2.4, yieldMPa: 300 },
];

// Pandora is a rectangle, not a point, and that is the whole result. Its flux
// follows from the tidal budget established for the moon (roughly 100–500 TW
// spread over 4.12e14 m²); its yield strength is unconstrained — canon never
// says how hydrated or how faulted the lithosphere is. The box straddles every
// regime boundary, which is an honest answer rather than a hedge.
export const PANDORA_BOX = {
  fluxMin: 0.24,
  fluxMax: 1.21,
  yieldMin: 100,
  yieldMax: 800,
} as const;

/** Log-axis bounds for the regime map. */
export const FLUX_MIN = 0.01;
export const FLUX_MAX = 10;
export const YIELD_MIN = 20;
export const YIELD_MAX = 2000;

export function fluxToPct(flux: number): number {
  const l = Math.log10(flux);
  const lo = Math.log10(FLUX_MIN);
  const hi = Math.log10(FLUX_MAX);
  return Math.max(0, Math.min(100, ((l - lo) / (hi - lo)) * 100));
}

/** Strength runs bottom-to-top on the plot, so a high strength sits high up. */
export function yieldToPct(yieldMPa: number): number {
  const l = Math.log10(yieldMPa);
  const lo = Math.log10(YIELD_MIN);
  const hi = Math.log10(YIELD_MAX);
  return Math.max(0, Math.min(100, ((l - lo) / (hi - lo)) * 100));
}
