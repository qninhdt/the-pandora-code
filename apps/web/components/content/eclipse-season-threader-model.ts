// The geometry behind EclipseSeasonThreader — why a moon that laps its planet
// every day still spends much of the year with no eclipses at all. The planet
// throws a shadow cylinder straight away from the star; the moon's orbit is
// canted to that plane, so for most of the year the moon rides clear above or
// below the shadow and only near the two node alignments does its path thread
// the dark on every lap. Canon's own numbers — a roughly day-long orbit around a
// Jupiter-class giant and a twenty-five-degree tilt — put the eclipse seasons at
// a little over a third of the year, which is exactly the pattern the chapter
// describes. Visible strings live in the component's translations.

/** Planet radius in metres (Jupiter-class, the giant canon describes). */
const PLANET_RADIUS = 6.9911e7;
/** Moon radius in metres, from canon's stated diameter. */
const MOON_RADIUS = 5.7235e6;
/** Orbital radius for a locked, roughly day-long orbit, in planet radii. */
export const ORBIT_RADII = 4.35;

/** Canon's axial/orbital tilt, and the deterministic default for the figure. */
export const DEFAULT_TILT = 25;
/** Season angle measured from node alignment; 0° = equinox, 90° = solstice. */
export const DEFAULT_SEASON = 12;

export type ShadowFit = "total" | "grazing" | "clear";

/**
 * How far the moon sits from the shadow's axis when it passes behind the planet,
 * in planet radii. The tilt lifts the orbit by sin(tilt); how much of that lift
 * lands at the anti-star point depends on where the year has carried the line of
 * nodes, hence the sine of the season angle.
 */
export function shadowOffset(tiltDeg: number, seasonDeg: number): number {
  const tilt = (tiltDeg * Math.PI) / 180;
  const season = (seasonDeg * Math.PI) / 180;
  return ORBIT_RADII * Math.sin(tilt) * Math.abs(Math.sin(season));
}

const MOON_IN_PLANET_RADII = MOON_RADIUS / PLANET_RADIUS;

/** Whether the moon lands fully inside the shadow, clips its edge, or misses. */
export function shadowFit(offset: number): ShadowFit {
  if (offset <= 1 - MOON_IN_PLANET_RADII) return "total";
  if (offset < 1 + MOON_IN_PLANET_RADII) return "grazing";
  return "clear";
}

/**
 * Fraction of the year (0…1) during which every lap brings an eclipse. Zero tilt
 * means every day of every year is eclipsed; the steeper the tilt, the narrower
 * the two windows around the node alignments.
 */
export function eclipseSeasonFraction(tiltDeg: number): number {
  const tilt = (tiltDeg * Math.PI) / 180;
  const reach = ORBIT_RADII * Math.sin(tilt);
  const threshold = 1 + MOON_IN_PLANET_RADII;
  if (reach <= threshold) return 1;
  return (2 / Math.PI) * Math.asin(threshold / reach);
}
