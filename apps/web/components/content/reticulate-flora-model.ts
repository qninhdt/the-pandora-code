// Topology behind ReticulateFloraNetwork.
//
// Animal phylogenies can usually be drawn as bifurcating trees. Plant phylogenies
// cannot. Around seventy percent of living angiosperm species carry a whole-genome
// duplication in their ancestry; allopolyploid hybridization creates new species in
// a single generation (Spartina anglica, around 1890; Tragopogon miscellus in the
// twentieth century); Amborella trichopoda acquired five foreign mitochondrial
// genomes horizontally; ferns picked up the neochrome photoreceptor from hornworts;
// and plastid capture routinely leaves the chloroplast tree disagreeing with the
// nuclear one. Every one of those events is an edge that a tree diagram has no
// place to draw.
//
// Pandora adds a mechanism Earth lacks at planetary scale: a root network that
// physically joins unrelated lineages. Canon confirms interspecific root grafting
// (Magellum piping defensive compounds into a neighbour) and a fungal conduit
// (Fungimonium penetrating root cortices). Those are lateral channels between
// branches, so a Pandoran floral phylogeny should be drawn as a network.
//
// The clade names here are this chapter's own labels for groups the canon flora
// falls into. They are not canon and not Earth taxonomy.

export type Layer = "tree" | "network";

export type Tier = "canon" | "inference";

export interface CladeNode {
  key: string;
  /** Parent clade key, or null for the basal stem. */
  parent: string | null;
  /** Depth from the stem, 0-based — drives x position. */
  depth: number;
  /** Vertical slot among the tips. */
  slot: number;
  tier: Tier;
}

// Six proposed groups plus the basal stem they all descend from.
export const CLADES: CladeNode[] = [
  { key: "stem", parent: null, depth: 0, slot: 3, tier: "inference" },
  { key: "protoZooplantae", parent: "stem", depth: 1, slot: 0, tier: "inference" },
  { key: "paleoPterido", parent: "stem", depth: 1, slot: 1, tier: "inference" },
  { key: "vascularStem", parent: "stem", depth: 1, slot: 3.2, tier: "inference" },
  { key: "dendroNeuro", parent: "vascularStem", depth: 2, slot: 2.4, tier: "canon" },
  { key: "tensiloSperm", parent: "vascularStem", depth: 2, slot: 3.6, tier: "inference" },
  { key: "sarcocaulo", parent: "vascularStem", depth: 2, slot: 4.8, tier: "inference" },
  { key: "thalasso", parent: "dendroNeuro", depth: 3, slot: 5.9, tier: "inference" },
];

export interface DescentEdge {
  parent: string;
  child: string;
}

/** The ordinary parent-to-daughter edges — the tree proper, with the stem excluded. */
export const DESCENT_EDGES: DescentEdge[] = CLADES.filter(
  (c): c is CladeNode & { parent: string } => c.parent !== null,
).map((c) => ({ parent: c.parent, child: c.key }));

export type EdgeKind = "rootGraft" | "hyphalConduit" | "plastidCapture" | "geneTransfer";

export interface ReticulationEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  /** Whether canon states the mechanism, or the chapter infers it. */
  tier: Tier;
}

// Lateral edges. The two root-mediated ones are the mechanisms canon describes;
// the genomic two are the Earth processes the chapter argues must also apply.
export const EDGES: ReticulationEdge[] = [
  { from: "dendroNeuro", to: "tensiloSperm", kind: "rootGraft", tier: "canon" },
  { from: "dendroNeuro", to: "paleoPterido", kind: "hyphalConduit", tier: "canon" },
  { from: "sarcocaulo", to: "tensiloSperm", kind: "plastidCapture", tier: "inference" },
  { from: "protoZooplantae", to: "dendroNeuro", kind: "geneTransfer", tier: "inference" },
];

export const EDGE_KINDS: EdgeKind[] = [
  "rootGraft",
  "hyphalConduit",
  "plastidCapture",
  "geneTransfer",
];

export interface Layout {
  x: number;
  y: number;
}

/** Node positions for a canvas of the given size. Depth runs left to right. */
export function layoutFor(width: number, height: number): Record<string, Layout> {
  const maxDepth = Math.max(...CLADES.map((c) => c.depth));
  const maxSlot = Math.max(...CLADES.map((c) => c.slot));
  const padX = 26;
  const padY = 16;
  const out: Record<string, Layout> = {};
  for (const node of CLADES) {
    out[node.key] = {
      x: padX + (node.depth / maxDepth) * (width - padX * 2),
      y: padY + (node.slot / maxSlot) * (height - padY * 2),
    };
  }
  return out;
}

export interface TopologyStats {
  /** Nodes in the diagram. */
  nodes: number;
  /** Vertical descent edges — the tree proper. */
  descentEdges: number;
  /** Lateral edges the tree cannot express. */
  lateralEdges: number;
  /**
   * A tree on n nodes has exactly n-1 edges. Anything above that is a cycle, and
   * a cycle is the formal signature that the diagram is a network, not a tree.
   */
  cycles: number;
}

export function statsFor(layer: Layer): TopologyStats {
  const nodes = CLADES.length;
  const descentEdges = DESCENT_EDGES.length;
  const lateralEdges = layer === "network" ? EDGES.length : 0;
  return {
    nodes,
    descentEdges,
    lateralEdges,
    cycles: Math.max(0, descentEdges + lateralEdges - (nodes - 1)),
  };
}

/** A gentle arc for a lateral edge, bowed away from the trunk so it stays legible. */
export function lateralArc(a: Layout, b: Layout): string {
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const bow = Math.max(18, Math.abs(b.y - a.y) * 0.45);
  return `M ${a.x} ${a.y} Q ${midX + bow} ${midY} ${b.x} ${b.y}`;
}

export function toneForKind(kind: EdgeKind): "cyan" | "teal" | "magenta" | "amber" {
  if (kind === "rootGraft") return "teal";
  if (kind === "hyphalConduit") return "cyan";
  if (kind === "plastidCapture") return "magenta";
  return "amber";
}
