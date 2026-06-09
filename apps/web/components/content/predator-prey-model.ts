// The dynamical core behind PredatorPreyOscillator, kept separate so the
// component file stays lean. Three nested models share one integrator:
//
//   naive    — classic Lotka-Volterra: unlimited prey growth, linear (Type I)
//              predation. Produces a *neutrally stable* closed orbit — push it and
//              it drifts to a new orbit with no force pulling it back.
//   real     — Rosenzweig-MacArthur: logistic prey growth to a carrying capacity K
//              plus a saturating (Holling Type II) functional response. Below the
//              enrichment threshold the interior equilibrium is a stable focus —
//              shock it and it spirals back.
//   enriched — the same model with K raised past the Hopf threshold. The
//              equilibrium goes unstable and a wide limit cycle takes over whose
//              troughs graze zero: the paradox of enrichment made mechanical.
//
// All three are one parameter set with K and the handling time h dialled. The math
// stays here; every visible string lives in the component's translations.

export type Model = "naive" | "real" | "enriched";

export interface Point {
  n: number; // prey (hexapede)
  p: number; // predator (viperwolf)
}

export interface Params {
  r: number; // prey intrinsic growth
  a: number; // attack rate
  h: number; // handling time (0 → linear Type I response)
  e: number; // prey→predator conversion efficiency
  m: number; // predator death rate
  K: number; // prey carrying capacity (Infinity → unlimited)
}

// Shared coefficients; only K and h move between models. Tuned so the real model
// sits below the Hopf threshold (K_crit ≈ 53 here) and the enriched model above it.
export const MODELS: Record<Model, Params> = {
  naive: { r: 1, a: 0.1, h: 0, e: 0.4, m: 0.3, K: Number.POSITIVE_INFINITY },
  real: { r: 1, a: 0.1, h: 0.3, e: 0.4, m: 0.3, K: 30 },
  enriched: { r: 1, a: 0.1, h: 0.3, e: 0.4, m: 0.3, K: 90 },
};

export const STEPS = 900;
export const DT = 0.05;

// Holling functional response: prey eaten per predator per unit time. h = 0 makes
// this linear (Type I); h > 0 saturates it (Type II).
function sat(prm: Params, n: number): number {
  return (prm.a * n) / (1 + prm.a * prm.h * n);
}

// The non-trivial coexistence equilibrium. For the saturating models it is the
// fixed point the orbit either spirals into (real) or circles (enriched).
export function equilibrium(prm: Params): Point {
  if (!Number.isFinite(prm.K) || prm.h === 0) {
    return { n: prm.m / (prm.e * prm.a), p: prm.r / prm.a };
  }
  const n = prm.m / (prm.a * (prm.e - prm.m * prm.h));
  const p = (prm.r * (1 - n / prm.K) * (1 + prm.a * prm.h * n)) / prm.a;
  return { n, p };
}

// Deterministic RK4 integration from a given start state. Populations are clamped
// at zero so a near-extinction trough never renders as a negative excursion.
export function integrate(prm: Params, n0: number, p0: number): Point[] {
  const f = (n: number, p: number) =>
    prm.r * n * (Number.isFinite(prm.K) ? 1 - n / prm.K : 1) - sat(prm, n) * p;
  const g = (n: number, p: number) => prm.e * sat(prm, n) * p - prm.m * p;

  const out: Point[] = [{ n: n0, p: p0 }];
  let n = n0;
  let p = p0;
  for (let i = 1; i < STEPS; i++) {
    const k1n = f(n, p);
    const k1p = g(n, p);
    const k2n = f(n + (DT / 2) * k1n, p + (DT / 2) * k1p);
    const k2p = g(n + (DT / 2) * k1n, p + (DT / 2) * k1p);
    const k3n = f(n + (DT / 2) * k2n, p + (DT / 2) * k2p);
    const k3p = g(n + (DT / 2) * k2n, p + (DT / 2) * k2p);
    const k4n = f(n + DT * k3n, p + DT * k3p);
    const k4p = g(n + DT * k3n, p + DT * k3p);
    n = Math.max(0, n + (DT / 6) * (k1n + 2 * k2n + 2 * k3n + k4n));
    p = Math.max(0, p + (DT / 6) * (k1p + 2 * k2p + 2 * k3p + k4p));
    out.push({ n, p });
  }
  return out;
}

// Start state for a model: its equilibrium displaced by a shock. The nudge button
// cycles `kick` to enlarge the displacement; the three models answer the same
// shock differently, which is the whole lesson.
export function shockedStart(model: Model, kick: number): Point {
  const eq = equilibrium(MODELS[model]);
  const d = 0.5 + kick * 0.3;
  return { n: eq.n * (1 + d), p: Math.max(0.5, eq.p * (1 - d * 0.5)) };
}
