// Structural arithmetic behind PneumaticBoneBudget. Canon gives the banshee's
// wing bones as hollow, carbon-threaded, and flushed with air from a bellows lung
// that carries flight heat out of the skeleton. Those three facts are one design
// problem: how thin can the wall of a tube get before the saving turns into a
// failure?
//
// Bending stiffness of a tube goes with the second moment of area
//   I = (pi/4) (Ro^4 - Ri^4) = (pi/4) Ro^4 (1 - k^4),   k = Ri/Ro
// Hold the required stiffness E·I fixed and the cross-sectional area needed
// collapses to one clean expression:
//   A = 2 sqrt(pi I) * sqrt((1 - k^2)/(1 + k^2))
// So hollowing buys mass for free at constant stiffness — the material moves
// outward to where it does the most work. The bill comes due as the wall thins:
// a tube with too high a radius-to-wall ratio stops failing by bending and starts
// failing by local buckling, crumpling like a drink can.
//
// Stiffer material shrinks the tube instead: I scales as 1/E, and Ro as I^(1/4),
// so tripling stiffness trims the outer diameter by 3^-0.25 ≈ 24% — the same
// figure the chapter quotes for Pandoran bone. The multiplier is the chapter's
// stated worked assumption, not a canon measurement.

/** Stiffness of each bone material, relative to Earth calcium-phosphate bone. */
export const MATERIALS = { mineral: 1, carbon: 3 } as const;
export type MaterialKey = keyof typeof MATERIALS;

/** Radius-to-wall ratio beyond which local buckling, not bending, sets the limit. */
export const THIN_WALL_LIMIT = 18;

/** Observed hollowness of real skeletons, for reference marks on the dial. */
export const REFERENCE_HOLLOWNESS = [
  { key: "mammal", k: 0.55 },
  { key: "bird", k: 0.8 },
  { key: "pterosaur", k: 0.9 },
] as const;

export interface SparBudget {
  /** Cross-sectional area, relative to a solid mineral spar of equal stiffness. */
  relativeMass: number;
  /** Outer diameter, relative to that same solid mineral spar. */
  relativeDiameter: number;
  /** Outer radius divided by wall thickness — the local-buckling number. */
  wallRatio: number;
  /** Share of the spar's cross-section that is open air channel. */
  channelShare: number;
  /** Percent of the solid-mineral spar's mass this design saves. */
  massSavedPct: number;
  verdict: "solid" | "tuned" | "fragile";
}

const clampK = (k: number) => Math.min(0.96, Math.max(0, k));

// Area factor at constant stiffness, normalized so a solid spar reads 1.
function areaFactor(k: number): number {
  return Math.sqrt((1 - k * k) / (1 + k * k));
}

export function sparBudget(hollowness: number, material: MaterialKey): SparBudget {
  const k = clampK(hollowness);
  const stiffness = MATERIALS[material];

  // Required I falls as 1/E; area goes as sqrt(I), diameter as I^(1/4).
  const stiffnessArea = 1 / Math.sqrt(stiffness);
  const stiffnessDiameter = stiffness ** -0.25;

  const relativeMass = areaFactor(k) * stiffnessArea;
  // Ro grows as (1 - k^4)^(-1/4) when the tube is hollowed at constant stiffness.
  const relativeDiameter = (1 - k ** 4) ** -0.25 * stiffnessDiameter;

  // Ro/t with t = Ro(1 - k). A solid rod is reported at its floor of 1.
  const wallRatio = k >= 1 ? Number.POSITIVE_INFINITY : 1 / (1 - k);
  const channelShare = k * k;
  const massSavedPct = (1 - relativeMass) * 100;

  const verdict: SparBudget["verdict"] =
    wallRatio > THIN_WALL_LIMIT ? "fragile" : k < 0.35 ? "solid" : "tuned";

  return { relativeMass, relativeDiameter, wallRatio, channelShare, massSavedPct, verdict };
}

/** Cooling airflow the lumen can carry, relative to a bird-like bone (k = 0.8). */
export function coolingCapacity(hollowness: number): number {
  const birdShare = 0.8 * 0.8;
  return clampK(hollowness) ** 2 / birdShare;
}
