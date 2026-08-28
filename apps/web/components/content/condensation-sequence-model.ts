// A protoplanetary disk sorts its own solids by temperature. Move outward from
// the star and the gas cools; each time it drops past a compound's condensation
// temperature, that compound precipitates out and becomes available as building
// material. A body assembling at a given radius can only be made from whatever
// has already frozen there — which is why the inner Solar System is rock and
// metal and the outer is ice.
//
// The temperature profile is the standard irradiated-disk power law
// T(r) = T0 * r^-q with q ≈ 0.5 for a passively heated flared disk; T0 is set so
// the water snow line lands near 2.7 AU for a solar-luminosity star, matching the
// Solar System's asteroid-belt boundary. Condensation temperatures are the
// equilibrium values at a nominal nebular pressure of ~1e-4 bar.
//
// Solid surface density is expressed relative to the inner-disk rock+metal value:
// crossing the water line roughly triples to quadruples the available solids,
// which is the whole reason giant-planet cores form out there and not in.
// Deterministic; no randomness.

export interface MaterialClass {
  id: string;
  /** Equilibrium condensation temperature, K. */
  condensationK: number;
  /** Fractional contribution to total condensable solids once frozen out. */
  massShare: number;
  /** Token hue for the band. */
  tone: string;
}

// Ordered hottest-condensing first, i.e. innermost-available first. Mass shares
// are fractions of the total condensable inventory of solar-composition gas:
// rock, metal and sulfide together make up a little over a quarter of it, water
// ice nearly half, and the colder ices the rest. So water alone roughly doubles
// the solids available, and the full volatile suite roughly triples them.
export const MATERIALS: MaterialClass[] = [
  { id: "refractoryOxides", condensationK: 1700, massShare: 0.015, tone: "var(--amber)" },
  { id: "silicatesMetal", condensationK: 1400, massShare: 0.2, tone: "var(--foreground)" },
  { id: "sulfidesAlkalis", condensationK: 700, massShare: 0.065, tone: "var(--magenta)" },
  { id: "waterIce", condensationK: 170, massShare: 0.42, tone: "var(--cyan)" },
  { id: "volatileIces", condensationK: 45, massShare: 0.3, tone: "var(--teal)" },
];

/** Exponent of the irradiated-disk temperature profile. */
const PROFILE_EXPONENT = 0.5;

/** Midplane temperature at 1 AU (K), tuned to put the water line near 2.7 AU. */
const T_AT_1AU = 279;

/** Disk temperature at a given orbital radius, in kelvin. */
export function diskTemperature(radiusAu: number): number {
  return T_AT_1AU * radiusAu ** -PROFILE_EXPONENT;
}

/** Orbital radius at which the disk reaches a given temperature, in AU. */
export function radiusForTemperature(kelvin: number): number {
  return (T_AT_1AU / kelvin) ** (1 / PROFILE_EXPONENT);
}

/** The water snow line — the boundary the chapter cares about most. */
export const SNOW_LINE_AU = radiusForTemperature(170);

export interface DiskSample {
  radiusAu: number;
  temperatureK: number;
  /** Material classes already condensed at this radius. */
  available: MaterialClass[];
  /** Condensable solids relative to the innermost rock-and-metal-only value. */
  solidEnrichment: number;
  /** Ice as a fraction of the condensed solids, 0–1. */
  iceFraction: number;
  /** Mean uncompressed density a body built from these solids would have, g/cm³. */
  bulkDensity: number;
  beyondSnowLine: boolean;
}

/** Representative uncompressed grain densities, g/cm³. */
const DENSITY: Record<string, number> = {
  refractoryOxides: 3.9,
  silicatesMetal: 4.3,
  sulfidesAlkalis: 3.6,
  waterIce: 0.94,
  volatileIces: 0.8,
};

const ICE_IDS = new Set(["waterIce", "volatileIces"]);

/**
 * What a body assembling at this radius has to work with. The density is the
 * volume-weighted mean of the available grain densities — uncompressed, so it
 * sits below the self-compressed density a finished planet would show.
 */
export function sampleDisk(radiusAu: number): DiskSample {
  const temperatureK = diskTemperature(radiusAu);
  const available = MATERIALS.filter((m) => temperatureK <= m.condensationK);

  const rockOnly = MATERIALS.filter((m) => !ICE_IDS.has(m.id)).reduce(
    (sum, m) => sum + m.massShare,
    0,
  );
  const totalMass = available.reduce((sum, m) => sum + m.massShare, 0);
  const iceMass = available.filter((m) => ICE_IDS.has(m.id)).reduce((s, m) => s + m.massShare, 0);

  // Volume-weighted mean: mass over summed mass/density.
  const volume = available.reduce((sum, m) => sum + m.massShare / DENSITY[m.id], 0);

  return {
    radiusAu,
    temperatureK,
    available,
    solidEnrichment: totalMass / rockOnly,
    iceFraction: totalMass > 0 ? iceMass / totalMass : 0,
    bulkDensity: volume > 0 ? totalMass / volume : 0,
    beyondSnowLine: radiusAu >= SNOW_LINE_AU,
  };
}
