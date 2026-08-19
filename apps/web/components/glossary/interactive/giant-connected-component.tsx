"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const N = 36;

function positions() {
  return Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    const ring = i % 3;
    const r = 14 + ring * 10;
    return { x: 50 + Math.cos(a + ring) * r, y: 46 + Math.sin(a + ring * 0.7) * r * 0.85 };
  });
}

const POS = positions();

function allPossibleEdges(): [number, number][] {
  const e: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = POS[i].x - POS[j].x;
      const dy = POS[i].y - POS[j].y;
      if (dx * dx + dy * dy < 22 * 22) e.push([i, j]);
    }
  }
  // shuffle deterministic
  let s = 42;
  for (let i = e.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [e[i], e[j]] = [e[j], e[i]];
  }
  return e;
}

const POOL = allPossibleEdges();

function giantSize(n: number, edges: [number, number][]) {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const seen = new Array(n).fill(false);
  let best = 0;
  let islands = 0;
  for (let i = 0; i < n; i++) {
    if (seen[i]) continue;
    islands++;
    let size = 0;
    const q = [i];
    seen[i] = true;
    while (q.length) {
      const u = q.pop()!;
      size++;
      for (const v of adj[u]) {
        if (!seen[v]) {
          seen[v] = true;
          q.push(v);
        }
      }
    }
    if (size > best) best = size;
  }
  return { best, islands };
}

function componentOf(n: number, edges: [number, number][]) {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const label = new Array(n).fill(-1);
  let bestNodes: number[] = [];
  let cid = 0;
  for (let i = 0; i < n; i++) {
    if (label[i] >= 0) continue;
    const q = [i];
    label[i] = cid;
    const members = [i];
    while (q.length) {
      const u = q.pop()!;
      for (const v of adj[u]) {
        if (label[v] < 0) {
          label[v] = cid;
          q.push(v);
          members.push(v);
        }
      }
    }
    if (members.length > bestNodes.length) bestNodes = members;
    cid++;
  }
  const giant = new Set(bestNodes);
  return { label, giant };
}

export default function GiantConnectedComponent() {
  const t = useTranslations("viz.giant-connected-component");
  const [count, setCount] = useState(8);
  const edges = useMemo(() => POOL.slice(0, count), [count]);
  const { best, islands } = useMemo(() => giantSize(N, edges), [edges]);
  const { giant } = useMemo(() => componentOf(N, edges), [edges]);
  const frac = best / N;
  const crystallized = frac >= 0.5;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCount(8)}
      allowFullscreen={false}
      caption={
        <span className={crystallized ? "text-amber" : "text-teal"}>
          {t("giant")}: {best}/{N} · {t("islands")}: {islands}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {edges.map(([a, b]) => {
            const g = giant.has(a) && giant.has(b);
            return (
              <line
                key={`${a}-${b}`}
                x1={POS[a].x}
                y1={POS[a].y}
                x2={POS[b].x}
                y2={POS[b].y}
                stroke={g ? "var(--amber)" : "var(--cyan)"}
                strokeWidth={g ? 0.9 : 0.45}
                opacity={g ? 0.85 : 0.35}
              />
            );
          })}
          {POS.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={giant.has(i) ? 2.4 : 1.8}
              fill={giant.has(i) ? "var(--amber)" : "var(--surface)"}
              stroke={giant.has(i) ? "var(--amber)" : "var(--teal)"}
              strokeWidth={0.6}
              opacity={0.9}
            />
          ))}
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("giant")} value={`${Math.round(frac * 100)}%`} accent={crystallized ? "amber" : "teal"} />
          <ControlButton onClick={() => setCount((c) => Math.min(POOL.length, c + 1))} className="px-2.5">
            + {t("edges")}
          </ControlButton>
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("edges")}
            value={count}
            min={0}
            max={POOL.length}
            step={1}
            display={`${count}`}
            onChange={setCount}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
