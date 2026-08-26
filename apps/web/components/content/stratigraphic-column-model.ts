// The logic behind StratigraphicColumnReader — how a geologist turns a wall of
// rock into an ordered history, and how far two dated ash beds can pin that
// history down in years.
//
// SOURCED (chapter research note): the five relative-dating principles that do
// all the ordering work here — superposition (a bed is younger than the bed
// beneath it), original horizontality, faunal succession, cross-cutting
// relationships (anything that cuts a rock is younger than the rock it cuts),
// and unconformities (surfaces of erosion or non-deposition). The note's
// calibration recipe is also exactly what the age bracket implements: find
// datable volcanic layers interbedded with fossil-bearing sediment and let the
// radiometric clocks pin absolute years onto the relative sequence.
//
// NOT ASSERTED: the two ash-bed dates are the reader's dials, not canon. The
// note gives no stratigraphic dates for Pandora, so the figure hands the reader
// the numbers and keeps only the reasoning fixed.
//
// The one thing this must teach, and the reason for the "undetermined" tier:
// geometry only orders features that actually touch. Two intrusions on opposite
// sides of the same outcrop, each truncated by the same erosion surface, are
// both younger than the beds they cut and older than the surface — and utterly
// silent about each other.

export type FeatureId =
  | "basement"
  | "lowerSand"
  | "ashLower"
  | "fossilBed"
  | "ashUpper"
  | "dike"
  | "fault"
  | "unconformity"
  | "upperSand";

export type PrincipleId = "superposition" | "crossCutting" | "unconformity" | "anchor";

/**
 * The outcrop's history, oldest tier first. Features sharing a tier cannot be
 * ordered against each other from the geometry alone — the dike and the fault
 * never intersect, so nothing in the rock says which came first.
 */
export const TIERS: FeatureId[][] = [
  ["basement"],
  ["lowerSand"],
  ["ashLower"],
  ["fossilBed"],
  ["ashUpper"],
  ["dike", "fault"],
  ["unconformity"],
  ["upperSand"],
];

/** Which principle carries the weight for each feature's placement. */
export const PRINCIPLE_OF: Record<FeatureId, PrincipleId> = {
  basement: "superposition",
  lowerSand: "superposition",
  ashLower: "anchor",
  fossilBed: "superposition",
  ashUpper: "anchor",
  dike: "crossCutting",
  fault: "crossCutting",
  unconformity: "unconformity",
  upperSand: "superposition",
};

/** Reading order for the control list: youngest (top of the wall) first. */
export const READING_ORDER: FeatureId[] = [...TIERS].reverse().flat();

const TIER_INDEX: Record<string, number> = Object.fromEntries(
  TIERS.flatMap((tier, i) => tier.map((id) => [id, i])),
);

export function tierOf(id: FeatureId): number {
  return TIER_INDEX[id];
}

export type Relation = "self" | "older" | "younger" | "undetermined";

/**
 * How `other` sits relative to `subject`: is it provably older, provably
 * younger, or beyond the reach of the geometry?
 */
export function relate(subject: FeatureId, other: FeatureId): Relation {
  if (subject === other) return "self";
  const a = tierOf(subject);
  const b = tierOf(other);
  if (b < a) return "older";
  if (b > a) return "younger";
  return "undetermined";
}

const ASH_LOWER_TIER = tierOf("ashLower");
const ASH_UPPER_TIER = tierOf("ashUpper");

export interface AgeBracket {
  /** Which shape of statement the evidence supports. */
  kind: "measured" | "between" | "olderThan" | "youngerThan";
  /** Older end of the bracket, Gyr ago. Absent for a one-sided younger bound. */
  old: number | null;
  /** Younger end of the bracket, Gyr ago. Absent for a one-sided older bound. */
  young: number | null;
}

/**
 * Turn the relative sequence into years. Only the two ash beds carry measured
 * dates; everything else inherits a bound from its position relative to them.
 * Analytical uncertainty widens every bracket outward — the honest direction,
 * since a wider bracket is a weaker claim, never a stronger one.
 */
export function ageBracket(
  id: FeatureId,
  lowerAshGyr: number,
  upperAshGyr: number,
  sigmaGyr: number,
): AgeBracket {
  if (id === "ashLower" || id === "ashUpper") {
    const dated = id === "ashLower" ? lowerAshGyr : upperAshGyr;
    return { kind: "measured", old: dated + sigmaGyr, young: dated - sigmaGyr };
  }

  const tier = tierOf(id);
  const oldEdge = lowerAshGyr + sigmaGyr;
  const youngEdge = upperAshGyr - sigmaGyr;

  if (tier < ASH_LOWER_TIER) return { kind: "olderThan", old: oldEdge, young: null };
  if (tier > ASH_UPPER_TIER) return { kind: "youngerThan", old: null, young: youngEdge };
  return { kind: "between", old: oldEdge, young: youngEdge };
}

/** How wide the bracket is, in Gyr — the price of having only two dated beds. */
export function bracketWidth(bracket: AgeBracket): number | null {
  if (bracket.old === null || bracket.young === null) return null;
  return Math.max(0, bracket.old - bracket.young);
}

/** The single figure a measured bracket is centred on, Gyr ago. */
export function bracketCentre(bracket: AgeBracket): number | null {
  if (bracket.old === null || bracket.young === null) return null;
  return (bracket.old + bracket.young) / 2;
}
