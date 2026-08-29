"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  type ElementId,
  ELEMENT_CYCLES,
  auditCycle,
  cycleById,
  formatStock,
  formatYears,
  geologicalShare,
  slowestFlux,
  stockFraction,
} from "./element-cycle-tracer-model";

// Switch between the four cycles and watch one thing: whether an atmosphere box
// appears. Three elements get one; phosphorus does not, and every consequence in
// the chapter's phosphorus section follows from that single missing row. The bars
// are log-scaled because the stocks span eleven decades. Strings from i18n;
// deterministic for SSR.

interface ElementCycleTracerProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 360;
const BAR_H = 15;
const ROW_GAP = 9;
const LABEL_W = 86;
const BAR_X = LABEL_W + 6;
const BAR_MAX_W = VIEW_W - BAR_X - 62;
const TOP_PAD = 8;

export function ElementCycleTracer({ caption, className }: ElementCycleTracerProps) {
  const t = useTranslations("viz.elementCycleTracer");
  const uid = useId();

  const [elementId, setElementId] = useState<ElementId>("carbon");
  const cycle = cycleById(elementId);
  const rows = auditCycle(cycle);
  const tone = `var(--${cycle.tone})`;
  const unit = t(`unit.${cycle.unit}`);
  const slowest = slowestFlux(cycle);
  const geoShare = geologicalShare(cycle);

  const viewH = TOP_PAD * 2 + rows.length * (BAR_H + ROW_GAP);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone={cycle.tone}
      className={className}
      hint={t(`hint.${cycle.bottleneck}`)}
      controls={
        <SegmentedToggle
          options={ELEMENT_CYCLES.map((c) => ({
            value: c.id,
            label: t(`element.${c.id}`),
            tone: `var(--${c.tone})`,
          }))}
          value={elementId}
          onChange={setElementId}
          ariaLabel={t("toggleAria")}
        />
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${viewH}`}
        className="w-full"
        role="img"
        aria-label={t(cycle.hasGasPhase ? "ariaWithGas" : "ariaNoGas", {
          element: t(`element.${cycle.id}`),
        })}
      >
        <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta"]} />

        {rows.map((row, i) => {
          const y = TOP_PAD + i * (BAR_H + ROW_GAP);
          const w = Math.max(3, stockFraction(row.stock) * BAR_MAX_W);
          const isAtmos = row.atmospheric;
          return (
            <g key={row.id}>
              <VizText
                x={LABEL_W}
                y={y + BAR_H * 0.72}
                size="small"
                tone={isAtmos ? cycle.tone : "muted"}
                anchor="end"
                weight={isAtmos ? 700 : undefined}
              >
                {t(`reservoir.${row.id}`)}
              </VizText>
              <rect
                x={BAR_X}
                y={y}
                width={w}
                height={BAR_H}
                rx={3}
                fill={
                  isAtmos
                    ? `color-mix(in oklab, ${tone} 55%, transparent)`
                    : `color-mix(in oklab, ${tone} 22%, transparent)`
                }
                stroke={isAtmos ? tone : `color-mix(in oklab, ${tone} 35%, transparent)`}
                filter={isAtmos ? glowUrl(uid, "bloom") : undefined}
              />
              <VizText
                x={BAR_X + w + 5}
                y={y + BAR_H * 0.72}
                size="micro"
                tone="subtle"
                numeric
              >
                {formatStock(row.stock)}
              </VizText>
            </g>
          );
        })}

        {/* the absence is the finding: mark the row phosphorus does not have */}
        {!cycle.hasGasPhase ? (
          <g>
            <line
              x1={BAR_X}
              y1={TOP_PAD - 4}
              x2={BAR_X + BAR_MAX_W}
              y2={TOP_PAD - 4}
              stroke="var(--amber)"
              strokeDasharray="3 3"
              strokeOpacity={0.7}
            />
            <VizText x={LABEL_W} y={TOP_PAD - 1} size="micro" tone="amber" anchor="end">
              {t("noAtmosphereRow")}
            </VizText>
          </g>
        ) : null}
      </svg>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("gasPhaseLabel")}
          value={cycle.hasGasPhase ? t("gasPhaseYes") : t("gasPhaseNo")}
          note={t("gasPhaseNote")}
          tone={tone}
          tinted={!cycle.hasGasPhase}
        />
        <VizReadout
          label={t("slowestLabel")}
          value={`${formatStock(slowest.rate)} ${unit}/yr`}
          note={t(`flux.${slowest.id}`)}
        />
        <VizReadout
          label={t("geologicalLabel")}
          value={`${Math.round(geoShare * 100)}%`}
          note={t("geologicalNote")}
        />
      </div>

      <ul className="mt-3 space-y-1 font-sans text-xs leading-relaxed text-subtle">
        {rows.slice(0, 3).map((row) => (
          <li key={row.id}>
            {t("residenceLine", {
              reservoir: t(`reservoir.${row.id}`),
              years: formatYears(row.residenceYears),
            })}
          </li>
        ))}
      </ul>
    </VizFigure>
  );
}
