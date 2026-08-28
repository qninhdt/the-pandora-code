// Satellite systems come out surprisingly uniform. Whatever a giant planet's
// mass, the moons it grows in its own circumplanetary disk add up to roughly one
// ten-thousandth of it — Jupiter, Saturn and Uranus all land within a factor of
// about two of that. The reason is a self-limiting balance: a moon growing in the
// gas-starved disk migrates inward faster as it gets heavier, so the disk feeds
// its products into the planet as fast as it makes them.
//
// That regularity is a hard ceiling for Pandora. Canonical surface gravity and
// radius give a moon of roughly 0.45 Earth masses, and no plausible mass for
// Polyphemus brings that inside the ratio. This model computes the ratio, the
// implied host mass needed to satisfy the ceiling, and the shortfall factor.
// Deterministic; no randomness.

/** Earth masses per Jupiter mass. */
export const EARTH_MASSES_PER_JUPITER = 317.8;

/** The empirical satellite-system to host mass ratio for disk-grown moons. */
export const DISK_MASS_RATIO = 1e-4;

export interface ReferenceSystem {
  id: string;
  /** Host mass in Jupiter masses. */
  hostMassJup: number;
  /** Combined satellite mass in Earth masses. */
  satelliteMassEarth: number;
}

// Observed systems, from published masses. Jupiter's four Galileans, Saturn's
// full satellite system (Titan dominating), and Uranus's five major moons.
export const REFERENCE_SYSTEMS: ReferenceSystem[] = [
  { id: "jupiter", hostMassJup: 1, satelliteMassEarth: 0.0669 },
  { id: "saturn", hostMassJup: 0.299, satelliteMassEarth: 0.0242 },
  { id: "uranus", hostMassJup: 0.0457, satelliteMassEarth: 0.00175 },
];

/** Pandora's mass, inverted from the canonical 0.80 g and 0.75 Earth radii. */
export const PANDORA_MASS_EARTH = 0.449;

/** Polyphemus, canonically Jupiter-class; the mid-range assumption. */
export const DEFAULT_HOST_JUP = 1;

export type FormationRoute = "disk" | "capture" | "impact";

export type Verdict = "withinCeiling" | "strained" | "impossible";

export interface MassBudget {
  /** Satellite-to-host mass ratio. */
  ratio: number;
  /** How far above the 1e-4 ceiling the ratio sits; below 1 means it fits. */
  overshoot: number;
  /** Largest moon the ceiling permits for this host, in Earth masses. */
  permittedMoonEarth: number;
  /** Host mass this moon would need for the ceiling to hold, in Jupiter masses. */
  requiredHostJup: number;
  verdict: Verdict;
}

export function massBudget(hostMassJup: number, moonMassEarth: number): MassBudget {
  const hostMassEarth = hostMassJup * EARTH_MASSES_PER_JUPITER;
  const ratio = moonMassEarth / hostMassEarth;
  const overshoot = ratio / DISK_MASS_RATIO;

  return {
    ratio,
    overshoot,
    permittedMoonEarth: hostMassEarth * DISK_MASS_RATIO,
    requiredHostJup: moonMassEarth / DISK_MASS_RATIO / EARTH_MASSES_PER_JUPITER,
    // Within a factor of ~2 of the ceiling is the observed scatter; an order of
    // magnitude past it is not a disk product at all.
    verdict: overshoot <= 2 ? "withinCeiling" : overshoot <= 10 ? "strained" : "impossible",
  };
}

/** Ratio for a reference system, for plotting against the ceiling. */
export function referenceRatio(system: ReferenceSystem): number {
  return system.satelliteMassEarth / (system.hostMassJup * EARTH_MASSES_PER_JUPITER);
}
