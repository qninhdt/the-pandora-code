// Can a vent field feed the animal standing on it? The question is arithmetic, and
// the arithmetic is brutal.
//
// Chemolithoautotrophs at a vent fix carbon at rates comparable to a coral reef or
// a rainforest - 0.1 to 2.0 kg C per m² per year - which is why the imagery is so
// misleading. Productivity per square metre is genuinely high. The problem is the
// number of square metres: an individual vent field covers 10² to 10⁴ m², a few
// hundred square metres to a few hectares, and globally all active venting adds up
// to under 50 km².
//
// Then each trophic step throws most of it away:
//
//   P_n = P_1 · TE^(n-1)
//
// with TE near 0.10. Bacteria to tubeworms to crabs to a top predator is four
// levels, so a thousandth of the fixed carbon is left. Multiply a small area by a
// thousandth and the supportable apex biomass is measured in kilograms, which is
// exactly what is found: zoarcid eelpouts under a kilogram, bythograeid crabs
// under half of one, and Vulcanoctopus hydrothermalis at under 200 grams. Nothing
// large lives there permanently, and nothing large could.
//
// Demand is estimated from Kleiber scaling. Field metabolic rate for an active
// marine predator runs near 3x resting, and carbon demand follows from an
// assimilation efficiency around 0.7 for a carnivore.
//
//   P_rest ≈ 4 · M^0.75  W      (marine ectotherm scaling, W for M in kg)
//
// Deterministic; no randomness.

/** Kleiber prefactor for a marine animal at moderate temperature (W kg^-0.75). */
const RESTING_PREFACTOR = 4;

/** Field metabolic rate as a multiple of resting, for an active hunter. */
const ACTIVITY_MULTIPLIER = 3;

/** Energy density of prey tissue (J per kg wet mass). */
const PREY_ENERGY_DENSITY = 4.5e6;

/** Fraction of ingested energy actually assimilated by a carnivore. */
const ASSIMILATION_EFFICIENCY = 0.7;

/** Wet prey mass per kilogram of fixed carbon. */
const WET_MASS_PER_KG_CARBON = 10;

const SECONDS_PER_YEAR = 31_557_600;

export interface VentBudget {
  /** Carbon fixed by the whole field each year (kg C). */
  fixedCarbonKgYr: number;
  /** Carbon reaching the apex trophic level each year (kg C). */
  apexCarbonKgYr: number;
  /** Prey biomass that represents, per year (kg wet). */
  apexPreyKgYr: number;
  /** Annual carbon demand of the stated pack (kg C). */
  packDemandKgYr: number;
  /** Supply divided by demand. Below 1, the field cannot pay. */
  supplyRatio: number;
  /** Largest single resident this field could support year-round (kg). */
  maxResidentMassKg: number;
  /** Field area that would be needed to cover the pack (m²). */
  requiredAreaM2: number;
}

/** Annual carbon a single animal of this mass must eat (kg C). */
export function annualCarbonDemand(massKg: number): number {
  const fieldMetabolicW = RESTING_PREFACTOR * massKg ** 0.75 * ACTIVITY_MULTIPLIER;
  const energyPerYear = fieldMetabolicW * SECONDS_PER_YEAR;
  const preyKg = energyPerYear / (PREY_ENERGY_DENSITY * ASSIMILATION_EFFICIENCY);
  return preyKg / WET_MASS_PER_KG_CARBON;
}

export function ventBudget(
  areaM2: number,
  productionKgCPerM2Yr: number,
  trophicLevels: number,
  transferEfficiency: number,
  packCount: number,
  bodyMassKg: number,
): VentBudget {
  const fixedCarbonKgYr = areaM2 * productionKgCPerM2Yr;
  const apexCarbonKgYr = fixedCarbonKgYr * transferEfficiency ** (trophicLevels - 1);
  const packDemandKgYr = packCount * annualCarbonDemand(bodyMassKg);

  // Invert the demand curve to find the biggest animal this supply could keep:
  // demand ∝ M^0.75, so M = (supply / demandPerUnit)^(4/3).
  const demandAtUnitMass = annualCarbonDemand(1);
  const maxResidentMassKg = (apexCarbonKgYr / demandAtUnitMass) ** (4 / 3);

  const carbonPerM2AtApex = productionKgCPerM2Yr * transferEfficiency ** (trophicLevels - 1);

  return {
    fixedCarbonKgYr,
    apexCarbonKgYr,
    apexPreyKgYr: apexCarbonKgYr * WET_MASS_PER_KG_CARBON,
    packDemandKgYr,
    supplyRatio: apexCarbonKgYr / packDemandKgYr,
    maxResidentMassKg,
    requiredAreaM2: packDemandKgYr / carbonPerM2AtApex,
  };
}
