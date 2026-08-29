// The photon-flux arithmetic behind PigmentSpectrumTuner, kept separate so the
// component file stays lean. A leaf's colour is whatever its pigments decline to
// absorb, so the colour question is really two questions: which photons arrive,
// and which window the pigments open on them.
//
// Arrival is a blackbody photon-flux spectrum. Radiance per unit wavelength goes
// as 1/λ⁵; dividing by the photon energy hc/λ gives photon flux ∝ 1/λ⁴:
//
//   N(λ) ∝ (1 / λ⁴) · 1 / (exp(hc / λkT) − 1)
//
// The Sun and Alpha Centauri A are near-twins (G2V, ~5780 K); B is a cooler K1V
// at ~5260 K, so its photon peak sits well into the orange. The binary case sums
// both — weighted, because B is the distant companion and only contributes
// meaningfully during the stretch of its long orbit when it burns bright in
// Pandora's sky.

export type StarKey = "sun" | "centauriA" | "centauriB" | "binary";

/** Effective temperatures in kelvin. */
const TEFF: Record<Exclude<StarKey, "binary">, number> = {
  sun: 5778,
  centauriA: 5790,
  centauriB: 5260,
};

/**
 * Photon contribution of Alpha Centauri B relative to A at Pandora's surface,
 * for the bright-companion configuration. B is far enough out that this is a
 * supplement to A's light, never a replacement for it.
 */
const B_WEIGHT = 0.45;

/** Sampling window, in nanometres: near-UV through the near-infrared. */
export const SPECTRUM_MIN = 350;
export const SPECTRUM_MAX = 900;
const SAMPLES = 220;

// hc/k in nm·K — the only physical constant the shape needs.
const HC_OVER_K = 1.4388e7;

function planckPhotonFlux(nm: number, tempK: number): number {
  const x = HC_OVER_K / (nm * tempK);
  return 1 / (nm ** 4 * (Math.expm1(x) || Number.EPSILON));
}

/** Unnormalised surface photon flux at one wavelength for a given sky. */
export function photonFluxAt(nm: number, star: StarKey): number {
  if (star === "binary") {
    return (
      planckPhotonFlux(nm, TEFF.centauriA) + B_WEIGHT * planckPhotonFlux(nm, TEFF.centauriB)
    );
  }
  return planckPhotonFlux(nm, TEFF[star]);
}

export interface SpectrumSample {
  nm: number;
  /** Photon flux scaled so the peak of this sky is 1. */
  flux: number;
}

/** The arriving spectrum, normalised to its own peak for plotting. */
export function sampleSpectrum(star: StarKey): SpectrumSample[] {
  const step = (SPECTRUM_MAX - SPECTRUM_MIN) / SAMPLES;
  const raw: SpectrumSample[] = [];
  let peak = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    const nm = SPECTRUM_MIN + i * step;
    const flux = photonFluxAt(nm, star);
    if (flux > peak) peak = flux;
    raw.push({ nm, flux });
  }
  return raw.map((s) => ({ nm: s.nm, flux: s.flux / peak }));
}

/** Wavelength of peak photon flux — where the sky is most generous. */
export function peakWavelength(star: StarKey): number {
  let best = SPECTRUM_MIN;
  let bestFlux = 0;
  for (const s of sampleSpectrum(star)) {
    if (s.flux > bestFlux) {
      bestFlux = s.flux;
      best = s.nm;
    }
  }
  return Math.round(best);
}

/**
 * Share of arriving photons the absorption window [lo, hi] captures. This is the
 * harvest: photons outside the window pass through or bounce back out, and the
 * ones that bounce are the ones an eye sees.
 */
export function capturedFraction(star: StarKey, lo: number, hi: number): number {
  const step = (SPECTRUM_MAX - SPECTRUM_MIN) / SAMPLES;
  let inside = 0;
  let total = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    const nm = SPECTRUM_MIN + i * step;
    const flux = photonFluxAt(nm, star);
    total += flux;
    if (nm >= lo && nm <= hi) inside += flux;
  }
  return total > 0 ? inside / total : 0;
}

/**
 * Approximate visible RGB for a single wavelength (Bruton's piecewise fit).
 * Used to mix the reflected spectrum into a swatch, so the reader sees the leaf
 * colour their chosen window implies rather than being told it.
 */
function wavelengthToRgb(nm: number): [number, number, number] {
  if (nm < 380 || nm > 780) return [0, 0, 0];
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else {
    r = 1;
  }
  // Intensity rolls off at both ends of the visible range.
  let scale = 1;
  if (nm < 420) scale = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm > 700) scale = 0.3 + (0.7 * (780 - nm)) / 80;
  return [r * scale, g * scale, b * scale];
}

/**
 * The colour of the light that escapes: arriving photons outside the absorption
 * window, mixed. Absorb blue and red and green comes back — an Earth leaf.
 * Absorb green through the near-infrared and the leftovers are blue and violet —
 * which is what Pandora's canopy looks like.
 */
export function reflectedColor(star: StarKey, lo: number, hi: number): string {
  const step = (SPECTRUM_MAX - SPECTRUM_MIN) / SAMPLES;
  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    const nm = SPECTRUM_MIN + i * step;
    if (nm >= lo && nm <= hi) continue;
    const weight = photonFluxAt(nm, star);
    const [cr, cg, cb] = wavelengthToRgb(nm);
    r += cr * weight;
    g += cg * weight;
    b += cb * weight;
  }
  const peak = Math.max(r, g, b, Number.EPSILON);
  // Normalise to the brightest channel, then lift the floor so a very narrow
  // reflection band still reads as a colour rather than as black.
  const norm = (v: number) => Math.round(40 + (v / peak) * 195);
  return `rgb(${norm(r)}, ${norm(g)}, ${norm(b)})`;
}

/** Chlorophyll a/b absorption peaks — the window Earth's accident settled on. */
export const EARTH_PIGMENT_PEAKS = [
  { nm: 430, pigment: "chlA" },
  { nm: 453, pigment: "chlB" },
  { nm: 642, pigment: "chlB" },
  { nm: 662, pigment: "chlA" },
] as const;

/** Photosynthetically active radiation, as defined for Earth plants. */
export const PAR_RANGE = { lo: 400, hi: 700 } as const;
