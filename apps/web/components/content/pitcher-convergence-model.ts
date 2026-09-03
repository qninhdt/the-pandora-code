// Nutrient arithmetic behind PitcherConvergenceBench.
//
// Carnivory in plants is the textbook convergence: it arose independently around
// ten to twelve times on Earth, in families that are not close relatives, and it
// arises wherever the same condition holds — soil so leached of nitrogen and
// phosphorus that catching an animal costs less than growing more root. The trap
// is a reading of the soil, not a badge of descent.
//
// The bench scores four Pandoran urn-formers against a soil the reader sets.
// Three carry the pitcher because the ground is poor. One, the Direhorse Pitcher,
// keeps the identical vessel with the digestion switched off and a nectar well in
// its place — the same secondary abandonment Nepenthes lowii made on Earth when
// it turned its trap into a tree-shrew feeding station. And Panopyra reaches the
// urn from a different direction entirely, as a canopy tank with no soil contact
// at all, which is the fourth origin in one flora.
//
// The payoff number is `traitSignal`: how strongly the pitcher predicts poor soil
// versus how strongly it predicts kinship. The first stays high across the bench;
// the second never rises, because independent origins carry no shared ancestry.

export type Strategy = "carnivorous" | "triggered" | "nectar" | "tank";

export interface UrnSpec {
  key: string;
  strategy: Strategy;
  /** Nutrient the plant captures directly from prey or debris, as a share of need. */
  captureCapacity: number;
  /** Whether the lineage still synthesizes digestive proteases. */
  digests: boolean;
  /** Rooted in soil at all — the tank epiphyte is not. */
  rooted: boolean;
  /** Independent origin index within this flora: same number means shared origin. */
  originGroup: number;
  tone: "cyan" | "teal" | "magenta" | "amber";
}

// Canon supplies the taxa, their habit and (for the Direhorse Pitcher) the loss
// of digestion. The capture fractions are this chapter's own estimates, chosen so
// the ordering matches the described biology rather than any published figure.
export const URNS: UrnSpec[] = [
  {
    key: "rosea",
    strategy: "carnivorous",
    captureCapacity: 0.55,
    digests: true,
    rooted: true,
    originGroup: 1,
    tone: "cyan",
  },
  {
    key: "simplex",
    strategy: "triggered",
    captureCapacity: 0.48,
    digests: true,
    rooted: true,
    originGroup: 1,
    tone: "teal",
  },
  {
    key: "equina",
    strategy: "nectar",
    captureCapacity: 0,
    digests: false,
    rooted: true,
    originGroup: 1,
    tone: "amber",
  },
  {
    key: "panopyra",
    strategy: "tank",
    captureCapacity: 0.62,
    digests: false,
    rooted: false,
    originGroup: 2,
    tone: "magenta",
  },
];

export interface SoilState {
  /** Bioavailable nitrogen in the substrate, 0 (leached) to 1 (rich). */
  nitrogen: number;
  /** Bioavailable phosphorus, 0 to 1. */
  phosphorus: number;
}

export interface UrnOutcome {
  /** Share of the plant's nutrient demand met, 0-1. */
  budget: number;
  /** Whether the trap is currently paying for itself. */
  favoured: boolean;
  /** What the plant is actually collecting in the basin. */
  harvest: "prey" | "debris" | "pollinator" | "none";
}

/**
 * A trap costs carbon to build and maintain. It pays when the soil cannot supply
 * what the plant needs — which is why the same organ keeps reappearing in
 * unrelated lineages on leached ground, and why it is abandoned when a better
 * return shows up.
 */
export function outcomeFor(urn: UrnSpec, soil: SoilState): UrnOutcome {
  // A rooted plant draws on whichever nutrient is scarcer; Liebig's minimum.
  const fromSoil = urn.rooted ? Math.min(soil.nitrogen, soil.phosphorus) : 0.08;
  const captured = urn.captureCapacity * (1 - fromSoil);
  const budget = Math.min(1, fromSoil + captured);
  // The trap earns its keep only while the soil alone would leave the plant short.
  const favoured = urn.captureCapacity > 0 && fromSoil < 0.5;
  const harvest: UrnOutcome["harvest"] = !urn.digests
    ? urn.strategy === "nectar"
      ? "pollinator"
      : "debris"
    : captured > 0.05
      ? "prey"
      : "none";
  return { budget, favoured, harvest };
}

export interface BenchSignal {
  /** How well the urn predicts leached soil, 0-1. */
  soilSignal: number;
  /** How well the urn predicts shared ancestry, 0-1. */
  kinshipSignal: number;
  /** Distinct independent origins of the urn on this bench. */
  origins: number;
}

/**
 * The bench-level reading. Soil signal rises as the ground gets poorer, because
 * that is the condition the trap tracks. Kinship signal is the share of urn-bearing
 * taxa that actually share an origin — it is fixed by the phylogeny and does not
 * move when the reader changes the soil, which is the whole point.
 */
export function benchSignal(soil: SoilState): BenchSignal {
  const scarcity = 1 - Math.min(soil.nitrogen, soil.phosphorus);
  const groups = new Set(URNS.map((u) => u.originGroup));
  // With more than one origin, sharing the organ cannot imply sharing an ancestor:
  // the best a naive reader could do is guess the largest group.
  const largest = Math.max(
    ...[...groups].map((g) => URNS.filter((u) => u.originGroup === g).length),
  );
  return {
    soilSignal: scarcity,
    kinshipSignal: largest / URNS.length - (groups.size - 1) / URNS.length,
    origins: groups.size,
  };
}

/** Outline of an urn, drawn as a tapering vessel with a lip and a basin. */
export function urnPath(w: number, h: number, flare: number): string {
  const lip = w * flare;
  const waist = w * 0.42;
  return [
    `M ${-lip} 0`,
    `C ${-lip} ${h * 0.28} ${-waist} ${h * 0.42} ${-waist} ${h * 0.66}`,
    `C ${-waist} ${h * 0.92} ${-waist * 0.5} ${h} 0 ${h}`,
    `C ${waist * 0.5} ${h} ${waist} ${h * 0.92} ${waist} ${h * 0.66}`,
    `C ${waist} ${h * 0.42} ${lip} ${h * 0.28} ${lip} 0`,
  ].join(" ");
}
