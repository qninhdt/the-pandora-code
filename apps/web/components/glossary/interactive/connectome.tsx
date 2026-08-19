"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type GNode = { id: number; x: number; y: number; cluster: number };

const COLORS = ["var(--cyan)", "var(--teal)", "var(--amber)", "var(--magenta)"];

function buildBrain() {
  const nodes: GNode[] = [];
  const clusters = [
    { cx: 32, cy: 34, n: 7 },
    { cx: 68, cy: 34, n: 7 },
    { cx: 32, cy: 68, n: 6 },
    { cx: 68, cy: 68, n: 6 },
  ];
  let id = 0;
  for (let c = 0; c < clusters.length; c++) {
    const cl = clusters[c];
    for (let k = 0; k < cl.n; k++) {
      const a = (k / cl.n) * Math.PI * 2;
      nodes.push({
        id: id++,
        x: cl.cx + Math.cos(a) * 11,
        y: cl.cy + Math.sin(a) * 10,
        cluster: c,
      });
    }
  }
  const edges: { a: number; b: number; w: number }[] = [];
  const add = (a: number, b: number, w: number) => {
    if (a === b) return;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (!edges.some((e) => e.a === lo && e.b === hi)) edges.push({ a: lo, b: hi, w });
  };
  // dense within cluster
  for (let c = 0; c < 4; c++) {
    const mem = nodes.filter((n) => n.cluster === c).map((n) => n.id);
    for (let i = 0; i < mem.length; i++) {
      for (let j = i + 1; j < mem.length; j++) {
        if (Math.random() < 0.75) add(mem[i], mem[j], 0.5 + Math.random() * 0.5);
      }
    }
  }
  // sparse long-range
  for (let i = 0; i < 12; i++) {
    const a = Math.floor(Math.random() * nodes.length);
    const b = Math.floor(Math.random() * nodes.length);
    if (nodes[a].cluster !== nodes[b].cluster) add(a, b, 0.2 + Math.random() * 0.3);
  }
  return { nodes, edges };
}

const BRAIN = buildBrain();

function liveComponents(
  nodes: GNode[],
  edges: { a: number; b: number; w: number }[],
  keep: number,
) {
  // keep strongest fraction of edges
  const sorted = [...edges].sort((x, y) => y.w - x.w);
  const m = Math.max(0, Math.floor(sorted.length * keep));
  const live = sorted.slice(0, m);
  const adj = new Map<number, number[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of live) {
    adj.get(e.a)!.push(e.b);
    adj.get(e.b)!.push(e.a);
  }
  const seen = new Set<number>();
  let clusters = 0;
  let largest = 0;
  for (const n of nodes) {
    if (seen.has(n.id)) continue;
    clusters++;
    let size = 0;
    const q = [n.id];
    seen.add(n.id);
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
    if (size > largest) largest = size;
  }
  return { live, clusters, largest, density: m / Math.max(1, edges.length) };
}

export default function Connectome() {
  const t = useTranslations("viz.connectome");
  const [keep, setKeep] = useState(1);
  const { live, clusters, largest, density } = useMemo(
    () => liveComponents(BRAIN.nodes, BRAIN.edges, keep),
    [keep],
  );
  const capacity = largest / BRAIN.nodes.length;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setKeep(1)}
      allowFullscreen={false}
      caption={
        <span>
          {t("capacity")}: <span className="text-cyan">{(capacity * 100).toFixed(0)}%</span> ·{" "}
          {t("clusters")}: <span className="text-amber">{clusters}</span>
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {live.map((e) => {
            const na = BRAIN.nodes[e.a];
            const nb = BRAIN.nodes[e.b];
            const same = na.cluster === nb.cluster;
            return (
              <line
                key={`${e.a}-${e.b}`}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke={same ? COLORS[na.cluster] : "var(--muted)"}
                strokeWidth={0.35 + e.w * 0.7}
                opacity={0.3 + e.w * 0.5}
              />
            );
          })}
          {BRAIN.nodes.map((n) => (
            <circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={2.4}
              fill="var(--surface)"
              stroke={COLORS[n.cluster]}
              strokeWidth={1}
            />
          ))}
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("density")} value={`${Math.round(density * 100)}%`} accent="teal" />
          <Readout label={t("clusters")} value={clusters} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("prune")}
            value={keep}
            min={0.05}
            max={1}
            step={0.02}
            display={`${Math.round(keep * 100)}%`}
            onChange={setKeep}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
