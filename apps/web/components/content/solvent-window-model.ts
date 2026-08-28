// The solvent bench behind SolventWindowBench, kept separate so the figure stays
// lean. The chapter's claim is that water is "close to a universal optimum" — and
// the phrase "close to" is doing real work. This model holds the four candidate
// solvents the astrobiology literature actually takes seriously, with the two
// numbers that decide most of the argument (the temperature band over which the
// liquid exists, and how polar it is) plus three biochemical gates a solvent has
// to pass before a cell can be built in it. Nothing here is scored or ranked:
// the reader is handed the same columns a working astrobiologist would compare,
// and the figure refuses to pretend water wins on every one. Formamide beats it
// on both raw numbers, which is exactly why the honest verdict is "close to".

export type SolventId = "water" | "ammonia" | "methane" | "formamide";

/** Physical state of a solvent at a given temperature, at ~1 atm. */
export type PhaseState = "solid" | "liquid" | "gas";

/**
 * How well a solvent clears one requirement of building a cell.
 * `works` — demonstrated (Earth biology does it, or the chemistry plainly allows it).
 * `untested` — the solvent is polar enough that the mechanism is not excluded,
 *   but no one has shown it working. Honest amber, not a quiet yes.
 * `fails` — ruled out by the solvent's own chemistry.
 */
export type GateState = "works" | "untested" | "fails";

export interface Solvent {
  id: SolventId;
  formula: string;
  /** Melting point at 1 atm (K). */
  meltK: number;
  /** Boiling point at 1 atm (K). */
  boilK: number;
  /** Dielectric constant — the standard measure of solvent polarity. */
  dielectric: number;
  /** Gates: dissolving polar biomolecules, folding proteins, building a membrane. */
  gates: {
    /** Can it dissolve the polar molecules biochemistry runs on? */
    solvation: GateState;
    /** Does the hydrophobic effect exist in it, so proteins can fold? */
    folding: GateState;
    /** Can an ordinary lipid bilayer self-assemble in it? */
    membrane: GateState;
  };
}

// Liquid ranges and dielectric constants as tabulated in the chapter's research
// note. Methane's non-polarity is the load-bearing fact: with no hydrogen
// bonding there is no hydrophobic effect and no ordinary bilayer, which is why
// theorists have to invent a different membrane (an "azotosome") for Titan.
export const SOLVENTS: Record<SolventId, Solvent> = {
  water: {
    id: "water",
    formula: "H₂O",
    meltK: 273,
    boilK: 373,
    dielectric: 78.4,
    gates: { solvation: "works", folding: "works", membrane: "works" },
  },
  ammonia: {
    id: "ammonia",
    formula: "NH₃",
    meltK: 195,
    boilK: 240,
    dielectric: 22.0,
    gates: { solvation: "works", folding: "untested", membrane: "untested" },
  },
  methane: {
    id: "methane",
    formula: "CH₄",
    meltK: 91,
    boilK: 111,
    dielectric: 1.7,
    gates: { solvation: "fails", folding: "fails", membrane: "fails" },
  },
  formamide: {
    id: "formamide",
    formula: "HCONH₂",
    meltK: 271,
    boilK: 483,
    dielectric: 109.0,
    gates: { solvation: "works", folding: "untested", membrane: "untested" },
  },
};

export const SOLVENT_ORDER: SolventId[] = ["methane", "ammonia", "water", "formamide"];

/** Width of the liquid window in kelvin — how forgiving a world's climate can be. */
export function windowWidthK(s: Solvent): number {
  return s.boilK - s.meltK;
}

/** Where the solvent sits at this surface temperature. */
export function phaseAt(s: Solvent, tempK: number): PhaseState {
  if (tempK < s.meltK) return "solid";
  if (tempK > s.boilK) return "gas";
  return "liquid";
}

/** How many of the four candidates are liquid at this temperature. */
export function liquidAt(tempK: number): SolventId[] {
  return SOLVENT_ORDER.filter((id) => phaseAt(SOLVENTS[id], tempK) === "liquid");
}

/** Ordered gate keys, so the figure and its translations stay in step. */
export const GATE_ORDER = ["solvation", "folding", "membrane"] as const;
export type GateId = (typeof GATE_ORDER)[number];
