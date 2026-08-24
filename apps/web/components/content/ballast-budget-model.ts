// Route planning as a spending problem.
//
// A living aerostat changes height by throwing something away. Climbing means
// dumping water; sinking means venting the gas that holds you up. Neither comes
// back in flight. So every course correction is withdrawn from a finite account,
// and a route that looks optimal on a wind chart can still fail because it asks
// for one climb too many.
//
// The wind field is not the same all the way round: each leg of the crossing has
// its own best level, which is exactly why a caravan cannot simply pick one height
// and sleep. The reader assigns a level to every leg and finds out whether the
// account survives the itinerary.

export type Level = "low" | "mid" | "jet";

export const LEVEL_ALTITUDE_KM: Record<Level, number> = { low: 1.5, mid: 6.0, jet: 9.5 };

const ORDER: Level[] = ["low", "mid", "jet"];

/**
 * Eastward ground speed in m/s for each leg at each level. Negative carries the
 * caravan backwards. No single level is good for the whole crossing — the fast
 * layer moves as the caravan travels, which is the whole reason level changes are
 * worth paying for.
 */
export const LEG_WINDS: Record<Level, number>[] = [
  { low: 8, mid: 3, jet: -2 },
  { low: -4, mid: 12, jet: 5 },
  { low: -6, mid: 4, jet: 30 },
  { low: 2, mid: 14, jet: 6 },
  { low: 10, mid: 4, jet: -3 },
];

export const LEG_COUNT = LEG_WINDS.length;
/** Days spent on each leg. */
export const LEG_DAYS = 4;

/** Water carried at departure, in jars the reader can count. */
export const WATER_BUDGET = 6;
/** Lifting gas the colony can spare before it can no longer hold the caravan up. */
export const GAS_BUDGET = 4;

/**
 * Eastward distance to the trading rendezvous, kilometres — roughly three fifths
 * of a Pandoran circuit. Deliberately tight: of the 243 possible itineraries only
 * a handful arrive, and riding the jet the whole way is not one of them.
 */
export const TARGET_KM = 22000;

/** The caravan launches from the low trade layer. */
export const START_LEVEL: Level = "low";

export interface LegResult {
  /** The level actually flown, which may not be the one requested. */
  level: Level;
  /** Whether the requested level was refused for want of water or gas. */
  refused: boolean;
  waterSpent: number;
  gasSpent: number;
  progressKm: number;
}

export interface RoutePlan {
  legs: LegResult[];
  waterUsed: number;
  gasUsed: number;
  distanceKm: number;
  arrived: boolean;
  outcome: "arrived" | "short" | "stranded";
}

/**
 * Cost of moving between levels: two units per rung of the ladder, so a
 * ground-to-jet climb costs twice a ground-to-middle one. Climbing spends water,
 * descending vents gas, and holding a level is free.
 */
export function transitionCost(from: Level, to: Level): { water: number; gas: number } {
  const steps = ORDER.indexOf(to) - ORDER.indexOf(from);
  if (steps > 0) return { water: steps * 2, gas: 0 };
  if (steps < 0) return { water: 0, gas: -steps * 2 };
  return { water: 0, gas: 0 };
}

const legKm = (speed: number) => (speed * LEG_DAYS * 86400) / 1000;

export function planRoute(levels: Level[]): RoutePlan {
  const legs: LegResult[] = [];
  let waterUsed = 0;
  let gasUsed = 0;
  let distanceKm = 0;
  let previous: Level = START_LEVEL;
  let refusedAny = false;

  levels.forEach((requested, i) => {
    const cost = transitionCost(previous, requested);
    const affordable = waterUsed + cost.water <= WATER_BUDGET && gasUsed + cost.gas <= GAS_BUDGET;
    // Out of water or gas: the caravan holds whatever level it last managed.
    const flown = affordable ? requested : previous;
    if (!affordable) refusedAny = true;

    if (affordable) {
      waterUsed += cost.water;
      gasUsed += cost.gas;
    }
    const progressKm = legKm(LEG_WINDS[i][flown]);
    distanceKm += progressKm;
    legs.push({
      level: flown,
      refused: !affordable,
      waterSpent: affordable ? cost.water : 0,
      gasSpent: affordable ? cost.gas : 0,
      progressKm,
    });
    previous = flown;
  });

  const arrived = distanceKm >= TARGET_KM;
  return {
    legs,
    waterUsed,
    gasUsed,
    distanceKm,
    arrived,
    outcome: arrived ? "arrived" : refusedAny ? "stranded" : "short",
  };
}

/** The itinerary the wind field rewards, ignoring cost — for the "best case" hint. */
export function greedyRoute(): Level[] {
  return LEG_WINDS.map((winds) =>
    (Object.keys(winds) as Level[]).reduce((a, b) => (winds[b] > winds[a] ? b : a)),
  );
}
