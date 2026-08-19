"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const NODES = [
  { id: 0, x: 30, y: 32 },
  { id: 1, x: 70, y: 32 },
  { id: 2, x: 30, y: 68 },
  { id: 3, x: 70, y: 68 },
  { id: 4, x: 50, y: 50 },
];

type Edge = [number, number];

const ALL_EDGES: Edge[] = [
  [0, 1],
  [0, 2],
  [0, 4],
  [1, 3],
  [1, 4],
  [2, 3],
  [2, 4],
  [3, 4],
];

// Toy Φ: density of edges × differentiation penalty for full clique / empty.
function approxPhi(edges: Edge[]): number {
  const n = NODES.length;
  const maxE = (n * (n - 1)) / 2;
  const e = edges.length;
  if (e === 0) return 0;
  const density = e / maxE;
  // differentiation: reward mid-density, punish total isolation or total clique
  const diff = 1 - Math.abs(density - 0.45) * 1.6;
  // integration proxy: largest component size / n
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const seen = new Set<number>();
  let best = 0;
  for (let i = 0; i < n; i++) {
    if (seen.has(i)) continue;
    const stack = [i];
    let size = 0;
    seen.add(i);
    while (stack.length) {
      const u = stack.pop()!;
      size++;
      for (const v of adj[u]) {
        if (!seen.has(v)) {
          seen.add(v);
          stack.push(v);
        }
      }
    }
    best = Math.max(best, size);
  }
  const integ = best / n;
  return Math.max(0, density * diff * integ * 4.2);
}

// Wire a small network; Φ rises when integrated yet differentiated.
export default function IntegratedInformationTheory() {
  const t = useTranslations("viz.integrated-information-theory");
  const [count, setCount] = useState(3);

  const edges = useMemo(() => ALL_EDGES.slice(0, count), [count]);
  const phi = useMemo(() => approxPhi(edges), [edges]);
  const high = phi >= 1.2;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCount(3)}
      allowFullscreen={false}
      caption={
        <span className={high ? "text-teal" : "text-magenta"}>
          {high ? t("integrated") : t("scattered")} · Φ={phi.toFixed(2)}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {edges.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
              stroke="var(--cyan)"
              strokeWidth="1"
              opacity={0.7}
            />
          ))}
          {NODES.map((n) => (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r="6"
                fill="var(--surface)"
                stroke="var(--teal)"
                strokeWidth="0.8"
              />
              <text
                x={n.x}
                y={n.y + 1.2}
                textAnchor="middle"
                style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--teal)" }}
              >
                {n.id}
              </text>
            </g>
          ))}

          {/* phi ring */}
          <circle
            cx="50"
            cy="50"
            r={10 + phi * 6}
            fill="none"
            stroke="var(--amber)"
            strokeWidth="0.6"
            opacity={0.4 + Math.min(0.5, phi * 0.15)}
            strokeDasharray="2 1.5"
          />
        </svg>

        <div className="absolute right-3 top-14">
          <Readout label={t("phi")} value={phi.toFixed(2)} accent={high ? "teal" : "magenta"} />
        </div>

        <div className="absolute left-3 top-14 flex gap-1">
          <ControlButton
            onClick={() => setCount((c) => Math.min(ALL_EDGES.length, c + 1))}
            className="px-2 py-1"
            variant="accent"
          >
            {t("addLink")}
          </ControlButton>
          <ControlButton
            onClick={() => setCount((c) => Math.max(0, c - 1))}
            className="px-2 py-1"
          >
            {t("cutLink")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
