// Reading a planet's interior from the arrivals it fails to deliver.
//
// Two body waves leave an earthquake. P waves are compressional and travel at
//   vP = sqrt((K + 4µ/3)/ρ)
// S waves are shear and travel at
//   vS = sqrt(µ/ρ)
// where K is the bulk modulus, µ the shear modulus and ρ the density. A fluid
// has no shear strength at all — µ ≡ 0 — so vS = 0 and a shear wave simply
// cannot cross it. That single fact is what proved Earth's outer core liquid.
//
// The angular boundaries below are Earth's, measured: direct P and S arrive out
// to ~103° epicentral distance, where the ray path grazes the core-mantle
// boundary. Beyond that the mantle path is cut off. From 103° to ~143° there is
// a P shadow — strong downward refraction into the slower core bends P rays away
// from that annulus — and past 143° P returns as PKP, having crossed the core.
// The S arrival never returns. Faint precursors inside the shadow, which
// Lehmann identified in 1936, are PKIKP: P that crossed the solid inner core.
//
// Set the core solid and every boundary dissolves: S propagates straight
// through and there is no shadow anywhere. The comparison is the lesson.

export type CoreState = "liquid" | "solid";

/** Angle where a direct mantle ray grazes the core–mantle boundary (degrees). */
export const CMB_GRAZE_DEG = 103;

/** Angle beyond which core-refracted P (PKP) reappears (degrees). */
export const PKP_RETURN_DEG = 143;

export type Arrival = "direct" | "throughCore" | "precursor" | "none";

export interface Arrivals {
  p: Arrival;
  s: Arrival;
}

export function arrivalsAt(distanceDeg: number, core: CoreState): Arrivals {
  if (core === "solid") {
    // A wholly solid interior transmits both waves at every distance; the ray
    // simply speeds up crossing the core.
    return {
      p: distanceDeg <= CMB_GRAZE_DEG ? "direct" : "throughCore",
      s: distanceDeg <= CMB_GRAZE_DEG ? "direct" : "throughCore",
    };
  }
  if (distanceDeg <= CMB_GRAZE_DEG) return { p: "direct", s: "direct" };
  if (distanceDeg < PKP_RETURN_DEG) return { p: "precursor", s: "none" };
  return { p: "throughCore", s: "none" };
}

/** Which named phase the P arrival corresponds to, for the readout. */
export function pPhase(distanceDeg: number, core: CoreState): string {
  const { p } = arrivalsAt(distanceDeg, core);
  if (p === "direct") return "P";
  if (p === "precursor") return "PKIKP";
  return "PKP";
}

export const ARRIVAL_TONE: Record<Arrival, string> = {
  direct: "var(--cyan)",
  throughCore: "var(--teal)",
  precursor: "var(--amber)",
  none: "var(--stone)",
};

/** True when the distance sits inside the shear-wave shadow. */
export function inShadow(distanceDeg: number, core: CoreState): boolean {
  return arrivalsAt(distanceDeg, core).s === "none";
}

// ── Cross-section geometry ────────────────────────────────────────────────
// Radii as fractions of the planet's radius, matching Earth: the core–mantle
// boundary sits at 2,890 km depth (0.547 R) and the inner core at 1,220 km
// radius (0.191 R).
export const R_CMB = 0.547;
export const R_INNER = 0.191;

/**
 * Screen position of a point on the surface at a given angle from the source,
 * with the source at the top of the circle. Returns unit-circle coordinates.
 */
export function surfacePoint(distanceDeg: number): { x: number; y: number } {
  const a = ((distanceDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(a), y: Math.sin(a) };
}
