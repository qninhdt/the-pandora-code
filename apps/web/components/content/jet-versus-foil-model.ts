// Two ways to push water, priced against the same job. Cruising at a steady speed
// means producing exactly enough thrust to cancel drag, so drag is the honest
// starting point rather than an assumed jet velocity:
//
//   D = ½ ρ C_d A_wet u²
//
// A jet has to make that force by throwing a small mass of water very fast,
// because the aperture is small: F = ρ A_e u_j², so u_j = √(D / ρ A_e). Froude
// efficiency then follows from how far the jet overshoots the swimming speed:
//
//   η = 2 / (1 + u_j/u)
//
// and everything the jet wastes ends up as kinetic energy in the wake. A flapping
// foil sweeps a far larger disk, so its wake barely outruns the body — a small
// slip velocity, and efficiency in the high eighties. The pulsed duty cycle costs
// the jet again: thrust drops to zero while the mantle refills, so the mean force
// must be produced in a fraction of each cycle.
//
// Constants are order-of-magnitude values for a large marine predator, chosen so
// the default case reproduces the measured Froude-efficiency band for pulsed
// jetting (0.38-0.55) against the high eighties for batoid pectoral flapping
// (Anderson & Grosenbaugh 2005; Fish et al. 2018).
//
// One honest limit: respirometry puts the whole-animal metabolic penalty of
// jetting at 3.5-5x that of a fish or ray (O'Dor & Webber 1991), which is steeper
// than the ratio of Froude efficiencies alone. The rest comes from anaerobic
// recruitment at speed, the mass of mantle muscle carried, and octopine clearance
// afterwards - physiology this budget does not model. What is derived here is the
// hydrodynamic share of the penalty, which is the part the geometry forces.
// Deterministic; no randomness.

/** Seawater density (kg m^-3). */
export const RHO_SEAWATER = 1025;

/** Friction-dominated drag coefficient referenced to wetted area. */
const DRAG_COEFFICIENT = 0.013;

/** Wetted area scales with volume^(2/3); this prefactor suits a winged body. */
const WETTED_AREA_FACTOR = 9;

/** Fraction of the pulse cycle spent actually ejecting water. */
const JET_DUTY_CYCLE = 0.6;

/**
 * Wake slip for a high-aspect-ratio flapping foil: the actuator disk leaves the
 * water moving only 27% faster than the body, which is where the ~0.88 Froude
 * efficiency of batoid pectoral flapping comes from.
 */
const FOIL_WAKE_SLIP = 0.27;

/** Mechanical-to-metabolic conversion for striated muscle. */
const MUSCLE_EFFICIENCY = 0.25;

export interface PropulsionCase {
  /** Froude propulsive efficiency (0-1). */
  froudeEfficiency: number;
  /** Mechanical power delivered by the muscles (W). */
  mechanicalPowerW: number;
  /** Power left behind in the wake rather than moving the body (W). */
  wastedPowerW: number;
  /** Metabolic cost of transport (J kg^-1 m^-1). */
  costOfTransport: number;
}

export interface PropulsionComparison {
  /** Drag the animal must cancel to hold this speed (N). */
  dragN: number;
  /** Jet exit velocity the aperture is forced to produce (m s^-1). */
  jetVelocityMs: number;
  jet: PropulsionCase;
  foil: PropulsionCase;
  /** How many times more expensive the jet is, per metre travelled. */
  jetPenaltyFactor: number;
  /**
   * Aperture area that would make the jet as efficient as the foil (m²). Always
   * far larger than any real siphon - at that size it is a wing, not a nozzle.
   */
  breakEvenApertureM2: number;
}

/** Wetted surface area of a neutrally buoyant body of this mass (m²). */
export function wettedArea(massKg: number): number {
  const volume = massKg / RHO_SEAWATER;
  return WETTED_AREA_FACTOR * volume ** (2 / 3);
}

export function propulsionComparison(
  massKg: number,
  speedMs: number,
  apertureCm2: number,
  includeRefillPenalty: boolean,
): PropulsionComparison {
  const apertureM2 = Math.max(1e-4, apertureCm2 / 10_000);
  const u = Math.max(0.1, speedMs);
  const drag = 0.5 * RHO_SEAWATER * DRAG_COEFFICIENT * wettedArea(massKg) * u * u;

  // The pulse only pushes for part of the cycle, so peak thrust during the
  // ejection phase has to exceed mean thrust to average out to the drag.
  const dutyFactor = includeRefillPenalty ? JET_DUTY_CYCLE : 1;
  const peakThrust = drag / dutyFactor;
  const jetVelocity = Math.sqrt(peakThrust / (RHO_SEAWATER * apertureM2));

  const jetEfficiency = 2 / (1 + jetVelocity / u);
  const jetMechanical = (drag * u) / jetEfficiency;

  const foilEfficiency = 2 / (2 + FOIL_WAKE_SLIP);
  const foilMechanical = (drag * u) / foilEfficiency;

  const cost = (mechanicalW: number) => mechanicalW / MUSCLE_EFFICIENCY / (massKg * u);

  const jet: PropulsionCase = {
    froudeEfficiency: jetEfficiency,
    mechanicalPowerW: jetMechanical,
    wastedPowerW: jetMechanical * (1 - jetEfficiency),
    costOfTransport: cost(jetMechanical),
  };
  const foil: PropulsionCase = {
    froudeEfficiency: foilEfficiency,
    mechanicalPowerW: foilMechanical,
    wastedPowerW: foilMechanical * (1 - foilEfficiency),
    costOfTransport: cost(foilMechanical),
  };

  // Setting u_j = u(1 + slip) in F = ρ A u_j² and solving for A.
  const breakEvenAperture = peakThrust / (RHO_SEAWATER * (u * (1 + FOIL_WAKE_SLIP)) ** 2);

  return {
    dragN: drag,
    jetVelocityMs: jetVelocity,
    jet,
    foil,
    jetPenaltyFactor: jet.costOfTransport / foil.costOfTransport,
    breakEvenApertureM2: breakEvenAperture,
  };
}
