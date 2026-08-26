"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const G = 16;

function buildGrid(p: number, seed: number) {
  let s = seed * 9973 + 11;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };
  const occ: boolean[][] = Array.from({ length: G }, () =>
    Array.from({ length: G }, () => rng() < p),
  );
  return occ;
}

function spanningCluster(occ: boolean[][]) {
  // BFS from left boundary occupied cells; span if reach right
  const seen: boolean[][] = Array.from({ length: G }, () => Array(G).fill(false));
  const q: [number, number][] = [];
  for (let r = 0; r < G; r++) {
    if (occ[r][0]) {
      q.push([r, 0]);
      seen[r][0] = true;
    }
  }
  const members = new Set<string>();
  let spans = false;
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (q.length) {
    const [r, c] = q.pop()!;
    members.add(`${r},${c}`);
    if (c === G - 1) spans = true;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= G || nc >= G) continue;
      if (!occ[nr][nc] || seen[nr][nc]) continue;
      seen[nr][nc] = true;
      q.push([nr, nc]);
    }
  }
  return { spans, members };
}

export default function PercolationTheory() {
  const t = useTranslations("viz.percolation-theory");
  const [p, setP] = useState(0.45);
  const [seed, setSeed] = useState(1);
  const occ = useMemo(() => buildGrid(p, seed), [p, seed]);
  const { spans, members } = useMemo(() => spanningCluster(occ), [occ]);

  const cell = 70 / G;
  const ox = 15;
  const oy = 14;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setP(0.45);
        setSeed((s) => s + 1);
      }}
      allowFullscreen={false}
      caption={
        <span className={spans ? "text-amber" : "text-muted"}>
          {spans ? t("span") : t("noSpan")} · p={p.toFixed(2)}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {occ.map((row, r) =>
            row.map((on, c) => {
              const key = `${r},${c}`;
              const inSpan = members.has(key);
              return (
                <rect
                  key={key}
                  x={ox + c * cell}
                  y={oy + r * cell}
                  width={cell - 0.3}
                  height={cell - 0.3}
                  rx={0.3}
                  fill={!on ? "var(--void)" : inSpan ? "var(--amber)" : "var(--cyan)"}
                  opacity={on ? (inSpan ? 0.95 : 0.55) : 0.25}
                  stroke="var(--border-strong)"
                  strokeWidth={0.15}
                />
              );
            }),
          )}
          {/* left/right markers */}
          <line
            x1={ox - 1}
            y1={oy}
            x2={ox - 1}
            y2={oy + G * cell}
            stroke="var(--teal)"
            strokeWidth={0.8}
          />
          <line
            x1={ox + G * cell + 0.5}
            y1={oy}
            x2={ox + G * cell + 0.5}
            y2={oy + G * cell}
            stroke="var(--teal)"
            strokeWidth={0.8}
          />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label="p" value={p.toFixed(2)} accent={spans ? "amber" : "cyan"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("p")}
            value={p}
            min={0.05}
            max={0.95}
            step={0.01}
            display={p.toFixed(2)}
            onChange={(v) => {
              setP(v);
              setSeed((s) => s + 1);
            }}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
