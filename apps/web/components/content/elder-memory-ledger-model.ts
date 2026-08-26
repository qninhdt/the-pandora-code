// ─────────────────────────────────────────────────────────────────────
// THE MODEL — experience is not distributed evenly, so neither is the loss
//
// Some ecological knowledge cannot be acquired in an ordinary season:
// where to feed when the usual abundance fails. Only an animal that lived
// through such a year carries it. If lean years arrive at random with a
// mean recurrence interval R, an individual of age A has crossed them a
// Poisson number of times with mean A/R, so:
//
//   experience(A) = A / R          expected lean years crossed
//   witness(A)    = 1 - exp(-A/R)  chance of having crossed at least one
//   P(pod holds)  = 1 - prod (1 - witness(A_i))
//
// Because experience is linear in age, it piles up at the old end. In a
// pod whose oldest members approach the canonical tulkun lifespan of
// 150-250 Earth years, the three eldest animals can carry more than half
// of everything the pod has lived through while being under a third of its
// bodies. Removing them is therefore not the same bereavement as removing
// the same number at random — which is exactly the loss a census cannot
// see, and exactly what industrial hunting does when it targets the large
// and the accompanied.
//
// Earth supplies the demographic confirmation: the death of a
// post-reproductive killer-whale matriarch raises her adult sons'
// mortality risk in the following year by up to eightfold, and hunted
// southern right whales failed to reoccupy calving bays after the
// matrilines that knew them were killed.
// ─────────────────────────────────────────────────────────────────────

/** Ages of one pod's members, youngest first. Canon lifespan: 150-250 years. */
export const POD_AGES = [4, 12, 26, 41, 58, 77, 96, 118, 147, 186, 231];

/** Expected number of lean years an animal of this age has crossed. */
export function experienceOf(age: number, recurrence: number): number {
  return age / recurrence;
}

/** Chance an animal of this age crossed at least one lean year. */
export function witnessChance(age: number, recurrence: number): number {
  return 1 - Math.exp(-age / recurrence);
}

/** Chance somebody in this group still carries such a memory. */
export function podRetention(ages: number[], recurrence: number): number {
  if (ages.length === 0) return 0;
  return 1 - ages.reduce((acc, age) => acc * (1 - witnessChance(age, recurrence)), 1);
}

export interface PodLedger {
  /** Members still alive, youngest first. */
  kept: number[];
  /** Share of the original head count that is gone. */
  bodyLoss: number;
  /** Share of the pod's accumulated lean-year experience that is gone. */
  experienceLoss: number;
  /** Chance the surviving pod still holds a lean-year memory. */
  retention: number;
  /** Same chance before anybody was removed. */
  retentionIntact: number;
  regime: "intact" | "buffered" | "asymmetric";
}

/** Score a pod after `removed` of its oldest members are taken. */
export function podLedger(removed: number, recurrence: number): PodLedger {
  const kept = POD_AGES.slice(0, Math.max(0, POD_AGES.length - removed));
  const totalAge = POD_AGES.reduce((a, b) => a + b, 0);
  const keptAge = kept.reduce((a, b) => a + b, 0);

  const bodyLoss = removed / POD_AGES.length;
  // Experience is linear in age, so the recurrence interval cancels here: the
  // share lost depends only on how much of the pod's lived time went with them.
  const experienceLoss = totalAge > 0 ? 1 - keptAge / totalAge : 0;
  const retention = podRetention(kept, recurrence);
  const retentionIntact = podRetention(POD_AGES, recurrence);

  const regime = removed === 0 ? "intact" : retention >= 0.95 ? "buffered" : "asymmetric";

  return { kept, bodyLoss, experienceLoss, retention, retentionIntact, regime };
}
