// The physics behind RaindropGrowthLadder: why a cloud is not simply a rain that
// has not got round to falling yet.
//
// Two barriers stand between vapour and a raindrop, and they are different
// barriers.
//
// FIRST: a droplet cannot start. Pure vapour would need a supersaturation above
// ~400% before a chance cluster of molecules survived its own surface tension, and
// no atmosphere gets remotely that wet. Real drops start on a hygroscopic speck —
// a cloud condensation nucleus — whose dissolved salt lowers the vapour pressure
// the droplet must fight. Köhler theory is that competition:
//
//   s(r) = A/r - B/r^3
//
// with A = 2*sigma / (rho_w * R_v * T) the curvature (Kelvin) term and B the
// solute (Raoult) term set by the nucleus mass. The curve peaks at
//
//   r_c = sqrt(3B/A),    s_c = sqrt(4A^3 / 27B)
//
// Below s_c a particle sits as stable haze, breathing with the humidity. Above it
// there is no equilibrium left and the drop runs away.
//
// SECOND: diffusional growth quits. Once activated, r*dr/dt is roughly constant,
// so dr/dt ~ 1/r and growth crawls as the drop widens. Around 20 um radius it has
// effectively stalled, and a drop that size falls at a few centimetres a second —
// it is not rain, it is cloud. What carries it the rest of the way is collision-
// coalescence: bigger drops fall faster, sweep up the small ones in their path,
// and accelerate as they grow. Getting from 10 um to 1 mm is a millionfold
// increase in volume.
//
// Terminal velocity in the turbulent regime balances weight against drag:
//
//   v_t = sqrt(8 * rho_w * g * r / (3 * C_D * rho_air))
//
// which scales as sqrt(g / rho_air) — so Pandora's 0.8 g and ~1.2x denser air
// slow every hydrometeor by about a fifth and keep it in the cloud correspondingly
// longer.
//
// SOURCED (research note): homogeneous nucleation requires S > 400%; critical
// radii 0.5-2.0 um and critical supersaturations 0.1-0.8% for real CCN;
// diffusional growth stalls near 20 um and cannot make raindrops alone;
// collision-coalescence needs collector drops past ~20 um and dominates warm
// tropical cloud; the 10 um -> 1 mm step is a 10^6 volume jump; Pandora at
// 0.80 g and 1.470 kg/m3 giving an 18-20% reduction in fall speed and a longer
// in-cloud residence.
//
// DEPARTURE FROM THE NOTE: the note's fall-speed table lists "1,000 um (1.00 mm)
// -> ~4.0 m/s" and "2,500 um -> ~9.0 m/s", which mixes radius and diameter — 4 m/s
// is the measured speed of a 1 mm *diameter* drop (0.5 mm radius), not a 1 mm
// radius one, which falls at ~6.6 m/s. Since every other quantity here is a
// radius, the table below is radius-indexed throughout and follows the Gunn &
// Kinzer measurements. The note's 10 um and 20 um entries are correct and agree.
//
// CHOSEN FOR ILLUSTRATION: the three nucleus sizes offered and the growth-track
// timing constants. The note gives stall radii and endpoints, not a continuous
// trajectory, so the track is a physically-shaped illustration rather than an
// integrated cloud model.

export type World = "earth" | "pandora";

export interface WorldAir {
  /** Surface gravity, m/s^2. */
  g: number;
  /** Air density, kg/m^3. */
  rhoAir: number;
}

export const AIR: Record<World, WorldAir> = {
  earth: { g: 9.81, rhoAir: 1.225 },
  pandora: { g: 7.85, rhoAir: 1.47 },
};

const RHO_W = 1000; // kg/m^3, liquid water
const C_D = 0.6; // sphere drag coefficient in the turbulent raindrop regime

// Köhler curvature term A = 2*sigma / (rho_w * R_v * T), evaluated at 283 K with
// sigma = 0.0728 N/m and R_v = 461.5 J/(kg*K). Units: metres.
const KOHLER_A = 1.11e-9;

export interface Nucleus {
  id: string;
  /** Raoult solute parameter, m^3. */
  b: number;
}

// Three nuclei spanning the real range: a small sulfate haze particle, a mid
// continental aerosol, and a coarse sea-salt speck.
//
// Note that r_c and s_c are not independent — s_c falls as r_c rises, since both
// come from the same B. The note quotes r_c = 0.5-2.0 um and s_c = 0.1-0.8% as
// separate observed ranges, and no single nucleus sits at the top of both. These
// three are chosen to be internally consistent: r_c of 0.26, 0.52 and 1.03 um
// against s_c of 0.29%, 0.14% and 0.07%, which straddles the quoted windows
// without inventing a nucleus that cannot exist.
export const NUCLEI: Nucleus[] = [
  { id: "small", b: 2.5e-23 },
  { id: "medium", b: 1.0e-22 },
  { id: "large", b: 4.0e-22 },
];

/** Köhler equilibrium supersaturation (as a fraction) for a droplet of radius r metres. */
export function kohlerS(radiusM: number, nucleus: Nucleus): number {
  return KOHLER_A / radiusM - nucleus.b / radiusM ** 3;
}

/** Critical radius at the peak of the Köhler curve, metres. */
export function criticalRadius(nucleus: Nucleus): number {
  return Math.sqrt((3 * nucleus.b) / KOHLER_A);
}

/** Critical supersaturation at that peak, as a fraction (0.004 = 0.4%). */
export function criticalSupersaturation(nucleus: Nucleus): number {
  return Math.sqrt((4 * KOHLER_A ** 3) / (27 * nucleus.b));
}

/**
 * Terminal fall speed in m/s for a water drop of radius r metres.
 *
 * The two analytic laws bracket reality but neither covers the middle: a falling
 * drop past ~40 um deforms into an oblate cap, its drag coefficient climbs, and
 * both Stokes and the clean turbulent form overshoot badly (at 100 um they give
 * ~1.2 and ~1.9 m/s against a measured 0.72). So Earth speeds come from the
 * classic Gunn & Kinzer fall-speed measurements, log-interpolated, and Pandora is
 * obtained by scaling: v is proportional to g while the flow is laminar, and to
 * sqrt(g / rho_air) once drag dominates. Both factors land near 0.8, which is the
 * ~20% reduction the note reports either way.
 */
const FALL_SPEED_EARTH: Array<[radiusUm: number, ms: number]> = [
  [10, 0.012],
  [20, 0.048],
  [30, 0.106],
  [40, 0.19],
  [50, 0.27],
  [70, 0.47],
  [100, 0.72],
  [150, 1.17],
  [200, 1.62],
  [300, 2.47],
  [400, 3.27],
  [500, 4.03],
  [700, 5.43],
  [1000, 6.59],
  [1500, 8.06],
  [2000, 8.83],
  [2500, 9.23],
];

function earthFallSpeed(radiusM: number): number {
  const um = radiusM * 1e6;
  const first = FALL_SPEED_EARTH[0];
  const last = FALL_SPEED_EARTH[FALL_SPEED_EARTH.length - 1];
  // Below the table, Stokes is exact and quadratic in radius.
  if (um <= first[0]) return first[1] * (um / first[0]) ** 2;
  if (um >= last[0]) return last[1];

  for (let i = 1; i < FALL_SPEED_EARTH.length; i++) {
    const [r1, v1] = FALL_SPEED_EARTH[i];
    if (um > r1) continue;
    const [r0, v0] = FALL_SPEED_EARTH[i - 1];
    const f = Math.log(um / r0) / Math.log(r1 / r0);
    return v0 * (v1 / v0) ** f;
  }
  return last[1];
}

export function terminalVelocity(radiusM: number, world: World): number {
  const earth = earthFallSpeed(radiusM);
  if (world === "earth") return earth;

  const { g, rhoAir } = AIR[world];
  const laminar = g / AIR.earth.g;
  const turbulent = Math.sqrt((g / AIR.earth.g) * (AIR.earth.rhoAir / rhoAir));

  // Blend the two scalings across the same band where the drag regime changes.
  const lo = 20e-6;
  const hi = 60e-6;
  const f = Math.min(1, Math.max(0, (radiusM - lo) / (hi - lo)));
  return earth * (laminar * (1 - f) + turbulent * f);
}

/** The clean turbulent-drag law, kept for the figure's readout of the derivation. */
export function turbulentTerminalVelocity(radiusM: number, world: World): number {
  const { g, rhoAir } = AIR[world];
  return Math.sqrt((8 * RHO_W * g * radiusM) / (3 * C_D * rhoAir));
}

export type GrowthMode = "diffusion" | "coalescence";

export interface GrowthSample {
  /** Minutes since activation. */
  minutes: number;
  /** Drop radius, metres. */
  radiusM: number;
  /** Which mechanism is carrying growth at this point. */
  mode: GrowthMode;
  /** Terminal fall speed at this radius, m/s. */
  fallMs: number;
}

/** Radius at which diffusional growth has effectively stalled, metres. */
export const STALL_RADIUS_M = 20e-6;

// Diffusional growth integrates r*dr/dt = const, i.e. r(t) = sqrt(r0^2 + 2*k*t).
// k is set so an activated drop reaches the 20 um stall in about ten minutes,
// matching the note's account of growth crawling to a halt there.
const DIFFUSION_K = 3.2e-13; // m^2/s
// Past the stall, coalescence sweeps up neighbours and accelerates: radius grows
// roughly exponentially in time while there is cloud water to collect.
const COALESCENCE_RATE = 1 / 5.2; // per minute

/**
 * The growth track of one drop from activation to raindrop: diffusion until it
 * stalls near 20 um, then collision-coalescence to millimetre scale. Returns
 * `samples` points, and reports where the handover happens.
 */
export function growthTrack(
  world: World,
  samples = 90,
): {
  track: GrowthSample[];
  stallMinutes: number;
} {
  const r0 = 1e-6;
  const stallMinutes = (STALL_RADIUS_M ** 2 - r0 ** 2) / (2 * DIFFUSION_K) / 60;
  const totalMinutes = stallMinutes + 22;
  const track: GrowthSample[] = [];

  for (let i = 0; i < samples; i++) {
    const minutes = (i / (samples - 1)) * totalMinutes;
    let radiusM: number;
    let mode: GrowthMode;
    if (minutes <= stallMinutes) {
      radiusM = Math.sqrt(r0 ** 2 + 2 * DIFFUSION_K * minutes * 60);
      mode = "diffusion";
    } else {
      radiusM = STALL_RADIUS_M * Math.exp(COALESCENCE_RATE * (minutes - stallMinutes));
      mode = "coalescence";
    }
    // Drops break up past roughly 2.5 mm radius, so the track stops there.
    radiusM = Math.min(radiusM, 2.5e-3);
    track.push({ minutes, radiusM, mode, fallMs: terminalVelocity(radiusM, world) });
  }

  return { track, stallMinutes };
}

/** Volume ratio between two radii — the millionfold jump, computed rather than asserted. */
export function volumeRatio(fromM: number, toM: number): number {
  return (toM / fromM) ** 3;
}
