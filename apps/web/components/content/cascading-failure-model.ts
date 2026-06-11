// The cascade logic behind CascadingFailure, kept separate so the component stays
// lean and the math is testable. Two coupled layers — flora (trees) and fauna
// (pollinators, seed-carriers) — each node depending on one partner in the other
// layer (Buldyrev et al. 2010, interdependent networks). A plague kills a fraction
// of the fauna; every flora node that loses its fauna partner then fails, which
// kills the fauna depending on THOSE, and so on — failure ricochets between layers
// in discrete rounds until it settles. Deterministic (seeded PRNG) so the figure
// scrubs the plague slider with no SSR jitter.

export const W = 360;
export const H = 220;
export const PER_LAYER = 14;

export interface CoupledNode {
  id: number;
  layer: "flora" | "fauna";
  x: number;
  y: number;
  /** Index (0..PER_LAYER-1) of the partner this node depends on in the other layer. */
  partner: number;
}

export interface CascadeResult {
  /** Per-round set of node ids alive at the end of that round; index 0 = initial. */
  rounds: boolean[][];
  floraAlive: number;
  faunaAlive: number;
  rounds_count: number;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build the two facing rows and a deterministic one-to-one-ish dependency map.
export function buildCoupled(): CoupledNode[] {
  const rng = mulberry32(20100614);
  const nodes: CoupledNode[] = [];
  const topY = 44;
  const botY = H - 44;
  const gap = (W - 40) / (PER_LAYER - 1);

  for (let i = 0; i < PER_LAYER; i++) {
    nodes.push({
      id: i,
      layer: "flora",
      x: 20 + i * gap,
      y: topY,
      partner: Math.floor(rng() * PER_LAYER),
    });
  }
  for (let i = 0; i < PER_LAYER; i++) {
    nodes.push({
      id: PER_LAYER + i,
      layer: "fauna",
      x: 20 + i * gap,
      y: botY,
      partner: Math.floor(rng() * PER_LAYER),
    });
  }
  return nodes;
}

// The order fauna die under the plague — deterministic shuffle so a given plague
// severity always removes the same nodes (and larger severities are supersets).
export function plagueOrder(): number[] {
  const rng = mulberry32(77123);
  const order = Array.from({ length: PER_LAYER }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Run the cascade: kill `killCount` fauna initially, then alternately fail any
// node whose partner in the other layer is dead, recording each round's state.
export function runCascade(nodes: CoupledNode[], killCount: number): CascadeResult {
  const flora = nodes.filter((n) => n.layer === "flora");
  const fauna = nodes.filter((n) => n.layer === "fauna");
  const alive = new Map<number, boolean>(nodes.map((n) => [n.id, true]));

  const order = plagueOrder();
  for (let k = 0; k < killCount && k < order.length; k++) {
    alive.set(PER_LAYER + order[k], false);
  }

  const rounds: boolean[][] = [nodes.map((n) => alive.get(n.id) ?? false)];

  let changed = true;
  let guard = 0;
  while (changed && guard < PER_LAYER * 2) {
    changed = false;
    guard++;
    // A flora node dies if its fauna partner is dead; a fauna node dies if its
    // flora partner is dead. Resolve both directions, then snapshot the round.
    for (const f of flora) {
      if (alive.get(f.id) && !alive.get(PER_LAYER + f.partner)) {
        alive.set(f.id, false);
        changed = true;
      }
    }
    for (const a of fauna) {
      if (alive.get(a.id) && !alive.get(a.partner)) {
        alive.set(a.id, false);
        changed = true;
      }
    }
    if (changed) rounds.push(nodes.map((n) => alive.get(n.id) ?? false));
  }

  return {
    rounds,
    floraAlive: flora.filter((n) => alive.get(n.id)).length,
    faunaAlive: fauna.filter((n) => alive.get(n.id)).length,
    rounds_count: rounds.length - 1,
  };
}
