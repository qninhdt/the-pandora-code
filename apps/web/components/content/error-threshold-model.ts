// The arithmetic behind ErrorThresholdCeiling. Eigen's relation says a
// replicator cannot carry more information than its own copying accuracy can
// protect: at fidelity q per base, sequences longer than roughly ln(sigma)/(1-q)
// decay into noise faster than selection can rebuild them. Set against the
// length a folded RNA replicase actually needs, that ceiling produces the
// origin-of-life field's sharpest circular problem.

/**
 * Longest sequence a replicator of per-base fidelity q can hold together.
 * L_max ≈ ln(sigma) / (1 − q), where sigma is how much fitter the master
 * sequence is than the mutant cloud around it.
 */
export function maxGenomeLength(fidelity: number, selectiveAdvantage: number): number {
  const mu = 1 - fidelity;
  if (mu <= 0) return Number.POSITIVE_INFINITY;
  return Math.log(selectiveAdvantage) / mu;
}

/** Nucleotides a ribozyme must fold from before it can copy anything at all. */
export const REPLICASE_LENGTH = { min: 170, max: 200 } as const;

export interface FidelityRegime {
  id: "nonEnzymatic" | "ribozyme" | "polymerase";
  /** Representative per-base fidelity for this class of copier. */
  fidelity: number;
}

// Three measured classes of copier, from bare chemistry to a modern enzyme. The
// gap the figure exists to show sits between the first two: non-enzymatic
// extension cannot protect a sequence long enough to fold into the ribozyme that
// would raise the fidelity.
export const REGIMES: Record<FidelityRegime["id"], FidelityRegime> = {
  nonEnzymatic: { id: "nonEnzymatic", fidelity: 0.93 },
  ribozyme: { id: "ribozyme", fidelity: 0.985 },
  polymerase: { id: "polymerase", fidelity: 0.9999999 },
};

export const REGIME_ORDER: FidelityRegime["id"][] = ["nonEnzymatic", "ribozyme", "polymerase"];

/** Whether this fidelity can hold a sequence long enough to fold a replicase. */
export type CeilingVerdict = "shortOfReplicase" | "clearsReplicase";

export function ceilingVerdict(lengthCeiling: number): CeilingVerdict {
  return lengthCeiling >= REPLICASE_LENGTH.min ? "clearsReplicase" : "shortOfReplicase";
}

export const FIDELITY_RANGE = { min: 0.85, max: 0.999 } as const;
export const SIGMA_RANGE = { min: 2, max: 10 } as const;
export const DEFAULT_SIGMA = 4;
