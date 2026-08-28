// The filtration arithmetic behind ExopackFilterBudget, kept separate so the
// component file stays lean. The reader is handed the exo-pack's real design
// problem: the pack carries no oxygen at all, only a finite mass of sorbent, and
// that sorbent has to be divided between two completely different poisons.
// Starve the sulfide bed and the wearer is knocked down at the cell level;
// starve the carbon dioxide scrubber and the wearer drowns in their own breath.
// The see-saw is the whole point — the reader's first instinct is to spend the
// pack on the huge number (seventeen percent carbon dioxide) and that instinct
// kills by the other route. Breathe harder and the window that works narrows
// until, in a bad sulfide haze, it closes completely.
//
// SOURCED (research note): ambient air is ~0.9 atm total, 21-25% oxygen,
// 16-18% carbon dioxide, hydrogen sulfide "far less than 1 percent" and possibly
// hundreds of ppm; the pack is a filter, not a tank — a particulate stage, a
// sulfide adsorption bed, and a scrubber that strips carbon dioxide to trace
// levels (<0.05%); 0.5% carbon dioxide is the occupational limit with no adverse
// effects; filters clog over a roughly two-week cycle, after which the wearer
// suffers "breakthrough".
//
// CHOSEN FOR ILLUSTRATION: the two sorbent efficiency constants, the 1 ppm
// delivered-sulfide rating (canon gives no exposure limit, only an ambient
// bound), the airflow penalty for exertion, and the bed capacity — calibrated so
// an evenly split pack worn at rest lasts the canonical two weeks. Ambient
// sulfide is the reader's slider precisely because canon refuses to pin it down.

export type Demand = "rest" | "work";

/** Total surface pressure, kPa. */
export const AMBIENT_TOTAL_KPA = 90;
/** Oxygen fraction of the raw air, percent — the middle of canon's 21-25%. */
export const AMBIENT_O2_PCT = 23;
/** Carbon dioxide fraction of the raw air, percent. */
export const AMBIENT_CO2_PCT = 17;

/** Delivered carbon dioxide a human tolerates indefinitely, percent. */
export const CO2_LIMIT_PCT = 0.5;
/** The pack's own design goal for delivered carbon dioxide, percent. */
export const CO2_DESIGN_PCT = 0.05;
/** Delivered hydrogen sulfide the pack is rated for, ppm. */
export const H2S_LIMIT_PPM = 1;

/** Breathing flow relative to rest. More flow means less contact time in a bed. */
export const FLOW: Record<Demand, number> = { rest: 1, work: 1.5 };

// Transfer efficiency per unit of bed mass. Sulfide chemisorbs more readily than
// carbon dioxide is scrubbed, so its constant is the larger of the two.
const K_CO2 = 12;
const K_H2S = 16;

// ppm·hours of sulfide a full bed holds before breakthrough. Calibrated so an
// evenly split pack, worn at rest in a typical sulfide haze, reaches the
// two-week service cycle canon gives the exo-pack.
const SULFIDE_BED_CAPACITY = 134_400;

export interface FilterResult {
  /** Delivered carbon dioxide, percent of the breathing mixture. */
  co2Pct: number;
  /** Delivered hydrogen sulfide, ppm. */
  h2sPpm: number;
  /** Delivered oxygen partial pressure, kPa. */
  o2Kpa: number;
  /** Raw ambient oxygen partial pressure, kPa — for comparison. */
  rawO2Kpa: number;
  /** Days until the sulfide bed breaks through. */
  serviceDays: number;
  verdict: "clean" | "pass" | "co2" | "h2s" | "both";
}

/**
 * Run one pack configuration.
 *
 * @param scrubberPct share of the sorbent given to the carbon dioxide scrubber,
 *   0-100; the remainder becomes the hydrogen sulfide bed.
 * @param h2sAmbientPpm ambient hydrogen sulfide, ppm.
 * @param demand how hard the wearer is breathing.
 */
export function filterAir(
  scrubberPct: number,
  h2sAmbientPpm: number,
  demand: Demand,
): FilterResult {
  const flow = FLOW[demand];
  const scrubberMass = Math.min(1, Math.max(0, scrubberPct / 100));
  const bedMass = 1 - scrubberMass;

  // A packed bed's outlet concentration falls exponentially with the number of
  // transfer units it offers: more sorbent, or slower air, means more units.
  const co2Pct = AMBIENT_CO2_PCT * Math.exp((-K_CO2 * scrubberMass) / flow);
  const h2sPpm = h2sAmbientPpm * Math.exp((-K_H2S * bedMass) / flow);

  // Scrubbing out the carbon dioxide does not add a single molecule of oxygen —
  // but it leaves the surviving gases a larger share of the same total pressure,
  // so the oxygen delivered presses very slightly harder than the raw air does.
  const removedFraction = (AMBIENT_CO2_PCT - co2Pct) / 100;
  const o2Kpa = (AMBIENT_O2_PCT / 100 / (1 - removedFraction)) * AMBIENT_TOTAL_KPA;
  const rawO2Kpa = (AMBIENT_O2_PCT / 100) * AMBIENT_TOTAL_KPA;

  const serviceDays =
    h2sAmbientPpm > 0
      ? (SULFIDE_BED_CAPACITY * bedMass) / (h2sAmbientPpm * flow) / 24
      : Number.POSITIVE_INFINITY;

  const co2Breach = co2Pct > CO2_LIMIT_PCT;
  const h2sBreach = h2sPpm > H2S_LIMIT_PPM;
  const verdict: FilterResult["verdict"] = co2Breach
    ? h2sBreach
      ? "both"
      : "co2"
    : h2sBreach
      ? "h2s"
      : co2Pct <= CO2_DESIGN_PCT
        ? "clean"
        : "pass";

  return { co2Pct, h2sPpm, o2Kpa, rawO2Kpa, serviceDays, verdict };
}

/** Format delivered carbon dioxide: percent above a tenth, ppm below it. */
export function formatCo2(pct: number): string {
  return pct >= 0.1 ? `${pct.toFixed(2)}%` : `${Math.round(pct * 10_000)} ppm`;
}

/** Format delivered sulfide: one decimal below 10 ppm, whole numbers above. */
export function formatH2s(ppm: number): string {
  return ppm >= 10 ? `${Math.round(ppm)}` : ppm.toFixed(2);
}
