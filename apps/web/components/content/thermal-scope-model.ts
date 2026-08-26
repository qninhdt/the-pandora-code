// How cold water slows an animal down, and by how much in each currency.
//
// Rate processes in an ectotherm scale with temperature by a coefficient measured
// over a ten-degree interval:
//
//   Q10 = (R2/R1)^(10/(T2-T1))   →   R(T) = R_ref · Q10^((T − T_ref)/10)
//
// For marine ectotherms Q10 runs 2.0-2.5, so dropping from 25 °C surface water to
// 2-4 °C in the deep costs a factor of 4-6 in metabolic rate. That number gets
// quoted as though it were a speed penalty. It is not, and the difference is the
// interesting part.
//
// Sustained swimming power goes as the cube of speed, so a factor of 5 in
// available power is only a factor of 5^(1/3) ≈ 1.7 in speed. Cold water makes a
// predator meaningfully but not catastrophically slower.
//
// Timing is where it bites. Muscle twitch frequency and neural conduction scale
// with rate directly, not with its cube root, so a fivefold metabolic penalty is a
// fivefold penalty on how fast the animal can change what it is doing. A
// coordinated pack strike is a timing problem before it is a speed problem: every
// animal has to commit inside the same fraction of a second, against prey that is
// also manoeuvring. That is the constraint an ectothermic tsyong cannot meet, and
// it is the reason tunas and lamnid sharks evolved counter-current vascular
// bundles - retia mirabilia - that trap the heat their red muscle produces and hold
// swimming muscle and braincase 5-15 °C above the water they swim in.
//
// Calibration: the reference state is a 25 °C surface animal at a 9 m/s burst and a
// 120 ms strike latency. Deterministic; no randomness.

/** Reference temperature the scaling is normalised against (°C). */
export const REFERENCE_TEMP_C = 25;

/** Burst speed of the reference warm-water animal (m s^-1). */
const REFERENCE_BURST_MS = 9;

/** Strike latency of the reference warm-water animal (ms). */
const REFERENCE_LATENCY_MS = 120;

/**
 * Latency a coordinated pack strike has to beat. Above this, the members cannot
 * commit inside the same window and the ambush becomes a chase.
 */
export const PACK_STRIKE_LATENCY_MS = 260;

/** Speed a pack strike on manoeuvring prey has to reach (m s^-1). */
export const PACK_STRIKE_SPEED_MS = 6;

export interface ThermalScope {
  /** Operating temperature of the swimming muscle (°C). */
  muscleTempC: number;
  /** Metabolic rate as a fraction of the warm-water reference. */
  rateFraction: number;
  /** Achievable burst speed (m s^-1). */
  burstMs: number;
  /** Neural + muscular latency of a strike decision (ms). */
  latencyMs: number;
  /** True when both speed and timing clear the pack-strike thresholds. */
  meetsPackStrike: boolean;
}

export function thermalScope(ambientTempC: number, q10: number, retialGainC: number): ThermalScope {
  const muscleTempC = ambientTempC + retialGainC;
  const rateFraction = q10 ** ((muscleTempC - REFERENCE_TEMP_C) / 10);

  // Drag power goes as u³, so speed recovers only as the cube root of rate.
  const burstMs = REFERENCE_BURST_MS * rateFraction ** (1 / 3);
  // Twitch frequency and conduction velocity track rate directly.
  const latencyMs = REFERENCE_LATENCY_MS / rateFraction;

  return {
    muscleTempC,
    rateFraction,
    burstMs,
    latencyMs,
    meetsPackStrike: burstMs >= PACK_STRIKE_SPEED_MS && latencyMs <= PACK_STRIKE_LATENCY_MS,
  };
}

/** Retial heat gain needed to bring an animal at this temperature up to spec (°C). */
export function requiredRetialGain(ambientTempC: number, q10: number): number {
  for (let gain = 0; gain <= 20; gain += 0.5) {
    if (thermalScope(ambientTempC, q10, gain).meetsPackStrike) return gain;
  }
  return Number.POSITIVE_INFINITY;
}
