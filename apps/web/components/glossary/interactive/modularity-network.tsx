"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type GNode = { id: number; x: number; y: number; community: number };

const COLORS = ["var(--cyan)", "var(--teal)", "var(--amber)", "var(--magenta)"];

function buildCommunities(): { nodes: GNode[]; edges: [number, number][] } {
  const nodes: GNode[] = [];
  const centers = [
    [28, 32],
    [72, 32],
    [28, 70],
    [72, 70],
  ];
  let id = 0;
  for (let c = 0; c < 4; c++) {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      nodes.push({
        id: id++,
        x: centers[c][0] + Math.cos(a) * 10,
        y: centers[c][1] + Math.sin(a) * 9,
        community: c,
      });
    }
  }
  const edges: [number, number][] = [];
  const add = (a: number, b: number) => {
    if (a === b) return;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (!edges.some(([x, y]) => x === lo && y === hi)) edges.push([lo, hi]);
  };
  // dense intra
  for (let c = 0; c < 4; c++) {
    const members = nodes.filter((n) => n.community === c).map((n) => n.id);
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        if (Math.random() < 0.7) add(members[i], members[j]);
      }
    }
  }
  // sparse inter bridges
  add(0, 5);
  add(4, 10);
  add(9, 15);
  add(14, 1);
  add(2, 12);
  return { nodes, edges };
}

const GRAPH = buildCommunities();

function assignModules(resolution: number): number[] {
  // resolution 0..1: 0 = one module, 0.33 = 2, 0.66 = 3, 1 = 4
  const k = Math.max(1, Math.min(4, Math.round(1 + resolution * 3)));
  // merge communities: map original 0..3 into k groups
  return GRAPH.nodes.map((n) => {
    if (k === 1) return 0;
    if (k === 2) return n.community < 2 ? 0 : 1;
    if (k === 3) return n.community === 3 ? 2 : n.community;
    return n.community;
  });
}

function modularityQ(labels: number[], edges: [number, number][]) {
  const m = edges.length;
  if (m === 0) return 0;
  const deg = new Array(GRAPH.nodes.length).fill(0);
  for (const [a, b] of edges) {
    deg[a]++;
    deg[b]++;
  }
  let q = 0;
  for (const [a, b] of edges) {
    if (labels[a] === labels[b]) q += 1 - (deg[a] * deg[b]) / (2 * m);
  }
  // also count non-edges contribution roughly via standard formula half
  for (let i = 0; i < GRAPH.nodes.length; i++) {
    for (let j = i + 1; j < GRAPH.nodes.length; j++) {
      if (labels[i] !== labels[j]) continue;
      const linked = edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
      if (!linked) q -= (deg[i] * deg[j]) / (2 * m);
    }
  }
  return Math.max(0, Math.min(1, q / m));
}

export default function ModularityNetwork() {
  const t = useTranslations("viz.modularity-network");
  const [resolution, setResolution] = useState(1);
  const labels = useMemo(() => assignModules(resolution), [resolution]);
  const modules = useMemo(() => new Set(labels).size, [labels]);
  const q = useMemo(() => modularityQ(labels, GRAPH.edges), [labels]);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setResolution(1)}
      allowFullscreen={false}
      caption={
        <span>
          {t("modules")}: <span className="text-cyan">{modules}</span> · {t("q")}:{" "}
          <span className="text-teal">{q.toFixed(2)}</span>
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {GRAPH.edges.map(([a, b]) => {
            const same = labels[a] === labels[b];
            return (
              <line
                key={`${a}-${b}`}
                x1={GRAPH.nodes[a].x}
                y1={GRAPH.nodes[a].y}
                x2={GRAPH.nodes[b].x}
                y2={GRAPH.nodes[b].y}
                stroke={same ? COLORS[labels[a] % 4] : "var(--muted)"}
                strokeWidth={same ? 0.8 : 0.4}
                opacity={same ? 0.7 : 0.25}
              />
            );
          })}
          {GRAPH.nodes.map((n) => (
            <circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={3.4}
              fill="var(--surface)"
              stroke={COLORS[labels[n.id] % 4]}
              strokeWidth={1.2}
            />
          ))}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("modules")} value={modules} accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("resolution")}
            value={resolution}
            min={0}
            max={1}
            step={0.05}
            display={resolution.toFixed(2)}
            onChange={setResolution}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
