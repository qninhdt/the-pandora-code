// Water carries a signature. The ratio of deuterium to ordinary hydrogen in a
// reservoir depends on how cold it was when that water condensed, and it survives
// delivery to a planet — so an ocean's D/H is a receipt naming its suppliers.
//
// The measured values span more than a factor of twenty-five. Carbonaceous
// asteroids sit almost exactly on seawater, which is why they are the leading
// candidate for the bulk of Earth's water. Comets run heavy: 67P/Churyumov-
// Gerasimenko, measured by Rosetta, is about three and a half times seawater.
// Nebular gas is far lighter than either.
//
// That spread turns "who delivered the water?" into an arithmetic question. Take
// asteroid water as the base and add a second source: because mixing is linear in
// hydrogen inventory, the measured ocean value caps how much of the heavy source
// can have contributed. For comets the cap lands at a couple of percent, which is
// the real published constraint. Deterministic; no randomness.

export interface Reservoir {
  id: string;
  /** Measured D/H, in units of 1e-6. */
  dhPpm: number;
  /** Token hue for markers. */
  tone: string;
}

/**
 * Carbonaceous-asteroid water, the assumed bulk supplier. CI and CM chondrites
 * span roughly (1.3–1.8)e-4; this is a representative value from the middle of
 * that range, and it sits just under seawater.
 */
export const BASE_RESERVOIR: Reservoir = {
  id: "chondrite",
  dhPpm: 149,
  tone: "var(--cyan)",
};

/**
 * Candidate second suppliers, as reported in the cosmochemistry literature and
 * expressed in parts per million of hydrogen atoms for readability.
 */
export const SECOND_SOURCES: Reservoir[] = [
  { id: "protosolar", dhPpm: 21, tone: "var(--teal)" },
  { id: "oortComet", dhPpm: 400, tone: "var(--amber)" },
  { id: "comet67p", dhPpm: 533, tone: "var(--magenta)" },
];

/** Every plotted reservoir, base included, in ascending D/H. */
export const ALL_RESERVOIRS: Reservoir[] = [...SECOND_SOURCES, BASE_RESERVOIR].sort(
  (a, b) => a.dhPpm - b.dhPpm,
);

/** Earth's ocean water (VSMOW) — the target any delivery model must reproduce. */
export const EARTH_OCEAN_PPM = 155.76;

/** How close a blend must come to count as reproducing the ocean. */
const MATCH_TOLERANCE = 0.025;

export function secondSourceById(id: string): Reservoir {
  const found = SECOND_SOURCES.find((r) => r.id === id);
  if (!found) throw new Error(`unknown reservoir: ${id}`);
  return found;
}

export type MixVerdict = "match" | "tooLight" | "tooHeavy";

export interface MixResult {
  /** Resulting D/H of the blend, in 1e-6. */
  dhPpm: number;
  /** Signed offset from the ocean target, as a percentage. */
  offsetPct: number;
  verdict: MixVerdict;
  /**
   * Share of the second source that lands exactly on seawater, or null when the
   * target lies outside the two endpoints and no blend can reach it.
   */
  solutionFraction: number | null;
}

/**
 * Blend asteroid water with a second source. `secondFraction` is the share of
 * hydrogen atoms drawn from that second source, 0–1.
 */
export function mixWithBase(secondId: string, secondFraction: number): MixResult {
  const second = secondSourceById(secondId);
  const f = Math.min(1, Math.max(0, secondFraction));

  const dhPpm = BASE_RESERVOIR.dhPpm * (1 - f) + second.dhPpm * f;
  const offsetPct = ((dhPpm - EARTH_OCEAN_PPM) / EARTH_OCEAN_PPM) * 100;

  const lo = Math.min(BASE_RESERVOIR.dhPpm, second.dhPpm);
  const hi = Math.max(BASE_RESERVOIR.dhPpm, second.dhPpm);
  const reachable = EARTH_OCEAN_PPM >= lo && EARTH_OCEAN_PPM <= hi;
  const span = second.dhPpm - BASE_RESERVOIR.dhPpm;

  return {
    dhPpm,
    offsetPct,
    verdict:
      Math.abs(offsetPct) <= MATCH_TOLERANCE * 100
        ? "match"
        : offsetPct < 0
          ? "tooLight"
          : "tooHeavy",
    solutionFraction:
      reachable && Math.abs(span) > 1e-9 ? (EARTH_OCEAN_PPM - BASE_RESERVOIR.dhPpm) / span : null,
  };
}
