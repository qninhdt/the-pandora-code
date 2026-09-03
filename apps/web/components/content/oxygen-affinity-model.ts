// The oxygen-binding arithmetic behind OxygenAffinityBench.
//
// A respiratory pigment's whole job is one number per pass: how much of the oxygen
// it picks up at the gas-exchange surface it lets go of in tissue. Fractional
// saturation follows the Hill equation,
//
//   Y = p^n / (P50^n + p^n)
//
// and the P50 itself moves with local pH through the Bohr coefficient
// phi = dlog(P50)/dpH, which is about -0.4 in human blood. Acid pushes P50 up
// (right shift, easier unloading); alkali pulls it down (left shift, easier
// loading).
//
// The interesting result, and the one this figure exists to show, is that an
// animal whose arterial blood sits permanently near pH 7.2 is NOT crippled at the
// loading end. Alveolar oxygen tension sits on the flat plateau of the sigmoid, so
// a 25 per cent rise in P50 costs about one point of arterial saturation. What
// permanent acidity actually does is bite at the far end: unloading becomes so
// aggressive that venous blood carries almost no reserve. That is superb for a
// sprint and thin cover for anything that interrupts the supply.
//
// Earth values are measured: human P50 near 27 mmHg with n about 2.7, the
// bar-headed goose near 27 against 40 mmHg in its lowland relatives. Pandoran
// alveolar tension is derived, not published — on Pandora most alveolar carbon
// dioxide is inhaled rather than metabolic, so only the metabolic increment
// displaces oxygen, which leaves alveolar oxygen close to the terrestrial value.
// Every visible string lives in the component's translations.

export type RegimeKey = "earthRest" | "earthSprint" | "pandoraRest" | "pandoraSprint";

export const REGIMES: RegimeKey[] = ["earthRest", "earthSprint", "pandoraRest", "pandoraSprint"];

export interface Regime {
  /** Oxygen tension at the gas-exchange surface, mmHg. */
  alveolarPo2: number;
  /** Arterial pH as the blood leaves that surface. */
  arterialPh: number;
  /** Oxygen tension in the tissue capillary bed, mmHg. */
  tissuePo2: number;
  /** Local pH in that capillary bed, depressed by working muscle. */
  tissuePh: number;
}

export const REGIME_STATE: Record<RegimeKey, Regime> = {
  earthRest: { alveolarPo2: 100, arterialPh: 7.4, tissuePo2: 40, tissuePh: 7.36 },
  earthSprint: { alveolarPo2: 100, arterialPh: 7.38, tissuePo2: 20, tissuePh: 7.1 },
  // Alveolar oxygen barely differs from Earth's: the inhaled carbon dioxide is
  // already there before the animal adds any, so it does not displace oxygen twice.
  pandoraRest: { alveolarPo2: 106, arterialPh: 7.16, tissuePo2: 38, tissuePh: 7.12 },
  pandoraSprint: { alveolarPo2: 106, arterialPh: 7.14, tissuePo2: 18, tissuePh: 6.9 },
};

/** pH at which the intrinsic P50 is quoted. */
export const REFERENCE_PH = 7.4;

export const P50_MIN = 14;
export const P50_MAX = 46;
export const HILL_MIN = 1;
export const HILL_MAX = 3.4;
/** Bohr coefficient magnitude; 0 is a fully blunted pigment. */
export const BOHR_MIN = 0;
export const BOHR_MAX = 0.6;

/** Human blood, as measured: the bench opens here. */
export const HUMAN_PIGMENT = { p50: 27, hill: 2.7, bohr: 0.4 };

/** P50 after the Bohr shift for a local pH. */
export function shiftedP50(p50Ref: number, bohr: number, ph: number): number {
  return p50Ref * 10 ** (-bohr * (ph - REFERENCE_PH));
}

/** Hill saturation, 0-1. */
export function saturation(po2: number, p50: number, hill: number): number {
  const a = po2 ** hill;
  return a / (p50 ** hill + a);
}

/** How hard the tissue bed strips the blood in one pass. */
export type ExtractionGrade = "sparing" | "moderate" | "aggressive";
/** What the blood still carries after the tissue has taken its share. */
export type ReserveGrade = "thin" | "workable" | "ample";

export interface AffinityOutcome {
  /** P50 in the arterial blood, after the Bohr shift. */
  arterialP50: number;
  /** P50 in the working tissue bed, after the deeper Bohr shift. */
  tissueP50: number;
  /** Saturation leaving the gas-exchange surface, 0-1. */
  arterialSat: number;
  /** Saturation leaving the tissue bed, 0-1. */
  tissueSat: number;
  /** Fraction of capacity handed over in one pass. */
  delivered: number;
  extraction: ExtractionGrade;
  reserve: ReserveGrade;
  /** True when loading, not unloading, is the binding constraint. */
  loadingLimited: boolean;
}

export function runBench(
  regime: RegimeKey,
  p50Ref: number,
  hill: number,
  bohr: number,
): AffinityOutcome {
  const r = REGIME_STATE[regime];
  const arterialP50 = shiftedP50(p50Ref, bohr, r.arterialPh);
  const tissueP50 = shiftedP50(p50Ref, bohr, r.tissuePh);
  const arterialSat = saturation(r.alveolarPo2, arterialP50, hill);
  const tissueSat = saturation(r.tissuePo2, tissueP50, hill);
  const delivered = arterialSat - tissueSat;

  const extraction: ExtractionGrade =
    delivered < 0.35 ? "sparing" : delivered < 0.7 ? "moderate" : "aggressive";
  // Below about a tenth of capacity there is nothing left to draw on if delivery
  // stumbles — a sprinter's margin, not a diver's.
  const reserve: ReserveGrade = tissueSat < 0.12 ? "thin" : tissueSat < 0.35 ? "workable" : "ample";

  return {
    arterialP50,
    tissueP50,
    arterialSat,
    tissueSat,
    delivered,
    extraction,
    reserve,
    loadingLimited: arterialSat < 0.9,
  };
}

/** Sampled dissociation curve across a fixed tension axis, for plotting. */
export const PO2_AXIS_MAX = 130;

export function curvePoints(
  p50: number,
  hill: number,
  steps = 48,
): Array<{ po2: number; sat: number }> {
  const points: Array<{ po2: number; sat: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const po2 = (PO2_AXIS_MAX * i) / steps;
    points.push({ po2, sat: saturation(po2, p50, hill) });
  }
  return points;
}
