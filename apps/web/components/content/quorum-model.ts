// The cascade logic behind QuorumCascade, kept separate so the component stays
// lean and the propagation is unit-testable. A deterministic grid of agents is
// wired to its grid neighbours; a distress signal injected at the central node
// (the chapter's Tree of Souls) spreads only when a quiet agent has at least
// `quorum` already-roused neighbours. Low quorum → the alarm sweeps the whole
// network; high quorum → it dies out locally. Nothing decides — local thresholds
// do all the work. The whole cascade is precomputed into frames so the figure
// can scrub, step, and play through it deterministically (SSR-safe, no jitter).

export const W = 360;
export const H = 240;
export const COLS = 8;
export const ROWS = 8;
export const NODE_COUNT = COLS * ROWS;

export interface Node {
  id: number;
  x: number;
  y: number;
  /** Indices of neighbour nodes this one can pass signal to. */
  neighbours: number[];
}

// Built once and stable across renders/SSR so the layout never jitters. The
// injection node is near-central and maximally connected.
export function buildNetwork(): { nodes: Node[]; injection: number } {
  const margin = 28;
  const gapX = (W - margin * 2) / (COLS - 1);
  const gapY = (H - margin * 2) / (ROWS - 1);
  const nodes: Node[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const id = r * COLS + c;
      // Moore neighbourhood: the 8 surrounding cells. A single lit node can never
      // give a quiet neighbour 2+ roused neighbours, so a 4-neighbour grid stalls
      // at any quorum above 1; the diagonal links let a quorum-2 alarm actually
      // travel while a high quorum still dies out.
      const neighbours: number[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          neighbours.push(nr * COLS + nc);
        }
      }
      nodes.push({ id, x: margin + c * gapX, y: margin + r * gapY, neighbours });
    }
  }
  const injection = 3 * COLS + 3;
  return { nodes, injection };
}

// The starting cluster: the injection node plus its immediate neighbours. A lone
// seed can never hand any quiet cell two roused neighbours, so the cascade would
// stall at every quorum above 1; a small lit cluster gives a quorum-2 alarm the
// two-neighbour overlap it needs to actually travel.
export function seedSet(nodes: Node[], injection: number): Set<number> {
  const seed = new Set<number>([injection]);
  for (const n of nodes[injection].neighbours) seed.add(n);
  return seed;
}

// One synchronous propagation step: a quiet node flips if at least `quorum` of
// its neighbours are already roused. Returns the next roused set + whether it
// changed this step.
export function step(
  nodes: Node[],
  current: Set<number>,
  quorum: number,
): { next: Set<number>; changed: boolean } {
  const next = new Set(current);
  let changed = false;
  for (const node of nodes) {
    if (next.has(node.id)) continue;
    const litNeighbours = node.neighbours.filter((n) => current.has(n)).length;
    if (litNeighbours >= quorum) {
      next.add(node.id);
      changed = true;
    }
  }
  return { next, changed };
}

// Precompute the full cascade as an array of frames, each the cumulative roused
// set at that tick. frames[0] is the lit seed cluster; the last frame is the
// settled state. Capped at NODE_COUNT iterations (it always converges well
// before that). Deterministic → safe to memoize and scrub.
export function cascadeFrames(nodes: Node[], injection: number, quorum: number): Set<number>[] {
  const frames: Set<number>[] = [seedSet(nodes, injection)];
  let cur = frames[0];
  for (let i = 0; i < NODE_COUNT; i++) {
    const { next, changed } = step(nodes, cur, quorum);
    if (!changed) break;
    frames.push(next);
    cur = next;
  }
  return frames;
}

// Final coverage (0..100) a given quorum reaches from the injection node — used
// for the verdict readout without having to play the animation.
export function finalCoverage(nodes: Node[], injection: number, quorum: number): number {
  const frames = cascadeFrames(nodes, injection, quorum);
  return Math.round((frames[frames.length - 1].size / NODE_COUNT) * 100);
}
