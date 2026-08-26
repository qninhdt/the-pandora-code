// ─────────────────────────────────────────────────────────────────────
// THE MODEL — a breath-hold is a division problem
//
//   t_ADL = total usable O2 stores (mL) / diving metabolic rate (mL/min)
//
// Stores scale linearly with mass (S = M * s) while metabolic rate scales
// as M^0.75, so the aerobic dive limit itself scales as M^0.25:
//
//   t_ADL = (M * s) / (K * M^0.75 * suppression)
//         = (s / (K * suppression)) * M^0.25
//
// SOURCED: the per-species mass, mass-specific store, compartment split,
// and measured ADL band all come from the chapter research note. The
// 0.75 / 1.00 / 0.25 exponents are the note's allometry.
//
// BACK-DERIVED: the note gives NO diving metabolic rates, so K is
// calibrated to the one unambiguous case — an untrained 70 kg human at
// 20 mL/kg with a ~1.25 min limit and no dive response (suppression 1.0):
//
//   K = (70 * 20) / (1.25 * 70^0.75) ~= 46.3 mL O2 / min / kg^0.75
//
// Every other row then falls out at a suppression the reader can dial,
// and the result is the chapter's point: marine mammals AND trained human
// apneists both land near 0.3-0.4, i.e. the dive response is mostly a
// metabolic brake, not a bigger tank.
// ─────────────────────────────────────────────────────────────────────

/** Allometric constant, mL O2 per minute per kg^0.75. Back-derived, not measured. */
export const METABOLIC_K = 46.3;

export const MASS_EXPONENT = 0.75;

export interface DiverProfile {
  id: string;
  /** Body mass, kg. */
  mass: number;
  /** Total usable O2 store, mL per kg. */
  store: number;
  /** Share of stores held in the lungs, blood and muscle (percent, sums to 100). */
  split: { lung: number; blood: number; muscle: number };
  /** Measured or calculated aerobic dive limit, minutes. */
  adl: [number, number];
}

/** The note's oxygen-compartment table, verbatim. */
export const DIVER_PROFILES: DiverProfile[] = [
  {
    id: "untrainedHuman",
    mass: 70,
    store: 20,
    split: { lung: 24, blood: 57, muscle: 19 },
    adl: [1, 1.5],
  },
  {
    id: "eliteApneist",
    mass: 75,
    store: 26,
    split: { lung: 32, blood: 48, muscle: 20 },
    adl: [3.5, 5.5],
  },
  {
    id: "weddellSeal",
    mass: 400,
    store: 87,
    split: { lung: 5, blood: 66, muscle: 29 },
    adl: [20, 25],
  },
  {
    id: "elephantSeal",
    mass: 1800,
    store: 97,
    split: { lung: 4, blood: 71, muscle: 25 },
    adl: [45, 60],
  },
  {
    id: "spermWhale",
    mass: 35000,
    store: 75,
    split: { lung: 5, blood: 45, muscle: 50 },
    adl: [60, 90],
  },
];

/** Total usable oxygen store, mL. */
export function totalStore(mass: number, store: number): number {
  return mass * store;
}

/** Diving oxygen consumption, mL per minute, at a given metabolic suppression. */
export function divingMetabolicRate(mass: number, suppression: number): number {
  return METABOLIC_K * mass ** MASS_EXPONENT * suppression;
}

/** Aerobic dive limit, minutes. */
export function aerobicDiveLimit(mass: number, store: number, suppression: number): number {
  return totalStore(mass, store) / divingMetabolicRate(mass, suppression);
}

/**
 * The suppression a profile needs to reach the midpoint of its measured ADL band —
 * how hard that animal has to brake its metabolism to hit the limit we observe.
 */
export function impliedSuppression(profile: DiverProfile): number {
  const target = (profile.adl[0] + profile.adl[1]) / 2;
  return (
    totalStore(profile.mass, profile.store) / (target * METABOLIC_K * profile.mass ** MASS_EXPONENT)
  );
}
