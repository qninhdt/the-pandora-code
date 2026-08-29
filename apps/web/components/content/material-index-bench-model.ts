// The property data and selection arithmetic behind MaterialIndexBench.
//
// A material is not "strong" or "weak" in the abstract. Which one wins depends
// entirely on the job it is asked to do, because each loading case combines
// stiffness, strength and density differently. Ashby's performance indices make
// that explicit — for minimum mass at a required performance:
//
//   tie in tension          M = sigma / rho
//   beam/spar in bending    M = sqrt(E) / rho
//   column in compression   M = E^(1/3) / rho
//   elastic energy store    M = sigma^2 / (E rho)
//
// Swapping jobs reshuffles the ranking, which is the whole point of the figure:
// steel wins nothing per unit weight, wood beats it at every structural job, and
// silk only dominates once the job is storing energy rather than holding shape.
//
// Property values are mid-range figures for each material. Ranges in the source
// literature are wide (bone varies with age and direction, wood with species and
// grain angle), so these are representative rather than exact.

export type StructuralJob = "tie" | "beam" | "column" | "spring";

export interface MaterialSpec {
  key: string;
  /** Young's modulus, GPa. */
  E: number;
  /** Yield or tensile strength, MPa. */
  sigma: number;
  /** Density, g/cm^3. */
  rho: number;
  /** Grown by an organism, or manufactured. */
  origin: "biological" | "engineered";
}

export const MATERIALS: MaterialSpec[] = [
  { key: "bone", E: 20, sigma: 145, rho: 1.95, origin: "biological" },
  { key: "nacre", E: 65, sigma: 155, rho: 2.7, origin: "biological" },
  { key: "wood", E: 11.5, sigma: 90, rho: 0.5, origin: "biological" },
  { key: "balsa", E: 2.5, sigma: 20, rho: 0.14, origin: "biological" },
  { key: "cuticle", E: 6.5, sigma: 78, rho: 1.25, origin: "biological" },
  { key: "tendon", E: 1.5, sigma: 100, rho: 1.15, origin: "biological" },
  { key: "silk", E: 12.5, sigma: 1400, rho: 1.3, origin: "biological" },
  { key: "biosilica", E: 42, sigma: 425, rho: 2.15, origin: "biological" },
  { key: "steel", E: 200, sigma: 325, rho: 7.85, origin: "engineered" },
  { key: "titanium", E: 114, sigma: 915, rho: 4.43, origin: "engineered" },
  { key: "aluminium", E: 72, sigma: 535, rho: 2.81, origin: "engineered" },
  { key: "cfrp", E: 160, sigma: 1850, rho: 1.575, origin: "engineered" },
];

/** SI conversions: GPa/MPa to Pa, g/cm^3 to kg/m^3. */
const toPa = (gpa: number) => gpa * 1e9;
const toPaFromMPa = (mpa: number) => mpa * 1e6;
const toKgM3 = (gcm3: number) => gcm3 * 1000;

/** Raw Ashby index for one material under one loading case. */
export function performanceIndex(m: MaterialSpec, job: StructuralJob): number {
  const E = toPa(m.E);
  const sigma = toPaFromMPa(m.sigma);
  const rho = toKgM3(m.rho);
  switch (job) {
    case "tie":
      return sigma / rho;
    case "beam":
      return Math.sqrt(E) / rho;
    case "column":
      return E ** (1 / 3) / rho;
    case "spring":
      return sigma ** 2 / (E * rho);
  }
}

/**
 * The physically meaningful value for a job, in units a reader can hold:
 * specific strength and specific energy are real quantities; the bending and
 * buckling indices have awkward fractional units, so those report as a
 * percentage of the best material on the bench.
 */
export interface JobFigure {
  /** Number to print. */
  value: number;
  /** Which unit string key to print it with. */
  unit: "kNmPerKg" | "kJPerKg" | "percent";
}

export function jobFigure(m: MaterialSpec, job: StructuralJob, best: number): JobFigure {
  const raw = performanceIndex(m, job);
  if (job === "tie") return { value: raw / 1000, unit: "kNmPerKg" };
  if (job === "spring") return { value: raw / 1000, unit: "kJPerKg" };
  return { value: (raw / best) * 100, unit: "percent" };
}

export interface RankedMaterial {
  spec: MaterialSpec;
  /** Raw index value. */
  index: number;
  /** Index as a fraction of the bench leader, 0-1 — the bar length. */
  share: number;
  figure: JobFigure;
}

/** Every material scored and sorted for one job, leader first. */
export function rankMaterials(job: StructuralJob): RankedMaterial[] {
  const scored = MATERIALS.map((spec) => ({ spec, index: performanceIndex(spec, job) }));
  const best = Math.max(...scored.map((s) => s.index));
  return scored
    .map(({ spec, index }) => ({
      spec,
      index,
      share: index / best,
      figure: jobFigure(spec, job, best),
    }))
    .sort((a, b) => b.index - a.index);
}

/** Where one material sits in the ranking for a job, 1-based. */
export function rankOf(ranked: RankedMaterial[], key: string): number {
  return ranked.findIndex((r) => r.spec.key === key) + 1;
}
