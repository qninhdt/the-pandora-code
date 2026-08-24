// The wind column the Tlalim actually navigate. A caravan cannot move relative to
// the air, so its only control is which layer it sits in — and because heading
// and speed both change with height, that single control is enough to steer.
//
// The profile below is a tropical column, which is where the reversal is real on
// Earth too: easterly trades in the lowest couple of kilometres, light and turning
// air in the middle, then westerly flow aloft topped by a jet core. Sit low and you
// go west; climb and you go east. Numbers are illustrative but the structure and
// the magnitudes are the ones soundings actually show.

/** Pandora's mean radius (canon: 0.75 Earth radii). */
export const PANDORA_RADIUS_KM = 5723.5;
/** Great-circle distance around Pandora at the equator. */
export const PANDORA_CIRCUMFERENCE_KM = 2 * Math.PI * PANDORA_RADIUS_KM;
/** Kilometres per degree of latitude on Pandora. */
export const KM_PER_DEGREE = PANDORA_CIRCUMFERENCE_KM / 360;

export type StratumKey = "surface" | "trade" | "middle" | "westerly" | "jet";

interface ControlPoint {
  /** Altitude in kilometres. */
  z: number;
  /** Heading the air flows TOWARD, degrees clockwise from north (90 = east). */
  heading: number;
  /** Wind speed in metres per second. */
  speed: number;
}

// Control points interpolated linearly. Surface friction both slows the wind and
// backs its heading relative to the free-atmosphere flow above — the atmospheric
// Ekman spiral, which is why the lowest two points turn as well as weaken.
const PROFILE: ControlPoint[] = [
  { z: 0.0, heading: 251, speed: 4.5 },
  { z: 0.6, heading: 263, speed: 8.0 },
  { z: 1.5, heading: 274, speed: 11.5 },
  { z: 3.0, heading: 288, speed: 6.5 },
  { z: 4.5, heading: 330, speed: 2.5 },
  { z: 6.0, heading: 58, speed: 8.5 },
  { z: 8.0, heading: 84, speed: 22.0 },
  { z: 9.5, heading: 90, speed: 42.0 },
  { z: 11.0, heading: 92, speed: 31.0 },
  { z: 12.0, heading: 96, speed: 18.0 },
];

export const MIN_ALTITUDE_KM = PROFILE[0].z;
export const MAX_ALTITUDE_KM = PROFILE[PROFILE.length - 1].z;

export interface WindAtAltitude {
  heading: number;
  speed: number;
  stratum: StratumKey;
}

// Headings live on a circle, so interpolating 350 → 10 the naive way sweeps the
// long way round. Take the shorter arc instead.
function lerpHeading(a: number, b: number, t: number): number {
  const delta = ((b - a + 540) % 360) - 180;
  return (a + delta * t + 360) % 360;
}

function stratumFor(z: number): StratumKey {
  if (z < 0.8) return "surface";
  if (z < 2.5) return "trade";
  if (z < 5.5) return "middle";
  if (z < 8.8) return "westerly";
  return "jet";
}

export function windAt(z: number): WindAtAltitude {
  const clamped = Math.min(MAX_ALTITUDE_KM, Math.max(MIN_ALTITUDE_KM, z));
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const lo = PROFILE[i];
    const hi = PROFILE[i + 1];
    if (clamped <= hi.z) {
      const t = (clamped - lo.z) / (hi.z - lo.z);
      return {
        heading: lerpHeading(lo.heading, hi.heading, t),
        speed: lo.speed + (hi.speed - lo.speed) * t,
        stratum: stratumFor(clamped),
      };
    }
  }
  const last = PROFILE[PROFILE.length - 1];
  return { heading: last.heading, speed: last.speed, stratum: stratumFor(clamped) };
}

/** Evenly spaced samples of the whole column, for drawing the wind staff. */
export function profileSamples(count: number): (WindAtAltitude & { z: number })[] {
  return Array.from({ length: count }, (_, i) => {
    const z = MIN_ALTITUDE_KM + ((MAX_ALTITUDE_KM - MIN_ALTITUDE_KM) * i) / (count - 1);
    return { z, ...windAt(z) };
  });
}

export interface GroundTrack {
  /** Longitude/latitude waypoints in degrees; longitude may run past 360. */
  points: { lon: number; lat: number }[];
  /** Total ground distance covered, kilometres. */
  distanceKm: number;
  /** Signed east-west displacement as a fraction of one circumnavigation. */
  circuits: number;
  /** Latitude reached at the end of the run. */
  endLat: number;
}

/**
 * Where a drifting caravan ends up after `days` at a fixed flight level, starting
 * from the equator on the prime meridian. Latitude convergence is ignored: over
 * the low latitudes this figure covers, the error is smaller than the honesty of
 * the wind numbers themselves.
 */
export function groundTrack(z: number, days: number, steps = 48): GroundTrack {
  const { heading, speed } = windAt(z);
  const rad = (heading * Math.PI) / 180;
  const totalKm = (speed * days * 86400) / 1000;
  const eastKm = totalKm * Math.sin(rad);
  const northKm = totalKm * Math.cos(rad);

  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const f = i / steps;
    return { lon: (eastKm * f) / KM_PER_DEGREE, lat: (northKm * f) / KM_PER_DEGREE };
  });

  return {
    points,
    distanceKm: totalKm,
    circuits: eastKm / PANDORA_CIRCUMFERENCE_KM,
    endLat: northKm / KM_PER_DEGREE,
  };
}
