// Why a jet meanders, and why the meander sometimes stops moving.
//
// A jet does not run straight. Displace a parcel of air poleward and the planetary
// vorticity it carries changes, which spins it back — the restoring force behind a
// Rossby wave. The wave's own tendency is to travel westward, while the jet carries
// it east, so its ground-relative phase speed is the difference of the two:
//
//   c = U - beta / K^2
//
// Set those equal and the pattern locks in place over the ground. That is the
// stationary wavenumber, and it is the difference between a sky whose weather keeps
// arriving and a sky that has stalled.

/** Pandora's mean radius in metres (canon: 0.75 Earth radii). */
const RADIUS_M = 5.7235e6;
/** Angular rotation rate for a 26-hour day (canon), radians per second. */
const OMEGA = (2 * Math.PI) / (26 * 3600);
/** The latitude this figure works at — the mid-latitude jet corridor. */
export const LATITUDE_DEG = 45;

const PHI = (LATITUDE_DEG * Math.PI) / 180;

/** Meridional gradient of planetary vorticity at the working latitude. */
export const BETA = (2 * OMEGA * Math.cos(PHI)) / RADIUS_M;

/** Length of one full circle of latitude at the working latitude, metres. */
const LATITUDE_CIRCUMFERENCE_M = 2 * Math.PI * RADIUS_M * Math.cos(PHI);

export const MIN_WAVENUMBER = 2;
export const MAX_WAVENUMBER = 9;
export const MIN_MEAN_FLOW = 4;
export const MAX_MEAN_FLOW = 40;

export interface MeanderState {
  /** Zonal wavelength in metres. */
  wavelengthM: number;
  /** Total horizontal wavenumber, radians per metre. */
  k: number;
  /** Westward propagation speed the wave would have in still air, m/s. */
  westwardSpeed: number;
  /** Ground-relative phase speed: positive eastward, m/s. */
  phaseSpeed: number;
  /** Mean flow at which this wavenumber stands still over the ground, m/s. */
  resonantFlow: number;
  /** How close to stationary, 0 (fast-moving) → 1 (locked). */
  lockedness: number;
  regime: "progressive" | "stalling" | "blocked";
}

export function meanderState(wavenumber: number, meanFlow: number): MeanderState {
  const wavelengthM = LATITUDE_CIRCUMFERENCE_M / wavenumber;
  const k = (2 * Math.PI) / wavelengthM;
  const westwardSpeed = BETA / (k * k);
  const phaseSpeed = meanFlow - westwardSpeed;
  const lockedness = Math.max(0, 1 - Math.abs(phaseSpeed) / 8);

  // A near-stationary long wave is the setup for blocking: the pattern stops
  // travelling, amplifies, and eventually overturns into a stalled high. Short
  // waves go stationary too, but they are too small to strand anything.
  const regime =
    lockedness > 0.65 && wavenumber <= 5
      ? "blocked"
      : lockedness > 0.35
        ? "stalling"
        : "progressive";

  return {
    wavelengthM,
    k,
    westwardSpeed,
    phaseSpeed,
    resonantFlow: westwardSpeed,
    lockedness,
    regime,
  };
}

/**
 * The jet's north-south displacement across the map, in units of amplitude. A
 * progressive wave is a clean sinusoid; as the pattern locks it amplifies and the
 * troughs sharpen, the visual signature of a wave about to break into a block.
 */
export function meanderShape(
  wavenumber: number,
  meanFlow: number,
  phase: number,
  samples: number,
): number[] {
  const { lockedness } = meanderState(wavenumber, meanFlow);
  const amplitude = 0.45 + 0.55 * lockedness;
  const sharpen = 0.4 * lockedness;
  return Array.from({ length: samples }, (_, i) => {
    const f = i / (samples - 1);
    const theta = 2 * Math.PI * (wavenumber * f - phase);
    // Adding a second harmonic flattens the ridges and deepens the troughs.
    return amplitude * (Math.sin(theta) - sharpen * Math.sin(2 * theta) * 0.5);
  });
}
