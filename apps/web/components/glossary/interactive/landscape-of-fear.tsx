"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Prey forage for food but discount patches by predation risk. Place up to 3
// predators; heatmap = food × exp(−risk). Food is uniform-ish; fear reshapes use.
const COLS = 12;
const ROWS = 8;

function foodAt(i: number, j: number): number {
  // gentle resource gradient + patchiness
  const n = Math.sin(i * 0.7) * Math.cos(j * 0.55) * 0.35 + 0.55;
  return Math.max(0.15, Math.min(1, n + ((i * 13 + j * 7) % 5) * 0.04));
}

export default function LandscapeOfFear() {
  const t = useTranslations("viz.landscape-of-fear");
  const [preds, setPreds] = useState<{ c: number; r: number }[]>([
    { c: 8, r: 2 },
  ]);

  const cells = useMemo(() => {
    const out: {
      c: number;
      r: number;
      food: number;
      risk: number;
      forage: number;
    }[] = [];
    let maxF = 0.001;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const food = foodAt(c, r);
        let risk = 0;
        for (const p of preds) {
          const d = Math.hypot(c - p.c, r - p.r);
          risk += Math.exp(-d * d * 0.35);
        }
        risk = Math.min(1.5, risk);
        const forage = food * Math.exp(-2.2 * risk);
        maxF = Math.max(maxF, forage);
        out.push({ c, r, food, risk, forage });
      }
    }
    return out.map((cell) => ({ ...cell, fn: cell.forage / maxF }));
  }, [preds]);

  const meanRisk =
    cells.reduce((s, c) => s + c.risk, 0) / Math.max(1, cells.length);
  const meanForage =
    cells.reduce((s, c) => s + c.fn, 0) / Math.max(1, cells.length);

  const onCell = (c: number, r: number) => {
    setPreds((prev) => {
      const exists = prev.findIndex((p) => p.c === c && p.r === r);
      if (exists >= 0) return prev.filter((_, i) => i !== exists);
      if (prev.length >= 3) return [...prev.slice(1), { c, r }];
      return [...prev, { c, r }];
    });
  };

  const cellW = 70 / COLS;
  const cellH = 48 / ROWS;
  const ox = 15;
  const oy = 18;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPreds([{ c: 8, r: 2 }])}
      allowFullscreen={false}
      caption={
        <span>
          {t("risk")} {(meanRisk * 100).toFixed(0)}% · {t("forage")}{" "}
          <span className="text-teal">{(meanForage * 100).toFixed(0)}%</span>
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
          {cells.map((cell) => {
            const x = ox + cell.c * cellW;
            const y = oy + cell.r * cellH;
            // blend teal forage with magenta risk
            const riskGlow = Math.min(1, cell.risk);
            return (
              <rect
                key={`${cell.c}-${cell.r}`}
                x={x}
                y={y}
                width={cellW - 0.3}
                height={cellH - 0.3}
                rx="0.3"
                fill={riskGlow > 0.45 ? "var(--magenta)" : "var(--teal)"}
                opacity={0.12 + cell.fn * 0.7 + riskGlow * 0.15}
                style={{ cursor: "pointer" }}
                onClick={() => onCell(cell.c, cell.r)}
              />
            );
          })}

          {preds.map((p, i) => (
            <circle
              key={i}
              cx={ox + (p.c + 0.5) * cellW}
              cy={oy + (p.r + 0.5) * cellH}
              r="2.2"
              fill="var(--magenta)"
              stroke="var(--foreground)"
              strokeWidth="0.35"
            />
          ))}
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("risk")} value={meanRisk.toFixed(2)} accent="magenta" />
          <Readout label={t("forage")} value={meanForage.toFixed(2)} accent="teal" />
        </div>

        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <ControlButton className="px-2.5 py-1.5" variant="default" disabled>
            {t("place")}
          </ControlButton>
          <ControlButton
            className="px-2.5 py-1.5"
            onClick={() => setPreds([])}
          >
            {t("clear")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
