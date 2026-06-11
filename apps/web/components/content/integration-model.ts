// The schematic Φ metric behind IntegrationVsSize, kept separate so the component
// stays lean. The chapter's point: raw connection count does not make a mind —
// recurrent, irreducible feedback does. So this model deliberately *decouples*
// the two. As "recurrence" r ∈ [0,1] rises, the network keeps a large, roughly
// constant node/connection count but rewires from a one-way feed-forward mesh
// (information enters, passes through, exits — Φ ≈ 0) toward a densely recurrent
// web where every node talks back (Φ climbs steeply). It is a dramatization of
// the connectomic fallacy, not a calculation of integrated information.

export const MESH_NODES = 30; // the "huge" feed-forward population (cerebellum-like)
export const LOOP_NODES = 6; // the small recurrent ring (cortex-like)

// Connections stay large and only drift mildly with r, so the reader sees Φ move
// while the count does *not* — the whole lesson in one readout pair.
export function connectionCount(r: number): number {
  // Feed-forward mesh has many one-way edges; as it folds into loops the raw
  // count barely changes (recurrence adds back-edges but prunes fan-out).
  return Math.round(MESH_NODES * 4 * (1 - 0.12 * r));
}

// Schematic integrated information. Near-zero while feed-forward (a feed-forward
// system unfolds into independent causal chains → reducible → Φ→0), rising
// super-linearly as recurrent loops bind the system into an irreducible whole.
export function phi(r: number): number {
  // smootherstep easing emphasises that early recurrence buys little, but a
  // richly looped network is qualitatively different.
  const e = r * r * r * (r * (r * 6 - 15) + 10);
  return Number((e * 9.4).toFixed(1));
}

// Effective node count shown to the reader: the visual collapses from a wide
// mesh to a tight ring as recurrence rises, but the *headline* count the figure
// argues against stays high — so we report the mesh population throughout.
export function verdictKey(r: number): "unconscious" | "candidate" {
  return phi(r) >= 4 ? "candidate" : "unconscious";
}
