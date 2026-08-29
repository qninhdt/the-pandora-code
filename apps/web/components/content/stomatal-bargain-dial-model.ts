// The gas-exchange arithmetic behind StomatalBargainDial, kept separate so the
// component file stays lean. Every leaf makes the same trade at the same door: a
// pore open enough to let carbon dioxide in is open enough to let water out, and
// there is no way to have one without the other.
//
// Assimilation is diffusion driven by the CO2 gradient across the pore:
//
//   A = (g_s / 1.6) · (C_a − C_i)
//
// where g_s is stomatal conductance to water vapour and 1.6 is the ratio of the
// diffusivities of water vapour and CO2 in air. Transpiration is the same pore,
// the same conductance, driven by the vapour-pressure deficit instead:
//
//   E = g_tw · VPD / P_atm
//
// Intrinsic water-use efficiency, A/g_s, is the honest score of the trade: carbon
// won per unit of door opened. On Earth C_a is ~425 ppm and the gradient is
// pitiful, so a leaf must gape. In Pandora's ~200,000 ppm air the gradient is
// enormous and a barely-cracked pore feeds the whole leaf, which is why Pandoran
// flora can be enormous and still spend almost no water.

export type World = "earth" | "pandora";

/** Ambient CO2 in ppm. */
export const CO2_EARTH = 425;
export const CO2_PANDORA = 200_000;

/** Total atmospheric pressure in kPa — Pandora's air is denser than Earth's. */
export const PRESSURE: Record<World, number> = { earth: 101.3, pandora: 120.0 };

/**
 * Ratio of intercellular to ambient CO2 that a leaf defends. C3 plants hold
 * C_i/C_a near 0.7; when ambient CO2 is overwhelming, the leaf lets the ratio
 * fall because it no longer needs to defend anything.
 */
function ciRatio(ambientPpm: number): number {
  if (ambientPpm <= 1_000) return 0.7;
  // Above saturation the leaf stops chasing the gradient; the ratio decays
  // toward a floor as ambient climbs into the percent range.
  const decades = Math.log10(ambientPpm / 1_000);
  return Math.max(0.25, 0.7 - 0.16 * decades);
}

/**
 * Diffusion of a gas scales inversely with total pressure (Chapman-Enskog), so
 * Pandora's denser air slows exchange by about 17% and thickens the still layer
 * over a broad leaf.
 */
function diffusionFactor(world: World): number {
  return PRESSURE.earth / PRESSURE[world];
}

export interface ExchangeResult {
  /** Net assimilation, µmol CO2 m⁻² s⁻¹. */
  assimilation: number;
  /** Transpiration, mmol H2O m⁻² s⁻¹. */
  transpiration: number;
  /** Intrinsic water-use efficiency: carbon won per unit of pore opened. */
  intrinsicWue: number;
  /** Instantaneous water-use efficiency: carbon won per water spent. */
  waterPerCarbon: number;
  /** Whether the leaf is carbon-saturated at this aperture. */
  saturated: boolean;
}

/**
 * Run the trade once.
 *
 * @param world       which atmosphere (sets pressure and diffusion)
 * @param ambientPpm  ambient CO2 in ppm
 * @param gs          stomatal conductance to water vapour, mol m⁻² s⁻¹
 * @param vpd         vapour-pressure deficit, kPa
 */
export function exchange(
  world: World,
  ambientPpm: number,
  gs: number,
  vpd: number,
): ExchangeResult {
  const df = diffusionFactor(world);
  const ratio = ciRatio(ambientPpm);
  const gradient = ambientPpm * (1 - ratio); // C_a − C_i, in ppm (= µmol/mol)

  // A = (g_s / 1.6) · (C_a − C_i). g_s in mol m⁻² s⁻¹ and the gradient in
  // µmol/mol give µmol m⁻² s⁻¹ directly.
  const rawAssimilation = ((gs * df) / 1.6) * gradient;

  // Carboxylation cannot outrun the enzyme however wide the door opens. Ceiling
  // set near a well-fed C3 leaf's maximum rate.
  const VCMAX = 45;
  const assimilation = (VCMAX * rawAssimilation) / (VCMAX + rawAssimilation);
  const saturated = rawAssimilation > VCMAX * 1.2;

  // E = g_tw · VPD / P. Water vapour leaves through the same pore, undiscounted.
  const transpiration = gs * df * (vpd / PRESSURE[world]) * 1000;

  return {
    assimilation,
    transpiration,
    intrinsicWue: gs > 0 ? assimilation / gs : 0,
    waterPerCarbon: assimilation > 0 ? transpiration / assimilation : 0,
    saturated,
  };
}

/**
 * Woodward's inverse relation between stomatal density and the CO2 a leaf grew
 * in — the basis for reading paleo-CO2 off fossil leaves. Returned as pores per
 * square millimetre, on an Earth-leaf baseline.
 */
export function stomatalDensity(ambientPpm: number): number {
  const density = 320 * (280 / ambientPpm) ** 0.32;
  return Math.max(4, Math.round(density));
}
