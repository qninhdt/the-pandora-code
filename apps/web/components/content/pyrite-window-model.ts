// The geochemistry behind PyriteWindowDial.
//
// Replacing soft tissue with pyrite is the single most generous preservation
// pathway there is: it can cast a muscle or a gill filament in brassy mineral at
// cellular resolution, in days. It is also fussy. Three ingredients have to arrive
// in the right ratio at the carcass:
//
//   1. reduced sulfide (HS- / H2S), which on Earth must be manufactured in the
//      sediment by sulfate-reducing bacteria:
//        2 CH2O + SO4^2-  ->  2 HCO3- + H2S
//   2. reactive iron, delivered as detrital iron minerals in the mud:
//        Fe^2+ + HS-  ->  FeS(s) + H+       then  FeS + H2S -> FeS2 + H2
//   3. a *low* concentration of surrounding organic carbon
//
// The third is the counter-intuitive one. Pyritization needs organic matter as the
// nucleation site but is poisoned by too much of it: a carbon-rich bed drives
// sulfide production everywhere at once, iron is consumed in the sediment far from
// the body, pore water acidifies, and the carcass gets nothing. Exceptional
// pyrite fossils come from carbon-*poor* muds with a single carcass in them.
//
// Pandora changes the first term structurally rather than incrementally. Canon
// gives its atmosphere well over one percent hydrogen sulfide, sustained by
// volcanism, so meteoric water and standing basins are charged with reduced sulfur
// before anything dies in them. The bacterial step stops being the bottleneck; the
// limit moves to iron delivery. That widens the window instead of shifting it.
//
// Values are dimensionless 0-100 dials standing in for concentration regimes, not
// published molarities. Every visible string lives in the component's translations.

export type Regime = "barren" | "pyriteWindow" | "ironStarved" | "carbonPoisoned";

export interface WindowInputs {
  /** Dissolved reduced sulfide available at the carcass, 0-100. */
  sulfide: number;
  /** Reactive detrital iron in the enclosing mud, 0-100. */
  iron: number;
  /** Background organic carbon in the surrounding sediment, 0-100. */
  carbon: number;
}

export type PresetKey = "earth" | "pandora";

/**
 * Earth: a carcass has to wait for bacteria to make its sulfide, so the sulfide
 * dial sits low unless the setting is unusually euxinic.
 * Pandora: the water arrives pre-charged from the air.
 */
export const PRESETS: Record<PresetKey, WindowInputs> = {
  earth: { sulfide: 22, iron: 55, carbon: 30 },
  pandora: { sulfide: 82, iron: 55, carbon: 30 },
};

/** Minimum sulfide for any iron sulfide to precipitate at all. */
const SULFIDE_FLOOR = 30;
/** Minimum reactive iron for sulfide to be captured as pyrite rather than lost. */
const IRON_FLOOR = 25;
/** Above this, background organic carbon consumes the iron before the body does. */
const CARBON_CEILING = 68;

export interface WindowOutcome {
  regime: Regime;
  /** 0-100 fidelity of the resulting fossil: how fine a structure gets cast. */
  fidelity: number;
  /** Which input is currently holding the outcome back. */
  limiting: "sulfide" | "iron" | "carbon" | "none";
}

export function evaluateWindow({ sulfide, iron, carbon }: WindowInputs): WindowOutcome {
  if (carbon > CARBON_CEILING) {
    return {
      regime: "carbonPoisoned",
      fidelity: carbonPoisonedFidelity(carbon),
      limiting: "carbon",
    };
  }
  if (sulfide < SULFIDE_FLOOR) {
    return { regime: "barren", fidelity: Math.round(sulfide * 0.25), limiting: "sulfide" };
  }
  if (iron < IRON_FLOOR) {
    return { regime: "ironStarved", fidelity: Math.round(iron * 0.9), limiting: "iron" };
  }

  // Inside the window. Fidelity rises with sulfide and iron and falls as the
  // surrounding carbon competes for the iron.
  const sulfideTerm = (sulfide - SULFIDE_FLOOR) / (100 - SULFIDE_FLOOR);
  const ironTerm = (iron - IRON_FLOOR) / (100 - IRON_FLOOR);
  const carbonPenalty = 1 - (Math.max(0, carbon - 20) / (CARBON_CEILING - 20)) * 0.45;
  const fidelity = Math.round(
    Math.min(100, 100 * Math.sqrt(sulfideTerm * ironTerm) * carbonPenalty),
  );

  const limiting: WindowOutcome["limiting"] =
    ironTerm < sulfideTerm && ironTerm < 0.6 ? "iron" : carbon > 45 ? "carbon" : "none";

  return { regime: "pyriteWindow", fidelity, limiting };
}

function carbonPoisonedFidelity(carbon: number): number {
  return Math.round(Math.max(0, 30 - (carbon - CARBON_CEILING)));
}

/** What anatomical scale the current fidelity can actually record. */
export type Resolution = "none" | "outline" | "organs" | "cellular";

export function resolutionFor(outcome: WindowOutcome): Resolution {
  if (outcome.regime !== "pyriteWindow") return outcome.fidelity > 18 ? "outline" : "none";
  if (outcome.fidelity >= 72) return "cellular";
  if (outcome.fidelity >= 40) return "organs";
  return "outline";
}

/** Whether a given dial triple sits inside the pyritization window. */
export function insideWindow(inputs: WindowInputs): boolean {
  return evaluateWindow(inputs).regime === "pyriteWindow";
}

export const WINDOW_BOUNDS = {
  sulfideFloor: SULFIDE_FLOOR,
  ironFloor: IRON_FLOOR,
  carbonCeiling: CARBON_CEILING,
} as const;
