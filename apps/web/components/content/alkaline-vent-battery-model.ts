// The physics behind AlkalineVentBattery. A serpentinising vent bleeds warm
// alkaline fluid into an acidic, CO2-loaded ocean; where the two fluids meet
// across a thin iron-sulfide wall, the pH difference IS a voltage. That is the
// whole argument for a vent origin, and it is one equation the reader can watch
// move. Kept separate so the figure file stays lean.

/** Gas constant, J·mol⁻¹·K⁻¹. */
const R = 8.314;
/** Faraday constant, C·mol⁻¹. */
const F = 96485;

/**
 * Millivolts of electrochemical drive per unit of pH difference at temperature
 * T. This is the ln(10)·R·T/F term of the chemiosmotic relation — ~59 mV/pH at
 * room temperature, ~68 mV/pH in a warm vent.
 */
export function nernstFactorMv(tempK: number): number {
  return ((Math.LN10 * R * tempK) / F) * 1000;
}

/**
 * Total proton-motive force across the barrier, in millivolts:
 *   Δp = Δψ − (ln(10)·RT/F)·ΔpH,  with ΔpH = pH_ocean − pH_vent.
 * A vent more alkaline than the ocean gives a negative ΔpH and therefore a
 * positive drive.
 */
export function protonMotiveForceMv(
  ventPh: number,
  oceanPh: number,
  tempK: number,
  membranePotentialMv: number,
): number {
  const deltaPh = oceanPh - ventPh;
  return membranePotentialMv - nernstFactorMv(tempK) * deltaPh;
}

/** The band modern cells actually run their ATP synthase on, in millivolts. */
export const CELL_PMF_RANGE = { min: 150, max: 250 } as const;

/** How the vent's drive compares with what a living cell uses. */
export type DriveVerdict = "below" | "cellRange" | "above";

export function driveVerdict(pmfMv: number): DriveVerdict {
  if (pmfMv < CELL_PMF_RANGE.min) return "below";
  if (pmfMv > CELL_PMF_RANGE.max) return "above";
  return "cellRange";
}

/** Ratio of the vent's drive to the midpoint of the cellular band. */
export function driveRatio(pmfMv: number): number {
  const mid = (CELL_PMF_RANGE.min + CELL_PMF_RANGE.max) / 2;
  return pmfMv / mid;
}

/**
 * Two real reference settings, so the sliders are anchored to measured fields
 * rather than to invented numbers. Lost City is the type locality for an
 * alkaline serpentinising vent; the Pandoran figure keeps the same vent
 * chemistry but sits it in the CO2-loaded ocean the chapter's research note
 * describes, which pushes the ocean side more acidic and the gradient wider.
 */
export interface VentPreset {
  id: "lostCity" | "pandora";
  ventPh: number;
  oceanPh: number;
  tempK: number;
}

export const VENT_PRESETS: Record<VentPreset["id"], VentPreset> = {
  lostCity: { id: "lostCity", ventPh: 10, oceanPh: 6.5, tempK: 343 },
  pandora: { id: "pandora", ventPh: 10.5, oceanPh: 5.6, tempK: 353 },
};

export const VENT_PRESET_ORDER: VentPreset["id"][] = ["lostCity", "pandora"];

export const PH_RANGE = { min: 4, max: 12 } as const;
export const TEMP_RANGE = { min: 293, max: 393 } as const;
/** Measured potentials across natural vent barriers sit in the tens of mV. */
export const MEMBRANE_POTENTIAL_MV = 50;
