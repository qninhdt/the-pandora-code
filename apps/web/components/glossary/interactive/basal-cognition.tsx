"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const COLS = 11;
const ROWS = 7;
const START = 0;
const GOAL = COLS * ROWS - 1;

type Cell = 0 | 1 | 2 | 3; // empty | wall | food | mold

function idx(c: number, r: number) {
  return r * COLS + c;
}

function neighbors(i: number): number[] {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  const out: number[] = [];
  if (c > 0) out.push(idx(c - 1, r));
  if (c < COLS - 1) out.push(idx(c + 1, r));
  if (r > 0) out.push(idx(c, r - 1));
  if (r < ROWS - 1) out.push(idx(c, r + 1));
  return out;
}

function blankGrid(): Cell[] {
  const g = Array<Cell>(COLS * ROWS).fill(0);
  g[START] = 3;
  g[GOAL] = 2;
  return g;
}

// Slime mold grows toward food around walls — cognition as morphology.
export default function BasalCognition() {
  const t = useTranslations("viz.basal-cognition");
  const [grid, setGrid] = useState<Cell[]>(blankGrid);
  const [mode, setMode] = useState<"food" | "wall">("wall");

  const moldSet = useMemo(() => {
    const s = new Set<number>();
    grid.forEach((v, i) => {
      if (v === 3) s.add(i);
    });
    return s;
  }, [grid]);

  const solved = moldSet.has(GOAL) || neighbors(GOAL).some((n) => moldSet.has(n));

  const onCell = useCallback(
    (i: number) => {
      if (i === START) return;
      setGrid((prev) => {
        const next = prev.slice() as Cell[];
        if (mode === "wall") {
          if (next[i] === 1) next[i] = 0;
          else if (next[i] === 0) next[i] = 1;
        } else {
          // move food
          for (let k = 0; k < next.length; k++) {
            if (next[k] === 2) next[k] = 0;
          }
          if (next[i] !== 3 && next[i] !== 1) next[i] = 2;
        }
        return next;
      });
    },
    [mode],
  );

  const grow = useCallback(() => {
    setGrid((prev) => {
      const next = prev.slice() as Cell[];
      const foodIdx = next.findIndex((v) => v === 2);
      const fc = foodIdx >= 0 ? foodIdx % COLS : COLS - 1;
      const fr = foodIdx >= 0 ? Math.floor(foodIdx / COLS) : ROWS - 1;

      const frontier: number[] = [];
      next.forEach((v, i) => {
        if (v === 3) {
          for (const n of neighbors(i)) {
            if (next[n] === 0 || next[n] === 2) frontier.push(n);
          }
        }
      });
      if (frontier.length === 0) return prev;

      // bias growth toward food (chemotaxis)
      frontier.sort((a, b) => {
        const da =
          Math.abs((a % COLS) - fc) + Math.abs(Math.floor(a / COLS) - fr);
        const db =
          Math.abs((b % COLS) - fc) + Math.abs(Math.floor(b / COLS) - fr);
        return da - db;
      });
      const pick = frontier[0];
      next[pick] = 3;
      return next;
    });
  }, []);

  const cellW = 100 / COLS;
  const cellH = 62 / ROWS;
  const ox = 0;
  const oy = 18;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setGrid(blankGrid())}
      allowFullscreen={false}
      caption={
        <span className={solved ? "text-teal" : "text-amber"}>
          {solved ? t("solved") : t("searching")}
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
          {grid.map((v, i) => {
            const c = i % COLS;
            const r = Math.floor(i / COLS);
            const x = ox + c * cellW + 0.4;
            const y = oy + r * cellH + 0.4;
            const fill =
              v === 1
                ? "var(--border-strong)"
                : v === 2
                  ? "var(--amber)"
                  : v === 3
                    ? "var(--teal)"
                    : "var(--surface)";
            const op = v === 0 ? 0.35 : v === 3 ? 0.75 : 0.9;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={cellW - 0.8}
                height={cellH - 0.8}
                rx="0.6"
                fill={fill}
                opacity={op}
                stroke="var(--border-strong)"
                strokeWidth="0.2"
                className="cursor-pointer"
                onClick={() => onCell(i)}
              />
            );
          })}
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("solved")}
            value={solved ? "✓" : "…"}
            accent={solved ? "teal" : "amber"}
          />
        </div>

        <div className="absolute left-3 top-14 flex flex-wrap gap-1">
          <ControlButton
            variant={mode === "wall" ? "active" : "default"}
            onClick={() => setMode("wall")}
            className="px-2 py-1"
          >
            {t("wall")}
          </ControlButton>
          <ControlButton
            variant={mode === "food" ? "active" : "default"}
            onClick={() => setMode("food")}
            className="px-2 py-1"
          >
            {t("food")}
          </ControlButton>
          <ControlButton onClick={grow} className="px-2 py-1" variant="accent">
            {t("grow")}
          </ControlButton>
          <ControlButton onClick={() => setGrid(blankGrid())} className="px-2 py-1">
            {t("clear")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
