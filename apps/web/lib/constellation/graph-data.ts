// Shared types + loader for the precomputed concept-constellation graph.
// The graph JSON is generated at build time (scripts/build-graph.ts) into
// public/graph/graph-{locale}.json with positions already laid out, so the
// client only renders + handles interaction — no force simulation at runtime.

export interface GraphNode {
  id: string;
  type: "chapter" | "glossary";
  label: string;
  href: string;
  part: string | null;
  /** Precomputed 3D position from the offline d3-force layout. */
  x: number;
  y: number;
  z: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  /** Why these two are linked — drives edge styling/weight. */
  kind: "see_also" | "related_chapter" | "chapter_term";
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Distinct part ids present, in book order, for the filter control. */
  parts: { id: string; label: string }[];
}

// Lazily fetch the precomputed graph for a locale, cached per session.
const cache = new Map<string, Promise<GraphData>>();

export function loadGraph(locale: "vi" | "en"): Promise<GraphData> {
  let pending = cache.get(locale);
  if (!pending) {
    pending = fetch(`/graph/graph-${locale}.json`).then((res) => {
      if (!res.ok) throw new Error(`Failed to load graph for "${locale}"`);
      return res.json() as Promise<GraphData>;
    });
    cache.set(locale, pending);
  }
  return pending;
}
