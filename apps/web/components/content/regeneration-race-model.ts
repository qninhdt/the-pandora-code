// The race behind RegenerationRace. Graph theory treats a felled node as gone
// forever; a living network reseeds it. That turns survival into a rate contest
// rather than a fixed threshold, and the contest has a cruel shape: reseeding is
// done BY the surviving forest, so every hectare lost also lowers the rate at
// which the rest can repair the gap. Above a certain burn rate the network finds
// a lower standing density and holds there; above the tipping rate it slides,
// accelerating, into the percolation threshold — and then it does not dim, it
// shatters in one step.

/** Which critical standing density the surviving network is judged against. */
export type NetworkShape = "scaleFree" | "lattice";

// Critical standing density (fraction of nodes still present) below which the
// giant component dies. For a scale-free graph under random loss the transition
// is pushed toward total annihilation, so the network survives on a sliver. A
// lattice-like web has the classic site-percolation threshold instead, and must
// keep most of itself standing to conduct at all.
export const CRITICAL_DENSITY: Record<NetworkShape, number> = {
  scaleFree: 0.05,
  lattice: 0.5927,
};

/** Years simulated, one step per year. */
export const HORIZON_YEARS = 200;

export interface RaceResult {
  /** Standing density per year, index = years elapsed. */
  density: number[];
  /** Year the giant component crosses the threshold, or null if it never does. */
  shatterYear: number | null;
  /** Density the network settles at when it survives. */
  settled: number;
}

// One year of the race. Burning subtracts a fixed fraction of the ORIGINAL
// network (an industrial campaign clears area, not a percentage of what is left).
// Reseeding adds in proportion to both the surviving forest (the seed source) and
// the empty ground available to colonise — so repair is fastest on a lightly
// wounded network and collapses along with the forest that powers it.
function step(density: number, burnPerYear: number, regrowPerYear: number): number {
  const regrown = regrowPerYear * density * (1 - density);
  return Math.max(0, Math.min(1, density - burnPerYear + regrown));
}

export function runRace(
  burnPerYear: number,
  regrowPerYear: number,
  shape: NetworkShape,
): RaceResult {
  const critical = CRITICAL_DENSITY[shape];
  const density: number[] = [1];
  let shatterYear: number | null = null;

  for (let year = 1; year <= HORIZON_YEARS; year++) {
    const next = step(density[year - 1], burnPerYear, regrowPerYear);
    density.push(next);
    if (shatterYear === null && next < critical) shatterYear = year;
  }

  return { density, shatterYear, settled: density[density.length - 1] };
}
