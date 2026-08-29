// The bookkeeping behind RubiscoErrorLedger, kept separate so the component file
// stays lean. Rubisco, the enzyme that fixes carbon for nearly every food chain
// on Earth, cannot reliably tell carbon dioxide from oxygen. Most of the time it
// grabs CO2 and makes sugar. Some of the time it grabs O2 instead and makes a
// broken two-carbon fragment the cell must spend energy to clean up, giving one
// CO2 back for every two mistakes.
//
// Which reaction wins is set by the ratio of the two substrates dissolved at the
// enzyme, scaled by how much Rubisco prefers carbon when both are on offer:
//
//   v_c / v_o = S_c/o · (C_c / O)
//
// The ratio that matters is of dissolved concentrations, not of the gases in the
// air: CO2 is roughly 26 times more soluble in water than O2, which quietly
// rescues Earth's leaves. In Earth air the two gases stand at about 425 ppm
// against 210,000 — a 0.0012 gas ratio that solubility lifts to about 0.05,
// leaving Rubisco near five carboxylations per mistake and handing back on the
// order of a tenth of gross fixation as CO2. (The full bill is worse: the salvage
// pathway also burns ATP and reducing power, which this ledger does not charge.)
// In Pandora's air the two gases stand nearly equal and the oxygenation reaction
// essentially stops happening — which rewrites the economics of every
// carbon-concentrating trick Earth plants evolved.

export type Pathway = "c3" | "c4" | "cam";

/** Rubisco's specificity for CO2 over O2 in land plants. */
export const SPECIFICITY = 90;

/**
 * How much better CO2 dissolves than O2 in water at leaf temperature. Without
 * this factor the enzyme's error rate looks catastrophic on Earth.
 */
export const SOLUBILITY_RATIO = 26.5;

/** Ambient CO2 in ppm for the two reference atmospheres. */
export const CO2_EARTH = 425;
export const CO2_PANDORA = 200_000;

/** Extra ATP each concentrating pathway spends per CO2 delivered to Rubisco. */
const PUMP_COST: Record<Pathway, number> = { c3: 0, c4: 2, cam: 2.5 };

/**
 * CO2 the pump maintains around Rubisco, in ppm. C4 bundle-sheath cells hold
 * >1000 ppm; CAM opens at night and decarboxylates malate behind shut pores.
 * Neither can improve on an atmosphere that already exceeds them.
 */
const PUMP_FLOOR: Record<Pathway, number> = { c3: 0, c4: 1_200, cam: 1_500 };

export interface LedgerResult {
  /** Fraction of Rubisco events that grab CO2 rather than O2. */
  carboxylationShare: number;
  /** Carbon lost to cleaning up the mistakes, as a fraction of gross fixation. */
  photorespiratoryLoss: number;
  /** Net carbon kept, per 100 units gross fixed. */
  netCarbon: number;
  /** ATP spent running the concentrating pump, per CO2 fixed. */
  pumpCost: number;
  /** Whether the pump is now buying nothing it wasn't already getting free. */
  pumpRedundant: boolean;
  /** Effective substrate ratio at the enzyme after any pump. */
  effectiveRatio: number;
}

/**
 * Run the ledger.
 *
 * @param ambientPpm ambient CO2 in ppm
 * @param pathway    which carbon-concentrating strategy the plant runs
 * @param o2Ppm      ambient O2 in ppm (Earth ~210,000; Pandora's is similar)
 */
export function ledger(ambientPpm: number, pathway: Pathway, o2Ppm = 210_000): LedgerResult {
  // A pump only helps when the atmosphere is thinner than the pump's own floor.
  const atRubisco = Math.max(ambientPpm, PUMP_FLOOR[pathway]);
  const pumpRedundant = pathway !== "c3" && ambientPpm >= PUMP_FLOOR[pathway];
  // Dissolved-phase ratio: the gas ratio, corrected for CO2's higher solubility.
  const effectiveRatio = (atRubisco / o2Ppm) * SOLUBILITY_RATIO;

  // v_c/v_o = S · C/O → share of events that are carboxylations.
  const vcOverVo = SPECIFICITY * effectiveRatio;
  const carboxylationShare = vcOverVo / (1 + vcOverVo);
  const oxygenationShare = 1 - carboxylationShare;

  // Two oxygenations release one CO2 back: loss = 0.5 · (v_o / v_c).
  const lossRatio = carboxylationShare > 0 ? (0.5 * oxygenationShare) / carboxylationShare : 1;
  const photorespiratoryLoss = Math.min(0.95, lossRatio);

  return {
    carboxylationShare,
    photorespiratoryLoss,
    netCarbon: Math.max(0, 100 * (1 - photorespiratoryLoss)),
    pumpCost: PUMP_COST[pathway],
    pumpRedundant,
    effectiveRatio,
  };
}

/**
 * A deterministic sequence of enzyme events for the animated tally: `true` is a
 * carboxylation (sugar), `false` an oxygenation (a mistake to clean up). Spread
 * evenly rather than randomly so the display is stable across renders and the
 * proportion is legible at a glance.
 */
export function eventSequence(carboxylationShare: number, count: number): boolean[] {
  const events: boolean[] = [];
  let credit = 0;
  for (let i = 0; i < count; i++) {
    credit += carboxylationShare;
    if (credit >= 1) {
      credit -= 1;
      events.push(true);
    } else {
      events.push(false);
    }
  }
  return events;
}
