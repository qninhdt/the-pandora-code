// What actually ends a burning flyer's flight. The temptation is to ask how long
// the wing takes to burn through — but that is the wrong question, and the
// arithmetic shows why. A flight membrane is mostly water, and water is an
// extraordinary thermal buffer: boiling it off consumes 2.26 MJ per kilogram, far
// more than heating the tissue ever did. So burn-through is slow. Control is not.
// Collagen unwinds at 58-65 C and contracts hard along its fibre axes, and a
// contracted, puckered membrane on one wing is an uncommanded rolling moment. The
// wing stops flying long before it stops existing.
//
// The membrane is thermally thin (Biot number well under 0.1), so it heats
// uniformly through its thickness and time-to-each-stage scales linearly with
// areal thermal mass. Parameters follow the bat wing-membrane literature scaled to
// a large flyer; treat the outputs as order-of-magnitude, not stopwatch readings.
// Deterministic; no randomness.

const RHO_MEMBRANE = 1080; // kg/m^3, hydrated collagen-elastin tissue
const WATER_FRACTION = 0.7; // mass fraction of water in living patagium
const CP_WET = 3.6; // kJ/(kg K), hydrated tissue
const CP_DRY = 1.5; // kJ/(kg K), dried collagen matrix
const H_VAPORISATION = 2260; // kJ/kg, latent heat of water
const H_PYROLYSIS = 500; // kJ/kg, endothermic decomposition of the dry matrix
const H_CONVECTIVE = 55; // W/(m^2 K), forced convection at flight speed
const K_MEMBRANE = 0.5; // W/(m K), thermal conductivity of wet tissue

const T_AMBIENT = 25; // C
const T_DENATURE = 60; // C — collagen triple helix unwinds
const T_BOIL = 100; // C
const T_CHAR = 250; // C — matrix pyrolyses to char

/** Loss of control follows denaturation by this factor as contraction accumulates. */
const LOC_SPREAD = 1.6;

export type PhaseKey = "denature" | "boil" | "desiccate" | "char";

export interface Phase {
  key: PhaseKey;
  /** Duration of this phase alone (s). */
  seconds: number;
  tone: string;
}

export interface WingTimeBudget {
  phases: Phase[];
  /** Cumulative time to collagen denaturation (s). */
  denatureAt: number;
  /** Earliest and latest plausible loss of roll control (s). */
  locFrom: number;
  locTo: number;
  /** Cumulative time to physical burn-through (s). */
  burnThroughAt: number;
  /** Share of the burn-through budget spent boiling water off (%). */
  waterSharePct: number;
  /** Biot number — confirms the thermally-thin assumption holds. */
  biot: number;
}

/**
 * Phase-by-phase thermal budget for a membrane of `thicknessMm` under a steady
 * incident `fluxKw` (kW/m^2). Each phase's net flux subtracts the convective loss
 * at that phase's mean surface temperature, so hotter phases progress slower.
 */
export function wingTimeBudget(thicknessMm: number, fluxKw: number): WingTimeBudget {
  const delta = thicknessMm / 1000; // m
  const arealMass = RHO_MEMBRANE * delta; // kg/m^2
  const waterMass = arealMass * WATER_FRACTION;
  const dryMass = arealMass - waterMass;

  // Net absorbed flux once convection has taken its share at a given mean surface
  // temperature. Never let it reach zero — a stalled phase is not a real outcome
  // in the regime this figure covers.
  const net = (meanTempC: number) =>
    Math.max(0.5, fluxKw - (H_CONVECTIVE * (meanTempC - T_AMBIENT)) / 1000);

  const qDenature = arealMass * CP_WET * (T_DENATURE - T_AMBIENT);
  const qBoil = arealMass * CP_WET * (T_BOIL - T_DENATURE);
  const qDesiccate = waterMass * H_VAPORISATION;
  const qChar = dryMass * (CP_DRY * (T_CHAR - T_BOIL) + H_PYROLYSIS);

  const tDenature = qDenature / net((T_AMBIENT + T_DENATURE) / 2);
  const tBoil = qBoil / net((T_DENATURE + T_BOIL) / 2);
  const tDesiccate = qDesiccate / net(T_BOIL);
  const tChar = qChar / net((T_BOIL + T_CHAR) / 2);

  const burnThroughAt = tDenature + tBoil + tDesiccate + tChar;

  return {
    phases: [
      { key: "denature", seconds: tDenature, tone: "var(--amber)" },
      { key: "boil", seconds: tBoil, tone: "var(--cyan)" },
      { key: "desiccate", seconds: tDesiccate, tone: "var(--teal)" },
      { key: "char", seconds: tChar, tone: "var(--magenta)" },
    ],
    denatureAt: tDenature,
    locFrom: tDenature,
    locTo: tDenature * LOC_SPREAD,
    burnThroughAt,
    waterSharePct: (tDesiccate / burnThroughAt) * 100,
    biot: (H_CONVECTIVE * delta) / K_MEMBRANE,
  };
}
