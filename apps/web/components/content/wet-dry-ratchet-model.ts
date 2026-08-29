// The mechanism behind WetDryRatchet. Joining two monomers expels a water
// molecule, so in bulk water the reaction runs backwards: chains fall apart as
// fast as they form. Dry the pool and the equilibrium flips — condensation is
// favoured, and short chains grow. Rewet it and most of the new chains hydrolyse
// again, but not all: the survivors are the ones that folded or got wrapped in a
// lipid film, so each cycle leaves the population slightly longer than the last.
// That asymmetry is the ratchet. A permanently submerged vent gets no such
// cycles, which is the honest cost of the vent scenario.

export type CyclePhase = "dry" | "wet";

/** Where in a wet-dry cycle a normalized 0..1 phase sits. */
export function phaseOf(phase: number): CyclePhase {
  return phase % 1 < 0.5 ? "dry" : "wet";
}

/**
 * Water activity, 0..1. Bulk ocean sits at ~1.0, where hydrolysis wins; a
 * drying pool falls towards ~0.2, where condensation does.
 */
export function waterActivity(phase: number, submerged: boolean): number {
  if (submerged) return 1;
  // A smooth evaporate-then-refill curve rather than a square wave.
  return 0.6 - 0.4 * Math.cos(2 * Math.PI * (phase % 1));
}

/** Net direction of the polymerisation reaction at this water activity. */
export type Direction = "condensing" | "hydrolysing";

export function direction(activity: number): Direction {
  return activity < 0.55 ? "condensing" : "hydrolysing";
}

export interface RatchetStep {
  cycle: number;
  /** Longest oligomer, in monomer units, after this cycle. */
  cycled: number;
  /** The same population left permanently submerged. */
  submerged: number;
}

/**
 * Chain length after n cycles. Each dry phase adds a decreasing increment (the
 * longer a chain, the harder the next addition), each wet phase removes a
 * fraction — but the fraction that survives is what carries forward, so the
 * trace climbs with diminishing returns towards a plateau. The submerged control
 * never leaves the short-oligomer floor, where synthesis and hydrolysis balance.
 */
export function ratchetTrace(cycles: number): RatchetStep[] {
  const steps: RatchetStep[] = [];
  let cycled = 2;
  for (let n = 0; n <= cycles; n++) {
    steps.push({ cycle: n, cycled: Math.round(cycled), submerged: 3 });
    const gained = cycled + 14 * Math.exp(-cycled / 30);
    cycled = gained * 0.92 + 1.6;
  }
  return steps;
}

export const CYCLE_COUNT = 12;
/** Longest chain reached by wet-dry cycling in the laboratory, in monomer units. */
export const LAB_CEILING = 50;
export const CYCLE_PERIOD_SECONDS = 6;
