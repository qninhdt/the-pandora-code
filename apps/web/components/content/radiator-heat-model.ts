// The heat-balance arithmetic behind RadiatorHeatLedger.
//
// An animal's temperature is a bank account, not a property:
//
//   dH/dt = M - (C + R + E)
//
// metabolic production in, convection plus radiation plus evaporation out. The body
// holds steady only while the outflows sum to the inflow.
//
// The useful question is therefore not "how hot is it" but "how hard can it work
// and still break even". That number — sustainable effort, in multiples of resting
// metabolism — is what this model computes, and it is the Heat-Dissipation-Limit
// hypothesis made concrete: sustained power is capped by the radiators, not by the
// muscles or the gut. Above that cap an animal is on a clock, and the model reports
// how long the clock runs before its core has risen two degrees.
//
// Heat crosses two resistances in series: core to skin through tissue, then skin to
// air. The inner one is under the animal's control — open the peripheral
// circulation and a thin bare appendage becomes a short circuit to the outside;
// clamp it down and the same appendage becomes insulation. So skin temperature is
// solved rather than assumed, as the value where inward flow equals outward flow.
//
// The outer resistance carries the Pandoran twist. Forced convection enters through
// the Reynolds number, so the coefficient runs roughly as rho^0.7 v^0.6: denser air
// strips heat faster at the same speed. On a moon where near-saturated air has
// already taken evaporation off the table, that exponent is the whole margin.
//
// Metabolic rate scales as mass^0.75. The coefficients reproduce plausible
// large-vertebrate values; canon publishes no metabolic rate, no core temperature,
// and no radiator area for any native species, so these outputs are the shape of
// the constraint rather than measurements of an animal. Every visible string lives
// in the component's translations.

/** Stefan-Boltzmann constant, W/m^2/K^4. */
export const SIGMA = 5.67e-8;
/** Emissivity of biological surfaces. */
export const EMISSIVITY = 0.96;
/** Latent heat of vaporization of water near 30 C, J/g. */
export const LATENT_HEAT = 2430;
/** Earth sea-level air density, kg/m^3. */
export const EARTH_DENSITY = 1.225;
/** Canonical Pandoran lowland air density, kg/m^3. */
export const PANDORA_DENSITY = 1.47;
/** Assumed core temperature, C. Canon states none for any native species. */
export const CORE_C = 37.5;
/** Specific heat of vertebrate tissue, J/kg/K. */
const TISSUE_SPECIFIC_HEAT = 3470;
/** Core rise, in C, that ends a sprint. */
export const SPRINT_BUDGET_C = 2;

export type RegimeKey = "rainforestChase" | "eclipseTotality" | "montaneWind";

export const REGIMES: RegimeKey[] = ["rainforestChase", "eclipseTotality", "montaneWind"];

export interface Regime {
  /** Ambient air temperature, C. */
  airC: number;
  /** Relative humidity, 0-1. */
  humidity: number;
  /** Air speed over the skin, m/s — locomotion plus wind. */
  windMs: number;
  /** Effective radiant sky temperature, C. */
  skyC: number;
  /** The effort the regime implies, as a multiple of resting metabolism. */
  effort: number;
}

export const REGIME_STATE: Record<RegimeKey, Regime> = {
  // Flat-out pursuit through near-saturated canopy air at midday.
  rainforestChase: { airC: 31, humidity: 0.93, windMs: 9, skyC: 27, effort: 14 },
  // Polyphemus totality: insolation gone, air falling, cold downdraught.
  eclipseTotality: { airC: 19, humidity: 0.95, windMs: 4, skyC: 4, effort: 1.6 },
  // The Hallelujah zone: cold, saturated mist, hard wind shear.
  montaneWind: { airC: 5, humidity: 0.95, windMs: 12, skyC: -8, effort: 3 },
};

/** Saturation vapour pressure of water at t degrees C, mmHg (Magnus form). */
export function saturationVapourPressure(tempC: number): number {
  const kPa = 0.61094 * Math.exp((17.625 * tempC) / (tempC + 243.04));
  return kPa * 7.50062;
}

export function vapourPressureDeficit(skinC: number, airC: number, humidity: number): number {
  return saturationVapourPressure(skinC) - humidity * saturationVapourPressure(airC);
}

/**
 * Body-surface area from mass by Meeh's allometry, m^2. The coefficient sits in the
 * usual range for a large-bodied terrestrial vertebrate.
 */
export function bodyArea(massKg: number): number {
  return 0.11 * massKg ** (2 / 3);
}

/** Resting metabolic heat production, W, from Kleiber-style mass scaling. */
export function restingMetabolism(massKg: number): number {
  return 3.4 * massKg ** 0.75;
}

/**
 * Forced-convection coefficient, W/m^2/K. Reynolds carries density and speed, and
 * the Nusselt correlation turns that into roughly rho^0.7 v^0.6 for a
 * cylinder-like body in cross-flow.
 */
export function convectionCoefficient(densityKgM3: number, windMs: number): number {
  return 6.2 * (densityKgM3 / EARTH_DENSITY) ** 0.7 * Math.max(windMs, 0.4) ** 0.6;
}

/**
 * Core-to-skin conductance, W/K. Trunk hide is a poor conductor; a thin, bare,
 * fully perfused radiator runs so close to blood temperature that the air becomes
 * the limiting resistance rather than the tissue.
 */
export function bodyConductance(area: number, openFraction: number): number {
  const hideConductance = 5.5; // W/m^2/K through insulated trunk
  const radiatorConductance = 900; // W/m^2/K through an open vascular radiator
  return area * (1 - openFraction) * hideConductance + area * openFraction * radiatorConductance;
}

/**
 * How wet the animal lets its surface become. Armoured, leathery hide does not
 * sweat freely; surface moisture is recruited only once the skin is genuinely hot,
 * which is why evaporation contributes almost nothing in the cold.
 */
export function skinWetness(skinC: number): number {
  return Math.min(1, Math.max(0.02, (skinC - 32) / 4));
}

export interface SkinFlow {
  convection: number;
  radiation: number;
  evaporation: number;
  total: number;
  vpd: number;
}

/** Skin-to-air heat flow at a given skin temperature, W. */
function outwardFlow(skinC: number, r: Regime, area: number, hc: number): SkinFlow {
  const convection = hc * area * (skinC - r.airC);
  const radiation = EMISSIVITY * SIGMA * area * ((skinC + 273.15) ** 4 - (r.skyC + 273.15) ** 4);
  const vpd = vapourPressureDeficit(skinC, r.airC, r.humidity);
  const evaporation = Math.max(
    0,
    LATENT_HEAT * 0.0024 * skinWetness(skinC) * area * Math.max(0, vpd),
  );
  return { convection, radiation, evaporation, total: convection + radiation + evaporation, vpd };
}

/**
 * Skin settles where flow through tissue equals flow to the air. Both sides are
 * monotone in skin temperature, so bisection converges cleanly and
 * deterministically — same answer on server and client, no randomness.
 */
function solveSkinTemperature(r: Regime, area: number, hc: number, bodyK: number): number {
  let lo = r.airC - 15;
  let hi = CORE_C;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (bodyK * (CORE_C - mid) > outwardFlow(mid, r, area, hc).total) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export type BalanceGrade = "overheating" | "steady" | "mustConserve";
export type LossPath = "convection" | "radiation" | "evaporation";

export interface LedgerInput {
  regime: RegimeKey;
  massKg: number;
  /** Share of body area given over to vascular radiators, 0-1. */
  radiatorFraction: number;
  densityKgM3: number;
  /** Effort as a multiple of resting metabolism. */
  effort: number;
}

export interface HeatLedger {
  /** Resting metabolic heat production, W. */
  resting: number;
  /** Heat production at the chosen effort, W. */
  production: number;
  /** Dissipation with every radiator wide open — the ceiling, W. */
  ceiling: number;
  /** The three pathways at that wide-open state. */
  open: SkinFlow;
  /** Skin temperature wide open, C. */
  skinC: number;
  /** Effort the radiators can support indefinitely, as a multiple of resting. */
  sustainableEffort: number;
  /** Production minus the ceiling, W. Positive means a clock is running. */
  netStorage: number;
  /** Core temperature change, C per hour, once the ceiling is exceeded. */
  coreDriftPerHour: number;
  /** Minutes of this effort before the core has risen SPRINT_BUDGET_C. */
  sprintMinutes: number;
  /** Convective coefficient, W/m^2/K. */
  hc: number;
  /** The same coefficient in Earth-density air, for comparison. */
  hcEarth: number;
  /** Whole-body surface area, m^2. */
  area: number;
  balance: BalanceGrade;
  dominantLoss: LossPath;
}

export function runLedger(input: LedgerInput): HeatLedger {
  const r = REGIME_STATE[input.regime];
  const area = bodyArea(input.massKg);
  const resting = restingMetabolism(input.massKg);
  const production = resting * input.effort;
  const hc = convectionCoefficient(input.densityKgM3, r.windMs);

  const openK = bodyConductance(area, input.radiatorFraction);
  const skinC = solveSkinTemperature(r, area, hc, openK);
  const open = outwardFlow(skinC, r, area, hc);

  const netStorage = production - open.total;
  const coreDriftPerHour = (netStorage / (input.massKg * TISSUE_SPECIFIC_HEAT)) * 3600;
  const sprintMinutes =
    coreDriftPerHour > 0 ? (SPRINT_BUDGET_C / coreDriftPerHour) * 60 : Number.POSITIVE_INFINITY;

  const losses: Array<[LossPath, number]> = [
    ["convection", open.convection],
    ["radiation", open.radiation],
    ["evaporation", open.evaporation],
  ];
  const dominantLoss = losses.reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  // Above the ceiling the core climbs and the animal is on a clock. Far below it,
  // a wide-open body would shed several times what it makes — so the radiators are
  // not an option here, they are a leak that has to be shut.
  const balance: BalanceGrade =
    netStorage > 0 ? "overheating" : production < open.total * 0.6 ? "mustConserve" : "steady";

  return {
    resting,
    production,
    ceiling: open.total,
    open,
    skinC,
    sustainableEffort: open.total / resting,
    netStorage,
    coreDriftPerHour,
    sprintMinutes,
    hc,
    hcEarth: convectionCoefficient(EARTH_DENSITY, r.windMs),
    area,
    balance,
    dominantLoss,
  };
}

export const MASS_MIN = 50;
export const MASS_MAX = 10000;
export const RADIATOR_MIN = 0;
export const RADIATOR_MAX = 0.25;
export const DENSITY_MIN = 1.0;
export const DENSITY_MAX = 1.8;
export const EFFORT_MIN = 1;
export const EFFORT_MAX = 25;

/** Bar length for a heat flow, normalized against the largest flow shown. */
export function barFraction(value: number, peak: number): number {
  if (peak <= 0) return 0;
  return Math.min(1, Math.max(0, value / peak));
}
