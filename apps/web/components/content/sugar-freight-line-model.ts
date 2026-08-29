// The transport arithmetic behind SugarFreightLine, kept separate so the component
// file stays lean. A tree has no pump for its sugar either. Sucrose loaded into
// the phloem at a sunlit leaf drags water in behind it by osmosis, and that
// swelling raises the pressure at the top; at the root, sugar is unloaded and
// consumed, the water leaves, and the pressure falls. The difference pushes the
// whole loaded column downward — Münch's pressure-flow mechanism, one long
// hydraulic shove with nothing steering it:
//
//   J_v = L_p (ΔP − σ ΔΠ)
//
// Velocity through a pipe under a pressure gradient is Hagen-Poiseuille: it goes
// as the square of the conduit radius and inversely with both length and
// viscosity. Two of those terms fight each other in a very tall tree. Doubling
// height doubles the distance the sugar must travel and halves the gradient
// driving it, so transit time grows with the square of height. Earth trees top out
// near 130 m and their canopy-to-root shipments already take days. Canon's tallest
// Hometrees are several times that.

/** Earth reference: measured phloem sap velocities run 0.2–2.0 m/h. */
export const EARTH_REFERENCE_VELOCITY = 1.0;

/** Sucrose concentration of the transport stream, mol/L (10–30% w/v). */
export const SAP_CONCENTRATION = { min: 0.3, max: 1.2 } as const;

/**
 * Reference geometry: the sieve-pore radius (µm) and tree height (m) at which the
 * Earth reference velocity holds. Everything else scales off this anchor.
 */
const REF_PORE_RADIUS = 0.7;
const REF_HEIGHT = 60;
const REF_TURGOR = 2.0;

export interface FreightResult {
  /** Sap velocity, m/h. */
  velocity: number;
  /** Canopy-to-root transit time, hours. */
  transitHours: number;
  /** Pressure gradient driving the flow, MPa per metre of trunk. */
  gradient: number;
  /** Whether the shipment now takes longer than a fortnight. */
  slowFreight: boolean;
}

/**
 * Run the freight line.
 *
 * @param heightM      distance from source leaf to root sink, metres
 * @param sourceTurgor turgor pressure generated at the loading end, MPa
 * @param poreRadiusUm sieve-plate pore radius, micrometres
 */
export function freight(
  heightM: number,
  sourceTurgor: number,
  poreRadiusUm: number,
): FreightResult {
  // Sink turgor is low by construction — sugar is spent there as fast as it lands.
  const SINK_TURGOR = 0.3;
  const drop = Math.max(0.05, sourceTurgor - SINK_TURGOR);
  const gradient = drop / heightM;

  // Hagen-Poiseuille: velocity ∝ r² · (ΔP / L).
  const refGradient = (REF_TURGOR - SINK_TURGOR) / REF_HEIGHT;
  const velocity =
    EARTH_REFERENCE_VELOCITY *
    (poreRadiusUm / REF_PORE_RADIUS) ** 2 *
    (gradient / refGradient);

  const transitHours = velocity > 0 ? heightM / velocity : Number.POSITIVE_INFINITY;
  return {
    velocity,
    transitHours,
    gradient,
    slowFreight: transitHours > 24 * 14,
  };
}

/** Hours rendered as the coarsest unit that still reads honestly. */
export function formatTransit(hours: number): { value: string; unit: "hours" | "days" | "weeks" } {
  if (hours < 48) return { value: hours.toFixed(1), unit: "hours" };
  const days = hours / 24;
  if (days < 21) return { value: days.toFixed(1), unit: "days" };
  return { value: (days / 7).toFixed(1), unit: "weeks" };
}
