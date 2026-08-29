// The chapter's instrument: reservoir ÷ flux = residence time, and its inversion.
// Divide how much of something a reservoir holds by the rate it leaves and you get
// the average time an atom stays. Run it backwards and you get the harder question:
// to HOLD a reservoir at a stated size against a known sink, what source flux is
// required? That inversion is what breaks Pandora's stated hydrogen sulfide.
//
// Every Pandoran figure here is arithmetic from canonical inputs (radius, surface
// gravity, surface pressure, published composition percentages) — not a canonical
// number in its own right. Earth figures are published observations.
// Deterministic; no randomness.

/** Pandora's atmospheric column, from canonical radius, gravity and pressure. */
export const PANDORA_ATM_MOLES = 1.283e20;
/** Earth's atmosphere, for comparison. */
export const EARTH_ATM_MASS_KG = 5.148e18;
export const PANDORA_ATM_MASS_KG = 4.785e18;

export type AuditWorld = "earth" | "pandora";

export interface AuditCase {
  id: string;
  world: AuditWorld;
  /** Reservoir size, in the case's own mass unit. */
  reservoir: number;
  /** Removal rate in mass-unit per year. */
  sink: number;
  /** Mass unit key, resolved to a localized label by the component. */
  unit: "GtC" | "TgN" | "TgP" | "TgS";
  tone: "cyan" | "teal" | "amber" | "magenta";
}

// Five audits, ordered so the reader walks from a comfortable Earth number into
// the one that fails. Sinks are the dominant removal term for each reservoir.
export const AUDIT_CASES: AuditCase[] = [
  // Earth's airborne carbon against gross photosynthetic + air-sea uptake.
  { id: "earthCarbon", world: "earth", reservoir: 875, sink: 210, unit: "GtC", tone: "teal" },
  // Pandora's airborne carbon against silicate weathering, scaled up for the
  // high-CO₂ warm-wet regime (~10x Earth's 0.25 GtC/yr).
  { id: "pandoraCarbon", world: "pandora", reservoir: 285000, sink: 2.5, unit: "GtC", tone: "cyan" },
  // Ocean dissolved phosphate against burial — the long one, and the reason
  // fertility is a tectonic property. Quoted residence times for oceanic
  // phosphorus range from a few thousand years to a few tens of thousands
  // depending on whether total river input or only the reactive fraction that
  // reaches open-ocean burial is counted; this is the total-input arithmetic.
  { id: "oceanPhosphorus", world: "earth", reservoir: 84000, sink: 20, unit: "TgP", tone: "amber" },
  // Earth's atmospheric N₂ against total biological + industrial fixation.
  { id: "earthNitrogen", world: "earth", reservoir: 3.9e9, sink: 400, unit: "TgN", tone: "teal" },
  // Pandora's stated hydrogen sulfide against hydroxyl oxidation. The sink here
  // is derived from a ~2-day photochemical lifetime, not measured.
  {
    id: "pandoraSulfide",
    world: "pandora",
    reservoir: 4.11e7,
    sink: 7.5e9,
    unit: "TgS",
    tone: "magenta",
  },
];

export function auditCaseById(id: string): AuditCase {
  return AUDIT_CASES.find((c) => c.id === id) ?? AUDIT_CASES[0];
}

/** Reference timescales the computed residence time is placed against. */
export interface TimeMarker {
  id: string;
  years: number;
}

export const TIME_MARKERS: TimeMarker[] = [
  { id: "day", years: 1 / 365 },
  { id: "year", years: 1 },
  { id: "lifetime", years: 80 },
  { id: "thermostat", years: 1e6 },
  { id: "canonStability", years: 1.2e7 },
];

export const TAU_MIN_YEARS = 1e-4;
export const TAU_MAX_YEARS = 1e9;

export type TauBand = "instant" | "fast" | "slow" | "geological";

export interface AuditResult {
  /** Residence time in years: reservoir ÷ sink. */
  tauYears: number;
  /** The same, in days, for the short cases where years read as noise. */
  tauDays: number;
  tauBand: TauBand;
  /**
   * How many times the reservoir must be refilled per Pandoran-canon span of
   * biospheric stability. Makes an implausible sink legible as absurd bookkeeping.
   */
  refillsPerCanonSpan: number;
}

const CANON_STABILITY_YEARS = 1.2e7;

export function audit(reservoir: number, sink: number): AuditResult {
  const safeSink = Math.max(sink, Number.MIN_VALUE);
  const tauYears = reservoir / safeSink;
  return {
    tauYears,
    tauDays: tauYears * 365,
    tauBand: bandFor(tauYears),
    refillsPerCanonSpan: CANON_STABILITY_YEARS / tauYears,
  };
}

function bandFor(tauYears: number): TauBand {
  if (tauYears < 0.1) return "instant";
  if (tauYears < 1e3) return "fast";
  if (tauYears < 1e6) return "slow";
  return "geological";
}

/** The inversion: source flux needed to hold this reservoir at this lifetime. */
export function requiredSource(reservoir: number, tauYears: number): number {
  return reservoir / Math.max(tauYears, Number.MIN_VALUE);
}

/** Log position of a value on the shared time axis, clamped to [0, 1]. */
export function logPosition(years: number, min = TAU_MIN_YEARS, max = TAU_MAX_YEARS): number {
  const clamped = Math.min(max, Math.max(min, years));
  return (Math.log10(clamped) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
}

/** Compact scientific rendering for values spanning many decades. */
export function formatQuantity(value: number): string {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e5 || abs < 1e-2) {
    const exp = Math.floor(Math.log10(abs));
    const mantissa = value / 10 ** exp;
    return `${mantissa.toFixed(1)}e${exp}`;
  }
  if (abs >= 100) return value.toFixed(0);
  if (abs >= 10) return value.toFixed(1);
  return value.toFixed(2);
}
