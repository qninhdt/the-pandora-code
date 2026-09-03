// The arithmetic behind PreservationOddsChain. A fossil is not one unlikely
// event but five, and they multiply. Tissue has to be recalcitrant enough to
// outlast the soft parts; the carcass has to be buried before scavengers and
// weather take it; pore-water chemistry has to leave the mineral alone; the host
// rock has to escape erosion, subduction and metamorphism for however long you
// need it to; and finally someone has to be standing on the outcrop when it is
// exposed. Because these are joint probabilities, the product is governed by its
// SMALLEST term — which is the whole point of the figure. A reader who sets four
// factors to near-certainty and leaves rainforest chemistry at 0.02 still ends up
// with essentially nothing, and the Hallelujah mountains are a hard zero no
// matter what else is dialled in: a net-erosional terrane with no subsiding basin
// keeps nothing at all.
//
// Numbers are order-of-magnitude teaching values, not measurements — they encode
// the direction and rough spacing that the taphonomic literature supports.

/** The five independent factors whose product is the preservation probability. */
export const FACTORS = ["tissue", "burial", "chem", "strat", "disc"] as const;
export type FactorKey = (typeof FACTORS)[number];

export type FactorSet = Record<FactorKey, number>;

export interface BodyOption {
  id: string;
  /** Adult body mass in kg — drives population density via Damuth's rule. */
  mass: number;
  /** Base share of the body made of genuinely durable material. */
  tissue: number;
}

export interface SettingOption {
  id: string;
  /** Odds of rapid entombment before the surface destroys the carcass. */
  burial: number;
  /** Odds the pore-water chemistry spares the mineral rather than leaching it. */
  chem: number;
  /** Odds the host rock survives to be sampled at all. */
  strat: number;
  /** Share of the setting that ends up as exposed, searchable outcrop. */
  outcrop: number;
}

// Shelled marine invertebrates carry the most durable tissue on any world;
// flyers carry the least, because everything that makes a wing light also makes
// it thin-walled. Pandoran bone gets a modest bump over Earth bone for the
// carbon-fibre reinforcement canon describes, which is inference, not canon.
export const BODIES: BodyOption[] = [
  { id: "shelledInvertebrate", mass: 0.2, tissue: 0.62 },
  { id: "hexapede", mass: 180, tissue: 0.34 },
  { id: "thanator", mass: 1800, tissue: 0.32 },
  { id: "banshee", mass: 220, tissue: 0.14 },
  { id: "navi", mass: 140, tissue: 0.3 },
];

// The rainforest floor is the destroyer: warm, wet, acidic, endlessly turned
// over by roots and scavengers. Ash fall is the opposite — burial in an
// afternoon. The floating mountains are the true zero, and not because of
// chemistry: with no accommodation space, nothing is ever laid down to preserve.
export const SETTINGS: SettingOption[] = [
  { id: "rainforestFloor", burial: 0.02, chem: 0.03, strat: 0.25, outcrop: 0.08 },
  { id: "oxbowLake", burial: 0.28, chem: 0.4, strat: 0.45, outcrop: 0.2 },
  { id: "ashFall", burial: 0.88, chem: 0.55, strat: 0.6, outcrop: 0.3 },
  { id: "sulfidicMud", burial: 0.45, chem: 0.82, strat: 0.5, outcrop: 0.18 },
  { id: "reefLagoon", burial: 0.4, chem: 0.75, strat: 0.55, outcrop: 0.35 },
  { id: "floatingMountain", burial: 0.01, chem: 0.3, strat: 0.002, outcrop: 0.5 },
];

/** Reference mass for the abundance scaling, in kg. */
const REFERENCE_MASS = 100;

/**
 * Damuth's rule: population density falls as roughly the -3/4 power of body
 * mass, so a thanator is rare where a hexapede is common. Discovery saturates —
 * past a certain abundance you are limited by outcrop, not by how many died —
 * hence N/(N+1) rather than raw N.
 */
export function abundanceScore(mass: number): number {
  const n = (REFERENCE_MASS / mass) ** 0.75;
  return n / (n + 1);
}

/** The factor set a body-and-setting pairing starts from. */
export function presetFor(body: BodyOption, setting: SettingOption): FactorSet {
  return {
    tissue: body.tissue,
    burial: setting.burial,
    chem: setting.chem,
    strat: setting.strat,
    disc: setting.outcrop * abundanceScore(body.mass),
  };
}

export interface ChainResult {
  /** Product of all five factors. */
  probability: number;
  /** One preserved individual in this many deaths. Infinity when the chain is zero. */
  oneIn: number;
  /** The factor doing the most damage — the term the reader should notice. */
  bottleneck: FactorKey;
  /** True when the chain is so small that the outcome is effectively "never". */
  effectivelyNever: boolean;
}

export function evaluate(factors: FactorSet): ChainResult {
  const probability = FACTORS.reduce((acc, key) => acc * factors[key], 1);
  const bottleneck = FACTORS.reduce((lowest, key) =>
    factors[key] < factors[lowest] ? key : lowest,
  );
  return {
    probability,
    oneIn: probability > 0 ? 1 / probability : Number.POSITIVE_INFINITY,
    bottleneck,
    effectivelyNever: probability < 1e-6,
  };
}

/** Compact "1 in 8,400" / "1 in 2.3 million" style magnitude for a readout. */
export function formatOneIn(oneIn: number): { value: string; scale: "plain" | "million" | "billion" } {
  if (!Number.isFinite(oneIn)) return { value: "∞", scale: "plain" };
  if (oneIn >= 1e9) return { value: (oneIn / 1e9).toPrecision(2), scale: "billion" };
  if (oneIn >= 1e6) return { value: (oneIn / 1e6).toPrecision(2), scale: "million" };
  return { value: Math.round(oneIn).toLocaleString("en-US"), scale: "plain" };
}
