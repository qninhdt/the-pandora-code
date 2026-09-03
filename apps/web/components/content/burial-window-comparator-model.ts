// What each burial setting actually hands a paleontologist. The three scenarios
// are not "good, better, best" — they are chemically different machines that
// preserve different *parts* of an animal, which is why a world can have an
// excellent fossil record and still be missing whole categories of anatomy.
//
//   subaerial  — the rainforest floor. Acid, warmth, roots and scavengers. The
//                default state of most of Pandora's land surface, and it keeps
//                almost nothing.
//   ash        — pyroclastic fall. Burial in an afternoon, then the soft tissue
//                rots inside a sealed mould and leaves a cavity. Pompeii's
//                Fiorelli casts and the Jehol tuffs work this way: external form
//                at astonishing fidelity, original substance gone.
//   sulfidicMud — anoxic, iron-bearing, sulfide-charged bottom mud. Pyrite
//                framboids nucleate on decaying tissue within days, casting
//                muscle, gut and fine filaments in brassy mineral. Beecher's
//                Trilobite Bed and the Hunsrück Slate are the Earth examples.
//
// The Pandora-specific hook: on Earth, pyritization is throttled by how fast
// bacteria can reduce sulfate to sulfide. Canon's atmosphere is volcanically
// sulfurous and keeps surface waters charged with dissolved sulfide already, so
// that rate-limiting step is bypassed and the process becomes iron-limited
// instead. That is inference from canon chemistry, not stated canon.

/** Anatomical categories a reader can check for across the three settings. */
export const FEATURES = ["externalForm", "softTissue", "bone", "finestructure", "colour"] as const;
export type FeatureKey = (typeof FEATURES)[number];

export const SCENARIOS = ["subaerial", "ash", "sulfidicMud"] as const;
export type ScenarioKey = (typeof SCENARIOS)[number];

/** How well a setting preserves a feature. */
export type Fidelity = "none" | "trace" | "good" | "exceptional";

export interface ScenarioSpec {
  key: ScenarioKey;
  /** Years from death to effective sealing. */
  burialTime: number;
  /** The mineral or process doing the preserving. */
  mechanism: "weathering" | "voidCast" | "pyrite";
  features: Record<FeatureKey, Fidelity>;
}

export const SCENARIO_SPECS: Record<ScenarioKey, ScenarioSpec> = {
  subaerial: {
    key: "subaerial",
    burialTime: 40,
    mechanism: "weathering",
    features: {
      externalForm: "none",
      softTissue: "none",
      bone: "trace",
      finestructure: "none",
      colour: "none",
    },
  },
  ash: {
    key: "ash",
    burialTime: 0.002, // hours
    mechanism: "voidCast",
    features: {
      externalForm: "exceptional",
      softTissue: "trace",
      bone: "good",
      finestructure: "good",
      colour: "good", // melanosome morphology survives carbonization
    },
  },
  sulfidicMud: {
    key: "sulfidicMud",
    burialTime: 0.02,
    mechanism: "pyrite",
    features: {
      externalForm: "good",
      softTissue: "exceptional",
      bone: "trace", // apatite still dissolves in the acidic pore water
      finestructure: "exceptional",
      colour: "none",
    },
  },
};

const RANK: Record<Fidelity, number> = { none: 0, trace: 1, good: 2, exceptional: 3 };

export function fidelityRank(f: Fidelity): number {
  return RANK[f];
}

/** Total preserved information across all features, for the summary readout. */
export function informationScore(spec: ScenarioSpec): number {
  return FEATURES.reduce((sum, key) => sum + RANK[spec.features[key]], 0);
}

/** The maximum a scenario could score, used to normalize the readout. */
export const MAX_SCORE = FEATURES.length * RANK.exceptional;

/**
 * Which single feature this setting preserves better than either alternative —
 * the reason it is worth digging at all. Returns null when nothing is uniquely
 * best here, which is the honest answer for the rainforest floor.
 */
export function signatureFeature(key: ScenarioKey): FeatureKey | null {
  const mine = SCENARIO_SPECS[key];
  const others = SCENARIOS.filter((s) => s !== key).map((s) => SCENARIO_SPECS[s]);
  let best: FeatureKey | null = null;
  let bestMargin = 0;
  for (const feature of FEATURES) {
    const margin = RANK[mine.features[feature]] - Math.max(...others.map((o) => RANK[o.features[feature]]));
    if (margin > bestMargin) {
      bestMargin = margin;
      best = feature;
    }
  }
  return best;
}
