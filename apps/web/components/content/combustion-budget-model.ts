// Combustion as an enthalpy balance. Reaction heat has to do three jobs at once:
// raise the products to flame temperature, replace what the passing airstream
// strips off the burning surface, and keep enough radicals alive to feed the next
// increment of reaction. Carbon dioxide attacks two of the three — it is a
// triatomic molecule with rotational and vibrational modes N2 lacks, so it stores
// more energy per degree (Cp 37 vs 29 J/mol/K at 298 K, and 55 vs 33 at 1200 K),
// and it competes as a third body in radical recombination. Oxygen fraction sets
// how fast the chain branches. Airspeed sets how fast heat leaves.
//
// The curves here are calibrated fits to the qualitative behaviour reported in
// combustion literature, not a chemical-kinetics solver: at Earth composition the
// model returns unity flame speed and ~2250 K, and at Pandora's composition it
// returns the ~40% spread-rate suppression and ~200 K flame-temperature
// depression the physics implies. Deterministic; no randomness.

export interface AirComposition {
  o2Pct: number;
  co2Pct: number;
}

/** Earth sea-level air, the reference case the model is normalised against. */
export const EARTH_AIR: AirComposition = { o2Pct: 21, co2Pct: 0 };

/**
 * Pandora's surface air. Oxygen and carbon dioxide follow the figures the book
 * established in "What's in the Air?" — oxygen at Earth's level or a little
 * above, carbon dioxide a major constituent rather than a trace gas.
 */
export const PANDORA_AIR: AirComposition = { o2Pct: 22, co2Pct: 17 };

/** Adiabatic flame temperature of dry wood in Earth air (K). */
const T_AD_EARTH = 2250;
const T_AMBIENT = 295;

/** Below this Damkohler number the flame cannot outrun its losses. */
export const DAMKOHLER_BLOWOFF = 1;

export type CombustionVerdict = "readily" | "reluctant" | "marginal";

export interface CombustionBudget {
  /** Laminar burning velocity as a fraction of the Earth-air value. */
  flameSpeedRatio: number;
  /** Adiabatic flame temperature (K). */
  flameTempK: number;
  /** Depression below the Earth-air flame temperature (K). */
  flameTempDropK: number;
  /** Share of reaction enthalpy absorbed by the diluent gas (%). */
  diluentSinkPct: number;
  /** Share of surface heat carried off by forced convection (%). */
  convectiveStripPct: number;
  /** Flow residence time over chemical time. Below 1, the flame blows off. */
  damkohler: number;
  verdict: CombustionVerdict;
}

export function combustionBudget(o2Pct: number, co2Pct: number, windMs: number): CombustionBudget {
  // Chain branching scales steeply with oxidiser fraction; the exponent near 1.8
  // reproduces the observed sensitivity of burning velocity to enrichment and
  // depletion around Earth's 21%.
  const oxidiserTerm = (o2Pct / EARTH_AIR.o2Pct) ** 1.8;

  // CO2 inhibits chemically as a third body in H + O2 + M -> HO2 + M, taking a
  // reactive radical out of circulation. Saturating, because past a point the
  // limiting reagent is oxygen, not the absence of a quencher.
  const quenchTerm = 1 / (1 + 0.032 * co2Pct);

  const flameSpeedRatio = Math.max(0.02, oxidiserTerm * quenchTerm);

  // Thermal dilution: the diluent's extra heat capacity shows up directly as a
  // lower product-gas temperature for the same released enthalpy.
  const diluentSinkFrac = Math.min(0.42, 0.0072 * co2Pct);
  const flameTempK = T_AMBIENT + (T_AD_EARTH - T_AMBIENT) * (1 - diluentSinkFrac);

  // Forced convection off a burning surface: Nu ~ Re^0.5 in laminar external
  // flow, so the stripped fraction grows with the square root of airspeed.
  const convectiveStripFrac = Math.min(0.55, 0.13 * Math.sqrt(windMs));

  // Damkohler number: residence time of reactants in the flame over the chemical
  // time. Chemical time falls as the square of burning velocity, so a slow flame
  // is far easier to blow out than a fast one.
  const chemicalTime = 1 / Math.max(0.02, flameSpeedRatio) ** 2;
  const residenceTime = 26 / (1 + windMs);
  const damkohler = residenceTime / chemicalTime;

  const verdict: CombustionVerdict =
    flameSpeedRatio >= 0.85 ? "readily" : flameSpeedRatio >= 0.5 ? "reluctant" : "marginal";

  return {
    flameSpeedRatio,
    flameTempK,
    flameTempDropK: T_AD_EARTH - flameTempK,
    diluentSinkPct: diluentSinkFrac * 100,
    convectiveStripPct: convectiveStripFrac * 100,
    damkohler,
    verdict,
  };
}
