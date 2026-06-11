// The Daisyworld model behind <Daisyworld>, kept separate so the component stays
// lean and the physics is testable. This is the Watson & Lovelock (1983) toy
// planet: a world growing only black and white daisies under a slowly
// brightening sun. Black daisies are dark (low albedo) and warm their patch;
// white daisies are pale (high albedo) and cool theirs. Both grow best near an
// optimum temperature and not at all when too cold or too hot. From those purely
// local, selfish rules, global temperature regulation emerges — with no
// controller and no foresight anywhere. We solve the steady state at each solar
// luminosity by iterating the coupled equations to convergence, so the figure
// can plot the regulated curve against the bare (lifeless) planet deterministically.

// All temperatures in degrees Celsius to stay readable for the lay reader; the
// original paper works in Kelvin but the shape of the result is identical.

export const SB = 5.67e-8; // Stefan–Boltzmann constant (W m⁻² K⁻⁴)
export const FLUX = 917; // solar-flux constant S·(1/4)·... folded so L=1 lands temperate
export const ALBEDO_GROUND = 0.5; // bare fertile ground
export const ALBEDO_BLACK = 0.25; // dark daisies absorb
export const ALBEDO_WHITE = 0.75; // pale daisies reflect
export const DEATH_RATE = 0.3; // constant daisy death rate γ
export const Q = 20; // heat-transfer coefficient linking local to planetary temp

// Growth is a downward parabola in local temperature, zero outside [5, 40] °C and
// peaking at the optimum (22.5 °C). β(T) = 1 − k·(Topt − T)², clamped at 0.
export const T_MIN = 5;
export const T_MAX = 40;
export const T_OPT = (T_MIN + T_MAX) / 2; // 22.5 °C
const GROWTH_K = 1 / (17.5 * 17.5); // makes β = 0 at the [5,40] edges

export function growth(localTempC: number): number {
  const b = 1 - GROWTH_K * (T_OPT - localTempC) ** 2;
  return b > 0 ? b : 0;
}

// Kelvin → Celsius. The radiation balance is solved in absolute temperature,
// then reported in °C.
const toC = (k: number) => k - 273.15;

export interface DaisyState {
  /** Fraction of the planet covered by black daisies (0..1). */
  black: number;
  /** Fraction covered by white daisies (0..1). */
  white: number;
  /** Planetary mean temperature (°C). */
  tempC: number;
  /** Planetary mean albedo (0..1). */
  albedo: number;
}

// Planetary radiative-equilibrium temperature for a given luminosity and albedo:
// absorbed sunlight = emitted thermal radiation. Returns °C.
function planetTempC(luminosity: number, albedo: number): number {
  const absorbed = FLUX * luminosity * (1 - albedo);
  const tK = (absorbed / SB) ** 0.25;
  return toC(tK);
}

// Local temperature of a daisy patch: hotter than planetary mean under dark
// daisies, cooler under pale ones, by an amount set by the albedo contrast and
// the heat-transfer coefficient Q. (Watson & Lovelock's linearised local model.)
function localTempC(planetC: number, planetAlbedo: number, patchAlbedo: number): number {
  return planetC + Q * (planetAlbedo - patchAlbedo);
}

// Solve the daisy steady state at one luminosity by iterating the coupled
// population + radiation equations to convergence. Deterministic and SSR-safe.
// Seeded with a small population of both daisy types so neither is locked out.
export function solveDaisyworld(luminosity: number): DaisyState {
  let black = 0.01;
  let white = 0.01;

  for (let i = 0; i < 200; i++) {
    const bare = 1 - black - white;
    const albedo = ALBEDO_GROUND * bare + ALBEDO_BLACK * black + ALBEDO_WHITE * white;
    const planetC = planetTempC(luminosity, albedo);

    const tBlack = localTempC(planetC, albedo, ALBEDO_BLACK);
    const tWhite = localTempC(planetC, albedo, ALBEDO_WHITE);

    // dαb/dt = αb·(x·β(Tb) − γ); steady state via damped Euler steps.
    const dBlack = black * (bare * growth(tBlack) - DEATH_RATE);
    const dWhite = white * (bare * growth(tWhite) - DEATH_RATE);

    black = Math.max(0.001, Math.min(1, black + 0.4 * dBlack));
    white = Math.max(0.001, Math.min(1, white + 0.4 * dWhite));
    if (black + white > 0.999) {
      const s = 0.999 / (black + white);
      black *= s;
      white *= s;
    }
  }

  const bare = 1 - black - white;
  const albedo = ALBEDO_GROUND * bare + ALBEDO_BLACK * black + ALBEDO_WHITE * white;
  return { black, white, tempC: planetTempC(luminosity, albedo), albedo };
}

// The bare (lifeless) planet's temperature at a luminosity — no daisies, just
// ground albedo. This is the line the regulated curve is measured against.
export function bareTempC(luminosity: number): number {
  return planetTempC(luminosity, ALBEDO_GROUND);
}

// Luminosity sweep used to draw both curves across the figure's x-axis.
export const L_MIN = 0.6;
export const L_MAX = 1.7;

// Precompute the regulated and bare temperature curves across the luminosity
// range, as {l, regulated, bare} samples — memoized once, drawn as two paths.
export function temperatureCurves(samples = 56): {
  l: number;
  regulated: number;
  bare: number;
}[] {
  const out: { l: number; regulated: number; bare: number }[] = [];
  for (let i = 0; i < samples; i++) {
    const l = L_MIN + (i / (samples - 1)) * (L_MAX - L_MIN);
    out.push({ l, regulated: solveDaisyworld(l).tempC, bare: bareTempC(l) });
  }
  return out;
}
