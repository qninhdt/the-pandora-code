// The acid-base arithmetic behind AcidBaseSetPointSolver.
//
// Blood pH is not a free parameter. It is pinned to dissolved carbon dioxide by
// the Henderson-Hasselbalch relation:
//
//   pH = pKa' + log10( [HCO3-] / (alpha_CO2 x PaCO2) )
//
// with pKa' = 6.10 and alpha_CO2 = 0.0307 mmol/L/mmHg in plasma at 37 C. Only two
// numbers move: the bicarbonate the body maintains, and the carbon dioxide tension
// the air imposes. That is the whole model, and it is enough to force the chapter's
// central conclusion — an animal breathing air rich in carbon dioxide cannot hold
// the terrestrial pH set-point without a bicarbonate load that would salt out its
// own tissues, so the set-point itself has to move.
//
// Earth baselines are textbook values. The Pandoran carbon dioxide tension follows
// from the canonical atmospheric fraction and surface pressure; the reconstructed
// native set-point is inference, not a published measurement, and the component
// says so. Every visible string lives in the component's translations.

/** Carbon dioxide solubility in plasma at 37 C, mmol/L per mmHg. */
export const ALPHA_CO2 = 0.0307;

/** Apparent pKa of the carbonic acid / bicarbonate pair in plasma at 37 C. */
export const PKA = 6.1;

/** Saturated water vapour pressure in the airway at body temperature, mmHg. */
export const P_H2O = 47;

export type PresetKey = "earth" | "defendEarthPh" | "nativeSetPoint" | "earthAirShock";

export const PRESETS: PresetKey[] = ["earth", "defendEarthPh", "nativeSetPoint", "earthAirShock"];

export interface PresetState {
  /** Arterial carbon dioxide tension, mmHg. */
  paco2: number;
  /** Plasma bicarbonate, mmol/L. */
  bicarbonate: number;
}

export const PRESET_STATE: Record<PresetKey, PresetState> = {
  // Terrestrial mammalian resting baseline: 24 mmol/L against 40 mmHg gives 7.39.
  earth: { paco2: 40, bicarbonate: 24 },
  // Pandoran arterial tension, but insisting on the terrestrial pH. The solver
  // shows what that costs: bicarbonate up in the seventies.
  defendEarthPh: { paco2: 120, bicarbonate: 74 },
  // The reconstruction the chapter argues for — a lower set-point defended by an
  // affordable bicarbonate load.
  nativeSetPoint: { paco2: 120, bicarbonate: 42 },
  // A Pandoran body in clean Earth air. Carbon dioxide washes out in tens of
  // seconds; the kidneys need days to shed the bicarbonate that is left behind.
  earthAirShock: { paco2: 18, bicarbonate: 42 },
};

/**
 * Inspired carbon dioxide tension for an ambient fraction and barometric
 * pressure, after the airway saturates the gas with water vapour.
 */
export function inspiredPco2(fraction: number, barometricMmHg: number): number {
  return fraction * (barometricMmHg - P_H2O);
}

export function bloodPh(paco2: number, bicarbonate: number): number {
  return PKA + Math.log10(bicarbonate / (ALPHA_CO2 * paco2));
}

/** Bicarbonate required to hold a target pH at a given carbon dioxide tension. */
export function requiredBicarbonate(targetPh: number, paco2: number): number {
  return 10 ** (targetPh - PKA) * ALPHA_CO2 * paco2;
}

export type Verdict =
  | "lethalAcidosis"
  | "compensatedLow"
  | "terrestrialNormal"
  | "alkalosis"
  | "lethalAlkalosis";

/**
 * Where a pH lands on the survivability ladder. The boundaries are the clinical
 * ones for mammals: below 6.8 and above 7.8 are not survivable for long, and the
 * 7.15-7.25 band is the reconstructed native window rather than a pathology.
 */
export function verdictFor(ph: number): Verdict {
  if (ph < 6.85) return "lethalAcidosis";
  if (ph < 7.32) return "compensatedLow";
  if (ph <= 7.48) return "terrestrialNormal";
  if (ph <= 7.75) return "alkalosis";
  return "lethalAlkalosis";
}

/** Osmotic and solubility strain from carrying a large bicarbonate reserve. */
export type LoadGrade = "ordinary" | "elevated" | "unaffordable";

export function loadGrade(bicarbonate: number): LoadGrade {
  if (bicarbonate <= 30) return "ordinary";
  if (bicarbonate <= 55) return "elevated";
  return "unaffordable";
}

export interface AcidBaseOutcome {
  ph: number;
  verdict: Verdict;
  load: LoadGrade;
  /** Bicarbonate that would be needed to hold pH 7.40 at this tension. */
  bicarbonateForEarthPh: number;
  /** Signed distance from the terrestrial 7.40 set-point. */
  phOffset: number;
}

export function solveAcidBase(paco2: number, bicarbonate: number): AcidBaseOutcome {
  const ph = bloodPh(paco2, bicarbonate);
  return {
    ph,
    verdict: verdictFor(ph),
    load: loadGrade(bicarbonate),
    bicarbonateForEarthPh: requiredBicarbonate(7.4, paco2),
    phOffset: ph - 7.4,
  };
}

export const PACO2_MIN = 15;
export const PACO2_MAX = 150;
export const HCO3_MIN = 15;
export const HCO3_MAX = 90;

/** Plot position (0-1) for a carbon dioxide tension on the solver's axis. */
export function paco2Fraction(paco2: number): number {
  return (paco2 - PACO2_MIN) / (PACO2_MAX - PACO2_MIN);
}

/** Plot position (0-1) for a bicarbonate concentration on the solver's axis. */
export function bicarbonateFraction(bicarbonate: number): number {
  return (bicarbonate - HCO3_MIN) / (HCO3_MAX - HCO3_MIN);
}

/**
 * The bicarbonate/tension pairs that hold one pH exactly — an isopleth across the
 * solver's plot. Drawn so the reader can see that defending a fixed pH against
 * rising carbon dioxide is a straight climb in bicarbonate, not a plateau.
 */
export function isoPhCurve(targetPh: number, steps = 24): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const paco2 = PACO2_MIN + ((PACO2_MAX - PACO2_MIN) * i) / steps;
    const hco3 = requiredBicarbonate(targetPh, paco2);
    if (hco3 < HCO3_MIN || hco3 > HCO3_MAX) continue;
    points.push({ x: paco2Fraction(paco2), y: bicarbonateFraction(hco3) });
  }
  return points;
}
