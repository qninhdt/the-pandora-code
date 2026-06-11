// The trade arithmetic behind MycorrhizalMarket, kept separate so the component
// file stays lean. The reader plays a plant deciding how much carbon (sugar) to
// pay a fungal partner each round; the fungus answers with phosphorus. The point
// the figure makes is that reciprocal reward and sanction keep the trade fair
// over repeated rounds with nobody coordinating — a biological market, not a
// hive mind. Trust is the memory that makes the market emerge: an honest partner
// rewarded with fair pay grows more generous; underpay it and it cools off; a
// cheat slides toward starvation no matter what. Every visible string lives in
// the component's translations.

export type Partner = "generous" | "cheat";

// Phosphorus returned per unit carbon, before trust and reward bonuses apply.
export const PARTNER_YIELD: Record<Partner, number> = {
  generous: 1.15,
  cheat: 0.35,
};

// Carbon at or above this "fair price" earns the plant rising trust + a reward
// bonus from an honest partner; underpaying erodes the relationship.
export const FAIR_PRICE = 55;

// Phosphorus is capped — a partner can only move so much per round.
export const PHOS_CAP = 160;

export const TRUST_START = 0.5;

export interface TradeResult {
  /** Phosphorus the fungus returns this round. */
  phosphorus: number;
  /** Net benefit to the plant: phosphorus gained minus carbon paid. */
  net: number;
  /** Updated trust after this round, clamped to [0, 1]. */
  trust: number;
  /** What the plant's strategy reads as, for guidance text. */
  verdict: "reward" | "sanction" | "cheated";
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// One round of the market. `trust` is the relationship's current memory; the
// return carries the *next* trust so the caller can commit it when the round is
// accepted. An honest partner's yield is amplified by trust (a long, fair
// history pays compounding dividends); a cheat ignores trust entirely and is
// always capped low — the sanction the plant cannot bargain away.
export function tradeStep(trust: number, carbon: number, partner: Partner): TradeResult {
  const yieldRate = PARTNER_YIELD[partner];

  // Trust amplifies an honest partner (0.6→1.1×); a cheat is deaf to it.
  const trustGain = partner === "generous" ? 0.6 + 0.5 * trust : 1;
  const base = carbon * yieldRate * trustGain;

  // Reciprocal reward: paying at/above the fair price earns a little extra from
  // an honest partner. A cheat returns nothing beyond its meagre base.
  const rewardBonus =
    partner === "generous" && carbon > FAIR_PRICE ? (carbon - FAIR_PRICE) * 0.45 : 0;

  const phosphorus = Math.round(Math.min(base + rewardBonus, PHOS_CAP));
  const net = phosphorus - carbon;

  // Trust update: an honest partner warms to fair pay and cools to underpay; a
  // cheat steadily loses the plant's confidence and gets starved out.
  let nextTrust: number;
  if (partner === "cheat") {
    nextTrust = clamp01(trust - 0.16);
  } else {
    nextTrust = clamp01(trust + (carbon >= FAIR_PRICE ? 0.12 : -0.12));
  }

  const verdict: TradeResult["verdict"] =
    partner === "cheat" ? "cheated" : net > 0 ? "reward" : "sanction";

  return { phosphorus, net, trust: nextTrust, verdict };
}

// Sample a cubic Bézier at t∈[0,1] — used to flow trade particles along the
// carbon/phosphorus arcs drawn in the figure.
export function cubicAt(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  t: number,
): { x: number; y: number } {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    y: a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  };
}
