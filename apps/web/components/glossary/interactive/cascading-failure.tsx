"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

type Node = { id: number; x: number; y: number; load: number; cap: number; dead: boolean };

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [1, 4],
  [1, 5],
  [2, 5],
  [2, 6],
  [3, 6],
  [4, 5],
  [5, 6],
  [4, 7],
  [5, 7],
  [5, 8],
  [6, 8],
  [7, 8],
];

function seedNodes(): Node[] {
  const pos = [
    [20, 28],
    [40, 22],
    [60, 22],
    [80, 28],
    [28, 50],
    [50, 48],
    [72, 50],
    [36, 74],
    [64, 74],
  ];
  return pos.map(([x, y], id) => ({
    id,
    x,
    y,
    load: 0.35 + (id % 3) * 0.08,
    cap: 1,
    dead: false,
  }));
}

export default function CascadingFailure() {
  const t = useTranslations("viz.cascading-failure");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [nodes, setNodes] = useState(seedNodes);
  const [playing, setPlaying] = useState(false);
  const [seed, setSeed] = useState<number | null>(null);

  const alive = useMemo(() => nodes.filter((n) => !n.dead).length, [nodes]);
  const failed = nodes.length - alive;

  const knock = useCallback((id: number) => {
    setSeed(id);
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, dead: true, load: 0 } : n)));
    setPlaying(true);
  }, []);

  useRafLoop(
    (dt) => {
      if (!playing) return;
      setNodes((prev) => {
        const dead = new Set(prev.filter((n) => n.dead).map((n) => n.id));
        if (dead.size === prev.length) return prev;
        // redistribute load from live edges
        const load = prev.map((n) => (n.dead ? 0 : n.load));
        for (const [a, b] of EDGES) {
          const aD = dead.has(a);
          const bD = dead.has(b);
          if (aD === bD) continue;
          const live = aD ? b : a;
          const spill = 0.12 * dt * 4;
          load[live] = Math.min(1.6, load[live] + spill);
        }
        let changed = false;
        const next = prev.map((n, i) => {
          if (n.dead) return n;
          const L = load[i];
          if (L > n.cap) {
            changed = true;
            return { ...n, load: 0, dead: true };
          }
          if (Math.abs(L - n.load) > 0.001) {
            changed = true;
            return { ...n, load: L };
          }
          return n;
        });
        return changed ? next : prev;
      });
    },
    { active: inView && playing },
  );

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setNodes(seedNodes());
        setPlaying(false);
        setSeed(null);
      }}
      onPlayPause={() => setPlaying((p) => !p)}
      isPlaying={playing}
      allowFullscreen={false}
      caption={
        <span>
          {t("alive")}: <span className="text-teal">{alive}</span> · {t("failed")}:{" "}
          <span className="text-magenta">{failed}</span>
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {EDGES.map(([a, b]) => {
            const na = nodes[a];
            const nb = nodes[b];
            const dead = na.dead || nb.dead;
            return (
              <line
                key={`${a}-${b}`}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke={dead ? "var(--magenta)" : "var(--cyan)"}
                strokeWidth={0.7}
                opacity={dead ? 0.2 : 0.5}
              />
            );
          })}
          {nodes.map((n) => {
            const heat = Math.min(1, n.load);
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={5}
                  fill={n.dead ? "var(--void)" : "var(--surface)"}
                  stroke={n.dead ? "var(--magenta)" : heat > 0.85 ? "var(--amber)" : "var(--cyan)"}
                  strokeWidth={n.dead ? 1.4 : 1}
                  opacity={n.dead ? 0.45 : 0.95}
                  className="cursor-pointer"
                  onClick={() => !n.dead && knock(n.id)}
                />
                {!n.dead && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={3.2 * heat}
                    fill={heat > 0.85 ? "var(--amber)" : "var(--teal)"}
                    opacity={0.35 + heat * 0.5}
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </svg>
        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("load")} value={seed == null ? "—" : `#${seed}`} accent="amber" />
          <ControlButton
            onClick={() => {
              const live = nodes.filter((n) => !n.dead);
              if (live.length) knock(live[Math.floor(Math.random() * live.length)].id);
            }}
            className="px-2.5"
          >
            {t("knock")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
