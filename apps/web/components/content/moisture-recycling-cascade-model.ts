// The arithmetic behind MoistureRecyclingCascade. A rainforest is not merely a
// wet place; it is upstream of its own rain. Air arrives at the coast carrying
// ocean-evaporated vapour, rains a share of it out, and the forest underneath
// returns most of that water to the column by transpiring it. Repeat inland and
// the rain falling a thousand kilometres from any sea is mostly water that has
// already fallen once — four to six times over, in the Amazon's case.
//
// The model is a deliberately simple discrete cascade, one bookkeeping step per
// segment of fetch:
//
//   P_i  = W_i * rainout                       rain wrung out of the column
//   E_i  = P_i * return(segment)               what the surface sends back up
//   W_i+1 = W_i - P_i + E_i                    the column moving inland
//
// and every millimetre of E is tagged "recycled" from then on, so the recycled
// share of each rainfall bar is tracked rather than assumed. The recycling ratio
// the literature reports is exactly that share:
//
//   rho = P_recycled / P_total
//
// SOURCED (research note): Amazon recycling ratio 35-50% over 4-6 serial cycles,
// established by stable-isotope tracking and tagged-moisture models; Congo
// 25-35%; global land ~30-40%; canopy transpiration is 60-75% of tropical ET
// with interception 15-25% and soil 5-10%; deforestation breaks the cascade,
// raising the lifting condensation level and drying the interior downwind;
// Earth's total precipitable water averages ~25 mm; Pandora's Bowen ratio sits
// near 0.15-0.25 because high leaf-area index compensates for the stomatal
// closure its CO2-rich air permits.
//
// CHOSEN FOR ILLUSTRATION: the per-segment rainout fraction, the segment length,
// the bare-ground return fraction, and Pandora's slightly fatter starting column
// (warmer, denser air holds more vapour by Clausius-Clapeyron). The note gives
// directions and endpoint ratios, never a per-step schedule, so these are tuned
// so that an intact Earth fetch lands inside the measured 35-50% band.

export type World = "earth" | "pandora";

export interface WorldMoisture {
  /** Precipitable water in the arriving marine column, mm. */
  columnMm: number;
  /** Share of the column wrung out over one segment of fetch. */
  rainout: number;
  /** Share of rainfall an intact forest returns to the column. */
  forestReturn: number;
  /** Share a cleared segment returns — bare ground evaporates far less. */
  bareReturn: number;
}

// Earth: a 25 mm marine column, a fifth of it rained out per 500 km of fetch, an
// intact canopy returning ~78% of what falls (transpiration plus interception,
// the two large terms), bare ground barely a third of that.
// Pandora: a fatter column (warmer, denser, heavier-humid air), the same rainout
// discipline, and a slightly better return because its low Bowen ratio pushes
// nearly all available energy into latent heat.
export const MOISTURE: Record<World, WorldMoisture> = {
  earth: { columnMm: 25, rainout: 0.2, forestReturn: 0.78, bareReturn: 0.26 },
  pandora: { columnMm: 34, rainout: 0.2, forestReturn: 0.85, bareReturn: 0.3 },
};

/** Kilometres of fetch each cascade step represents. */
export const SEGMENT_KM = 500;

/**
 * Default fetch: eight segments, i.e. 4,000 km — roughly the Atlantic-to-Andes
 * run the Amazon recycling studies measure. At the Earth settings this lands the
 * recycling ratio near 39%, inside the note's measured 35-50% band.
 */
export const DEFAULT_SEGMENTS = 8;

export interface CascadeStep {
  /** 1-based segment index, counting inland from the coast. */
  index: number;
  /** Distance from the coast at the far edge of this segment, km. */
  km: number;
  /** Total rain falling on this segment, mm of column. */
  rainMm: number;
  /** The part of that rain whose water had already fallen upwind. */
  recycledMm: number;
  /** Whether this segment still carries forest. */
  forested: boolean;
}

export interface CascadeResult {
  steps: CascadeStep[];
  /** Recycled share of all rain over the whole fetch, 0-1. */
  recyclingRatio: number;
  /** Rain reaching the deepest interior segment, mm. */
  interiorRainMm: number;
  /** The same figure with the clearing healed, for the cost comparison. */
  interiorRainIntactMm: number;
  /** Fractional shortfall at the interior caused by the clearing, 0-1. */
  interiorShortfall: number;
  verdict: "intact" | "thinning" | "broken";
}

// Walk the column inland one segment at a time, tracking how much of the water
// it carries is original marine vapour and how much has already rained once.
function runCascade(world: World, segments: number, clearedFrom: number | null): CascadeStep[] {
  const phys = MOISTURE[world];
  let marine = phys.columnMm;
  let recycled = 0;
  const steps: CascadeStep[] = [];

  for (let i = 1; i <= segments; i++) {
    const forested = clearedFrom === null || i < clearedFrom;
    const column = marine + recycled;
    const rain = column * phys.rainout;

    // Rain is drawn from the column in proportion to what the column is made of,
    // so the recycled tag follows the water rather than being reassigned.
    const recycledShare = column > 0 ? recycled / column : 0;
    const rainRecycled = rain * recycledShare;
    const rainMarine = rain - rainRecycled;

    // Whatever the surface sends back up is recycled water by definition.
    const returned = rain * (forested ? phys.forestReturn : phys.bareReturn);

    marine -= rainMarine;
    recycled = recycled - rainRecycled + returned;

    steps.push({
      index: i,
      km: i * SEGMENT_KM,
      rainMm: rain,
      recycledMm: rainRecycled,
      forested,
    });
  }

  return steps;
}

/**
 * Run the moisture cascade for a fetch of `segments` forest segments, optionally
 * clear-cutting everything from segment `clearedFrom` inland, and report both the
 * recycling ratio and what the clearing costs the deep interior.
 */
export function runRecycling(
  world: World,
  segments: number,
  clearedFrom: number | null,
): CascadeResult {
  const steps = runCascade(world, segments, clearedFrom);
  const intact = clearedFrom === null ? steps : runCascade(world, segments, null);

  const totalRain = steps.reduce((s, x) => s + x.rainMm, 0);
  const totalRecycled = steps.reduce((s, x) => s + x.recycledMm, 0);

  const interiorRainMm = steps[steps.length - 1]?.rainMm ?? 0;
  const interiorRainIntactMm = intact[intact.length - 1]?.rainMm ?? 0;
  const interiorShortfall =
    interiorRainIntactMm > 0 ? 1 - interiorRainMm / interiorRainIntactMm : 0;

  // Thresholds are presentational: they name what the reader is looking at rather
  // than claiming a measured tipping point.
  let verdict: CascadeResult["verdict"] = "intact";
  if (interiorShortfall > 0.35) verdict = "broken";
  else if (interiorShortfall > 0.1) verdict = "thinning";

  return {
    steps,
    recyclingRatio: totalRain > 0 ? totalRecycled / totalRain : 0,
    interiorRainMm,
    interiorRainIntactMm,
    interiorShortfall,
    verdict,
  };
}
