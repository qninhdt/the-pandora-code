"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Pt = { id: number; x: number; y: number };

const SEED: Pt[] = [
  { id: 0, x: 50, y: 22 },
  { id: 1, x: 28, y: 40 },
  { id: 2, x: 72, y: 40 },
  { id: 3, x: 18, y: 62 },
  { id: 4, x: 38, y: 62 },
  { id: 5, x: 62, y: 62 },
  { id: 6, x: 82, y: 62 },
  { id: 7, x: 28, y: 82 },
  { id: 8, x: 72, y: 82 },
];

const SEED_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [2, 6],
  [3, 7],
  [4, 7],
  [5, 8],
  [6, 8],
  [1, 2],
];

function components(nodes: number[], edges: [number, number][]): number {
  const adj = new Map<number, number[]>();
  for (const n of nodes) adj.set(n, []);
  for (const [a, b] of edges) {
    if (!adj.has(a) || !adj.has(b)) continue;
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  }
  const seen = new Set<number>();
  let c = 0;
  for (const n of nodes) {
    if (seen.has(n)) continue;
    c++;
    const q = [n];
    seen.add(n);
    while (q.length) {
      const u = q.pop()!;
      for (const v of adj.get(u) ?? []) {
        if (!seen.has(v)) {
          seen.add(v);
          q.push(v);
        }
      }
    }
  }
  return c;
}

function isArticulation(id: number, nodes: number[], edges: [number, number][]): boolean {
  const base = components(nodes, edges);
  const rest = nodes.filter((n) => n !== id);
  const restE = edges.filter(([a, b]) => a !== id && b !== id);
  return components(rest, restE) > base;
}

export default function ArticulationPoint() {
  const t = useTranslations("viz.articulation-point");
  const [alive, setAlive] = useState(() => SEED.map((p) => p.id));
  const [edges, setEdges] = useState(() => SEED_EDGES.map((e) => [...e] as [number, number]));
  const [hover, setHover] = useState<number | null>(null);

  const nodes = useMemo(() => SEED.filter((p) => alive.includes(p.id)), [alive]);
  const arts = useMemo(
    () => new Set(alive.filter((id) => isArticulation(id, alive, edges))),
    [alive, edges],
  );
  const comps = components(alive, edges);
  const split = comps > 1;

  const remove = (id: number) => {
    setAlive((a) => a.filter((n) => n !== id));
    setEdges((es) => es.filter(([a, b]) => a !== id && b !== id));
    setHover(null);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setAlive(SEED.map((p) => p.id));
        setEdges(SEED_EDGES.map((e) => [...e] as [number, number]));
      }}
      allowFullscreen={false}
      caption={
        <span className={split ? "text-magenta" : "text-teal"}>
          {split ? t("split") : t("intact")} · {t("components")}: {comps}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {edges.map(([a, b]) => {
            const pa = SEED.find((p) => p.id === a)!;
            const pb = SEED.find((p) => p.id === b)!;
            const hot = hover != null && (a === hover || b === hover) && arts.has(hover);
            return (
              <line
                key={`${a}-${b}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={hot ? "var(--magenta)" : "var(--cyan)"}
                strokeWidth={hot ? 1.2 : 0.6}
                opacity={hot ? 0.95 : 0.45}
              />
            );
          })}
          {nodes.map((p) => {
            const art = arts.has(p.id);
            const on = hover === p.id;
            return (
              <g key={p.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={on ? 5.2 : 4.2}
                  fill={art ? "var(--magenta)" : "var(--surface)"}
                  stroke={art ? "var(--magenta)" : "var(--cyan)"}
                  strokeWidth={1}
                  opacity={art ? (on ? 1 : 0.85) : 0.9}
                  className="cursor-pointer"
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => remove(p.id)}
                />
                <text
                  x={p.x}
                  y={p.y + 1.2}
                  textAnchor="middle"
                  style={{
                    fontSize: 3,
                    fontFamily: "monospace",
                    fill: art ? "var(--void)" : "var(--cyan)",
                    pointerEvents: "none",
                  }}
                >
                  {p.id}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("components")} value={comps} accent={split ? "magenta" : "teal"} />
          <ControlButton
            onClick={() => hover != null && remove(hover)}
            disabled={hover == null}
            className="px-2.5"
          >
            {t("remove")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
