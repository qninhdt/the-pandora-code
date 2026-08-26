"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface MorphogenGradientLabProps {
  caption?: string;
  className?: string;
}

const W = 360;
const H = 216;
const CELLS = 24;
const PLOT_TOP = 16;
const PLOT_H = 118;
const PLOT_BOT = PLOT_TOP + PLOT_H;
const CELL_TOP = 150;
const CELL_H = 40;
const PAD = 12;

// concentration at normalized position x in [0,1]: C(x) = C0 · e^(-x/λ), C0 = 1.
function conc(x: number, lambda: number): number {
  return Math.exp(-x / lambda);
}

// A row of cells under an exponential morphogen gradient. Each cell reads the
// concentration at its position and picks one of three fates by threshold (the
// French-flag model). Drag the decay length λ and the two thresholds T1/T2 and
// the fate boundaries slide — a simple chemical gradient partitions complex
// pattern with no per-cell instruction. Fully deterministic, SSR-safe.
export function MorphogenGradientLab({ caption, className }: MorphogenGradientLabProps) {
  const uid = useId();
  const t = useTranslations("viz.morphogenGradientLab");

  const [lambda, setLambda] = useState(0.35);
  const [t1, setT1] = useState(0.6);
  const [t2, setT2] = useState(0.25);

  // keep T2 strictly below T1 so the three bands never invert
  const hi = Math.max(t1, t2 + 0.05);
  const lo = Math.min(t2, hi - 0.05);

  const innerW = W - PAD * 2;
  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = i / 60;
      const px = PAD + x * innerW;
      const py = PLOT_BOT - conc(x, lambda) * PLOT_H;
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [lambda, innerW]);

  const cells = useMemo(() => {
    return Array.from({ length: CELLS }, (_, i) => {
      const x = (i + 0.5) / CELLS;
      const c = conc(x, lambda);
      const fate = c > hi ? "a" : c > lo ? "b" : "c";
      return { i, x, c, fate };
    });
  }, [lambda, hi, lo]);

  const counts = useMemo(() => {
    let a = 0;
    let b = 0;
    let cc = 0;
    for (const cell of cells) {
      if (cell.fate === "a") a++;
      else if (cell.fate === "b") b++;
      else cc++;
    }
    return { a, b, cc };
  }, [cells]);

  const cellW = innerW / CELLS;
  const yFor = (v: number) => PLOT_BOT - v * PLOT_H;
  const fateFill = (fate: string) =>
    fate === "a" ? "var(--cyan)" : fate === "b" ? "var(--teal)" : "var(--magenta)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone="cyan"
      hint={t("hint")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta"]} />

          {/* threshold guide lines */}
          {[
            { v: hi, tone: "var(--cyan)", key: "t1" },
            { v: lo, tone: "var(--teal)", key: "t2" },
          ].map(({ v, tone, key }) => (
            <g key={key}>
              <line
                x1={PAD}
                y1={yFor(v)}
                x2={W - PAD}
                y2={yFor(v)}
                stroke={tone}
                strokeWidth={0.8}
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
              <VizText x={W - PAD} y={yFor(v) - 3} size="micro" tone={tone} anchor="end">
                {key === "t1" ? t("t1Mark") : t("t2Mark")}
              </VizText>
            </g>
          ))}

          {/* the morphogen gradient curve */}
          <polyline
            points={curve}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={2}
            filter={glowUrl(uid, "bloom")}
          />
          <VizText x={PAD} y={PLOT_TOP + 4} size="small" tone="cyan">
            {t("sourceLabel")}
          </VizText>

          {/* the cell row, colored by fate */}
          {cells.map((cell) => (
            <rect
              key={cell.i}
              x={PAD + cell.i * cellW + 0.5}
              y={CELL_TOP}
              width={cellW - 1}
              height={CELL_H}
              rx={1.5}
              fill={fateFill(cell.fate)}
              fillOpacity={0.55 + cell.c * 0.4}
              stroke={fateFill(cell.fate)}
              strokeOpacity={0.8}
              strokeWidth={0.6}
            />
          ))}
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizSlider
            label={t("lambda")}
            display={lambda.toFixed(2)}
            min={0.12}
            max={0.8}
            step={0.01}
            value={lambda}
            onChange={setLambda}
            tone="var(--cyan)"
          />
          <VizSlider
            label={t("t1")}
            display={hi.toFixed(2)}
            min={0.3}
            max={0.9}
            step={0.01}
            value={t1}
            onChange={setT1}
            tone="var(--cyan)"
          />
          <VizSlider
            label={t("t2")}
            display={lo.toFixed(2)}
            min={0.05}
            max={0.55}
            step={0.01}
            value={t2}
            onChange={setT2}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("fatesLabel")}
            value={`${counts.a} · ${counts.b} · ${counts.cc}`}
            tone="var(--cyan)"
            tinted
            note={t("fatesNote")}
          />
        </div>
      </div>
    </VizFigure>
  );
}
