// The sulfide arithmetic behind SulfideElectronLedger.
//
// Hydrogen sulfide is not a poison the way arsenic is a poison. It is a fuel that
// happens to bind the site the fuel-burning machinery uses. HS- coordinates the iron
// of cytochrome c oxidase — Complex IV, the last step of the respiratory chain — and
// stops oxygen reduction dead. That is why a lungful kills a human in seconds: not
// suffocation from outside, but suffocation inside every mitochondrion at once.
//
// The same molecule is also an electron donor. Sulfide:quinone oxidoreductase (SQR)
// strips its electrons and hands them to the ubiquinone pool — the same pool
// Complex I feeds from food. Downstream, persulfide dioxygenase (ETHE1) and
// rhodanese convert the residue to sulfite and thiosulfate, and sulfite oxidase
// finishes it to sulfate. Every animal has this cascade; it is how a body handles
// the sulfide it makes itself as a signalling molecule.
//
// The whole story is therefore capacity, and the shape of the answer is a cliff
// rather than a slope. Free sulfide inside a cell is not proportional to what is
// inhaled: it is the steady state of delivery against enzymatic clearance. Treating
// the cascade as saturable,
//
//   Vmax x S / (Km + S) = D   =>   S = Km x D / (Vmax - D)
//
// free sulfide stays near zero for any delivery below capacity, then runs away
// asymptotically as delivery approaches it. Below the cliff sulfide is food. Above
// it, the surplus reaches Complex IV and the animal dies of its own fuel. A human's
// cascade tops out around the occupational exposure limit, which is exactly why the
// clinical ladder turns lethal between ten and a few hundred parts per million.
//
// The rungs and the enzyme cascade are real. Riftia pachyptila lives in vent water
// at one to two millimolar. Sulfide-spring Poecilia mexicana carries substitutions in
// the Complex IV oxygen-reduction centre alongside upregulated sulfide oxidation.
// Whether Pandoran mitochondria do either is inference, and the component says so.
// Every visible string lives in the component's translations.

export type BodyKey = "human" | "exopack" | "sulfideSpringFish" | "pandoranNative";

export const BODIES: BodyKey[] = ["human", "exopack", "sulfideSpringFish", "pandoranNative"];

export interface BodyPlan {
  /**
   * Clearance capacity of the SQR cascade, expressed as the inspired concentration
   * in ppm it can process indefinitely. A human's sits near the occupational limit.
   */
  capacityPpm: number;
  /** Complex IV resistance, 0-1. Higher means HS- binds the a3/CuB site less readily. */
  siteResistance: number;
  /** Fraction of inspired sulfide removed before it reaches the blood at all. */
  preFilter: number;
}

export const BODY_PLAN: Record<BodyKey, BodyPlan> = {
  // Enough capacity for its own signalling sulfide and a lungful of someone else's;
  // an unmodified oxygen-reduction site; nothing filtering the air. The cliff lands
  // where the clinical literature puts knockdown.
  human: { capacityPpm: 500, siteResistance: 0, preFilter: 0 },
  // The mask changes none of the biology. It removes the sulfide upstream.
  exopack: { capacityPpm: 500, siteResistance: 0, preFilter: 0.995 },
  // Measured convergence: substitutions in the binuclear centre plus upregulated
  // sulfide oxidation, sized for a spring rather than an atmosphere.
  sulfideSpringFish: { capacityPpm: 1200, siteResistance: 0.75, preFilter: 0 },
  // The chapter's reconstruction, not a canonical measurement: a cascade sized just
  // above the load the air actually delivers.
  pandoranNative: { capacityPpm: 4000, siteResistance: 0.93, preFilter: 0 },
};

/** Half-saturation constant of the cascade, in the same inspired-ppm units. */
const KM_PPM = 0.6;
/** Blood sulfide, in inspired-ppm units, that half-inhibits an unmodified site. */
const HALF_INHIBITION_PPM = 2;
/**
 * Electron flux from sulfide as a share of total respiratory electron flux, per ppm
 * inhaled. Sulfide oxidation yields two electrons per molecule where oxygen accepts
 * four, so at roughly a quarter oxygen extraction from air that is a fifth of a per
 * cent of the flux per hundred ppm — the accounting behind the coefficient.
 */
const FLUX_PER_PPM = 1e-5;
/** Electrons entering at ubiquinone skip Complex I, so they buy about two thirds the ATP. */
const UBIQUINONE_YIELD = 2 / 3;

export const PPM_MIN = 0.05;
export const PPM_MAX = 10000;

export interface Rung {
  ppm: number;
  key: string;
}

/**
 * Reference marks on the exposure axis: the human clinical ladder, plus where
 * Pandora's "far less than one per cent" sulfide actually sits. One per cent is
 * 10,000 ppm, so even a tenth of a per cent is 1,000 ppm — above the concentration
 * that drops a human in a single breath.
 */
export const RUNGS: Rung[] = [
  { ppm: 0.1, key: "smell" },
  { ppm: 15, key: "occupational" },
  { ppm: 125, key: "olfactoryParalysis" },
  { ppm: 600, key: "knockdown" },
  { ppm: 1000, key: "pandoraTrace" },
];

export type Fate = "trace" | "supplement" | "nearCapacity" | "arrest";

export interface SulfideOutcome {
  /** Sulfide reaching the blood after any pre-filter, in inspired-ppm units. */
  delivered: number;
  /** How hard the cascade is working, 0-1 of its capacity. */
  load: number;
  /** Steady-state free sulfide the cascade cannot keep up with. */
  freeSulfide: number;
  /** Complex IV throughput remaining, 0-1. */
  complexIvCapacity: number;
  /** Electron flux gained from sulfide, as a share of resting oxidative supply. */
  energyBonus: number;
  fate: Fate;
  /** True when the body is drawing usable energy from the sulfide. */
  netGain: boolean;
}

export function runSulfide(body: BodyKey, ppm: number): SulfideOutcome {
  const plan = BODY_PLAN[body];
  const delivered = ppm * (1 - plan.preFilter);
  const load = delivered / plan.capacityPpm;

  // Past capacity the steady state has no solution: sulfide accumulates without
  // bound. The clamp keeps the curve finite for plotting without softening the cliff.
  const freeSulfide = load >= 1 ? 1e4 : (KM_PPM * delivered) / (plan.capacityPpm - delivered);

  const halfInhibition = HALF_INHIBITION_PPM / Math.max(0.02, 1 - plan.siteResistance);
  const complexIvCapacity = 1 / (1 + freeSulfide / halfInhibition);

  const harvested = Math.min(delivered, plan.capacityPpm);
  const energyBonus = harvested * FLUX_PER_PPM * UBIQUINONE_YIELD * complexIvCapacity;

  const fate: Fate =
    complexIvCapacity < 0.5
      ? "arrest"
      : load > 0.75
        ? "nearCapacity"
        : energyBonus < 0.002
          ? "trace"
          : "supplement";

  return {
    delivered,
    load,
    freeSulfide,
    complexIvCapacity,
    energyBonus,
    fate,
    netGain: energyBonus >= 0.002 && complexIvCapacity > 0.8,
  };
}

/** Log-scale plot position (0-1) for a concentration on the exposure axis. */
export function ppmFraction(ppm: number): number {
  const lo = Math.log10(PPM_MIN);
  const hi = Math.log10(PPM_MAX);
  const v = Math.log10(Math.min(PPM_MAX, Math.max(PPM_MIN, ppm)));
  return (v - lo) / (hi - lo);
}

/** Inverse of ppmFraction, so a linear slider walks the axis evenly. */
export function ppmFromFraction(fraction: number): number {
  const lo = Math.log10(PPM_MIN);
  const hi = Math.log10(PPM_MAX);
  return 10 ** (lo + fraction * (hi - lo));
}

/** Compact ppm label; precision past the first digits is fake. */
export function formatPpm(ppm: number): string {
  if (ppm >= 1000) return `${Math.round(ppm / 100) / 10}k`;
  if (ppm >= 10) return String(Math.round(ppm));
  if (ppm >= 1) return ppm.toFixed(1);
  return ppm.toFixed(2);
}

/** The two curves the figure draws, sampled across the exposure axis. */
export function curves(
  body: BodyKey,
  steps = 72,
): Array<{ x: number; capacity: number; bonus: number }> {
  const points: Array<{ x: number; capacity: number; bonus: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    const out = runSulfide(body, ppmFromFraction(x));
    points.push({ x, capacity: out.complexIvCapacity, bonus: out.energyBonus });
  }
  return points;
}

/** Top of the energy-bonus axis, as a share of resting oxidative flux. */
export const BONUS_AXIS_MAX = 0.025;
