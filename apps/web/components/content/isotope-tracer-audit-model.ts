// The audit logic behind IsotopeTracerAudit. Each control is one thing a real
// carbon-tracing experiment can either do or skip, and the ladder of claims the
// design earns is strictly gated by them: without two distinguishable labels you
// cannot say whose carbon you found; without a hyphae-severing mesh you cannot
// say it travelled through the fungus rather than leaking into soil; without a
// shading gradient you cannot speak of need-directed flow; and without related
// receivers in continuous wild forest the mother-tree claim is simply untested.
// Simard's design earns the middle rungs cleanly. The top rung is the one the
// popular retelling took without paying for it.

export type ControlId = "dualIsotope" | "meshBarrier" | "sourceSink" | "kinDesign" | "wildForest";

export const CONTROL_ORDER: ControlId[] = [
  "dualIsotope",
  "meshBarrier",
  "sourceSink",
  "kinDesign",
  "wildForest",
];

/** Strongest claim the design supports, weakest first. */
export type Rung = "none" | "movement" | "route" | "gradient" | "kin";

/** Where a detected molecule could legitimately have come from. */
export type Attribution = "unknown" | "soilLeak" | "fungalRoute";

/** The single biggest hole left in the design. */
export type Confound =
  | "donorUnknown"
  | "soilLeak"
  | "noGradient"
  | "kinUntested"
  | "potArtifact"
  | "none";

export interface AuditResult {
  rung: Rung;
  attribution: Attribution;
  confound: Confound;
}

// Hue per rung so the readout reads at a glance: an unearned claim burns magenta,
// the middle rungs the real experiments reached read teal, and the kin rung —
// reachable here only with every control in place — reads amber, because even
// then it is the rung field ecology has never actually closed.
export const RUNG_TONE: Record<Rung, string> = {
  none: "var(--magenta)",
  movement: "var(--magenta)",
  route: "var(--teal)",
  gradient: "var(--teal)",
  kin: "var(--amber)",
};

export function auditDesign(controls: Record<ControlId, boolean>): AuditResult {
  // No distinguishable labels: a molecule in the receiver proves nothing about
  // where it started, so no rung is available at all.
  if (!controls.dualIsotope) {
    return { rung: "none", attribution: "unknown", confound: "donorUnknown" };
  }

  // Labels but no barrier: movement between plants is real, but the soil matrix
  // is an open alternative route and cannot be ruled out.
  if (!controls.meshBarrier) {
    return { rung: "movement", attribution: "soilLeak", confound: "soilLeak" };
  }

  // Barrier in place: whatever crossed, crossed through the fungal link.
  if (!controls.sourceSink) {
    return { rung: "route", attribution: "fungalRoute", confound: "noGradient" };
  }

  // A gradient turns "it moved" into "it moved toward need" — Simard's result.
  if (!controls.kinDesign) {
    return { rung: "gradient", attribution: "fungalRoute", confound: "kinUntested" };
  }

  // Kin comparison in pots still cannot speak for a wild forest.
  if (!controls.wildForest) {
    return { rung: "gradient", attribution: "fungalRoute", confound: "potArtifact" };
  }

  return { rung: "kin", attribution: "fungalRoute", confound: "none" };
}
