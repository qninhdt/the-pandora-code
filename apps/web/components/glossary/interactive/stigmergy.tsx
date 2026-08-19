"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const COLS = 20;
const ROWS = 12;
const NEST = { c: 2, r: 6 };

type Ant = { c: number; r: number; carrying: boolean };

function idx(c: number, r: number) {
  return r * COLS + c;
}

function neighbors(c: number, r: number) {
  const out: [number, number][] = [];
  for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    const nc = c + dc;
    const nr = r + dr;
    if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) out.push([nc, nr]);
  }
  return out;
}

export default function Stigmergy() {
  const t = useTranslations("viz.stigmergy");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [evap, setEvap] = useState(0.02);
  const [playing, setPlaying] = useState(true);
  const [food, setFood] = useState({ c: 16, r: 5 });
  const pher = useRef(new Float32Array(COLS * ROWS));
  const ants = useRef<Ant[]>(
    Array.from({ length: 14 }, () => ({
      c: NEST.c,
      r: NEST.r,
      carrying: false,
    })),
  );
  const [, bump] = useState(0);

  const dropFood = () => {
    setFood({
      c: 10 + Math.floor(Math.random() * 8),
      r: 1 + Math.floor(Math.random() * (ROWS - 2)),
    });
  };

  useRafLoop(
    () => {
      const P = pher.current;
      // evaporate
      for (let i = 0; i < P.length; i++) P[i] *= 1 - evap;
      // ants
      for (const a of ants.current) {
        const target = a.carrying ? NEST : food;
        const neigh = neighbors(a.c, a.r);
        // pick by pheromone + heuristic to target
        let best = neigh[0];
        let bestScore = -1;
        for (const [nc, nr] of neigh) {
          const pherS = P[idx(nc, nr)];
          const dist =
            Math.abs(nc - target.c) + Math.abs(nr - target.r);
          const score = pherS * 3 + (1 / (1 + dist)) * 2 + Math.random() * 0.4;
          if (score > bestScore) {
            bestScore = score;
            best = [nc, nr];
          }
        }
        a.c = best[0];
        a.r = best[1];
        if (!a.carrying && a.c === food.c && a.r === food.r) a.carrying = true;
        if (a.carrying && a.c === NEST.c && a.r === NEST.r) a.carrying = false;
        if (a.carrying) P[idx(a.c, a.r)] = Math.min(1, P[idx(a.c, a.r)] + 0.35);
      }
      bump((n) => (n + 1) % 1_000_000);
    },
    { active: inView && playing },
  );

  const cellW = 80 / COLS;
  const cellH = 56 / ROWS;
  const ox = 10;
  const oy = 16;
  let trailSum = 0;
  for (let i = 0; i < pher.current.length; i++) trailSum += pher.current[i];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        pher.current = new Float32Array(COLS * ROWS);
        ants.current = Array.from({ length: 14 }, () => ({
          c: NEST.c,
          r: NEST.r,
          carrying: false,
        }));
        setEvap(0.02);
        setFood({ c: 16, r: 5 });
      }}
      onPlayPause={() => setPlaying((p) => !p)}
      isPlaying={playing}
      allowFullscreen={false}
      caption={<span className="text-amber">{t("path")}: {trailSum.toFixed(1)}</span>}
    >
      <div ref={ref} className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const v = pher.current[idx(c, r)];
              if (v < 0.02) return null;
              return (
                <rect
                  key={`${c}-${r}`}
                  x={ox + c * cellW}
                  y={oy + r * cellH}
                  width={cellW}
                  height={cellH}
                  fill="var(--amber)"
                  opacity={Math.min(0.9, v)}
                />
              );
            }),
          )}
          {/* nest */}
          <circle cx={ox + (NEST.c + 0.5) * cellW} cy={oy + (NEST.r + 0.5) * cellH} r={2.8} fill="var(--cyan)" />
          {/* food */}
          <circle cx={ox + (food.c + 0.5) * cellW} cy={oy + (food.r + 0.5) * cellH} r={2.8} fill="var(--teal)" />
          {ants.current.map((a, i) => (
            <circle
              key={i}
              cx={ox + (a.c + 0.5) * cellW}
              cy={oy + (a.r + 0.5) * cellH}
              r={1.3}
              fill={a.carrying ? "var(--teal)" : "var(--magenta)"}
            />
          ))}
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <ControlButton onClick={dropFood} className="px-2.5">{t("food")}</ControlButton>
          <Readout label={t("path")} value={trailSum.toFixed(1)} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("evap")} value={evap} min={0.005} max={0.12} step={0.005} display={evap.toFixed(3)} onChange={setEvap} thumb="amber" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
