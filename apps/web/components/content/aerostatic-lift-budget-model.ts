// Aerostatic lift as a mass budget.
//
// Lift is not a property of a light gas; it is the density difference between
// the enclosed gas and the air it displaces, bought by the cubic metre:
//
//   gross lift = V * (rho_air - rho_gas)
//
// Because an ideal gas at the same pressure and temperature has density in
// proportion to its molar mass, rho_gas = rho_air * (M_gas / M_air). That single
// substitution is what collapses the popular "hydrogen lifts twice as much as
// helium" claim: what matters is how far each gas sits below the air, not how
// far it sits above zero.
//
// The other half of the budget is the skin. Enclosed volume grows as the cube of
// linear size while envelope area grows as the square, so overhead outruns lift
// at small sizes and lift outruns overhead at large ones. The two power laws
// cross at one diameter, below which a gasbag cannot lift even itself. That
// crossing is the reason there are no sparrow-sized balloon animals.
//
// Deterministic; no randomness.

/** Pandoran surface air density, kg/m^3 - about a fifth denser than Earth's. */
export const RHO_AIR_PANDORA = 1.47;
/** Earth sea-level air density, kg/m^3, for the comparison column. */
export const RHO_AIR_EARTH = 1.225;
/** Pandoran surface gravity, m/s^2. */
export const G_PANDORA = 7.85;

// Mean molar mass of each air, g/mol. Pandora's follows from its published
// composition - roughly half nitrogen, a fifth to a quarter oxygen, a sixth
// carbon dioxide and a startling twentieth xenon - and the xenon is why the
// mixture is so much heavier than Earth's despite the moon's thinner column.
const M_AIR_PANDORA = 36.2;
const M_AIR_EARTH = 28.96;

export type LiftingGas = "hydrogen" | "helium" | "methane" | "ammonia" | "hotAir";

/** Molar mass in g/mol. Hot air is modelled below as a temperature effect. */
const M_GAS: Record<Exclude<LiftingGas, "hotAir">, number> = {
  hydrogen: 2.016,
  helium: 4.003,
  methane: 16.04,
  ammonia: 17.03,
};

/** Hot air at 100 C against ambient at 15 C: density falls as 1/T. */
const HOT_AIR_RATIO = 288.15 / 373.15;

export const LIFTING_GASES: LiftingGas[] = ["hydrogen", "helium", "methane", "ammonia", "hotAir"];

/** Density of a lifting gas at ambient pressure, kg/m^3. */
export function gasDensity(gas: LiftingGas, onPandora: boolean): number {
  const rhoAir = onPandora ? RHO_AIR_PANDORA : RHO_AIR_EARTH;
  if (gas === "hotAir") return rhoAir * HOT_AIR_RATIO;
  const mAir = onPandora ? M_AIR_PANDORA : M_AIR_EARTH;
  return rhoAir * (M_GAS[gas] / mAir);
}

/** Specific lift: kilograms lifted per cubic metre of envelope. */
export function specificLift(gas: LiftingGas, onPandora: boolean): number {
  const rhoAir = onPandora ? RHO_AIR_PANDORA : RHO_AIR_EARTH;
  return rhoAir - gasDensity(gas, onPandora);
}

export type EnvelopeMaterial = "film" | "goldbeater" | "collagen" | "mesoglea";

export const ENVELOPE_MATERIALS: EnvelopeMaterial[] = [
  "film",
  "goldbeater",
  "collagen",
  "mesoglea",
];

/** Areal density of the envelope wall, kg/m^2. */
const AREAL_DENSITY: Record<EnvelopeMaterial, number> = {
  film: 0.035, // engineered polymer film - the lightest thing anyone has flown
  goldbeater: 0.15, // goldbeater's skin, the gas cells of the historical airships
  collagen: 1.05, // a 1 mm cross-plied collagen laminate - plausibly biological
  mesoglea: 21.0, // a 20 mm hydrated jellyfish mantle - honestly biological
};

// A living aerostat carries more than its skin: gut, gas gland, ballast
// reservoirs, nerve rings and a tentacle curtain. None of it lifts anything.
// Modelled as a fixed multiple of envelope mass, since those structures scale
// with the animal's surface rather than its enclosed volume.
const ORGAN_MULTIPLE = 1.2;

export interface LiftBudget {
  /** Envelope diameter, m. */
  diameter: number;
  /** Enclosed volume, m^3. */
  volume: number;
  /** Envelope surface area, m^2. */
  area: number;
  /** Kilograms lifted per cubic metre. */
  specificLift: number;
  /** Total mass the displaced air can support, kg. */
  grossLift: number;
  /** Mass of the envelope wall itself, kg. */
  envelopeMass: number;
  /** Mass of the non-lifting living structure, kg. */
  organMass: number;
  /** What is left over for gondola, crew and cargo, kg. Negative means grounded. */
  netPayload: number;
  /** Smallest diameter at which this gas and skin can lift themselves, m. */
  minimumDiameter: number;
  /** True when the animal cannot even lift its own tissue. */
  grounded: boolean;
}

export function liftBudget(
  diameter: number,
  gas: LiftingGas,
  material: EnvelopeMaterial,
  onPandora = true,
): LiftBudget {
  const r = diameter / 2;
  const volume = (4 / 3) * Math.PI * r ** 3;
  const area = 4 * Math.PI * r ** 2;
  const dRho = specificLift(gas, onPandora);
  const sigma = AREAL_DENSITY[material];

  const grossLift = volume * dRho;
  const envelopeMass = area * sigma;
  const organMass = envelopeMass * ORGAN_MULTIPLE;
  const netPayload = grossLift - envelopeMass - organMass;

  // V * dRho = A * sigma * (1 + organ) with V = (4/3)pi r^3 and A = 4 pi r^2
  // reduces to r = 3 * sigma * (1 + organ) / dRho.
  const minimumRadius = (3 * sigma * (1 + ORGAN_MULTIPLE)) / dRho;

  return {
    diameter,
    volume,
    area,
    specificLift: dRho,
    grossLift,
    envelopeMass,
    organMass,
    netPayload,
    minimumDiameter: minimumRadius * 2,
    grounded: netPayload <= 0,
  };
}

/** Total non-lifting mass at a diameter - the curve that races gross lift. */
export function overheadMass(diameter: number, material: EnvelopeMaterial): number {
  const area = 4 * Math.PI * (diameter / 2) ** 2;
  return area * AREAL_DENSITY[material] * (1 + ORGAN_MULTIPLE);
}

/** Gross lift at a diameter, kg. */
export function grossLiftAt(diameter: number, gas: LiftingGas, onPandora = true): number {
  const volume = (4 / 3) * Math.PI * (diameter / 2) ** 3;
  return volume * specificLift(gas, onPandora);
}

/** How much more lift hydrogen buys than helium, as a percentage. */
export function hydrogenAdvantagePct(onPandora: boolean): number {
  return (specificLift("hydrogen", onPandora) / specificLift("helium", onPandora) - 1) * 100;
}

/**
 * How many Tlalim households a payload supports, at roughly two tonnes each -
 * the people, their share of the gondola, their water and their trade goods.
 */
export function householdEquivalent(payloadKg: number): number {
  return Math.max(0, Math.floor(payloadKg / 2000));
}
