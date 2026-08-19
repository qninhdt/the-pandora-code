"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Mode = "random" | "scaleFree";

type GNode = { id: number; x: number; y: number; deg: number };

function build(mode: Mode, n = 28): { nodes: GNode[]; edges: [number, number][] } {
  const nodes: GNode[] = Array.from({ length: n }, (_, id) => {
    const a = (id / n) * Math.PI * 2;
    const r = 28 + (id % 5) * 2.2;
    return { id, x: 32 + Math.cos(a) * r * 0.55, y: 48 + Math.sin(a) * r * 0.7, deg: 0 };
  });
  const edges: [number, number][] = [];
  const add = (a: number, b: number) => {
    if (a === b) return;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (edges.some(([x, y]) => x === lo && y === hi)) return;
    edges.push([lo, hi]);
    nodes[lo].deg++;
    nodes[hi].deg++;
  };

  if (mode === "random") {
    const m = Math.floor(n * 1.4);
    let tries = 0;
    while (edges.length < m && tries < m * 20) {
      tries++;
      add(Math.floor(Math.random() * n), Math.floor(Math.random() * n));
    }
  } else {
    // preferential attachment from a small clique
    add(0, 1);
    add(1, 2);
    add(0, 2);
    for (let i = 3; i < n; i++) {
      const total = nodes.reduce((s, nd) => s + Math.max(1, nd.deg), 0);
      let r = Math.random() * total;
      let target = 0;
      for (let j = 0; j < i; j++) {
        r -= Math.max(1, nodes[j].deg);
        if (r <= 0) {
          target = j;
          break;
        }
      }
      add(i, target);
      if (Math.random() < 0.45) {
        let r2 = Math.random() * total;
        for (let j = 0; j < i; j++) {
          r2 -= Math.max(1, nodes[j].deg);
          if (r2 <= 0) {
            add(i, j);
            break;
          }
        }
      }
    }
  }
  return { nodes, edges };
}

export default function DegreeDistribution() {
  const t = useTranslations("viz.degree-distribution");
  const [mode, setMode] = useState<Mode>("scaleFree");
  const [tick, setTick] = useState(0);
  const { nodes, edges } = useMemo(() => build(mode), [mode, tick]);

  const hist = useMemo(() => {
    const maxD = Math.max(1, ...nodes.map((n) => n.deg));
    const bins = Array.from({ length: maxD + 1 }, () => 0);
    for (const n of nodes) bins[n.deg]++;
    return bins;
  }, [nodes]);
  const maxBin = Math.max(1, ...hist);
  const maxDeg = Math.max(...nodes.map((n) => n.deg));

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setTick((x) => x + 1)}
      allowFullscreen={false}
      caption={
        <span>
          {mode === "random" ? t("random") : t("scaleFree")} · max k={maxDeg}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {edges.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={nodes[a].x}
              y1={nodes[a].y}
              x2={nodes[b].x}
              y2={nodes[b].y}
              stroke="var(--cyan)"
              strokeWidth={0.45}
              opacity={0.4}
            />
          ))}
          {nodes.map((n) => {
            const r = 1.6 + n.deg * 0.55;
            const hub = n.deg >= maxDeg && maxDeg > 2;
            return (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={r}
                fill={hub ? "var(--amber)" : "var(--surface)"}
                stroke={hub ? "var(--amber)" : "var(--teal)"}
                strokeWidth={0.7}
                opacity={0.9}
              />
            );
          })}
          {/* histogram panel */}
          <rect x="62" y="18" width="34" height="64" rx="1.5" fill="var(--void)" opacity={0.55} stroke="var(--border-strong)" strokeWidth={0.4} />
          {hist.map((c, k) => {
            const h = (c / maxBin) * 52;
            const bw = Math.min(3.2, 28 / hist.length);
            const x = 66 + k * (bw + 0.4);
            return (
              <rect
                key={k}
                x={x}
                y={78 - h}
                width={bw}
                height={h}
                fill={k === maxDeg ? "var(--amber)" : "var(--cyan)"}
                opacity={0.85}
              />
            );
          })}
          <text x="79" y="90" textAnchor="middle" style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("degree")} k
          </text>
        </svg>
        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <ControlTabs
            value={mode}
            onChange={(v) => setMode(v)}
            options={[
              { value: "random", label: t("random") },
              { value: "scaleFree", label: t("scaleFree") },
            ]}
          />
          <Readout label={t("count")} value={nodes.length} accent="teal" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
