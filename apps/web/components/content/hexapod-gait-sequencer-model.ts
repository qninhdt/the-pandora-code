// Footfall arithmetic behind HexapodGaitSequencer. Six legs are not four legs
// plus two: what matters is *when* each foot is down. A gait is fully described
// by two numbers per limb — the fraction of the stride the foot spends on the
// ground (duty factor) and where in the stride it lands (phase offset) — and
// everything a reader cares about falls out of those: whether the long stride
// pairs ever both leave the ground (the suspension a tendon spring needs), and
// whether the short middle pair is planted at the instants a turn would need
// something to push sideways against.
//
// The canon fixes the anatomy: three pairs, the long fore and hind pairs swinging
// the cursorial stride, the shorter middle pair supplying traction and the bracing
// contact for high-speed pivots. Duty factor and phase are ordinary terrestrial
// gait analysis. Nothing about the animal is invented here; only its timing is
// put in the reader's hands.

export const LIMBS = [
  "foreLeft",
  "foreRight",
  "midLeft",
  "midRight",
  "hindLeft",
  "hindRight",
] as const;
export type LimbKey = (typeof LIMBS)[number];

export type GaitKey = "walk" | "trot" | "gallop";

export interface Gait {
  /** Fraction of the stride each foot stays on the ground. */
  duty: number;
  /** Phase gap between the two feet of one long pair. 0.5 = alternating. */
  pairOffset: number;
  /** Where the hind pair lands relative to the fore pair. */
  hindPhase: number;
}

// Duty factors follow the usual terrestrial pattern: a walk keeps each foot down
// for most of the stride, a gallop barely touches. Near-unison long pairs are
// what makes a gallop a gallop.
export const GAITS: Record<GaitKey, Gait> = {
  walk: { duty: 0.68, pairOffset: 0.5, hindPhase: 0.25 },
  trot: { duty: 0.45, pairOffset: 0.5, hindPhase: 0.5 },
  gallop: { duty: 0.3, pairOffset: 0.12, hindPhase: 0.42 },
};

/**
 * The middle pair always alternates left/right. It is a traction pair, not a
 * stride pair — it has no reason to beat in unison the way galloping legs do,
 * so only its position in the stride is left for the reader to choose.
 */
export const MID_PAIR_OFFSET = 0.5;

/** The half of the stride cycle the middle pair's position can meaningfully span. */
export const MID_PHASE_MAX = MID_PAIR_OFFSET;

const LONG_LIMBS: LimbKey[] = ["foreLeft", "foreRight", "hindLeft", "hindRight"];
const MID_LIMBS: LimbKey[] = ["midLeft", "midRight"];

const wrap = (x: number) => ((x % 1) + 1) % 1;

/** Phase offset of every limb, given the gait and where the middle pair lands. */
export function limbPhases(gait: Gait, midPhase: number): Record<LimbKey, number> {
  return {
    foreLeft: 0,
    foreRight: wrap(gait.pairOffset),
    midLeft: wrap(midPhase),
    midRight: wrap(midPhase + MID_PAIR_OFFSET),
    hindLeft: wrap(gait.hindPhase),
    hindRight: wrap(gait.hindPhase + gait.pairOffset),
  };
}

/** Is this foot on the ground at stride fraction `t`? */
export function isDown(phase: number, duty: number, t: number): boolean {
  return wrap(t - phase) < duty;
}

export interface SupportProfile {
  /** Feet on the ground, sampled evenly across one stride. */
  samples: number[];
  minFeet: number;
  maxFeet: number;
  /** Share of the stride with both long stride pairs clear of the ground. */
  suspensionShare: number;
  /**
   * Of the instants when at most one long foot is still down, the share that has
   * a middle foot planted. Two feet half a stride apart always cover the same
   * total time, so *when* the middle pair lands is the only thing that decides
   * whether a brace exists at the moment it is needed.
   */
  braceScore: number;
  verdict: "grounded" | "bouncing" | "unbraced";
}

const SAMPLES = 120;

/** Threshold below which a turn can arrive with no middle foot planted. */
export const BRACE_FLOOR = 0.75;

export function supportProfile(gait: Gait, midPhase: number): SupportProfile {
  const phases = limbPhases(gait, midPhase);
  const samples: number[] = [];
  let suspended = 0;
  let weakWindows = 0;
  let bracedWeakWindows = 0;

  for (let i = 0; i < SAMPLES; i++) {
    const t = i / SAMPLES;
    const longDown = LONG_LIMBS.filter((l) => isDown(phases[l], gait.duty, t)).length;
    const midDown = MID_LIMBS.filter((l) => isDown(phases[l], gait.duty, t)).length;

    samples.push(longDown + midDown);
    if (longDown === 0) suspended++;
    if (longDown <= 1) {
      weakWindows++;
      if (midDown > 0) bracedWeakWindows++;
    }
  }

  const suspensionShare = suspended / SAMPLES;
  const braceScore = weakWindows === 0 ? 1 : bracedWeakWindows / weakWindows;

  const verdict: SupportProfile["verdict"] =
    braceScore < BRACE_FLOOR ? "unbraced" : suspensionShare > 0 ? "bouncing" : "grounded";

  return {
    samples,
    minFeet: Math.min(...samples),
    maxFeet: Math.max(...samples),
    suspensionShare,
    braceScore,
    verdict,
  };
}

/** Which of the six feet are down at a given stride fraction. */
export function contactsAt(gait: Gait, midPhase: number, t: number): Record<LimbKey, boolean> {
  const phases = limbPhases(gait, midPhase);
  return LIMBS.reduce(
    (acc, limb) => {
      acc[limb] = isDown(phases[limb], gait.duty, t);
      return acc;
    },
    {} as Record<LimbKey, boolean>,
  );
}
