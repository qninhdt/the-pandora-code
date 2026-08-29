// The scoreboard behind OriginScenarioScoreboard. Abiogenesis is not one problem
// but six, and the reason the field argues is that no single setting solves all
// six: each leading scenario is strong on some rows and weak on others. This
// model holds that grid honestly — including the rows where the answer is simply
// "not shown" — plus, for each row, whether Pandora's environment helps. The
// pattern the reader should find is that Pandora's advantages all sit in the
// energy and monomer rows and none of them touch the information rows.

export type SubProblemId =
  | "monomers"
  | "polymers"
  | "information"
  | "compartments"
  | "energy"
  | "darwin";

export type ScenarioId = "spark" | "vent" | "pool";

/**
 * How well a setting addresses a sub-problem.
 * `strong` — demonstrated experimentally in that setting.
 * `partial` — plausible there, with real results but real gaps.
 * `weak` — the setting works against this step.
 */
export type Grade = "strong" | "partial" | "weak";

/** Whether Pandora's environment improves this row relative to early Earth. */
export type PandoraEffect = "better" | "same" | "worse";

export interface SubProblem {
  id: SubProblemId;
  grades: Record<ScenarioId, Grade>;
  pandora: PandoraEffect;
}

// Grades follow the chapter's research note: spark chemistry makes monomers
// readily but has no answer for concentration or information; alkaline vents own
// the energy row and struggle with polymer stability; surface pools own
// polymerisation via wet-dry cycling and are exposed on continuity of supply.
// Every scenario is weak or partial on information and on the Darwinian
// transition, which is the whole point of the figure.
export const SUB_PROBLEMS: Record<SubProblemId, SubProblem> = {
  monomers: {
    id: "monomers",
    grades: { spark: "strong", vent: "partial", pool: "strong" },
    pandora: "better",
  },
  polymers: {
    id: "polymers",
    grades: { spark: "weak", vent: "weak", pool: "strong" },
    pandora: "better",
  },
  information: {
    id: "information",
    grades: { spark: "weak", vent: "weak", pool: "partial" },
    pandora: "same",
  },
  compartments: {
    id: "compartments",
    grades: { spark: "weak", vent: "partial", pool: "strong" },
    pandora: "same",
  },
  energy: {
    id: "energy",
    grades: { spark: "partial", vent: "strong", pool: "partial" },
    pandora: "better",
  },
  darwin: {
    id: "darwin",
    grades: { spark: "weak", vent: "weak", pool: "weak" },
    pandora: "same",
  },
};

export const SUB_PROBLEM_ORDER: SubProblemId[] = [
  "monomers",
  "polymers",
  "information",
  "compartments",
  "energy",
  "darwin",
];

export const SCENARIO_ORDER: ScenarioId[] = ["spark", "vent", "pool"];

/** How many rows this scenario handles well, for the summary line. */
export function strongRows(scenario: ScenarioId): number {
  return SUB_PROBLEM_ORDER.filter((id) => SUB_PROBLEMS[id].grades[scenario] === "strong").length;
}

/** Rows Pandora's environment genuinely improves. */
export function pandoraGains(): SubProblemId[] {
  return SUB_PROBLEM_ORDER.filter((id) => SUB_PROBLEMS[id].pandora === "better");
}

/** Rows no scenario handles well — where the field is actually stuck. */
export function unsolvedRows(): SubProblemId[] {
  return SUB_PROBLEM_ORDER.filter((id) =>
    SCENARIO_ORDER.every((s) => SUB_PROBLEMS[id].grades[s] !== "strong"),
  );
}

export const GRADE_TONE: Record<Grade, string> = {
  strong: "var(--teal)",
  partial: "var(--amber)",
  weak: "var(--magenta)",
};

export const PANDORA_TONE: Record<PandoraEffect, string> = {
  better: "var(--teal)",
  same: "var(--subtle)",
  worse: "var(--magenta)",
};
