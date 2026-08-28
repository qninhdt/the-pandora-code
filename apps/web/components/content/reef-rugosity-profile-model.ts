// ─────────────────────────────────────────────────────────────────────
// THE MODEL — complexity is measurable, and it is the habitat
//
// Reef ecologists reduce three-dimensional structure to one number, the
// rugosity index:
//
//   R = L_contour / L_linear
//
// the length of a chain laid over the reef surface divided by the straight
// distance it spans. A flat rubble plain gives R -> 1.0; a healthy,
// branching Indo-Pacific framework gives R >= 2.5. That index is one of the
// strongest predictors of how much life a reef holds, because folding the
// surface is what creates the microrefugia, nursery pockets and settlement
// area that organisms actually occupy. It also dampens hydrodynamics, which
// is why flattening a reef costs coastal protection as well as fish.
//
// The profile here is a fixed sum of sinusoids across three spatial scales —
// boulder, branch and twig — whose amplitudes grow with the complexity
// dial. Fixed phases keep the shape deterministic for SSR. Contour length
// is integrated from the sampled profile, so the reported R is measured off
// the drawn shape rather than asserted.
//
// Refuges are counted as profile valleys, split by the size class of animal
// that could shelter there. Shelter capacity and wave attenuation are
// reported as relative indices, not absolute biomass or wave heights:
// the research note gives the direction and the R thresholds, not a
// transfer function, and Pandora supplies neither.
// ─────────────────────────────────────────────────────────────────────

export interface ScaleBand {
  id: "boulder" | "branch" | "twig";
  /** Spatial wavelength in profile units. */
  wavelength: number;
  /** Amplitude at full complexity. */
  amplitude: number;
  /** Fixed phase offset, so the profile never shifts between renders. */
  phase: number;
}

export const BANDS: ScaleBand[] = [
  { id: "boulder", wavelength: 62, amplitude: 15, phase: 0.4 },
  { id: "branch", wavelength: 21, amplitude: 9, phase: 2.1 },
  { id: "twig", wavelength: 7.5, amplitude: 4.5, phase: 5.3 },
];

const SAMPLES = 420;

export interface ReefProfile {
  /** Sampled surface, x across the span and y as height above the datum. */
  points: { x: number; y: number }[];
  /** Rugosity index measured off the sampled profile. */
  rugosity: number;
  /** Refuge count per size class of occupant. */
  refuges: { small: number; medium: number; large: number };
  /** Relative shelter capacity, 0-1, against the most complex profile. */
  shelterIndex: number;
  /** Fraction of incident wave energy still moving past the reef, 0-1. */
  waveTransmission: number;
}

/** Height of the reef surface at x, for a complexity in 0..1. */
function heightAt(x: number, complexity: number): number {
  // Small scales disappear first as a reef is ground down: twigs go before
  // branches, branches before boulders. Each band fades on its own curve.
  return BANDS.reduce((sum, band, index) => {
    const fade = complexity ** (1 + index * 0.8);
    return sum + band.amplitude * fade * Math.sin((2 * Math.PI * x) / band.wavelength + band.phase);
  }, 0);
}

export function buildReefProfile(complexity: number, span: number): ReefProfile {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const x = (span * i) / SAMPLES;
    points.push({ x, y: heightAt(x, complexity) });
  }

  let contour = 0;
  for (let i = 1; i < points.length; i += 1) {
    contour += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  const rugosity = contour / span;

  // A valley deep enough to hide in. Depth is measured from the valley floor
  // up to the lower of its two flanking ridges.
  const refuges = { small: 0, medium: 0, large: 0 };
  for (let i = 1; i < points.length - 1; i += 1) {
    const y = points[i].y;
    if (y > points[i - 1].y || y > points[i + 1].y) continue;
    let left = y;
    for (let j = i - 1; j >= 0 && points[j].y >= points[j + 1].y; j -= 1) left = points[j].y;
    let right = y;
    for (let j = i + 1; j < points.length && points[j].y >= points[j - 1].y; j += 1)
      right = points[j].y;
    const depth = Math.min(left, right) - y;
    if (depth < 1.2) continue;
    if (depth < 4) refuges.small += 1;
    else if (depth < 10) refuges.medium += 1;
    else refuges.large += 1;
  }

  const maxRugosity = buildRugosityOnly(1, span);
  const shelterIndex = Math.min(1, (rugosity - 1) / Math.max(0.001, maxRugosity - 1));
  // Rough surfaces dissipate wave energy; a flattened one lets the swell past.
  // Reported relative to a flat floor, which is the reference the reader sees.
  const waveTransmission = Math.exp(-1.7 * (rugosity - 1));

  return { points, rugosity, refuges, shelterIndex, waveTransmission };
}

/** Rugosity alone, used to normalize the relative indices. */
function buildRugosityOnly(complexity: number, span: number): number {
  let contour = 0;
  let prev = { x: 0, y: heightAt(0, complexity) };
  for (let i = 1; i <= SAMPLES; i += 1) {
    const x = (span * i) / SAMPLES;
    const point = { x, y: heightAt(x, complexity) };
    contour += Math.hypot(point.x - prev.x, point.y - prev.y);
    prev = point;
  }
  return contour / span;
}

/** The regime the measured index puts the reef in. */
export function rugosityRegime(rugosity: number): "complex" | "reduced" | "flattened" {
  if (rugosity >= 2.5) return "complex";
  if (rugosity >= 1.5) return "reduced";
  return "flattened";
}
