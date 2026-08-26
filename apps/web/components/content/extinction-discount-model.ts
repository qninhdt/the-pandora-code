// The bioeconomic core behind ExtinctionDiscountModel, kept separate so the
// component file stays lean.
//
// Gordon-Schaefer harvesting on a logistically growing stock:
//
//   dN/dt = r N (1 - N/K) - H     growth minus harvest
//   TR(E) = p q E N               revenue is linear in effort and stock
//   TC(E) = c E                   cost is linear in effort
//
// Three reference stock levels fall out of that:
//
//   N_msy  = K/2            the biologist's answer - peak sustainable surplus
//   N_oa   = c/(p q)        open-access equilibrium - entry stops when rent is gone
//   N_star = the sole owner's optimum, from Clark's fundamental bioeconomic
//            equation  F'(N) - c'(N) F(N)/(p - c(N)) = delta
//
// With a stock-independent unit price and a capture cost that stays affordable as
// the stock thins, that equation reduces to a closed form. Clark's 1973 result is
// the consequence: when the discount rate exceeds the biological growth rate, the
// present-value-maximising N* falls to zero, and liquidating the population is
// the *rational* choice rather than a failure of rationality.
//
// The math stays here; every visible string lives in the component's translations.

export interface StockParams {
  /** Intrinsic growth rate r, per year. Great whales sit near 0.02-0.06. */
  r: number;
  /** Discount rate delta, per year - the return available on rival investments. */
  delta: number;
  /** Unit price p of the harvested product, in millions of currency units. */
  price: number;
  /** Unit cost c of harvesting effort, in the same millions. */
  cost: number;
  /** Carrying capacity K, in individuals. */
  K: number;
  /** Catchability coefficient q - fraction of the stock taken per unit effort. */
  q: number;
}

export const DEFAULTS: StockParams = {
  r: 0.03,
  delta: 0.1,
  price: 80,
  cost: 1.2,
  K: 20000,
  q: 0.0004,
};

/** Logistic surplus production F(N) = r N (1 - N/K). */
export function surplus(p: StockParams, n: number): number {
  return p.r * n * (1 - n / p.K);
}

/** Marginal surplus F'(N) = r (1 - 2N/K). */
function marginalSurplus(p: StockParams, n: number): number {
  return p.r * (1 - (2 * n) / p.K);
}

/**
 * Unit harvest cost at stock N: c/(q N). Thin stocks are dearer to hunt, which is
 * the only brake the market has - and a high enough price disables it.
 */
export function unitCost(p: StockParams, n: number): number {
  if (n <= 0) return Number.POSITIVE_INFINITY;
  return p.cost / (p.q * n);
}

/** Peak sustainable yield stock, K/2, and the yield there, rK/4. */
export function msyStock(p: StockParams): number {
  return p.K / 2;
}
export function msyYield(p: StockParams): number {
  return (p.r * p.K) / 4;
}

/**
 * Open-access equilibrium: vessels keep entering until revenue equals cost, so
 * the stock settles where the unit cost of capture has risen to the price.
 */
export function openAccessStock(p: StockParams): number {
  const n = p.cost / (p.price * p.q);
  return Math.min(p.K, Math.max(0, n));
}

/**
 * Clark's optimal steady-state stock. Solved by bisection on
 *   g(N) = F'(N) + [c/(q N^2)] F(N) / (p - c/(q N)) - delta
 * over the interval where harvesting is profitable at all. Returns 0 when no
 * positive stock satisfies the equation - the optimal-extinction case.
 */
export function optimalStock(p: StockParams): number {
  const lo = openAccessStock(p) * 1.0001; // below this, harvesting loses money
  const hi = p.K;
  if (!(lo < hi)) return 0;

  const g = (n: number): number => {
    const margin = p.price - unitCost(p, n);
    if (margin <= 0) return Number.POSITIVE_INFINITY;
    const stockEffect = (p.cost / (p.q * n * n)) * (surplus(p, n) / margin);
    return marginalSurplus(p, n) + stockEffect - p.delta;
  };

  // g is decreasing in N over this interval. If even the cheapest profitable
  // stock cannot return delta, the present value is maximised by liquidation.
  if (g(lo) < 0) return 0;
  if (g(hi) > 0) return p.K;

  let a = lo;
  let b = hi;
  for (let i = 0; i < 80; i++) {
    const mid = (a + b) / 2;
    if (g(mid) > 0) a = mid;
    else b = mid;
  }
  return (a + b) / 2;
}

export type Verdict = "conserve" | "deplete" | "liquidate";

export interface Outcome {
  nStar: number;
  nMsy: number;
  nOpenAccess: number;
  verdict: Verdict;
  /** Sustainable yield at the optimum, in individuals per year. */
  yieldAtOptimum: number;
  /** Annual gross revenue at the optimum, in millions. */
  revenueAtOptimum: number;
}

/**
 * Whether the profit-maximising owner conserves the stock, grinds it below the
 * biologist's reference point, or takes it to zero. The liquidate verdict is the
 * chapter's point: it is an output of the arithmetic, not a moral failing.
 */
export function evaluate(p: StockParams): Outcome {
  const nStar = optimalStock(p);
  const nMsy = msyStock(p);
  const y = surplus(p, nStar);
  const verdict: Verdict =
    nStar <= p.K * 0.02 ? "liquidate" : nStar < nMsy ? "deplete" : "conserve";
  return {
    nStar,
    nMsy,
    nOpenAccess: openAccessStock(p),
    verdict,
    yieldAtOptimum: y,
    revenueAtOptimum: y * p.price,
  };
}
