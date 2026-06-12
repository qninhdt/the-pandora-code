#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import {
  type SimulationNodeDatum,
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import { type Locale, locales } from "../i18n/config";
import { listChapters, listPublishedChapters } from "../lib/content/loader/chapter-loader";
import {
  listGlossaryIds,
  listGlossaryTerms,
  loadGlossaryTerm,
} from "../lib/content/loader/glossary-loader";
import { getOutlineWithStatus } from "../lib/content/outline";
import type { GraphData, GraphEdge, GraphNode } from "../lib/constellation/graph-data";

// Concept constellation graph: nodes = published chapters + glossary terms,
// edges = see_also (term↔term) + related_chapters (chapter↔chapter) +
// glossary_terms (chapter↔term). Tag-sharing edges are deliberately EXCLUDED —
// a spike showed they add ~4,400 edges (one "evolution" tag links 45 terms)
// and collapse the graph into an unreadable hairball.

interface SimNode extends SimulationNodeDatum {
  id: string;
}

function buildGraph(locale: Locale): GraphData {
  const chapters = listPublishedChapters(locale);
  const chapterSlugs = new Set(chapters.map((c) => c.meta.slug));
  const terms = listGlossaryTerms(locale);
  const termIds = new Set(listGlossaryIds());

  // Map each chapter slug → its part id + label (book order) for filtering.
  const outline = getOutlineWithStatus(locale);
  const partOfChapter = new Map<string, { id: string; label: string }>();
  const parts: { id: string; label: string }[] = [];
  for (const part of outline) {
    parts.push({ id: part.id, label: part.label[locale] });
    for (const ch of part.chapters) {
      partOfChapter.set(ch.slug, { id: part.id, label: part.label[locale] });
    }
  }

  const nodes: GraphNode[] = [
    ...chapters.map((c) => ({
      id: `c:${c.meta.slug}`,
      type: "chapter" as const,
      label: c.title,
      href: `/${locale}/chapters/${c.meta.slug}`,
      part: partOfChapter.get(c.meta.slug)?.id ?? null,
      x: 0,
      y: 0,
      z: 0,
    })),
    ...terms.map((t) => ({
      id: `g:${t.id}`,
      type: "glossary" as const,
      label: t.label,
      href: `/${locale}/glossary/${t.id}`,
      part: null,
      x: 0,
      y: 0,
      z: 0,
    })),
  ];
  const nodeIds = new Set(nodes.map((n) => n.id));

  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (a: string, b: string, kind: GraphEdge["kind"]) => {
    if (a === b || !nodeIds.has(a) || !nodeIds.has(b)) return;
    const key = [a, b].sort().join("|");
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ source: a, target: b, kind });
  };

  for (const id of listGlossaryIds()) {
    const term = loadGlossaryTerm(id);
    for (const s of term?.see_also ?? []) {
      if (termIds.has(s)) addEdge(`g:${id}`, `g:${s}`, "see_also");
    }
  }
  for (const c of listChapters(locale)) {
    for (const rc of c.meta.related_chapters ?? []) {
      if (chapterSlugs.has(rc)) addEdge(`c:${c.meta.slug}`, `c:${rc}`, "related_chapter");
    }
    for (const gt of c.meta.glossary_terms ?? []) {
      if (termIds.has(gt)) addEdge(`c:${c.meta.slug}`, `g:${gt}`, "chapter_term");
    }
  }

  layout(nodes, edges);
  // d3-force mutates node objects in place (index/vx/vy) and tags edges with an
  // `index`; emit clean records with only the fields the client needs so the
  // JSON stays lean.
  const cleanNodes: GraphNode[] = nodes.map((n) => ({
    id: n.id,
    type: n.type,
    label: n.label,
    href: n.href,
    part: n.part,
    x: n.x,
    y: n.y,
    z: n.z,
  }));
  const cleanEdges: GraphEdge[] = edges.map((e) => ({
    source: e.source,
    target: e.target,
    kind: e.kind,
  }));
  return { nodes: cleanNodes, edges: cleanEdges, parts };
}

// Offline 3D force layout: positions are baked into the JSON so the client
// renders a static point cloud (no runtime simulation). Deterministic — d3's
// default seeded layout + a fixed tick count (no Math.random in scripts).
function layout(nodes: GraphNode[], edges: GraphEdge[]): void {
  const sim = forceSimulation<SimNode>(nodes as unknown as SimNode[])
    .force(
      "link",
      forceLink<SimNode, { source: string; target: string }>(edges)
        .id((d) => d.id)
        .distance(6)
        .strength(0.4),
    )
    .force("charge", forceManyBody().strength(-12))
    .force("center", forceCenter(0, 0))
    .stop();

  // Run synchronously; spread the 2D layout onto a sphere-ish z by hashing id.
  const ticks = 300;
  for (let i = 0; i < ticks; i++) sim.tick();

  for (const n of nodes) {
    const s = n as unknown as SimNode;
    n.x = round(s.x ?? 0);
    n.y = round(s.y ?? 0);
    // Derive a stable z from the node id so the cloud has depth without a 3D
    // sim (cheaper, and d3-force is 2D). Range roughly [-20, 20].
    n.z = round(((hash(n.id) % 4000) / 100 - 20) as number);
  }

  // forceLink replaced edge.source/target strings with node object refs;
  // restore them to ids so the serialized edges stay string-keyed.
  for (const e of edges as unknown as { source: SimNode | string; target: SimNode | string }[]) {
    if (typeof e.source === "object") e.source = e.source.id as string;
    if (typeof e.target === "object") e.target = e.target.id as string;
  }
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function main() {
  const outDir = path.resolve(process.cwd(), "public", "graph");
  fs.mkdirSync(outDir, { recursive: true });
  for (const locale of locales) {
    const data = buildGraph(locale);
    if (data.nodes.length === 0) {
      console.warn(`[build-graph] WARNING: 0 nodes for locale "${locale}".`);
    }
    const outPath = path.join(outDir, `graph-${locale}.json`);
    fs.writeFileSync(outPath, JSON.stringify(data));
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(
      `[build-graph] ${locale}: ${data.nodes.length} nodes, ${data.edges.length} edges → ${kb}KB`,
    );
  }
}

main();
