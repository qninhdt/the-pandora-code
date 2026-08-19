"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type GNode = { id: number; x: number; y: number; deg: number; dead: boolean };

function buildScaleFree(n = 30): { nodes: GNode[]; edges: [number, number][] } {
  const nodes: GNode[] = Array.from({ length: n }, (_, id) => {
    const a = (id / n) * Math.PI * 2 + 0.3;
    const r = 12 + (id % 4) * 8;
    return {
      id,
      x: 50 + Math.cos(a) * r,
      y: 46 + Math.sin(a) * r * 0.8,
      deg: 0,
      dead: false,
    };
  });
  const edges: [number, number][] = [];
  const link = (a: number, b: number) => {
    if (a === b) return;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (edges.some(([x, y]) => x === lo && y === hi)) return;
    edges.push([lo, hi]);
    nodes[lo].deg++;
    nodes[hi].deg++;
  };
  link(0, 1);
  link(1, 2);
  link(0, 2);
  for (let i = 3; i < n; i++) {
    const total = nodes.slice(0, i).reduce((s, nd) => s + Math.max(1, nd.deg), 0);
    for (let k = 0; k < 2; k++) {
      let r = Math.random() * total;
      for (let j = 0; j < i; j++) {
        r -= Math.max(1, nodes[j].deg);
        if (r <= 0) {
          link(i, j);
          break;
        }
      }
    }
  }
  return { nodes, edges };
}

function largestAlive(nodes: GNode[], edges: [number, number][]) {
  const alive = new Set(nodes.filter((n) => !n.dead).map((n) => n.id));
  const adj = new Map<number, number[]>();
  for (const id of alive) adj.set(id, []);
  for (const [a, b] of edges) {
    if (!alive.has(a) || !alive.has(b)) continue;
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  }
  const seen = new Set<number>();
  let best = 0;
  for (const id of alive) {
    if (seen.has(id)) continue;
    let size = 0;
    const q = [id];
    seen.add(id);
    while (q.length) {
      const u = q.pop()!;
      size++;
      for (const v of adj.get(u) ?? []) {
        if (!seen.has(v)) {
          seen.add(v);
          q.push(v);
        }
      }
    }
    if (size > best) best = size;
  }
  return best;
}

export default function HubNetwork() {
  const t = useTranslations("viz.hub-network");
  const [graph, setGraph] = useState(() => buildScaleFree());
  const liveEdges = useMemo(
    () =>
      graph.edges.filter(
        ([a, b]) => !graph.nodes[a].dead && !graph.nodes[b].dead,
      ),
    [graph],
  );
  const connected = largestAlive(graph.nodes, graph.edges);
  const maxDeg = Math.max(...graph.nodes.filter((n) => !n.dead).map((n) => n.deg), 0);

  const kill = (id: number) => {
    setGraph((g) => ({
      ...g,
      nodes: g.nodes.map((n) => (n.id === id ? { ...n, dead: true } : n)),
    }));
  };

  const attackHub = () => {
    const live = graph.nodes.filter((n) => !n.dead);
    if (!live.length) return;
    const hub = live.reduce((a, b) => (b.deg > a.deg ? b : a));
    kill(hub.id);
  };

  const randomFail = () => {
    const live = graph.nodes.filter((n) => !n.dead);
    if (!live.length) return;
    kill(live[Math.floor(Math.random() * live.length)].id);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setGraph(buildScaleFree())}
      allowFullscreen={false}
      caption={
        <span>
          {t("connected")}: <span className="text-cyan">{connected}</span>
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {liveEdges.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={graph.nodes[a].x}
              y1={graph.nodes[a].y}
              x2={graph.nodes[b].x}
              y2={graph.nodes[b].y}
              stroke="var(--cyan)"
              strokeWidth={0.5}
              opacity={0.4}
            />
          ))}
          {graph.nodes.map((n) => {
            if (n.dead) return null;
            const hub = n.deg === maxDeg && maxDeg > 3;
            const r = 1.5 + n.deg * 0.45;
            return (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={r}
                fill={hub ? "var(--amber)" : "var(--surface)"}
                stroke={hub ? "var(--amber)" : "var(--teal)"}
                strokeWidth={hub ? 1.2 : 0.6}
                className="cursor-pointer"
                onClick={() => kill(n.id)}
              />
            );
          })}
        </svg>
        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <ControlButton onClick={attackHub} className="px-2.5" variant="accent">
            {t("attack")}
          </ControlButton>
          <ControlButton onClick={randomFail} className="px-2.5">
            {t("random")}
          </ControlButton>
          <Readout label={t("connected")} value={connected} accent="cyan" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
