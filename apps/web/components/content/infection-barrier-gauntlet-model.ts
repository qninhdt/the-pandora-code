// The lock sequence behind InfectionBarrierGauntlet. Infection is not one event
// but a chain: reach the tissue, dock on a receptor, tolerate the chemistry,
// replicate on host machinery, survive the broad defences, and leave for the next
// host. Fail one link and the chain ends there.
//
// The states below are qualitative on purpose. The research note supports the
// *order* of the filters and the *reason* each one blocks — shared ancestry makes
// receptors and machinery broadly compatible within a biosphere, while two
// independently evolved biospheres share neither molecular handedness, nor entry
// receptors, nor a genetic code — but nobody has a number for the odds of an alien
// microbe infecting a Na'vi. Putting a percentage on it would be invention, so the
// figure counts locks cleared instead of pretending to a probability.
//
// The third pairing is the honest one: an avatar body is a laboratory chimera with
// no documented inoculation protocol, so every lock past exposure is unmeasured
// rather than open or shut. The reader walks the whole corridor and arrives at a
// gap in canon instead of an answer.
//
// Harm needs none of this. An organism that clears no locks at all can still
// poison, inflame, digest dead tissue, foul a membrane or occupy an empty niche.
// Every visible string lives in the component's translations.

export type Pairing = "sameBiosphere" | "crossBiosphere" | "avatarChimera";

export type LockId =
  | "exposure"
  | "docking"
  | "chemistry"
  | "replication"
  | "immunity"
  | "transmission";

/**
 * clears  — passes on shared machinery
 * narrow  — possible but the usual outcome is failure
 * unknown — nothing in canon or the literature settles it
 * blocked — the chain ends here
 */
export type LockState = "clears" | "narrow" | "unknown" | "blocked";

export const LOCK_ORDER: LockId[] = [
  "exposure",
  "docking",
  "chemistry",
  "replication",
  "immunity",
  "transmission",
];

export const LOCK_STATES: Record<Pairing, Record<LockId, LockState>> = {
  // Within one biosphere the machinery is broadly compatible, which is why host
  // jumps happen at all — and still rare, because a receptor adapted to one
  // animal may find no handle on another.
  sameBiosphere: {
    exposure: "clears",
    docking: "narrow",
    chemistry: "clears",
    replication: "clears",
    immunity: "narrow",
    transmission: "narrow",
  },
  // Two independent origins: the first molecular recognition step fails and
  // nothing downstream can recover it.
  crossBiosphere: {
    exposure: "clears",
    docking: "blocked",
    chemistry: "blocked",
    replication: "blocked",
    immunity: "blocked",
    transmission: "blocked",
  },
  // A tank-grown chimeric body with no published inoculum, immune profile or
  // colonisation survey. Every lock past exposure is a missing measurement.
  avatarChimera: {
    exposure: "clears",
    docking: "unknown",
    chemistry: "unknown",
    replication: "unknown",
    immunity: "unknown",
    transmission: "unknown",
  },
};

export type HarmId = "toxin" | "inflammation" | "necrotrophy" | "fouling" | "niche";

/** Harm routes stay open whatever the locks decide. */
export const HARM_ROUTES: Record<Pairing, HarmId[]> = {
  sameBiosphere: ["toxin", "inflammation", "necrotrophy", "fouling"],
  crossBiosphere: ["toxin", "inflammation", "necrotrophy", "niche"],
  avatarChimera: ["toxin", "inflammation", "necrotrophy", "fouling", "niche"],
};

/** How many locks the visitor can clear before the chain ends. */
export function locksCleared(pairing: Pairing): number {
  const states = LOCK_STATES[pairing];
  let n = 0;
  for (const id of LOCK_ORDER) {
    if (states[id] === "blocked") return n;
    n += 1;
  }
  return n;
}
