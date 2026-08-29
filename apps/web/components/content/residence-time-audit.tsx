"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  AUDIT_CASES,
  TIME_MARKERS,
  audit,
  auditCaseById,
  formatQuantity,
  logPosition,
} from "./residence-time-audit-model";

// The audit bench. Pick a reservoir, see how long an atom stays in it, then push
// the sink rate around and watch the answer move across nine orders of magnitude.
// The reader should leave able to run this on any planetary claim, including the
// ones in this chapter that fail. Strings from i18n; deterministic for SSR.

interface ResidenceTimeAuditProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 360;
const VIEW_H = 118;
const AXIS_X = 14;
const AXIS_W = VIEW_W - AXIS_X - 14;
const AXIS_Y = 84;
const MARKER_TOP = 30;

// Log-decade ticks across the axis span, labelled sparsely so they stay readable.
const DECADES = [-4, -2, 0, 2, 4, 6, 8];

function xFor(years: number): number {
  return AXIS_X + logPosition(years) * AXIS_W;
}

export function ResidenceTimeAudit({ caption, className }: ResidenceTimeAuditProps) {
  const t = useTranslations("viz.residenceTimeAudit");
  const uid = useId();

  const [caseId, setCaseId] = useState(AUDIT_CASES[0].id);
  const active = auditCaseById(caseId);

  // Sliders work in log space: these are exponents, so a single control can span
  // the whole plausible range of a reservoir or a flux.
  const [reservoirExp, setReservoirExp] = useState(Math.log10(active.reservoir));
  const [sinkExp, setSinkExp] = useState(Math.log10(active.sink));

  function selectCase(id: string) {
    const next = auditCaseById(id);
    setCaseId(id);
    setReservoirExp(Math.log10(next.reservoir));
    setSinkExp(Math.log10(next.sink));
  }

  const reservoir = 10 ** reservoirExp;
  const sink = 10 ** sinkExp;
  const result = audit(reservoir, sink);
  const tone = `var(--${active.tone})`;
  const unit = t(`unit.${active.unit}`);

  const tauX = xFor(result.tauYears);
  const shortLived = result.tauYears < 0.5;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone={active.tone}
      className={className}
      hint={t(`hint.${result.tauBand}`)}
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-sans text-xs text-muted">{t("caseLabel")}</span>
        {AUDIT_CASES.map((c) => {
          const isActive = c.id === caseId;
          const caseTone = `var(--${c.tone})`;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => selectCase(c.id)}
              className="rounded-md border px-2.5 py-1.5 font-sans text-xs transition-all duration-200"
              style={{
                borderColor: isActive
                  ? `color-mix(in oklab, ${caseTone} 45%, transparent)`
                  : "var(--border)",
                background: isActive
                  ? `color-mix(in oklab, ${caseTone} 12%, transparent)`
                  : "transparent",
                color: isActive ? caseTone : "var(--subtle)",
              }}
            >
              {t(`case.${c.id}`)}
            </button>
          );
        })}
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={t("aria", { years: formatQuantity(result.tauYears) })}
      >
        <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />

        {/* the time axis itself */}
        <line
          x1={AXIS_X}
          y1={AXIS_Y}
          x2={AXIS_X + AXIS_W}
          y2={AXIS_Y}
          stroke="var(--border-strong)"
        />
        {DECADES.map((exp) => {
          const x = xFor(10 ** exp);
          return (
            <g key={exp}>
              <line x1={x} y1={AXIS_Y} x2={x} y2={AXIS_Y + 4} stroke="var(--border-strong)" />
              <VizText x={x} y={AXIS_Y + 13} size="micro" anchor="middle" numeric>
                {t(`decade.e${exp}`)}
              </VizText>
            </g>
          );
        })}

        {/* reference timescales, so the computed answer lands somewhere meaningful */}
        {TIME_MARKERS.map((marker) => {
          const x = xFor(marker.years);
          return (
            <g key={marker.id}>
              <line
                x1={x}
                y1={MARKER_TOP}
                x2={x}
                y2={AXIS_Y}
                stroke="var(--border)"
                strokeDasharray="2 3"
              />
              <VizText
                x={x}
                y={MARKER_TOP - 4}
                size="micro"
                tone="subtle"
                anchor="middle"
                transform={`rotate(-18 ${x} ${MARKER_TOP - 4})`}
              >
                {t(`marker.${marker.id}`)}
              </VizText>
            </g>
          );
        })}

        {/* the computed residence time */}
        <line x1={tauX} y1={MARKER_TOP - 12} x2={tauX} y2={AXIS_Y} stroke={tone} strokeWidth={2} />
        <circle cx={tauX} cy={AXIS_Y} r={5} fill={tone} filter={glowUrl(uid, "bloom")} />
        <VizText x={tauX} y={AXIS_Y + 26} size="small" tone={tone} anchor="middle" weight={700}>
          {shortLived
            ? t("tauDays", { days: formatQuantity(result.tauDays) })
            : t("tauYears", { years: formatQuantity(result.tauYears) })}
        </VizText>
      </svg>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <VizSlider
          label={t("reservoirSlider", { unit })}
          display={`${formatQuantity(reservoir)} ${unit}`}
          min={Math.log10(active.reservoir) - 3}
          max={Math.log10(active.reservoir) + 3}
          step={0.05}
          value={reservoirExp}
          onChange={setReservoirExp}
          tone={tone}
        />
        <VizSlider
          label={t("sinkSlider", { unit })}
          display={`${formatQuantity(sink)} ${unit}/yr`}
          min={Math.log10(active.sink) - 4}
          max={Math.log10(active.sink) + 4}
          step={0.05}
          value={sinkExp}
          onChange={setSinkExp}
          tone={tone}
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("tauLabel")}
          value={
            shortLived
              ? t("tauDays", { days: formatQuantity(result.tauDays) })
              : t("tauYears", { years: formatQuantity(result.tauYears) })
          }
          note={t("tauNote")}
          tone={tone}
          tinted
        />
        <VizReadout
          label={t("sourceLabel")}
          value={`${formatQuantity(sink)} ${unit}/yr`}
          note={t("sourceNote")}
        />
        <VizReadout
          label={t("refillLabel")}
          value={`${formatQuantity(result.refillsPerCanonSpan)}×`}
          note={t("refillNote")}
        />
      </div>
    </VizFigure>
  );
}
