// The percolation logic behind PercolationNetwork, kept separate so the
// component stays lean and the math is testable. A deterministic scale-free
// network (Barabási–Albert preferential attachment) is built once; nodes are
// then removed either at random or hubs-first, and after each removal we measure
// the giant connected component via union-find. Random removal barely dents the
// giant component until almost everything is gone (the percolation threshold for
// a scale-free graph sits near total annihilation); targeted hub removal shatters
// it after only a few nodes. Everything is precomputed and deterministic so the
// figure can scrub the removal fraction with no SSR jitter.

export const W = 360;
export const H = 260;
export const NODE_COUNT = 72;
// Edges each new node brings when it joins (preferential attachment degree).
const ATTACH = 2;

export type AttackMode = "random" | "targeted";

export interface Node {
  id: number;
  x: number;
  y: number;
  degree: number;
  neighbours: number[];
}

// Small deterministic PRNG (mulberry32) so the network + the random removal
// order are identical on server and client — no hydration drift.
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

// Build a Barabási–Albert scale-free graph: a few highly-connected hubs and many
// low-degree leaves. Hubs are laid out toward the centre and leaves toward the
// rim so the topology reads at a glance. Stable across renders/SSR.
export function buildNetwork(): Node[] {
  const rand = mulberry32(0x9e3779b9);
  const edges: Array<[number, number]> = [];
  const degree = new Array<number>(NODE_COUNT).fill(0);
  // A repeated-node target list makes selection probability ∝ current degree.
  const targets: number[] = [];

  // Seed clique of ATTACH+1 fully-connected nodes.
  for (let i = 0; i <= ATTACH; i++) {
    for (let j = i + 1; j <= ATTACH; j++) {
      edges.push([i, j]);
      degree[i]++;
      degree[j]++;
      targets.push(i, j);
    }
  }

  for (let v = ATTACH + 1; v < NODE_COUNT; v++) {
    const chosen = new Set<number>();
    while (chosen.size < ATTACH) {
      const pick = targets.length
        ? targets[Math.floor(rand() * targets.length)]
        : Math.floor(rand() * v);
      if (pick !== v) chosen.add(pick);
    }
    for (const u of chosen) {
      edges.push([u, v]);
      degree[u]++;
      degree[v]++;
      targets.push(u, v);
    }
  }

  // Radial layout: rank by degree, hubs near centre, leaves toward the rim, with
  // a seeded angle + jitter so it looks organic but is deterministic.
  const byDegree = [...Array(NODE_COUNT).keys()].sort((a, b) => degree[b] - degree[a]);
  const rank = new Array<number>(NODE_COUNT);
  byDegree.forEach((id, i) => {
    rank[id] = i;
  });

  const cx = W / 2;
  const cy = H / 2;
  const maxR = Math.min(W, H) / 2 - 26;
  const angleRand = mulberry32(0x1234567);
  const nodes: Node[] = [];
  for (let id = 0; id < NODE_COUNT; id++) {
    const rNorm = rank[id] / (NODE_COUNT - 1); // 0 = biggest hub
    const radius = Math.sqrt(rNorm) * maxR; // sqrt → fill the disc evenly
    const angle = angleRand() * Math.PI * 2;
    const jitter = (angleRand() - 0.5) * 18;
    nodes.push({
      id,
      x: cx + Math.cos(angle) * radius + jitter,
      y: cy + Math.sin(angle) * radius + jitter,
      degree: degree[id],
      neighbours: [],
    });
  }
  for (const [a, b] of edges) {
    nodes[a].neighbours.push(b);
    nodes[b].neighbours.push(a);
  }
  return nodes;
}

// The order in which nodes are removed for a given attack. Random = seeded
// shuffle; targeted = highest-degree hubs first (ties broken by id for
// determinism). Returns a full permutation of node ids.
export function removalOrder(nodes: Node[], mode: AttackMode): number[] {
  const ids = [...Array(nodes.length).keys()];
  if (mode === "targeted") {
    return ids.sort((a, b) => nodes[b].degree - nodes[a].degree || a - b);
  }
  const rand = mulberry32(0xc0ffee);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

// Largest connected component among the surviving nodes (those NOT in `removed`),
// counted via union-find over the surviving edges.
function giantComponent(nodes: Node[], removed: Set<number>): number {
  const parent = new Array<number>(nodes.length);
  for (let i = 0; i < nodes.length; i++) parent[i] = i;
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };
  for (const node of nodes) {
    if (removed.has(node.id)) continue;
    for (const n of node.neighbours) {
      if (n > node.id && !removed.has(n)) union(node.id, n);
    }
  }
  const size = new Map<number, number>();
  let max = 0;
  for (const node of nodes) {
    if (removed.has(node.id)) continue;
    const root = find(node.id);
    const c = (size.get(root) ?? 0) + 1;
    size.set(root, c);
    if (c > max) max = c;
  }
  return max;
}

// For an attack mode, the giant-component fraction (0..100) of the ORIGINAL node
// count after removing the first k nodes, for every k = 0..NODE_COUNT.
// Precomputed once per mode so the slider just indexes in.
export function giantComponentCurve(nodes: Node[], mode: AttackMode): number[] {
  const order = removalOrder(nodes, mode);
  const removed = new Set<number>();
  const curve: number[] = [];
  for (let k = 0; k <= nodes.length; k++) {
    if (k > 0) removed.add(order[k - 1]);
    curve.push(Math.round((giantComponent(nodes, removed) / nodes.length) * 100));
  }
  return curve;
}

// The set of removed node ids after removing the first k in this mode's order —
// used to grey out the fallen nodes in the SVG.
export function removedSet(nodes: Node[], mode: AttackMode, k: number): Set<number> {
  const order = removalOrder(nodes, mode);
  return new Set(order.slice(0, k));
}
