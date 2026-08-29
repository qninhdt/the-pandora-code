// Greenhill's critical buckling height, behind ColumnHeightCeiling.
//
// A tree does not fall over because its wood is crushed. Long before that, a
// slender column reaches the height at which its own weight makes the straight
// shape unstable: nudge it and it keeps leaning. Greenhill solved that in 1881,
// and the answer is remarkably forgiving of material —
//
//   H_cr = C (E / (rho g))^(1/3) D^(2/3)
//
// with C = 1.2513 for a uniform cylinder and about 0.84 for a naturally tapered
// trunk. Note the cube root: to double a safe height you need eight times the
// stiffness-to-weight, but only about 2.8 times the base diameter. Diameter is by
// far the cheaper lever, which is why real trees flare at the base rather than
// evolving exotic wood.
//
// Gravity sits in the same cube root, so Pandora's 0.8 g lifts the ceiling by
// only (1/0.8)^(1/3), around 8%. That modest number matters: it means the
// Hometree result cannot be attributed to low gravity — ordinary wood clears
// 300 m on Earth-strength gravity too, and the real ceiling for a tall tree is
// water transport, not buckling.

/** Greenhill coefficient for a uniform cylinder. */
export const C_UNIFORM = 1.2513;
/** Empirical coefficient for a naturally tapered trunk (McMahon). */
export const C_TAPERED = 0.84;

export const EARTH_G = 9.81;

export type TrunkProfile = "uniform" | "tapered";

export const PROFILE_COEFFICIENT: Record<TrunkProfile, number> = {
  uniform: C_UNIFORM,
  tapered: C_TAPERED,
};

export interface ColumnInputs {
  /** Base diameter, m. */
  diameter: number;
  /** Young's modulus along the grain, GPa. */
  modulus: number;
  /** Green wood density, kg/m^3. */
  density: number;
  /** Surface gravity as a multiple of Earth's. */
  gravityRatio: number;
  profile: TrunkProfile;
}

/** Critical self-buckling height in metres. */
export function criticalHeight(inputs: ColumnInputs): number {
  const { diameter, modulus, density, gravityRatio, profile } = inputs;
  const g = EARTH_G * gravityRatio;
  const specific = (modulus * 1e9) / (density * g);
  return PROFILE_COEFFICIENT[profile] * specific ** (1 / 3) * diameter ** (2 / 3);
}

/** Base diameter needed to stand a given height — the formula run backwards. */
export function requiredDiameter(height: number, inputs: Omit<ColumnInputs, "diameter">): number {
  const g = EARTH_G * inputs.gravityRatio;
  const specific = (inputs.modulus * 1e9) / (inputs.density * g);
  return (height / (PROFILE_COEFFICIENT[inputs.profile] * specific ** (1 / 3))) ** 1.5;
}

export interface HeightReference {
  key: string;
  height: number;
  tone: "cyan" | "teal" | "amber" | "magenta";
}

/** Real and canonical heights to mark on the scale. */
export const REFERENCES: HeightReference[] = [
  { key: "hyperion", height: 116, tone: "teal" },
  { key: "hydraulicLimit", height: 130, tone: "amber" },
  { key: "hometree", height: 300, tone: "cyan" },
];

/** Safety factor against self-buckling at a target height. */
export function safetyFactor(inputs: ColumnInputs, targetHeight: number): number {
  return criticalHeight(inputs) / targetHeight;
}
