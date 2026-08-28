// The diagnostic behind NetworkOrMindDiagnostic. The chapter's problem is that
// "is Eywa a mind?" cannot be settled by looking at the behaviour, because
// brainless networks counterfeit purpose perfectly. So instead of arguing about
// Eywa directly, this model states the four checks the two leading frameworks
// actually put a system through — adaptive competence, recurrent irreducible
// integration (Integrated Information Theory), a global workspace that ignites
// (Global Workspace Theory), and any external evidence of subjective experience —
// and grades five specimens against all four. Two brainless networks, one brain
// structure that fails the test while sitting inside a mind, one mind that
// passes, and Eywa. Putting the controls beside the specimen is the whole point:
// the reader can see the test is calibrated before trusting its verdict on
// Pandora. Every grade below is what the chapter's research note supports; the
// prose for each cell lives in the translations.

export const GATES = ["competence", "recurrence", "broadcast", "experience"] as const;
export type GateId = (typeof GATES)[number];

/**
 * `yes` — the specimen clears this check.
 * `partial` — it clears it locally or in a weaker form than the framework asks for.
 * `no` — it fails.
 * `unknown` — unanswerable from outside, and saying so is the honest answer.
 */
export type Grade = "yes" | "partial" | "no" | "unknown";

export const SPECIMENS = ["slimeMould", "beeSwarm", "cerebellum", "cortex", "eywa"] as const;
export type SpecimenId = (typeof SPECIMENS)[number];

export type Verdict = "network" | "candidate" | "mind";

export const SPECIMEN_GRADES: Record<SpecimenId, Record<GateId, Grade>> = {
  // Reproduces the Tokyo rail network from one local rule. Brilliant, and its
  // feedback is local flow physics, not a whole bound into one irreducible system.
  slimeMould: {
    competence: "yes",
    recurrence: "partial",
    broadcast: "no",
    experience: "no",
  },
  // The piping signal is the closest thing on this bench to a broadcast — but it
  // carries one alarm, not arbitrary content available to every processor.
  beeSwarm: {
    competence: "yes",
    recurrence: "partial",
    broadcast: "partial",
    experience: "no",
  },
  // The negative control: four-fifths of the brain's neurons, and consciousness
  // survives its removal intact. If the test cannot fail this, it is worthless.
  cerebellum: {
    competence: "yes",
    recurrence: "no",
    broadcast: "no",
    experience: "no",
  },
  // The positive control, and the only specimen where the last check is answered
  // from the inside rather than inferred from the outside.
  cortex: {
    competence: "yes",
    recurrence: "yes",
    broadcast: "yes",
    experience: "yes",
  },
  // Canon gives dense local integration at hubs, point-to-point memory access,
  // and no sign of a planet-wide ignition. The last check is the hard problem.
  eywa: {
    competence: "yes",
    recurrence: "partial",
    broadcast: "no",
    experience: "unknown",
  },
};

/** Does this grade let the signal continue down the pipeline? */
export function clears(grade: Grade): boolean {
  return grade === "yes";
}

/**
 * Index of the first check the specimen does not clear outright, or GATES.length
 * if it clears them all. This is how far the signal travels along the bench.
 */
export function reachedGate(id: SpecimenId): number {
  const grades = SPECIMEN_GRADES[id];
  const idx = GATES.findIndex((g) => !clears(grades[g]));
  return idx === -1 ? GATES.length : idx;
}

// Verdict from the grades, not from the name of the specimen — so the bench
// cannot be accused of deciding Eywa's case in advance. Experience confirmed is
// the only route to "mind"; recurrence plus broadcast makes a candidate; bare
// competence makes an intelligent network, which is where most of biology sits.
export function verdictFor(id: SpecimenId): Verdict {
  const g = SPECIMEN_GRADES[id];
  if (g.experience === "yes") return "mind";
  if (clears(g.recurrence) && clears(g.broadcast)) return "candidate";
  return "network";
}

/** Which framework each check comes from, for the figure's attribution line. */
export const GATE_SOURCE: Record<GateId, "behaviour" | "iit" | "gwt" | "hardProblem"> = {
  competence: "behaviour",
  recurrence: "iit",
  broadcast: "gwt",
  experience: "hardProblem",
};
