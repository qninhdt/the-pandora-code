"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type GNode = { id: number; x: number; y: number; deg: number };

function layout(id: number, n: number) {
  const a = (id / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
  const r = 12 + (id % 5) * 5.5;
  return { x: 50 + Math.cos(a) * r, y: 46 + Math.sin(a) * r * 0.82 };
}

function seedGraph() {
  const nodes: GNode[] = [0, 1, 2].map((id) => ({ id, ...layout(id, 3), deg: 0 }));
  const edges: [number, number][] = [];
  const link = (a: number, b: number) => {
    if (a === b) return;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (edges.some(([x, y]) => x === lo && y === hi)) return;
    edges.push([lo, hi]);
    nodes[a].deg++;
    nodes[b].deg++;
  };
  link(0, 1);
  link(1, 2);
  link(0, 2);
  return { nodes, edges, nextId: 3 };
}

export default function ScaleFreeNetwork() {
  const t = useTranslations("viz.scale-free-network");
  const [graph, setGraph] = useState(seedGraph);

  const maxDeg = Math.max(...graph.nodes.map((n) => n.deg), 1);
  const hubs = useMemo(
    () => graph.nodes.filter((n) => n.deg >= Math.max(3, maxDeg - 1)).length,
    [graph, maxDeg],
  );

  const grow = () => {
    setGraph((g) => {
      if (g.nodes.length >= 40) return g;
      const id = g.nextId;
      const nodes = g.nodes.map((n) => ({ ...n }));
      const edges = g.edges.map((e) => [...e] as [number, number]);
      const total = nodes.reduce((s, n) => s + Math.max(1, n.deg), 0);
      let r = Math.random() * total;
      let target = 0;
      for (let j = 0; j < nodes.length; j++) {
        r -= Math.max(1, nodes[j].deg);
        if (r <= 0) {
          target = j;
          break;
        }
      }
      const pos = layout(id, nodes.length + 1);
      nodes.push({ id, x: pos.x, y: pos.y, deg: 0 });
      const lo = Math.min(id, nodes[target].id);
      const hi = Math.max(id, nodes[target].id);
      edges.push([lo, hi]);
      nodes[nodes.length - 1].deg++;
      const ti = nodes.findIndex((n) => n.id === nodes[target].id);
      // target index may shift — use original target index
      nodes[target].deg++;
      // re-layout all for spacing
      const n = nodes.length;
      const laid = nodes.map((nd, i) => ({ ...nd, ...layout(i, n) }));
      // fix deg after possible confusion
      void ti;
      return { nodes: laid, edges, nextId: id + 1 };
    });
  };

  // recompute degrees from edges for safety
  const nodes = useMemo(() => {
    const deg = new Map<number, number>();
    for (const n of graph.nodes) deg.set(n.id, 0);
    for (const [a, b] of graph.edges) {
      deg.set(a, (deg.get(a) ?? 0) + 1);
      deg.set(b, (deg.get(b) ?? 0) + 1);
    }
    return graph.nodes.map((n) => ({ ...n, deg: deg.get(n.id) ?? 0 }));
  }, [graph]);

  const md = Math.max(...nodes.map((n) => n.deg), 1);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setGraph(seedGraph())}
      allowFullscreen={false}
      caption={
        <span>
          {t("nodes")}: <span className="text-cyan">{nodes.length}</span> · {t("hubs")}:{" "}
          <span className="text-amber">{hubs}</span>
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {graph.edges.map(([a, b]) => {
            const na = nodes.find((n) => n.id === a);
            const nb = nodes.find((n) => n.id === b);
            if (!na || !nb) return null;
            return (
              <line
                key={`${a}-${b}`}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke="var(--cyan)"
                strokeWidth={0.5}
                opacity={0.45}
              />
            );
          })}
          {nodes.map((n) => {
            const hub = n.deg === md && md > 2;
            return (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={1.6 + n.deg * 0.55}
                fill={hub ? "var(--amber)" : "var(--surface)"}
                stroke={hub ? "var(--amber)" : "var(--teal)"}
                strokeWidth={hub ? 1.1 : 0.6}
              />
            );
          })}
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("nodes")} value={nodes.length} accent="cyan" />
          <ControlButton onClick={grow} className="px-2.5" disabled={nodes.length >= 40}>
            {t("grow")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
