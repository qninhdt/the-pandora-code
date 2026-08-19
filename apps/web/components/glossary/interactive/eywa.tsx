"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

type Node = { id: number; x: number; y: number; r: number; layer: number };
type Edge = { a: number; b: number };
type Ripple = { x: number; y: number; t0: number; id: number };

const W = 100;
const H = 100;
const HUMAN_SYN = 100; // display units (~1e14 real)
const EYWA_BASE = 140;

function seedNodes(): Node[] {
  const nodes: Node[] = [];
  let id = 0;
  // deep planetary layers — denser toward the "surface" band
  const rings: { cy: number; n: number; span: number; layer: number }[] = [
    { cy: 78, n: 7, span: 28, layer: 0 },
    { cy: 58, n: 11, span: 34, layer: 1 },
    { cy: 40, n: 14, span: 38, layer: 2 },
    { cy: 24, n: 10, span: 42, layer: 3 },
    { cy: 12, n: 6, span: 30, layer: 4 },
  ];
  for (const ring of rings) {
    const span = ring.span;
    for (let i = 0; i < ring.n; i++) {
      const t = ring.n === 1 ? 0.5 : i / (ring.n - 1);
      const jitter = Math.sin(i * 2.7 + ring.layer) * 2.2;
      nodes.push({
        id: id++,
        x: 50 - span / 2 + t * span + jitter * 0.4,
        y: ring.cy + jitter,
        r: 0.9 + (ring.layer % 3) * 0.25,
        layer: ring.layer,
      });
    }
  }
  return nodes;
}

function buildEdges(nodes: Node[]): Edge[] {
  const edges: Edge[] = [];
  const byLayer = new Map<number, Node[]>();
  for (const n of nodes) {
    const list = byLayer.get(n.layer) ?? [];
    list.push(n);
    byLayer.set(n.layer, list);
  }
  // horizontal within layer
  for (const list of byLayer.values()) {
    for (let i = 0; i < list.length - 1; i++) {
      edges.push({ a: list[i].id, b: list[i + 1].id });
      if (i + 2 < list.length && i % 2 === 0) {
        edges.push({ a: list[i].id, b: list[i + 2].id });
      }
    }
  }
  // vertical between layers
  for (let L = 0; L < 4; L++) {
    const lo = byLayer.get(L) ?? [];
    const hi = byLayer.get(L + 1) ?? [];
    for (const a of lo) {
      let best = hi[0];
      let bestD = Infinity;
      for (const b of hi) {
        const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = b;
        }
      }
      if (best) edges.push({ a: a.id, b: best.id });
    }
  }
  return edges;
}

export default function Eywa() {
  const t = useTranslations("viz.eywa");
  const nodes = useMemo(() => seedNodes(), []);
  const edges = useMemo(() => buildEdges(nodes), [nodes]);
  const nodeMap = useMemo(() => {
    const m = new Map<number, Node>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const [lit, setLit] = useState<Set<number>>(() => new Set());
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [tick, setTick] = useState(0);
  const rippleId = useRef(0);
  const elapsed = useRef(0);
  const { ref, inView } = useInView<HTMLDivElement>();

  useRafLoop(
    (dt, el) => {
      elapsed.current = el;
      setTick((n) => (n + 1) % 1_000_000);
      setRipples((rs) => rs.filter((r) => el - r.t0 < 2.4));
    },
    { active: inView },
  );

  const touch = useCallback(
    (n: Node) => {
      const t0 = elapsed.current;
      setRipples((rs) => [...rs.slice(-6), { x: n.x, y: n.y, t0, id: ++rippleId.current }]);
      // BFS light-up through neighbors
      setLit((prev) => {
        const next = new Set(prev);
        next.add(n.id);
        const adj = new Map<number, number[]>();
        for (const e of edges) {
          (adj.get(e.a) ?? adj.set(e.a, []).get(e.a)!).push(e.b);
          (adj.get(e.b) ?? adj.set(e.b, []).get(e.b)!).push(e.a);
        }
        const q = [n.id];
        const seen = new Set([n.id]);
        let guard = 0;
        while (q.length && guard++ < 18) {
          const cur = q.shift()!;
          for (const nb of adj.get(cur) ?? []) {
            if (seen.has(nb)) continue;
            seen.add(nb);
            next.add(nb);
            q.push(nb);
          }
        }
        return next;
      });
    },
    [edges],
  );

  const reset = useCallback(() => {
    setLit(new Set());
    setRipples([]);
  }, []);

  const eywaLinks = EYWA_BASE + lit.size * 3;
  const pulse = 0.5 + 0.5 * Math.sin(elapsed.current * 1.4);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={reset}
      caption={
        lit.size === 0 ? (
          <span className="text-muted">{t("idle")}</span>
        ) : (
          <span className="text-cyan">{t("ripple")}</span>
        )
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="eywa-glow" cx="50%" cy="60%" r="55%">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.14" />
              <stop offset="55%" stopColor="var(--teal)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <filter id="eywa-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
          </defs>

          <rect width={W} height={H} fill="url(#eywa-glow)" />

          {/* depth haze bands */}
          {[70, 48, 28].map((y, i) => (
            <ellipse
              key={y}
              cx="50"
              cy={y}
              rx={42 - i * 4}
              ry={3.5}
              fill="var(--teal)"
              opacity={0.04 + i * 0.015}
            />
          ))}

          {/* edges */}
          {edges.map((e) => {
            const a = nodeMap.get(e.a)!;
            const b = nodeMap.get(e.b)!;
            const on = lit.has(e.a) && lit.has(e.b);
            return (
              <line
                key={`${e.a}-${e.b}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={on ? "var(--cyan)" : "var(--teal)"}
                strokeWidth={on ? 0.55 : 0.28}
                opacity={on ? 0.55 + pulse * 0.25 : 0.12 + a.layer * 0.03}
              />
            );
          })}

          {/* ripples */}
          {ripples.map((r) => {
            const age = elapsed.current - r.t0;
            const rad = 2 + age * 14;
            const op = Math.max(0, 0.55 - age * 0.22);
            return (
              <circle
                key={r.id}
                cx={r.x}
                cy={r.y}
                r={rad}
                fill="none"
                stroke="var(--cyan)"
                strokeWidth="0.45"
                opacity={op}
                filter="url(#eywa-soft)"
              />
            );
          })}

          {/* nodes */}
          {nodes.map((n) => {
            const on = lit.has(n.id);
            const breathe = 0.85 + 0.15 * Math.sin(elapsed.current * 2 + n.id);
            return (
              <g
                key={n.id}
                onClick={() => touch(n)}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") touch(n);
                }}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 2.4 * breathe}
                  fill="var(--cyan)"
                  opacity={on ? 0.18 : 0.04}
                  filter="url(#eywa-soft)"
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r * (on ? 1.15 : 1)}
                  fill={on ? "var(--cyan)" : "var(--teal)"}
                  opacity={on ? 0.95 : 0.35 + n.layer * 0.08}
                />
              </g>
            );
          })}

          <text
            x="4"
            y="96"
            className="fill-muted"
            style={{ fontSize: 2.4, fontFamily: "monospace" }}
          >
            {t("depth")} ↓
          </text>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col items-end gap-1.5">
          <Readout
            label={t("humanBrain")}
            value={HUMAN_SYN}
            unit={t("synapses")}
            accent="foreground"
          />
          <Readout
            label={t("eywaNet")}
            value={eywaLinks}
            unit={t("connections")}
            accent="cyan"
          />
          <Readout label={t("nodes")} value={lit.size} accent="teal" />
        </div>
        {/* keep tick referenced so RAF re-renders breathe */}
        <span className="sr-only" aria-hidden>
          {tick}
        </span>
      </div>
    </GlossaryFrame>
  );
}
