"use client";

import {
  type RankedMaterial,
  type StructuralJob,
  rankMaterials,
} from "@/components/content/material-index-bench-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// The bench that shows "strong" is not one number. Twelve materials, four jobs;
// choosing a job re-sorts the whole board, because each loading case weighs
// stiffness, strength and density differently. Steel never wins. Wood, which
// nobody calls a high-performance material, beats titanium at holding a shape
// per unit weight — and that is the fact the chapter needs the reader to own
// before it starts weighing Pandora's claims.

const JOBS: StructuralJob[] = ["tie", "beam", "column", "spring"];

const JOB_TONE: Record<StructuralJob, "cyan" | "teal" | "magenta" | "amber"> = {
  tie: "cyan",
  beam: "teal",
  column: "amber",
  spring: "magenta",
};

/** Grown materials read in living teal; manufactured ones stay neutral. */
const ORIGIN_TONE = {
  biological: "var(--teal)",
  engineered: "var(--subtle)",
} as const;

const BAR_H = 18;
const BAR_GAP = 5;
const LABEL_W = 96;
const TRACK_W = 196;
const W = LABEL_W + TRACK_W + 8;

interface MaterialIndexBenchProps {
  caption?: string;
  className?: string;
}

export function MaterialIndexBench({ caption, className }: MaterialIndexBenchProps) {
  const uid = useId();
  const t = useTranslations("viz.materialIndexBench");
  const [job, setJob] = useState<StructuralJob>("tie");

  const ranked = useMemo(() => rankMaterials(job), [job]);
  const leader = ranked[0];
  const tone = JOB_TONE[job];
  const toneVar = `var(--${tone})`;

  // Each job reports in its own unit, so the row formatter takes a resolver
  // rather than the translator itself.
  const unitLabel = (unit: string, value: string) => t(`unit.${unit}`, { value });

  // Where steel lands is the punchline of every job, so it gets its own readout.
  const steelRank = ranked.findIndex((r) => r.spec.key === "steel") + 1;

  const H = ranked.length * (BAR_H + BAR_GAP) + 14;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={tone}
      caption={caption}
      hint={t(`hint.${job}`)}
      controls={
        <SegmentedToggle
          options={JOBS.map((j) => ({
            value: j,
            label: t(`job.${j}`),
            tone: `var(--${JOB_TONE[j]})`,
          }))}
          value={job}
          onChange={setJob}
          ariaLabel={t("jobLabel")}
        />
      }
      className={className}
    >
      <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr] sm:items-start">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={t("aria", { job: t(`job.${job}`) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />
          {ranked.map((row, i) => (
            <MaterialRow
              key={row.spec.key}
              row={row}
              y={i * (BAR_H + BAR_GAP) + 6}
              leading={i === 0}
              toneVar={toneVar}
              name={t(`material.${row.spec.key}`)}
              figure={formatFigure(row, unitLabel)}
              idBase={uid}
            />
          ))}
        </svg>

        <div className="grid gap-2">
          <VizReadout
            label={t("readout.leader")}
            value={t(`material.${leader.spec.key}`)}
            note={t("readout.leaderNote", { figure: formatFigure(leader, unitLabel) })}
            tone={toneVar}
            tinted
          />
          <VizReadout
            label={t("readout.steel")}
            value={t("readout.steelValue", { rank: steelRank, total: ranked.length })}
            note={t("readout.steelNote")}
            tone="var(--subtle)"
          />
          <p className="font-sans text-xs leading-relaxed text-muted">{t(`verdict.${job}`)}</p>
          <p className="font-sans text-[0.7rem] uppercase tracking-wider text-subtle">
            {t("legend")}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}

/** Format a row's figure with the unit its job actually reports in. */
function formatFigure(row: RankedMaterial, unitLabel: (unit: string, value: string) => string) {
  const { value, unit } = row.figure;
  const digits = unit === "percent" ? 0 : value >= 100 ? 0 : 1;
  return unitLabel(unit, value.toFixed(digits));
}

interface MaterialRowProps {
  row: RankedMaterial;
  y: number;
  leading: boolean;
  toneVar: string;
  name: string;
  figure: string;
  idBase: string;
}

function MaterialRow({ row, y, leading, toneVar, name, figure, idBase }: MaterialRowProps) {
  const barW = Math.max(row.share, 0.012) * TRACK_W;
  const originTone = ORIGIN_TONE[row.spec.origin];
  const fill = leading ? toneVar : originTone;

  return (
    <g>
      <text
        x={LABEL_W - 6}
        y={y + BAR_H / 2 + 3}
        textAnchor="end"
        className="font-sans"
        style={{ fill: "var(--muted)", fontSize: 8.5 }}
      >
        {name}
      </text>
      <rect
        x={LABEL_W}
        y={y}
        width={TRACK_W}
        height={BAR_H}
        rx={3}
        fill="color-mix(in oklab, var(--void) 45%, transparent)"
        stroke="var(--border)"
        strokeWidth={0.5}
      />
      <rect
        x={LABEL_W}
        y={y}
        width={barW}
        height={BAR_H}
        rx={3}
        fill={fill}
        fillOpacity={leading ? 0.85 : 0.42}
        filter={leading ? glowUrl(idBase, "bloom") : undefined}
      />
      <text
        x={LABEL_W + barW + 5}
        y={y + BAR_H / 2 + 3}
        className="font-sans tabular-nums"
        style={{ fill: leading ? toneVar : "var(--subtle)", fontSize: 8.5, fontWeight: 600 }}
      >
        {figure}
      </text>
    </g>
  );
}
