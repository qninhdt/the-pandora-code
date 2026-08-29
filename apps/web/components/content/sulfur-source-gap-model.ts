// The sulfur audit, and the chapter's hardest number.
//
// Canon states Pandora's air carries hydrogen sulfide and that it kills an
// unmasked human in seconds. Both halves are load-bearing, and together they
// create a bookkeeping problem: H₂S is destroyed by hydroxyl radicals within a
// couple of days in any oxygen-bearing atmosphere, so whatever concentration the
// air holds must be replaced continuously. Invert τ = M/F and the required source
// flux falls out of the stated concentration alone.
//
// Two dials, because there are exactly two honest repair routes: lower the
// concentration, or lengthen the lifetime. This model computes what each costs,
// and against two independent bounds — how much sulfur volcanism can plausibly
// deliver, and how much H₂S the toxicology needs for canon's twenty seconds.
// The interesting result is that on Earth-like photochemistry the two bounds do
// not overlap. Deterministic; no randomness.

/** Total moles of gas in Pandora's atmospheric column, from canonical inputs. */
export const PANDORA_ATM_MOLES = 1.283e20;

/** Molar mass of sulfur, kg/mol. */
const S_KG_PER_MOL = 0.03206;

/** Earth's global volcanic sulfur emission, Tg S/yr. */
export const EARTH_VOLCANIC_TG_S = 20;

/** Peak anthropogenic sulfur emission, 1980s, Tg S/yr. */
export const ANTHROPOGENIC_PEAK_TG_S = 130;

/**
 * A deliberately generous allowance for a moon far more volcanically active than
 * Earth — a hundred times our output, sustained. Pandora is tidally heated, so
 * this is a real concession rather than a straw man.
 */
export const HYPERVOLCANIC_ALLOWANCE_TG_S = 2000;

/**
 * Roughly where hydrogen sulfide produces immediate collapse in humans, in parts
 * per million. Canon's twenty-second death needs at least this much if the gas is
 * well mixed and doing the killing.
 */
export const KNOCKDOWN_PPM = 500;

/** Canon's stated upper bound on the mixing ratio: "well under one percent". */
export const CANON_STATED_PPM = 10000;

/** Hydroxyl-limited lifetime of tropospheric H₂S in oxidising air, in days. */
export const OXIDISING_LIFETIME_DAYS = 2;

export interface SulfurBudget
  extends Readonly<{
    /** Sulfur held in the air as H₂S, in Tg S. */
    reservoirTgS: number;
    /** Source flux needed to hold that reservoir steady, Tg S/yr. */
    requiredSourceTgS: number;
    /** How many times Earth's volcanic sulfur output that demands. */
    timesEarthVolcanic: number;
    /** Whether the demand fits inside the generous hyper-volcanic allowance. */
    withinAllowance: boolean;
    /** Whether the concentration is high enough to kill on canon's timescale. */
    lethal: boolean;
  }> {}

export function sulfurBudget(mixingRatioPpm: number, lifetimeDays: number): SulfurBudget {
  const moles = (mixingRatioPpm / 1e6) * PANDORA_ATM_MOLES;
  // kg → Tg (1 Tg = 1e9 kg).
  const reservoirTgS = (moles * S_KG_PER_MOL) / 1e9;
  const lifetimeYears = Math.max(lifetimeDays, 1e-6) / 365;
  const requiredSourceTgS = reservoirTgS / lifetimeYears;

  return {
    reservoirTgS,
    requiredSourceTgS,
    timesEarthVolcanic: requiredSourceTgS / EARTH_VOLCANIC_TG_S,
    withinAllowance: requiredSourceTgS <= HYPERVOLCANIC_ALLOWANCE_TG_S,
    lethal: mixingRatioPpm >= KNOCKDOWN_PPM,
  };
}

export type Verdict = "impossible" | "strained" | "survivableButHarmless";

/**
 * The audit's judgement — and note what is missing from it. There is no verdict
 * for "both constraints satisfied", because across the whole space of
 * concentrations and lifetimes there is no such state: the allowance permits at
 * most a fraction of a part per million, while dropping a human in seconds needs
 * hundreds. The two requirements are about a thousandfold apart, so the honest
 * outcome is a choice between an impossible source flux and air that no longer
 * does what canon says it does. That absence is the chapter's finding.
 */
export function verdict(budget: SulfurBudget): Verdict {
  if (budget.withinAllowance) return "survivableButHarmless";
  if (budget.timesEarthVolcanic <= 1e4) return "strained";
  return "impossible";
}

/**
 * How far apart the two constraints sit at a given lifetime: the factor between
 * the sulfide a lethal atmosphere needs and the most the volcanic allowance can
 * sustain. Well above one at every plausible lifetime.
 */
export function constraintGap(lifetimeDays: number): number {
  return KNOCKDOWN_PPM / Math.max(ppmForAllowance(lifetimeDays), Number.MIN_VALUE);
}

/**
 * The lifetime that would be needed for a given concentration to sit inside the
 * hyper-volcanic allowance — the second repair route, expressed in days. Returned
 * so the prose can state how far from ordinary photochemistry it lies.
 */
export function lifetimeForAllowance(mixingRatioPpm: number): number {
  const moles = (mixingRatioPpm / 1e6) * PANDORA_ATM_MOLES;
  const reservoirTgS = (moles * S_KG_PER_MOL) / 1e9;
  return (reservoirTgS / HYPERVOLCANIC_ALLOWANCE_TG_S) * 365;
}

/** The highest mixing ratio the allowance permits at a given lifetime, in ppm. */
export function ppmForAllowance(lifetimeDays: number): number {
  const lifetimeYears = Math.max(lifetimeDays, 1e-6) / 365;
  const reservoirTgS = HYPERVOLCANIC_ALLOWANCE_TG_S * lifetimeYears;
  const moles = (reservoirTgS * 1e9) / S_KG_PER_MOL;
  return (moles / PANDORA_ATM_MOLES) * 1e6;
}

/** Reference fluxes drawn on the ladder, lowest first. */
export const FLUX_REFERENCES = [
  { id: "earthVolcanic", tgS: EARTH_VOLCANIC_TG_S },
  { id: "anthropogenicPeak", tgS: ANTHROPOGENIC_PEAK_TG_S },
  { id: "hypervolcanic", tgS: HYPERVOLCANIC_ALLOWANCE_TG_S },
] as const;

export const FLUX_MIN_TG_S = 1;
export const FLUX_MAX_TG_S = 1e11;

/** Log position of a flux on the ladder, clamped to [0, 1]. */
export function fluxPosition(tgS: number): number {
  const clamped = Math.min(FLUX_MAX_TG_S, Math.max(FLUX_MIN_TG_S, tgS));
  return (
    (Math.log10(clamped) - Math.log10(FLUX_MIN_TG_S)) /
    (Math.log10(FLUX_MAX_TG_S) - Math.log10(FLUX_MIN_TG_S))
  );
}

/** Compact scientific rendering for values spanning many decades. */
export function formatFlux(tgS: number): string {
  if (tgS >= 1e4 || tgS < 0.01) {
    const exp = Math.floor(Math.log10(tgS));
    return `${(tgS / 10 ** exp).toFixed(1)}e${exp}`;
  }
  if (tgS >= 100) return tgS.toFixed(0);
  return tgS.toFixed(1);
}
