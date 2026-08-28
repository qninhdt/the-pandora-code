// The moisture arithmetic behind RainShadowTransect, kept separate so the figure
// file stays lean. The chapter has already argued that a slow spin widens the
// wet belt; this is the follow-up question the prose raises and never settles —
// *where*, then, does Pandora keep its dry country? The answer is that dryness on
// this moon is not a latitude band you can point to from orbit. It is made
// locally, one ridge at a time, wherever a mountain range stands across a sea
// wind. The reader raises the range and slides it poleward and watches two
// separate mechanisms compete: the circulation that supplies the moisture, and
// the orography that steals it.
//
// The Pandoran twist is the lapse rate. Gentler gravity and heavier, heat-richer
// air mean rising air cools more slowly, so the same 2,600 m ridge that would
// wring an Earthly airstream dry barely troubles a Pandoran one. Combined with a
// wet belt that reaches twice as far, that is why the note's Pandoran dry lands
// come out as narrow high-latitude grasslands behind ridges rather than as an
// Earth-style subtropical desert empire.
//
// SOURCED (research note): Pandora's surface gravity is 0.8 g; its air is ~20%
// denser at a lower total pressure (~0.9 atm); the note's own lapse-rate argument
// is Γ ∝ g / c_p with both terms pushing Pandora below Earth; the slower spin
// widens the Hadley cell so the wet ascending belt reaches ~±20-22° and the dry
// descending branch is pushed to ~45-50° instead of Earth's 30°; deserts are
// "restricted to narrow, high-latitude continental interior rain shadows"; the
// Upper Plains are a semi-arid grassland ringed by mountains on three sides; the
// dense atmosphere transports heat poleward so efficiently that the equator-to-
// pole gradient is strongly flattened.
//
// CHOSEN FOR ILLUSTRATION: the 1.25× specific-heat ratio (the note asserts the
// direction, never a number), the sea-air temperature profiles, the background
// supply curve, and the constants converting condensate to centimetres of annual
// rain. Ridge height and latitude are the reader's dials because canon fixes
// neither.

export type World = "earth" | "pandora";

interface WorldPhysics {
  /** Dry adiabatic lapse rate, °C per km. */
  dryLapse: number;
  /** Surface pressure, kPa. */
  surfaceKpa: number;
  /** Pressure scale height, km. */
  scaleHeightKm: number;
  /** Latitude where the Hadley cell's dry branch sinks, degrees. */
  cellEdge: number;
  /** Sea-air temperature at the equator, °C. */
  equatorC: number;
  /** °C the sea air loses per degree of latitude — the meridional gradient. */
  gradient: number;
}

// Earth: g/c_p with g = 9.81 m/s² and dry-air c_p ≈ 1005 J/kg/K, a cell sinking
// at 30°, and the sharp equator-to-pole gradient a thin atmosphere permits.
// Pandora: the same lapse ratio at 0.8 g with a heat capacity 1.25× Earth's, a
// cell sinking near 48°, and a gradient flattened by the thick-air flywheel.
export const PHYSICS: Record<World, WorldPhysics> = {
  earth: {
    dryLapse: 9.8,
    surfaceKpa: 101,
    scaleHeightKm: 8.4,
    cellEdge: 30,
    equatorC: 27,
    gradient: 0.42,
  },
  pandora: {
    dryLapse: (9.8 * 0.8) / 1.25,
    surfaceKpa: 90,
    scaleHeightKm: 7.8,
    cellEdge: 48,
    equatorC: 28,
    gradient: 0.2,
  },
};

/** Saturated air cools at roughly 56% of the dry rate; latent heat pays the rest. */
const MOIST_FRACTION = 0.56;
/** Dew point falls at roughly a fifth of the dry rate during unsaturated ascent. */
const DEWPOINT_FRACTION = 0.18;
/** Centimetres of annual rain per g/kg of water the rising air is forced to drop. */
const RAIN_PER_GRAM = 19;
/** Background rain, cm/yr, under the rising branch of the cell. */
const BELT_RAIN_CM = 320;
/** Background rain, cm/yr, directly under the descending dry branch. */
const SUBSIDENCE_RAIN_CM = 32;
/** Background rain, cm/yr, in the mid-latitude storm belt beyond the cell. */
const STORM_BELT_RAIN_CM = 105;

/** Saturation vapour pressure over water, hPa (Magnus form). */
function saturationHpa(tempC: number): number {
  return 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5));
}

/** Saturation mixing ratio, g of water per kg of dry air. */
function saturationMixing(tempC: number, pressureKpa: number): number {
  const es = saturationHpa(tempC);
  return (622 * es) / Math.max(pressureKpa * 10 - es, 1);
}

/** Dew point, °C, for a temperature and relative humidity (0-1). */
function dewPoint(tempC: number, rh: number): number {
  const ln = Math.log(Math.max(rh, 0.02) * (saturationHpa(tempC) / 6.112));
  return (243.5 * ln) / (17.67 - ln);
}

/**
 * Background rainfall the circulation delivers to this latitude before any
 * mountain interferes: wet under the cell's rising branch, driest under its
 * sinking edge, partly recovered in the storm belt beyond it.
 */
function beltSupplyCm(world: World, lat: number): number {
  const { cellEdge } = PHYSICS[world];
  const wetTo = cellEdge * 0.45; // the broad rainy core of the ascending branch
  if (lat <= wetTo) return BELT_RAIN_CM;
  if (lat <= cellEdge) {
    const f = (lat - wetTo) / (cellEdge - wetTo);
    return BELT_RAIN_CM + (SUBSIDENCE_RAIN_CM - BELT_RAIN_CM) * f ** 0.7;
  }
  const f = Math.min(1, (lat - cellEdge) / 22);
  return SUBSIDENCE_RAIN_CM + (STORM_BELT_RAIN_CM - SUBSIDENCE_RAIN_CM) * f;
}

/** Sea-air temperature at this latitude's windward coast, °C. */
function coastTempC(world: World, lat: number): number {
  const { equatorC, gradient } = PHYSICS[world];
  return equatorC - gradient * lat;
}

export interface TransectResult {
  /** Background rainfall the circulation supplies here, cm/yr. */
  supplyCm: number;
  /** Sea-air temperature at the windward coast, °C. */
  coastC: number;
  /** Height at which the rising air saturates and cloud forms, km. */
  cloudBaseKm: number;
  /** Air temperature at the ridge crest, °C. */
  ridgeC: number;
  /** Air temperature on the lee plain after descending, °C. */
  leeC: number;
  /** Annual rainfall on the windward flank, cm. */
  windwardCm: number;
  /** Annual rainfall on the lee plain, cm. */
  leeCm: number;
  /** Relative humidity of the air arriving on the lee plain, 0-1. */
  leeRh: number;
  verdict: "wetBoth" | "gentle" | "grassland" | "desert";
}

/**
 * Run one transect: sea wind onshore, one range, one lee plain.
 *
 * @param world which lapse rate, cell width, and gradient to use.
 * @param ridgeKm crest height above the plains, km.
 * @param lat absolute latitude of the transect, degrees.
 */
export function runTransect(world: World, ridgeKm: number, lat: number): TransectResult {
  const p = PHYSICS[world];
  const supplyCm = beltSupplyCm(world, lat);
  const coastC = coastTempC(world, lat);

  // Wetter latitudes hand the range moister air to work with.
  const arrivingRh = Math.min(0.95, 0.6 + supplyCm / 1100);

  // Rising unsaturated air cools faster than its dew point falls; where the two
  // meet is cloud base.
  const spread = coastC - dewPoint(coastC, arrivingRh);
  const cloudBaseKm = spread / (p.dryLapse * (1 - DEWPOINT_FRACTION));
  const liftedKm = Math.max(0, ridgeKm - cloudBaseKm);

  const cloudBaseC = coastC - p.dryLapse * Math.min(ridgeKm, cloudBaseKm);
  const ridgeC = cloudBaseC - p.dryLapse * MOIST_FRACTION * liftedKm;
  const cloudBaseKpa = p.surfaceKpa * Math.exp(-Math.min(ridgeKm, cloudBaseKm) / p.scaleHeightKm);
  const ridgeKpa = p.surfaceKpa * Math.exp(-ridgeKm / p.scaleHeightKm);

  // Water the cloud is forced to drop: what the air held when it saturated, minus
  // what it can still hold at the colder, thinner crest.
  const condensate =
    liftedKm > 0
      ? Math.max(0, saturationMixing(cloudBaseC, cloudBaseKpa) - saturationMixing(ridgeC, ridgeKpa))
      : 0;
  const windwardCm = supplyCm + condensate * RAIN_PER_GRAM;

  // The spent air sinks the far side, warming at the full dry rate all the way
  // down, so it arrives hotter than it left the sea and thirstier than it has
  // ever been. That thirst, not the ridge itself, is what dries the lee.
  const leeC = ridgeC + p.dryLapse * ridgeKm;
  const carried =
    liftedKm > 0
      ? saturationMixing(ridgeC, ridgeKpa)
      : saturationMixing(coastC, p.surfaceKpa) * arrivingRh;
  const leeRh = Math.min(1, carried / saturationMixing(leeC, p.surfaceKpa));
  const leeCm = supplyCm * leeRh ** 2.2;

  let verdict: TransectResult["verdict"];
  if (leeCm >= 150) verdict = "wetBoth";
  else if (leeCm >= 60) verdict = "gentle";
  else if (leeCm >= 25) verdict = "grassland";
  else verdict = "desert";

  return {
    supplyCm,
    coastC,
    cloudBaseKm,
    ridgeC,
    leeC,
    windwardCm,
    leeCm,
    leeRh,
    verdict,
  };
}
