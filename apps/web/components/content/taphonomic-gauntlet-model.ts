// The preservation arithmetic behind TaphonomicGauntlet.
//
// Becoming a fossil is not one unlikely event but a chain of them, and the chain
// multiplies:
//
//   P_pres = P_tissue x P_burial x P_diagenesis x P_strata x P_discovery
//
// Every term is a probability below one, so the product collapses fast. The point
// the figure has to land is that the terms are not equally weighted and they are
// not properties of the animal: the same body plan, dying in four different
// Pandoran settings, spans several orders of magnitude in its odds. Burial is the
// hinge. A rainforest floor withholds it; an ash fall grants it outright.
//
// The figures below are illustrative orders of magnitude, chosen to reproduce the
// relationships measured on Earth (near-total loss in wet tropical soils,
// exceptional preservation in air-fall tephra and anoxic sulfidic bottoms), not
// published Pandoran measurements. Every visible string lives in the component's
// translations.

export type GateKey = "tissue" | "burial" | "diagenesis" | "strata" | "discovery";

export const GATES: GateKey[] = ["tissue", "burial", "diagenesis", "strata", "discovery"];

export type SettingKey = "forestFloor" | "uplandLedge" | "sulfidicLagoon" | "ashFall";

export const SETTINGS: SettingKey[] = ["forestFloor", "uplandLedge", "sulfidicLagoon", "ashFall"];

/** Per-gate pass probability for one death setting. */
export type GateOdds = Record<GateKey, number>;

export const SETTING_ODDS: Record<SettingKey, GateOdds> = {
  // Acidic laterite soils, year-round warmth, dense scavengers and roots. Almost
  // nothing is buried before it is gone; what is buried then meets pore water
  // acid enough to dissolve bone mineral.
  forestFloor: {
    tissue: 0.5,
    burial: 0.004,
    diagenesis: 0.08,
    strata: 0.35,
    discovery: 0.02,
  },
  // A montane shelf is a net erosional surface: no sediment arrives, so burial
  // is even rarer than on the forest floor, and the rock that does form is the
  // first to be stripped away again.
  uplandLedge: {
    tissue: 0.45,
    burial: 0.0015,
    diagenesis: 0.1,
    strata: 0.12,
    discovery: 0.03,
  },
  // Anoxic, sulfide-charged bottom water suppresses scavenging and pushes
  // mineralization onto the carcass itself. Burial is ordinary; the chemistry is
  // exceptional.
  sulfidicLagoon: {
    tissue: 0.55,
    burial: 0.45,
    diagenesis: 0.7,
    strata: 0.5,
    discovery: 0.04,
  },
  // Air-fall tephra buries a living community where it stands, in hours. The
  // burial term stops being the bottleneck at all.
  ashFall: {
    tissue: 0.6,
    burial: 0.92,
    diagenesis: 0.55,
    strata: 0.45,
    discovery: 0.06,
  },
};

export interface GateStep {
  gate: GateKey;
  /** This gate's own pass probability. */
  pass: number;
  /** Probability of having survived every gate up to and including this one. */
  cumulative: number;
}

export interface GauntletOutcome {
  steps: GateStep[];
  /** Product of all five gates. */
  overall: number;
  /** 1-in-N form of `overall`, rounded for display. */
  oneIn: number;
  /** The gate that removes the largest share of the survivors. */
  bottleneck: GateKey;
}

export function runGauntlet(setting: SettingKey): GauntletOutcome {
  const odds = SETTING_ODDS[setting];
  let cumulative = 1;
  const steps: GateStep[] = GATES.map((gate) => {
    cumulative *= odds[gate];
    return { gate, pass: odds[gate], cumulative };
  });
  const bottleneck = GATES.reduce((worst, gate) => (odds[gate] < odds[worst] ? gate : worst));
  return {
    steps,
    overall: cumulative,
    oneIn: Math.round(1 / cumulative),
    bottleneck,
  };
}

/**
 * Compact 1-in-N label. Millions and thousands are rounded hard, because the
 * precision is fake past the first digit and the reader only needs the scale.
 */
export function formatOneIn(oneIn: number): string {
  if (oneIn >= 1_000_000) return `${(oneIn / 1_000_000).toFixed(1)}M`;
  if (oneIn >= 10_000) return `${Math.round(oneIn / 1000)}k`;
  if (oneIn >= 1000) return `${(oneIn / 1000).toFixed(1)}k`;
  return String(oneIn);
}

/**
 * Bar length for a probability, on a log scale spanning 1 down to 1/1000 so a
 * 0.4% gate is still a visible sliver rather than a zero-width line.
 */
export function logBarFraction(p: number): number {
  const floor = -3;
  const exponent = Math.max(floor, Math.log10(Math.max(p, 1e-6)));
  return (exponent - floor) / -floor;
}
