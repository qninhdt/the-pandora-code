// The arithmetic behind OutgroupPolarityBench, kept separate so the figure file
// stays lean. Hennig's method needs one thing before it can group anything: it
// must know which state of a trait is old and which is new. That direction is
// not in the specimens — it comes entirely from the creature you nominate as the
// baseline. Nominate one that branched off before the group, and the real shared
// novelties light up. Nominate a deeply derived member of the group itself and
// the polarity inverts: the family crest reads as ancestral (so it groups no
// one) while genuinely ancient traits are mistaken for novelties. The reader is
// meant to feel that the same unchanged matrix supports a different tree purely
// because the compass was pointed the wrong way.
//
// Scoring follows the chapter's five-character matrix; state labels live in i18n.

export const CHARACTERS = ["limbs", "eyes", "resp", "queue", "bone"] as const;
export type CharacterKey = (typeof CHARACTERS)[number];

export type StateRow = [number, number, number, number, number];

export interface Taxon {
  id: string;
  states: StateRow;
}

// Character order: limbs, eyes, respiration, queue, bone.
// limbs 0 six · 1 split forelimbs · 2 four | eyes 0 four · 1 two
// resp 0 flank opercula · 1 cranial airway | queue 0 absent · 1 present
// bone 0 plain mineral · 1 carbon-threaded
export const TAXA: Taxon[] = [
  { id: "marine", states: [0, 1, 1, 0, 0] },
  { id: "ilu", states: [0, 0, 1, 1, 1] },
  { id: "direhorse", states: [0, 0, 0, 1, 1] },
  { id: "hexapede", states: [0, 0, 0, 1, 1] },
  { id: "prolemuris", states: [1, 1, 0, 1, 1] },
  { id: "navi", states: [2, 1, 1, 1, 1] },
];

/** The baseline a reader can nominate. Only `marine` branched off first. */
export const CANDIDATE_OUTGROUPS = ["marine", "direhorse", "navi"] as const;
export type OutgroupId = (typeof CANDIDATE_OUTGROUPS)[number];

/** The two characters the chapter calls the family crest. */
const CREST: CharacterKey[] = ["queue", "bone"];

export interface DerivedGroup {
  state: number;
  taxa: string[];
}

export interface Polarity {
  character: CharacterKey;
  /** State the nominated baseline shows — read as ancestral by definition. */
  ancestral: number;
  /** Every other state, largest sharing group first. */
  derived: DerivedGroup[];
  /** How many taxa share the largest derived state. */
  grouping: number;
  /** What the character can do for you once polarized. */
  kind: "synapomorphy" | "autapomorphy" | "constant";
  /** True when this baseline reads the trait the opposite way round. */
  inverted: boolean;
}

function statesFor(character: CharacterKey): (t: Taxon) => number {
  const i = CHARACTERS.indexOf(character);
  return (t) => t.states[i];
}

function polarizeCharacter(
  character: CharacterKey,
  outgroupId: string,
  trueAncestral: number,
): Polarity {
  const stateOf = statesFor(character);
  const outgroup = TAXA.find((t) => t.id === outgroupId);
  const ancestral = outgroup ? stateOf(outgroup) : trueAncestral;

  const buckets = new Map<number, string[]>();
  for (const taxon of TAXA) {
    if (taxon.id === outgroupId) continue;
    const s = stateOf(taxon);
    if (s === ancestral) continue;
    buckets.set(s, [...(buckets.get(s) ?? []), taxon.id]);
  }

  const derived = [...buckets.entries()]
    .map(([state, taxa]) => ({ state, taxa }))
    .sort((a, b) => b.taxa.length - a.taxa.length || a.state - b.state);

  const grouping = derived[0]?.taxa.length ?? 0;
  const kind: Polarity["kind"] =
    grouping >= 2 ? "synapomorphy" : grouping === 1 ? "autapomorphy" : "constant";

  return { character, ancestral, derived, grouping, kind, inverted: ancestral !== trueAncestral };
}

/** Read every character's direction off the nominated baseline. */
export function polarize(outgroupId: string): Polarity[] {
  const trueOutgroup = TAXA.find((t) => t.id === "marine")!;
  return CHARACTERS.map((character) =>
    polarizeCharacter(character, outgroupId, statesFor(character)(trueOutgroup)),
  );
}

export interface PolaritySummary {
  /** Characters that can bind two or more taxa into a branch. */
  grouping: number;
  /** Characters stranded on a single taxon, so useless for grouping. */
  loners: number;
  /** Characters now read the opposite way round. */
  inverted: CharacterKey[];
  /** Do carbon-threaded bone and the queue still unite the whole ingroup? */
  crestRecovered: boolean;
  verdict: "clean" | "crestLost";
}

export function summarize(polarities: Polarity[]): PolaritySummary {
  const grouping = polarities.filter((p) => p.kind === "synapomorphy").length;
  const loners = polarities.filter((p) => p.kind === "autapomorphy").length;
  const inverted = polarities.filter((p) => p.inverted).map((p) => p.character);

  // The crest only counts when each of its two characters still marks a novelty
  // shared by every other taxon on the bench — five of the six specimens.
  const crestRecovered = CREST.every((key) => {
    const p = polarities.find((q) => q.character === key);
    return p ? p.grouping === TAXA.length - 1 : false;
  });

  return {
    grouping,
    loners,
    inverted,
    crestRecovered,
    verdict: crestRecovered ? "clean" : "crestLost",
  };
}
