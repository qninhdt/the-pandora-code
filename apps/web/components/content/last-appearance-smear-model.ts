// The sampling statistics behind LastAppearanceSmear.
//
// Two ideas, one figure. Both are about the same uncomfortable fact: the last
// fossil of a species is almost never the last individual.
//
// 1. THE SIGNOR-LIPPS EFFECT (Signor & Lipps 1982). Take several species that all
//    die out at the same instant. Their fossil records have different densities,
//    because some were common and some were rare. The common one's last fossil
//    sits just below the true horizon; the rare one's last fossil may sit far
//    below it. Plot the observed last appearances and an event that was abrupt
//    looks like a long, staggered decline. The gradualism is an artifact of
//    sampling, not a fact about the extinction.
//
// 2. THE STRAUSS-SADLER CORRECTION (1989). If a taxon is found at n horizons
//    spread over an observed range R = y_n - y_1, and finds are treated as
//    uniformly distributed within the true range, then the true endpoint lies
//    above the highest find by at most
//
//      alpha = R [ (1 - C)^(-1/(n-1)) - 1 ]
//
//    with confidence C. The interval is the honest way to state an absence: not
//    "it ended here" but "it ended somewhere in here, and with two finds I can
//    barely constrain it at all".
//
// Positions run 0 (oldest, bottom of section) to 100 (the true extinction horizon).
// Find horizons come from a fixed low-discrepancy sequence rather than Math.random
// so the figure is identical on server and client, and so raising the sampling
// slider *adds* points without moving the ones already drawn.
//
// Every visible string lives in the component's translations.

export const TRUE_EXTINCTION = 100;

export interface Taxon {
  id: string;
  /** Relative fossil abundance, 1 = the commonest taxon in the section. */
  abundance: number;
}

/** Five taxa spanning three orders of magnitude in how often they turn up. */
export const TAXA: Taxon[] = [
  { id: "microspore", abundance: 1 },
  { id: "reefBuilder", abundance: 0.42 },
  { id: "grazingHerd", abundance: 0.16 },
  { id: "apexHunter", abundance: 0.05 },
  { id: "canopyFlyer", abundance: 0.018 },
];

/** Finds available to the commonest taxon at maximum sampling effort. */
const MAX_FINDS = 60;

/**
 * Golden-ratio additive sequence on [0,1). Deterministic, well spread at every
 * prefix length, and stable: element k never changes as n grows.
 */
function haltonish(index: number, offset: number): number {
  const phi = 0.618033988749895;
  return (offset + (index + 1) * phi) % 1;
}

/** How many horizons a taxon is found at, given the section's sampling effort. */
export function findCount(taxon: Taxon, effort: number): number {
  const scaled = MAX_FINDS * taxon.abundance * (effort / 100);
  return Math.max(0, Math.round(scaled));
}

/** Find horizons for one taxon, ascending, all strictly below the true horizon. */
export function findHorizons(taxon: Taxon, effort: number): number[] {
  const n = findCount(taxon, effort);
  const offset = taxon.id.length / 10;
  const raw: number[] = [];
  for (let i = 0; i < n; i++) raw.push(haltonish(i, offset) * TRUE_EXTINCTION);
  return raw.sort((a, b) => a - b);
}

export interface TaxonRange {
  taxon: Taxon;
  horizons: number[];
  n: number;
  /** Lowest find, y_1. */
  first: number | null;
  /** Highest find, y_n - the *observed* last appearance. */
  last: number | null;
  /** Observed range R = y_n - y_1. */
  range: number;
  /** Strauss-Sadler extension above y_n at the given confidence. */
  alpha: number;
  /** Upper end of the confidence interval, capped at the top of the section. */
  intervalTop: number;
  /** How far the observed last appearance falls short of the truth. */
  smear: number;
  /** Whether the interval actually reaches the true extinction horizon. */
  covers: boolean;
}

/**
 * Strauss-Sadler classical confidence interval on a stratigraphic endpoint.
 * Undefined for fewer than two finds - with a single occurrence there is no
 * observed range to extrapolate from, which is itself the point.
 */
export function strausSadlerAlpha(range: number, n: number, confidence: number): number {
  if (n < 2 || range <= 0) return Number.POSITIVE_INFINITY;
  return range * ((1 - confidence) ** (-1 / (n - 1)) - 1);
}

export function analyzeTaxon(taxon: Taxon, effort: number, confidence: number): TaxonRange {
  const horizons = findHorizons(taxon, effort);
  const n = horizons.length;
  const first = n > 0 ? horizons[0] : null;
  const last = n > 0 ? horizons[n - 1] : null;
  const range = first !== null && last !== null ? last - first : 0;
  const alpha = strausSadlerAlpha(range, n, confidence);
  const finite = Number.isFinite(alpha);
  const intervalTop =
    last === null ? 0 : Math.min(TRUE_EXTINCTION * 1.35, last + (finite ? alpha : TRUE_EXTINCTION));
  return {
    taxon,
    horizons,
    n,
    first,
    last,
    range,
    alpha,
    intervalTop,
    smear: last === null ? TRUE_EXTINCTION : TRUE_EXTINCTION - last,
    covers: last !== null && (!finite || last + alpha >= TRUE_EXTINCTION),
  };
}

export interface SectionOutcome {
  ranges: TaxonRange[];
  /** Vertical spread of observed last appearances - the apparent "decline". */
  apparentDecline: number;
  /** Taxa whose confidence interval reaches the true horizon. */
  covered: number;
  /** Taxa with at least one find. */
  found: number;
}

export function analyzeSection(effort: number, confidence: number): SectionOutcome {
  const ranges = TAXA.map((tx) => analyzeTaxon(tx, effort, confidence));
  const lasts = ranges.map((r) => r.last).filter((v): v is number => v !== null);
  return {
    ranges,
    apparentDecline: lasts.length > 1 ? Math.max(...lasts) - Math.min(...lasts) : 0,
    covered: ranges.filter((r) => r.covers).length,
    found: ranges.filter((r) => r.n > 0).length,
  };
}
