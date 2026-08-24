// Where a living balloon gets its lifting gas, and why keeping it is the hard part.
//
// Fermenting sugar to hydrogen has a hard thermodynamic ceiling: four moles of H2
// per mole of glucose, via the acetate route. Push past it and the reaction stops
// paying for itself. In practice, gut communities run nearer half that, because
// the butyrate route yields two.
//
// But the yield is not the interesting constraint. Every hydrogen-producing gut on
// Earth throws the hydrogen away: methanogens and sulfate reducers consume it as
// fast as it appears, which is why a cow makes cubic metres of H2 a day and exhales
// essentially none. That microbial sink is the difference between a fermenter and
// an aerostat.
//
// The second leak is physical and cannot be switched off. Hydrogen is the smallest
// molecule there is, and it diffuses through any hydrated membrane. Permeation
// scales with envelope area while the enclosed gas scales with volume, so a big
// animal loses a smaller fraction per day than a small one - the same square-cube
// arithmetic that governs lift, working here in the animal's favour.
//
// The ledger asks one question: does today's production cover today's losses?
//
// Deterministic; no randomness.

/** Molar mass of glucose, g/mol. */
const M_GLUCOSE = 180.16;
/** Molar mass of H2, g/mol. */
const M_H2 = 2.016;
/** Moles of gas per m^3 at Pandoran surface conditions (~90 kPa, ~288 K). */
const MOL_PER_M3 = 37.6;

/** The acetate-route ceiling: 4 mol H2 per mol glucose. */
export const THAUER_LIMIT = 4;
/** The butyrate route, which real gut communities mostly run. */
export const BUTYRATE_YIELD = 2;

/** Fraction of wet prey mass that is fermentable carbohydrate. */
const DIGESTIBLE_FRACTION = 0.1;

/**
 * Fraction of evolved hydrogen that syntrophic microbes eat before it can be
 * routed to the bladder. Earth's guts sit at essentially all of it.
 */
const SINK_CAPTURE = 0.97;

/**
 * Daily permeation loss as a fraction of enclosed gas, for a 50 m envelope.
 * Anchored on the historical airships' gas cells, which held hydrogen behind a
 * goldbeater's-skin laminate and lost a fraction of a percent per day.
 */
const LEAK_AT_REFERENCE = 0.001;
const REFERENCE_DIAMETER = 50;

export interface HydrogenLedger {
  /** Envelope volume, m^3. */
  volume: number;
  /** Gas the envelope holds when full, m^3 (equal to volume). */
  capacity: number;
  /** Hydrogen the gut evolves per day before any losses, m^3. */
  evolved: number;
  /** Hydrogen eaten by syntrophic microbes per day, m^3. */
  consumedBySink: number;
  /** Hydrogen actually delivered to the bladder per day, m^3. */
  delivered: number;
  /** Hydrogen lost through the envelope wall per day, m^3. */
  permeated: number;
  /** Delivered minus permeated, m^3/day. Negative means the animal is sinking. */
  netPerDay: number;
  /** Net as a percentage of full capacity per day. */
  netPctPerDay: number;
  /** Days to fill an empty envelope at this net rate; null if it never fills. */
  daysToFill: number | null;
  holding: boolean;
}

export function hydrogenLedger(
  preyKgPerDay: number,
  diameter: number,
  sinkSuppressed: boolean,
  permeates: boolean,
  yieldMol: number = BUTYRATE_YIELD,
): HydrogenLedger {
  const volume = (4 / 3) * Math.PI * (diameter / 2) ** 3;
  const area = 4 * Math.PI * (diameter / 2) ** 2;

  const glucoseKg = preyKgPerDay * DIGESTIBLE_FRACTION;
  const molH2 = (glucoseKg * 1000 * yieldMol) / M_GLUCOSE;
  const evolved = molH2 / MOL_PER_M3;

  const consumedBySink = sinkSuppressed ? 0 : evolved * SINK_CAPTURE;
  const delivered = evolved - consumedBySink;

  // Loss tracks wall area, so scale the reference rate by area-per-volume.
  const referenceArea = 4 * Math.PI * (REFERENCE_DIAMETER / 2) ** 2;
  const referenceVolume = (4 / 3) * Math.PI * (REFERENCE_DIAMETER / 2) ** 3;
  const areaPerVolume = area / volume;
  const referenceAreaPerVolume = referenceArea / referenceVolume;
  const leakFraction = permeates ? LEAK_AT_REFERENCE * (areaPerVolume / referenceAreaPerVolume) : 0;
  const permeated = volume * leakFraction;

  const netPerDay = delivered - permeated;

  return {
    volume,
    capacity: volume,
    evolved,
    consumedBySink,
    delivered,
    permeated,
    netPerDay,
    netPctPerDay: (netPerDay / volume) * 100,
    daysToFill: netPerDay > 0 ? volume / netPerDay : null,
    holding: netPerDay >= 0,
  };
}

/** Prey mass per day that exactly covers permeation - the animal's rent. */
export function breakEvenPrey(
  diameter: number,
  sinkSuppressed: boolean,
  yieldMol: number = BUTYRATE_YIELD,
): number {
  const probe = hydrogenLedger(1000, diameter, sinkSuppressed, true, yieldMol);
  if (probe.delivered <= 0) return Number.POSITIVE_INFINITY;
  return (probe.permeated / probe.delivered) * 1000;
}

/** Hydrogen mass in a volume of gas, kg - for expressing the bladder's contents. */
export function hydrogenMass(volumeM3: number): number {
  return ((volumeM3 * MOL_PER_M3 * M_H2) / 1000) * 1;
}
