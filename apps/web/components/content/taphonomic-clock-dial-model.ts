// The kinetics behind TaphonomicClockDial. Everything in a dead body is on a
// clock, but the clocks run at wildly different speeds and respond to different
// things — which is why a fossil is never a whole organism, only the slowest
// parts of one. Three environmental controls drive the model:
//
//   temperature — chemical decay is Arrhenius, so a warm world is a fast world;
//   pore-water pH — bio-apatite dissolves in acid, which is why a rainforest
//     oxisol at pH 4.5 erases bone that a limestone basin would keep;
//   burial delay — a carcass left on the surface is destroyed at Behrensmeyer
//     weathering rates no matter how durable its chemistry is. This is the term
//     that decides whether the other two ever get to matter.
//
// The last coupling is the point of the figure: get buried late and every track
// truncates at the surface-weathering limit, so the material's own half-life
// becomes irrelevant. Burial has to win the race or nothing else is consulted.

/** Universal gas constant, J/(mol·K). */
const R = 8.314;

/** Absolute zero offset for °C → K. */
const KELVIN = 273.15;

export const TRACKS = ["softTissue", "dna", "collagen", "apatite", "carbonFibre"] as const;
export type TrackKey = (typeof TRACKS)[number];

interface TrackSpec {
  /** Survival horizon in years at the reference conditions below. */
  refHorizon: number;
  refTempC: number;
  /** Effective activation energy, kJ/mol. Zero for materials decay barely touches. */
  eaEff: number;
  /** Decades of horizon lost per pH unit below neutral (7.0). */
  acidSensitivity: number;
}

// Reference horizons are literature order-of-magnitude limits, not measurements
// of any one specimen:
//   softTissue  — microbial putrefaction removes labile tissue in days.
//   dna         — authenticated aDNA reaches ~1.2 Myr in permafrost (Krestovka
//                 mammoth); the effective Ea here is the empirical thermal-age
//                 spread across the literature, deliberately NOT the ~127 kJ/mol
//                 hydrolysis barrier, which describes bond cleavage rather than
//                 the retrievable-fragment endpoint. Both appear in the figure:
//                 this one sets the horizon, that one sets the half-life below.
//   collagen    — peptide sequences recovered to ~3.8 Myr from enamel and
//                 eggshell, where crystal shielding does the protecting.
//   apatite     — bone mineral is chemically, not thermally, limited; its
//                 acid sensitivity is the highest on the board.
//   carbonFibre — aligned aromatic carbon is non-hydrolyzable and microbially
//                 inedible. Flat by construction. Canon gives Pandoran bone this
//                 reinforcement; that it would therefore outlast the mineral is
//                 inference, not canon.
const SPECS: Record<TrackKey, TrackSpec> = {
  softTissue: { refHorizon: 0.011, refTempC: 25, eaEff: 60, acidSensitivity: 0 },
  dna: { refHorizon: 1.2e6, refTempC: -5, eaEff: 52, acidSensitivity: 0.35 },
  collagen: { refHorizon: 3.8e6, refTempC: 10, eaEff: 45, acidSensitivity: 0.5 },
  apatite: { refHorizon: 2.5e7, refTempC: 15, eaEff: 30, acidSensitivity: 1.6 },
  carbonFibre: { refHorizon: 4e9, refTempC: 15, eaEff: 0, acidSensitivity: 0 },
};

/** Allentoft et al. 2012: per-site fragmentation rate measured in moa bone. */
export const ALLENTOFT_RATE = 5.5e-6; // site⁻¹ yr⁻¹
export const ALLENTOFT_TEMP_C = 13.1;
export const ALLENTOFT_HALFLIFE = 521; // yr, for a 242-bp fragment
/** Activation energy of hydrolytic strand cleavage, kJ/mol. */
export const HYDROLYSIS_EA = 127;

/**
 * Arrhenius rate ratio relative to a reference temperature. Returns how many
 * times FASTER the process runs at `tempC` than at `refTempC`.
 */
export function rateRatio(tempC: number, refTempC: number, eaKJ: number): number {
  if (eaKJ === 0) return 1;
  const ea = eaKJ * 1000;
  return Math.exp((ea / R) * (1 / (refTempC + KELVIN) - 1 / (tempC + KELVIN)));
}

/** The Allentoft half-life scaled to another temperature, in years. */
export function dnaHalfLife(tempC: number): number {
  return ALLENTOFT_HALFLIFE / rateRatio(tempC, ALLENTOFT_TEMP_C, HYDROLYSIS_EA);
}

export interface Conditions {
  tempC: number;
  ph: number;
  /** Years spent on the surface before sediment covers the remains. */
  burialDelayYr: number;
}

/**
 * Behrensmeyer's weathering stages: bone left subaerially in the tropics loses
 * morphological identity in 10–15 years. Anything still exposed past that has
 * no horizon left to spend, and the ceiling tightens with temperature.
 */
export function weatheringCeiling(tempC: number): number {
  const tropical = 12; // yr to Weathering Stage 5 in a warm, wet regime
  return tropical / rateRatio(tempC, 27, 45);
}

export interface TrackResult {
  key: TrackKey;
  /** Horizon in years after chemistry, acidity and burial timing are applied. */
  horizon: number;
  /** Horizon before the burial race is taken into account. */
  chemicalHorizon: number;
  /** True when surface exposure, not chemistry, set the limit. */
  truncated: boolean;
}

export function evaluateTracks(c: Conditions): TrackResult[] {
  const ceiling = weatheringCeiling(c.tempC);
  const exposedTooLong = c.burialDelayYr >= ceiling;

  return TRACKS.map((key) => {
    const spec = SPECS[key];
    const thermal = spec.refHorizon / rateRatio(c.tempC, spec.refTempC, spec.eaEff);
    const acidPenalty = 10 ** (spec.acidSensitivity * Math.max(0, 7 - c.ph));
    const chemicalHorizon = thermal / acidPenalty;

    // Carbon fibre is the one material surface weathering cannot finish off: it
    // is not what cracks and flakes, so an exposed skeleton still leaves a mesh.
    const survivesExposure = key === "carbonFibre";
    const horizon =
      exposedTooLong && !survivesExposure ? Math.min(chemicalHorizon, ceiling) : chemicalHorizon;

    return { key, horizon, chemicalHorizon, truncated: horizon < chemicalHorizon };
  });
}

/** Human-readable magnitude for a span of years. */
export function formatYears(years: number): { value: string; unit: "yr" | "kyr" | "myr" | "gyr" } {
  if (years >= 1e9) return { value: (years / 1e9).toPrecision(2), unit: "gyr" };
  if (years >= 1e6) return { value: (years / 1e6).toPrecision(2), unit: "myr" };
  if (years >= 1e3) return { value: (years / 1e3).toPrecision(2), unit: "kyr" };
  if (years >= 1) return { value: Math.round(years).toString(), unit: "yr" };
  return { value: years.toPrecision(2), unit: "yr" };
}
