// The arithmetic behind OpercularOxygenBudget — whether a breathing fan can keep
// up with the body behind it, and what the ventilation itself costs.
//
// SOURCED (chapter research note):
//  • Kleiber's law — metabolic rate, and so oxygen demand, scales as M^0.75.
//  • Fick's law — flux rises with exchange area and the pressure gradient, and
//    falls with the thickness of the diffusion barrier.
//  • Surface grows as the square of length while volume grows as the cube, so an
//    exchange surface that merely kept pace with the body would scale as
//    M^(2/3) ≈ 0.67 — and the note states outright that respiratory surfaces must
//    instead scale with *positive* allometry or the diffusion path becomes the
//    bottleneck. That tension is the whole subject of this figure.
//  • Pandora's air: oxygen 21–25% by volume at ~0.9 atm barometric, density
//    ~1.2× Earth's. Note the consequence the note's own numbers force — at
//    0.9 atm, Pandora's oxygen partial pressure is close to Earth's, so nothing
//    here is explained by "richer air".
//  • Dense air makes tidal ventilation expensive: the heavy gas must be
//    accelerated and reversed every breath. One-way ram ventilation transfers
//    that work to the locomotory muscles, which are moving anyway.
//  • A high-velocity one-way stream strips the stagnant boundary layer off the
//    membrane, holding the effective barrier at its minimum; where the air pauses
//    and reverses, that layer builds and the barrier effectively thickens.
//
// CALIBRATED, NOT MEASURED: the note gives no absolute metabolic rates, no body
// mass for any Pandoran animal, and no ventilation-cost figures. So this model
// claims no absolute rates. Everything is a *margin* — supply over demand —
// pegged so that one reference body sits exactly at break-even: a 350 kg tidal
// breather in Earth air whose exchange surface merely keeps pace with its bulk.
// Earth's large tidal breathers are of that order, and pegging there is what
// makes every other reading on screen a comparison rather than a claim.
//
// Two constants set how hard the density penalties bite:
//
//   TIDAL_COST_AT_UNIT_DENSITY  what reversing Earth-density air costs
//   BOUNDARY_LAYER_PENALTY      how fast the stagnant film thickens with density
//
// Only the *exponents* and the *direction* of every effect come from the note.
// Both constants are this figure's own calibration, and the component says so
// on screen rather than burying it here.

/** Oxygen demand exponent — Kleiber's law. */
export const DEMAND_EXPONENT = 0.75;

/** The exponent of an exchange surface that merely keeps pace with the body. */
export const ISOMETRIC_AREA_EXPONENT = 2 / 3;

/** Earth's oxygen partial pressure, atm (20.95% of 1 atm). */
export const EARTH_PO2 = 0.2095;

/** Pandora's barometric pressure, atm. */
export const PANDORA_PRESSURE = 0.9;

/** Pandora's oxygen fraction — mid-range of the note's 21–25% band. */
export const PANDORA_O2_FRACTION = 0.23;

/** Oxygen partial pressure of Pandora's air, atm. */
export const PANDORA_PO2 = PANDORA_O2_FRACTION * PANDORA_PRESSURE;

/** Pandora's air density, × Earth. */
export const PANDORA_DENSITY = 1.2;

/** Share of the budget a tidal breather spends reversing unit-density air. */
const TIDAL_COST_AT_UNIT_DENSITY = 0.14;

/** How much the stagnant film thickens the barrier per unit of excess density. */
const BOUNDARY_LAYER_PENALTY = 0.45;

/**
 * The peg. A body of this mass, breathing tidally in Earth air with an exchange
 * surface that merely keeps pace, is defined to sit exactly at break-even — the
 * figure's one fixed reference, chosen because Earth's large tidal breathers are
 * of this order. Every other number on screen is a deviation from it.
 */
export const REFERENCE_MASS = 350;

/**
 * Diffusive surplus of a 1 kg tidal breather in Earth air, solved so the
 * reference body above lands on 1.0. Derived, not asserted.
 */
export const HEADROOM =
  1 /
  ((1 - TIDAL_COST_AT_UNIT_DENSITY) *
    REFERENCE_MASS ** (ISOMETRIC_AREA_EXPONENT - DEMAND_EXPONENT));

export type VentilationMode = "tidal" | "oneWay";

export interface BudgetInputs {
  /** Body mass, kg. */
  mass: number;
  /** How the exchange area scales with mass. 0.67 = merely keeping pace. */
  areaExponent: number;
  /** Air density, × Earth. */
  density: number;
  /** Oxygen partial pressure of the air, atm. */
  po2: number;
  mode: VentilationMode;
}

export interface BudgetResult {
  /** Supply ÷ demand at this mass. 1.0 = exactly breaking even. */
  margin: number;
  /** Share of the budget spent moving air, 0–1. */
  ventilationCost: number;
  /** Effective diffusion barrier thickness, × the scoured-clean minimum. */
  barrier: number;
  /** Heaviest body this design can feed, kg — or null when nothing caps it. */
  ceiling: number | null;
  /** Area exponent that would exactly feed the chosen body, or null at 1 kg. */
  requiredExponent: number | null;
}

/**
 * Effective barrier thickness. A one-way stream scours the boundary layer away,
 * so the barrier stays at its structural minimum however heavy the air; a tidal
 * breather, which pauses and reverses, lets that layer settle and build.
 */
function barrierThickness(density: number, mode: VentilationMode): number {
  if (mode === "oneWay") return 1;
  return 1 + BOUNDARY_LAYER_PENALTY * Math.max(0, density - 1);
}

/**
 * What ventilation costs the animal. A tidal breather pays in proportion to the
 * mass of air it must stop and reverse, so the bill climbs with density. Ram
 * ventilation hands that work to legs or wings that are already moving.
 */
function ventilationCost(density: number, mode: VentilationMode): number {
  if (mode === "oneWay") return 0;
  return Math.min(0.85, TIDAL_COST_AT_UNIT_DENSITY * density);
}

/**
 * The mass-independent part of the budget: richer air helps, a thicker effective
 * barrier hurts, ventilation work comes straight off the top. Slides the whole
 * margin curve up or down without changing its slope.
 */
function scale(po2: number, density: number, mode: VentilationMode): number {
  const barrier = barrierThickness(density, mode);
  const cost = ventilationCost(density, mode);
  return (HEADROOM * (po2 / EARTH_PO2) * (1 - cost)) / barrier;
}

export function evaluate({ mass, areaExponent, density, po2, mode }: BudgetInputs): BudgetResult {
  const s = scale(po2, density, mode);

  // Supply ∝ exchange area ∝ M^areaExponent; demand ∝ M^0.75. Both normalized at
  // 1 kg, so the result is a pure ratio and no absolute rate is claimed.
  const margin = s * mass ** (areaExponent - DEMAND_EXPONENT);

  // Where the margin falls to break-even. If the surface keeps pace with demand
  // there is no ceiling from gas exchange and some other constraint must bind.
  const shortfall = DEMAND_EXPONENT - areaExponent;
  const ceiling = shortfall > 1e-6 && s > 0 ? s ** (1 / shortfall) : null;

  // The exponent that would exactly feed *this* body — the cleanest way to read
  // how much folding each ventilation design demands of the exchange surface.
  const logMass = Math.log(mass);
  const requiredExponent =
    Math.abs(logMass) < 1e-6 || s <= 0 ? null : DEMAND_EXPONENT - Math.log(s) / logMass;

  return {
    margin,
    ventilationCost: ventilationCost(density, mode),
    barrier: barrierThickness(density, mode),
    ceiling,
    requiredExponent,
  };
}
