// Where the atoms in a world actually came from. Every element has a production
// history, and the histories differ enough that two samples from the same moon
// can trace to almost disjoint sets of astrophysical events.
//
// Five channels, chosen because they are the ones that dominate a rocky world's
// inventory:
//   bigBang     — the first few minutes: H, most He, a trace of Li
//   agbWinds    — low/intermediate-mass stars shedding envelopes: much C and N,
//                 and the slow-neutron-capture elements up to lead
//   coreCollapse— massive stars dying: the alpha ladder, O through Ca, plus iron
//   typeIa      — white-dwarf detonations: the majority of the galaxy's iron peak
//   rProcess    — neutron-star mergers and rare collapsars: the heaviest nuclei
//
// Per-element channel splits are approximate galactic-chemical-evolution
// attributions, rounded to the nearest 5% because the field's own numbers carry
// uncertainties of that order. They are shares of a given element's present-day
// abundance, not of a single event's yield. Deterministic; no randomness.

export type Channel = "bigBang" | "agbWinds" | "coreCollapse" | "typeIa" | "rProcess";

export const CHANNELS: Channel[] = ["bigBang", "agbWinds", "coreCollapse", "typeIa", "rProcess"];

/** Token hue per channel, oldest event to youngest. */
export const CHANNEL_TONE: Record<Channel, string> = {
  bigBang: "var(--magenta)",
  agbWinds: "var(--amber)",
  coreCollapse: "var(--cyan)",
  typeIa: "var(--teal)",
  rProcess: "var(--foreground)",
};

interface ElementData {
  /** Relative atomic mass, for converting mass shares to atom counts. */
  weight: number;
  /** Fraction of this element attributable to each channel; sums to 1. */
  from: Partial<Record<Channel, number>>;
}

// Standard atomic weights (CIAAW), rounded. "heavyMetals" and "actinides" stand
// in for the platinum-group/gold cluster and the Th-U pair respectively, using a
// representative mass for each group.
const ELEMENTS: Record<string, ElementData> = {
  H: { weight: 1.008, from: { bigBang: 1 } },
  He: { weight: 4.003, from: { bigBang: 0.9, agbWinds: 0.1 } },
  C: { weight: 12.011, from: { agbWinds: 0.55, coreCollapse: 0.45 } },
  N: { weight: 14.007, from: { agbWinds: 0.75, coreCollapse: 0.25 } },
  O: { weight: 15.999, from: { coreCollapse: 0.95, agbWinds: 0.05 } },
  Mg: { weight: 24.305, from: { coreCollapse: 0.9, typeIa: 0.1 } },
  Al: { weight: 26.982, from: { coreCollapse: 1 } },
  Si: { weight: 28.085, from: { coreCollapse: 0.7, typeIa: 0.3 } },
  S: { weight: 32.06, from: { coreCollapse: 0.7, typeIa: 0.3 } },
  Ca: { weight: 40.078, from: { coreCollapse: 0.5, typeIa: 0.5 } },
  Fe: { weight: 55.845, from: { typeIa: 0.6, coreCollapse: 0.4 } },
  Ni: { weight: 58.693, from: { typeIa: 0.7, coreCollapse: 0.3 } },
  Xe: { weight: 131.29, from: { agbWinds: 0.5, rProcess: 0.5 } },
  heavyMetals: { weight: 195.0, from: { rProcess: 0.95, agbWinds: 0.05 } },
  actinides: { weight: 235.0, from: { rProcess: 1 } },
};

export type TargetId = "ocean" | "mantle" | "core" | "air" | "blood" | "oreVein";

export const TARGET_IDS: TargetId[] = ["ocean", "mantle", "core", "air", "blood", "oreVein"];

/** Element mass percentages per sample. Each list sums to ~100. */
const TARGETS: Record<TargetId, Record<string, number>> = {
  // Pure water: the one sample where the Big Bang still dominates by atom count.
  ocean: { H: 11.2, O: 88.8 },
  // A silicate mantle, following Earth's bulk mantle composition closely enough
  // for the provenance argument.
  mantle: { O: 44, Mg: 23, Si: 21, Fe: 6, Ca: 3, Al: 2, S: 0.7, Ni: 0.3 },
  // An iron-nickel core with light-element impurities.
  core: { Fe: 85, Ni: 5, S: 6, Si: 4 },
  // Pandora's surface air by mass, derived from the canonical volume mixing
  // ratios: nitrogen-dominated, carbon dioxide a major constituent, and a slug
  // of xenon heavy enough to carry a fifth of the mass.
  air: { N: 40, O: 34, Xe: 20, C: 6 },
  // Haemoglobin's iron: a single element, and the cleanest possible case.
  blood: { Fe: 100 },
  // A heavy-metal vein: platinum-group and gold with sulfide and iron gangue.
  oreVein: { heavyMetals: 55, Fe: 30, S: 12, actinides: 3 },
};

export type Basis = "mass" | "atoms";

export interface ProvenanceShare {
  channel: Channel;
  /** Percentage of the sample, 0–100. */
  pct: number;
}

export interface Provenance {
  shares: ProvenanceShare[];
  dominant: Channel;
  /** Percentage carried by the dominant channel. */
  dominantPct: number;
  /** Whether the primordial channel contributes at all. */
  primordialPct: number;
}

/**
 * Resolve a sample into channel shares. `basis` decides whether the sample is
 * weighed or counted — water flips from overwhelmingly supernova-made by mass to
 * mostly primordial by atom, which is the point of offering the choice.
 */
export function provenanceOf(target: TargetId, basis: Basis): Provenance {
  const composition = TARGETS[target];
  const totals = new Map<Channel, number>();
  let grand = 0;

  for (const [symbol, massPct] of Object.entries(composition)) {
    const element = ELEMENTS[symbol];
    if (!element) continue;
    const amount = basis === "mass" ? massPct : massPct / element.weight;
    grand += amount;
    for (const channel of CHANNELS) {
      const share = element.from[channel];
      if (!share) continue;
      totals.set(channel, (totals.get(channel) ?? 0) + amount * share);
    }
  }

  const shares: ProvenanceShare[] = CHANNELS.map((channel) => ({
    channel,
    pct: grand > 0 ? ((totals.get(channel) ?? 0) / grand) * 100 : 0,
  }));

  let dominant: Channel = "coreCollapse";
  let dominantPct = -1;
  for (const share of shares) {
    if (share.pct > dominantPct) {
      dominant = share.channel;
      dominantPct = share.pct;
    }
  }

  return {
    shares,
    dominant,
    dominantPct,
    primordialPct: shares.find((s) => s.channel === "bigBang")?.pct ?? 0,
  };
}

/** The element symbols in a sample, heaviest contribution first. */
export function elementsOf(target: TargetId): string[] {
  return Object.entries(TARGETS[target])
    .sort((a, b) => b[1] - a[1])
    .map(([symbol]) => symbol);
}
