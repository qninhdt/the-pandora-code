"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useId, useMemo } from "react";
import { type LedgerResult, apparentRichnessAt } from "./dependent-species-ledger-model";

// The clipboard line. A censusing ecologist walking the perimeter records the
// upper curve; the dashed floor is what genuinely survives. The shaded column at
// the scrubbed year is the difference — species still visible whose future has
// already been removed.

const W = 340;
const H = 196;
const PAD = { l: 40, r: 14, t: 16, b: 44 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;
export const MAX_YEARS = 120;
const YEAR_TICKS = [0, 30, 60, 90, 120];

const xOf = (years: number) => PAD.l + (years / MAX_YEARS) * plotW;
const yOf = (count: number, top: number) => PAD.t + (1 - count / Math.max(1, top)) * plotH;

interface ChartProps {
  ledger: LedgerResult;
  /** Full tenant list — the top of the y axis. */
  associated: number;
  years: number;
  tone: string;
  ariaLabel: string;
  axisTime: string;
  axisSpecies: string;
  floorLabel: string;
}

export function DependentSpeciesLedgerChart({
  ledger,
  associated,
  years,
  tone,
  ariaLabel,
  axisTime,
  axisSpecies,
  floorLabel,
}: ChartProps) {
  const uid = useId();
  const recorded = apparentRichnessAt(ledger, years);
  const floorY = yOf(ledger.safe, associated);

  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 80; i += 1) {
      const yr = (MAX_YEARS * i) / 80;
      const v = apparentRichnessAt(ledger, yr);
      pts.push(`${i === 0 ? "M" : "L"}${xOf(yr).toFixed(1)},${yOf(v, associated).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [ledger, associated]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full sm:w-3/5" role="img" aria-label={ariaLabel}>
      <GlowDefs idBase={uid} tones={["teal", "amber", "magenta", "cyan"]} />

      <line
        x1={PAD.l}
        y1={PAD.t}
        x2={PAD.l}
        y2={PAD.t + plotH}
        stroke="var(--border-strong)"
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />
      <line
        x1={PAD.l}
        y1={PAD.t + plotH}
        x2={PAD.l + plotW}
        y2={PAD.t + plotH}
        stroke="var(--border-strong)"
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />
      {YEAR_TICKS.map((yr) => (
        <VizTick key={yr} x={xOf(yr)} y={PAD.t + plotH + 14}>
          {yr}
        </VizTick>
      ))}
      <VizText x={PAD.l + plotW / 2} y={H - 18} size="small" anchor="middle" tone="var(--muted)">
        {axisTime}
      </VizText>
      <VizText
        x={11}
        y={PAD.t + plotH / 2}
        size="small"
        anchor="middle"
        tone="var(--muted)"
        transform={`rotate(-90 11 ${PAD.t + plotH / 2})`}
      >
        {axisSpecies}
      </VizText>

      {/* the floor the census is falling toward: what genuinely survives */}
      <line
        x1={PAD.l}
        y1={floorY}
        x2={PAD.l + plotW}
        y2={floorY}
        stroke="var(--teal)"
        strokeWidth={1.2}
        strokeDasharray="4 3"
        strokeOpacity={0.75}
      />
      <VizText x={PAD.l + plotW} y={floorY - 5} size="micro" anchor="end" tone="teal">
        {floorLabel}
      </VizText>

      {/* the debt still unpaid at the scrubbed year — the whole point */}
      <rect
        x={xOf(years) - 3}
        y={yOf(recorded, associated)}
        width={6}
        height={Math.max(0, floorY - yOf(recorded, associated))}
        fill="var(--magenta)"
        opacity={0.22}
      />

      <path d={curve} fill="none" stroke={tone} strokeWidth={2.2} filter={glowUrl(uid, "bloom")} />
      <circle cx={xOf(years)} cy={yOf(recorded, associated)} r={4} fill={tone} />
    </svg>
  );
}

// The tenant list split three ways: what survives, the multi-host affiliates that
// slide out late, and the obligates that were lost the moment the tree fell.
export function LedgerBar({
  bands,
  total,
  label,
}: {
  bands: { id: string; label: string; n: number; fill: string }[];
  total: number;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <span className="font-sans text-xs text-muted">{label}</span>
      <div className="mt-1.5 flex h-2.5 w-full overflow-hidden rounded-full bg-void/60">
        {bands.map((b) => (
          <span
            key={b.id}
            className="h-full transition-all duration-300"
            style={{ width: `${(b.n / Math.max(1, total)) * 100}%`, backgroundColor: b.fill }}
          />
        ))}
      </div>
      <ul className="mt-2 flex flex-col gap-1">
        {bands.map((b) => (
          <li key={b.id} className="flex items-baseline gap-2 font-sans text-xs">
            <span
              aria-hidden
              className="mt-1 inline-block size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: b.fill }}
            />
            <span className="text-muted">
              {b.label} · {Math.round(b.n)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
