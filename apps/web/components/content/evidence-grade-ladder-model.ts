// The scoring rules behind EvidenceGradeLadder, kept separate so the figure file
// stays lean. This is medicine's GRADE appraisal in miniature: a body of evidence
// starts at a certainty level fixed by its study design, then moves down for
// problems (bias, inconsistency, indirectness, imprecision, publication bias) and
// up for strengths (a very large effect, a clean dose-response, confounding that
// would only have weakened the result). The point the figure makes is that the
// starting rung is not the verdict — a randomized trial with three flaws lands
// below an observational study lifted by two strengths. Visible strings live in
// the component's translations.

export type Design = "randomized" | "observational";

/** GRADE certainty rungs, lowest score first, so index = score − 1. */
export const LEVELS = ["veryLow", "low", "moderate", "high"] as const;
export type Level = (typeof LEVELS)[number];

/** Design fixes the starting rung: trials open high, cohorts open low. */
export const START_SCORE: Record<Design, number> = {
  randomized: 4, // high
  observational: 2, // low
};

/** The five reasons a real appraisal rates certainty down. */
export const DOWNGRADES = [
  "bias",
  "inconsistency",
  "indirectness",
  "imprecision",
  "publication",
] as const;
export type Downgrade = (typeof DOWNGRADES)[number];

/** The three reasons it may rate certainty back up. */
export const UPGRADES = ["largeEffect", "doseResponse", "confounding"] as const;
export type Upgrade = (typeof UPGRADES)[number];

export const LEVEL_TONE: Record<Level, string> = {
  high: "var(--teal)",
  moderate: "var(--cyan)",
  low: "var(--amber)",
  veryLow: "var(--magenta)",
};

// Net certainty after appraisal, clamped to the four rungs. Each flaw costs one
// rung and each strength earns one back — GRADE's own arithmetic, simplified to
// single steps so the ladder stays readable at a glance.
export function gradeScore(design: Design, flawCount: number, strengthCount: number): number {
  const raw = START_SCORE[design] - flawCount + strengthCount;
  return Math.max(1, Math.min(4, raw));
}
