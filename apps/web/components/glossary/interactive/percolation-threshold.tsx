"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const G = 18;
const PC = 0.5927;

function grid(p: number, seed: number) {
  let s = seed * 7919 + 3;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };
  return Array.from({ length: G }, () => Array.from({ length: G }, () => rng() < p));
}

function orderParam(occ: boolean[][]) {
  const seen: boolean[][] = Array.from({ length: G }, () => Array(G).fill(false));
  const q: [number, number][] = [];
  for (let r = 0; r < G; r++) {
    if (occ[r][0]) {
      q.push([r, 0]);
      seen[r][0] = true;
    }
  }
  let size = 0;
  let spans = false;
  while (q.length) {
    const [r, c] = q.pop()!;
    size++;
    if (c === G - 1) spans = true;
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= G || nc >= G) continue;
      if (!occ[nr][nc] || seen[nr][nc]) continue;
      seen[nr][nc] = true;
      q.push([nr, nc]);
    }
  }
  const occupied = occ.flat().filter(Boolean).length || 1;
  return { pInf: spans ? size / occupied : 0, spans, members: size };
}

// sample order curve for sparkline
function sampleCurve(seed: number) {
  const pts: { p: number; o: number }[] = [];
  for (let i = 0; i <= 20; i++) {
    const p = 0.3 + (i / 20) * 0.5;
    const { pInf } = orderParam(grid(p, seed + i));
    pts.push({ p, o: pInf });
  }
  return pts;
}

export default function PercolationThreshold() {
  const t = useTranslations("viz.percolation-threshold");
  const [p, setP] = useState(0.55);
  const [seed, setSeed] = useState(2);
  const occ = useMemo(() => grid(p, seed), [p, seed]);
  const { pInf, spans } = useMemo(() => orderParam(occ), [occ]);
  const curve = useMemo(() => sampleCurve(seed), [seed]);

  const cell = 52 / G;
  const ox = 8;
  const oy = 18;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setP(0.55);
        setSeed((s) => s + 1);
      }}
      allowFullscreen={false}
      caption={
        <span className={spans ? "text-amber" : "text-cyan"}>
          {t("order")}: {pInf.toFixed(2)} · |p−pc|={Math.abs(p - PC).toFixed(3)}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {occ.map((row, r) =>
            row.map((on, c) => (
              <rect
                key={`${r}-${c}`}
                x={ox + c * cell}
                y={oy + r * cell}
                width={cell - 0.25}
                height={cell - 0.25}
                fill={on ? (spans ? "var(--amber)" : "var(--teal)") : "var(--void)"}
                opacity={on ? 0.8 : 0.2}
              />
            )),
          )}
          {/* order-parameter plot */}
          <rect
            x="64"
            y="18"
            width="32"
            height="52"
            rx="1"
            fill="var(--void)"
            opacity={0.5}
            stroke="var(--border-strong)"
            strokeWidth={0.4}
          />
          {/* pc line */}
          {(() => {
            const xPc = 66 + ((PC - 0.3) / 0.5) * 28;
            return (
              <line
                x1={xPc}
                y1={20}
                x2={xPc}
                y2={66}
                stroke="var(--magenta)"
                strokeWidth={0.5}
                strokeDasharray="1 1"
              />
            );
          })()}
          <polyline
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={0.7}
            points={curve
              .map((pt) => {
                const x = 66 + ((pt.p - 0.3) / 0.5) * 28;
                const y = 66 - pt.o * 44;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {/* current p marker */}
          <circle
            cx={66 + ((p - 0.3) / 0.5) * 28}
            cy={66 - pInf * 44}
            r={1.4}
            fill="var(--amber)"
          />
          <text
            x="80"
            y="74"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("pc")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("order")} value={pInf.toFixed(2)} accent={spans ? "amber" : "cyan"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("p")}
            value={p}
            min={0.3}
            max={0.85}
            step={0.005}
            display={p.toFixed(3)}
            onChange={(v) => {
              setP(v);
              setSeed((s) => s + 1);
            }}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
