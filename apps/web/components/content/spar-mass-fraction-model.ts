// Wing-spar bending arithmetic behind SparMassFractionGate.
//
// This is the calculation where Pandora's composite claim earns its keep. A flier
// with a 25 m wingspan banking at 2.5 g has to carry the resulting bending moment
// at the shoulder, and that moment is large:
//
//   L_total = n M g           total lift in the manoeuvre
//   y_bar   = 4L / (3 pi)     spanwise centre of an elliptical lift distribution
//   M_root  = (L_total / 2) y_bar
//
// A thin-walled tube resists it with section modulus Z = pi R^2 t, so the wall
// stress is sigma = M_root / Z. Two knobs set the mass: the material's strength
// decides how thin the wall may be, and its density decides what that wall weighs.
//
// Run it with ordinary vertebrate bone and the spar alone comes out at well over
// half the animal's body mass — not merely heavy, but arithmetically impossible,
// since the rest of the creature still has to exist. Run it with a composite in
// the CFRP class and the same spar drops to about a sixth of body mass with a
// safety factor near three. The canon claim is not decoration here; without
// something in that performance class the great leonopteryx cannot be built.

export const EARTH_G = 9.81;
/** Pandoran surface gravity, as a fraction of Earth's. */
export const PANDORA_G_RATIO = 0.8;

export type SparMaterial = "bone" | "composite";

export interface MaterialProps {
  key: SparMaterial;
  /** Yield strength, MPa. */
  yieldMPa: number;
  /** Density, kg/m^3. */
  density: number;
  /**
   * Wall thickness as a fraction of outer radius. Thinner walls need a stronger
   * material: bone is held at the pterosaur-like t/R = 0.10, while the composite
   * can be drawn down to 0.0375 before local buckling, not yield, would bind.
   */
  wallRatio: number;
  tone: "magenta" | "teal";
}

export const MATERIALS: Record<SparMaterial, MaterialProps> = {
  bone: { key: "bone", yieldMPa: 140, density: 2000, wallRatio: 0.1, tone: "magenta" },
  composite: { key: "composite", yieldMPa: 900, density: 1550, wallRatio: 0.0375, tone: "teal" },
};

/**
 * Share of body mass a flier can spend on wing spars before the rest of the
 * animal — muscle, gut, brain, the other wing structure — has nowhere left to go.
 * Treated here as a viability line rather than a hard physical constant.
 */
export const VIABILITY_LIMIT = 0.25;

export interface SparInputs {
  /** Full wingspan, m. */
  span: number;
  /** Total body mass, kg. */
  bodyMass: number;
  /** Manoeuvre load factor, multiples of level-flight lift. */
  loadFactor: number;
  /** Spar outer radius, m. */
  outerRadius: number;
  /** Surface gravity as a fraction of Earth's. */
  gravityRatio: number;
}

export const DEFAULT_INPUTS: SparInputs = {
  span: 25,
  bodyMass: 350,
  loadFactor: 2.5,
  outerRadius: 0.08,
  gravityRatio: PANDORA_G_RATIO,
};

export interface SparResult {
  /** Bending moment at the wing root, N·m. */
  rootMoment: number;
  /** Section modulus of the tube, m^3. */
  sectionModulus: number;
  /** Peak bending stress in the wall, MPa. */
  stressMPa: number;
  /** Yield strength divided by working stress. */
  safetyFactor: number;
  /** Mass of both spars, kg. */
  sparMass: number;
  /** Spar mass as a fraction of body mass, 0-1. */
  massFraction: number;
  /** Whether the spar both survives the load and leaves room for an animal. */
  viable: boolean;
}

export function evaluateSpar(inputs: SparInputs, material: SparMaterial): SparResult {
  const { span, bodyMass, loadFactor, outerRadius, gravityRatio } = inputs;
  const props = MATERIALS[material];
  const g = EARTH_G * gravityRatio;

  const totalLift = loadFactor * bodyMass * g;
  const liftPerWing = totalLift / 2;
  const semiSpan = span / 2;
  // Centre of an elliptical spanwise lift distribution.
  const centreOfLift = (4 * semiSpan) / (3 * Math.PI);
  const rootMoment = liftPerWing * centreOfLift;

  const t = outerRadius * props.wallRatio;
  const sectionModulus = Math.PI * outerRadius ** 2 * t;
  const stressPa = rootMoment / sectionModulus;
  const stressMPa = stressPa / 1e6;
  const safetyFactor = props.yieldMPa / stressMPa;

  // Thin-wall annulus area, carried across the whole span (both spars).
  const area = 2 * Math.PI * outerRadius * t;
  const sparMass = area * span * props.density;
  const massFraction = sparMass / bodyMass;

  return {
    rootMoment,
    sectionModulus,
    stressMPa,
    safetyFactor,
    sparMass,
    massFraction,
    viable: safetyFactor >= 1 && massFraction <= VIABILITY_LIMIT,
  };
}
