// What deep water actually does to a body, in the order the effects matter.
//
// It does not crush it. Seawater and soft tissue share an isothermal
// compressibility near κ = 4.5e-10 Pa^-1, so even at the bottom of the deepest
// trench a gas-free body loses only a few per cent of its volume, applied evenly
// from every direction. With no gas cavity there is no pressure difference across
// any wall, and with no difference there is no shear to deform anatomy.
//
// The real damage is molecular. Any reaction whose transition state occupies more
// room than its reactants is pushed backwards by pressure:
//
//   (∂ ln k / ∂P)_T = −ΔV‡ / RT   →   k(P)/k(0) = exp(−ΔV‡ P / RT)
//
// A positive activation volume of a few tens of cm³/mol is enough to halve a rate
// over a few kilometres of depth. Membranes suffer the parallel problem: pressure
// compresses the bilayer's hydrophobic core toward a gel, and organisms answer by
// packing in more cis-unsaturated fatty acid to hold the fluidity they need.
//
// The hard ceiling is neither of those - it is osmotic. Deep-sea fish stabilise
// their proteins with trimethylamine N-oxide, and muscle TMAO rises almost
// linearly with depth. Teleost blood starts well below seawater osmolarity, so
// there is only so much room to climb: at roughly 8,400 m the accumulated
// osmolytes bring internal osmolarity level with the ~1,100 mOsm/kg of seawater,
// and past that point the animal would be drawing water inward faster than it
// could manage. That biochemical boundary is where bony fish stop being found
// (Yancey et al. 2014) - the deepest trenches belong to animals with a different
// solution.
//
// Calibration: κ from standard seawater values, the TMAO gradient anchored on the
// 350 mOsm surface baseline and the 1,100 mOsm crossing at 8,400 m. Deterministic;
// no randomness.

const P0 = 101_325; // surface pressure (Pa)
const RHO = 1025; // seawater density (kg m^-3)
const G = 9.81;

/** Isothermal compressibility of seawater and soft tissue (Pa^-1). */
const COMPRESSIBILITY = 4.5e-10;

const R_GAS = 8.314; // J mol^-1 K^-1

/** Deep-ocean temperature used for the rate calculation (K). */
const T_DEEP = 277;

/** Teleost plasma osmolarity at the surface (mOsm/kg). */
const SURFACE_OSMOLARITY = 350;

/** Seawater osmolarity — the ceiling TMAO accumulation runs into (mOsm/kg). */
export const SEAWATER_OSMOLARITY = 1100;

/** Depth at which teleost osmolarity reaches seawater's (m). */
export const TMAO_CEILING_DEPTH = 8400;

const OSMOLARITY_PER_METRE = (SEAWATER_OSMOLARITY - SURFACE_OSMOLARITY) / TMAO_CEILING_DEPTH;

export interface DepthStressState {
  /** Absolute hydrostatic pressure (Pa). */
  pressurePa: number;
  pressureMPa: number;
  pressureAtm: number;
  /** Volume lost by a gas-free body, as a percentage. */
  volumeLossPct: number;
  /** Reaction rate as a fraction of its surface value. */
  reactionRateFraction: number;
  /** Extra unsaturated-lipid share needed to hold membrane fluidity (%). */
  lipidUnsaturationPct: number;
  /** Internal osmolarity after piezolyte accumulation (mOsm/kg). */
  osmolarity: number;
  /** Osmotic headroom left before internal matches seawater (mOsm/kg). */
  osmoticHeadroom: number;
  /** True past the depth where a teleost would become hyperosmotic. */
  pastOsmoticCeiling: boolean;
}

export function depthStress(depthM: number, activationVolumeCm3: number): DepthStressState {
  const pressurePa = P0 + RHO * G * depthM;
  const gaugePa = pressurePa - P0;

  // ΔV‡ arrives in cm³/mol; convert to m³/mol for the exponent.
  const activationVolume = activationVolumeCm3 * 1e-6;
  const reactionRateFraction = Math.exp((-activationVolume * gaugePa) / (R_GAS * T_DEEP));

  // Membranes have to be rebuilt roughly in step with the pressure they face;
  // the observed trend in deep taxa is a few per cent more unsaturation per
  // kilometre of habitat depth.
  const lipidUnsaturationPct = Math.min(45, 18 + (depthM / 1000) * 2.4);

  const osmolarity = SURFACE_OSMOLARITY + OSMOLARITY_PER_METRE * depthM;

  return {
    pressurePa,
    pressureMPa: pressurePa / 1e6,
    pressureAtm: pressurePa / P0,
    volumeLossPct: gaugePa * COMPRESSIBILITY * 100,
    reactionRateFraction,
    lipidUnsaturationPct,
    osmolarity,
    osmoticHeadroom: SEAWATER_OSMOLARITY - osmolarity,
    pastOsmoticCeiling: depthM > TMAO_CEILING_DEPTH,
  };
}
