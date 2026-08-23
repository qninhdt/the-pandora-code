"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Five real volcanic recoveries plotted on ONE log-time axis so the reader can
// see that "recovered" spans years to millennia. Each site is a vegetation-cover
// trajectory; Surtsey carries an event marker where a gull colony switched on the
// nitrogen supply and its curve jumps. The lesson is comparative: identical
// disturbance intensity, wildly different clocks, set by climate + legacies +
// nutrient supply. Data indices in code; every label translates.

type Site = "sthelens" | "surtsey" | "krakatau" | "paricutin" | "laki";

interface SiteSpec {
  tone: string;
  // control points [log10(years+1) is handled by the scale]; cover 0-1 at year marks.
  points: { year: number; cover: number }[];
  eventYear?: number; // annotated regime switch (Surtsey gull colony)
}

// Years since eruption → fractional vegetation cover (stylized from field lit).
const SITES: Record<Site, SiteSpec> = {
  sthelens: {
    tone: "var(--teal)",
    points: [
      { year: 1, cover: 0.01 },
      { year: 5, cover: 0.12 },
      { year: 15, cover: 0.34 },
      { year: 30, cover: 0.55 },
      { year: 45, cover: 0.7 },
    ],
  },
  surtsey: {
    tone: "var(--cyan)",
    points: [
      { year: 1, cover: 0.005 },
      { year: 10, cover: 0.04 },
      { year: 23, cover: 0.09 },
      { year: 24, cover: 0.28 },
      { year: 40, cover: 0.66 },
      { year: 57, cover: 0.8 },
    ],
    eventYear: 23,
  },
  krakatau: {
    tone: "var(--amber)",
    points: [
      { year: 1, cover: 0.0 },
      { year: 10, cover: 0.15 },
      { year: 25, cover: 0.45 },
      { year: 50, cover: 0.82 },
      { year: 70, cover: 0.95 },
    ],
  },
  paricutin: {
    tone: "var(--magenta)",
    points: [
      { year: 1, cover: 0.0 },
      { year: 20, cover: 0.06 },
      { year: 40, cover: 0.14 },
      { year: 80, cover: 0.28 },
    ],
  },
  laki: {
    tone: "var(--stone)",
    points: [
      { year: 1, cover: 0.0 },
      { year: 50, cover: 0.05 },
      { year: 120, cover: 0.12 },
      { year: 240, cover: 0.2 },
    ],
  },
};

const W = 360;
const H = 220;
const PAD_L = 26;
const PAD_R = 16;
const PAD_T = 14;
const PAD_B = 30;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const MAX_LOG = Math.log10(240 + 1); // longest span, Laki 240 yr
const lx = (year: number) => PAD_L + (Math.log10(year + 1) / MAX_LOG) * PLOT_W;
const ly = (cover: number) => PAD_T + (1 - cover) * PLOT_H;

function sitePath(spec: SiteSpec): string {
  return spec.points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${lx(p.year).toFixed(1)} ${ly(p.cover).toFixed(1)}`)
    .join(" ");
}

const TICK_YEARS = [1, 10, 100];

interface RecoveryChronosequenceProps {
  caption?: string;
  className?: string;
}

export function RecoveryChronosequence({ caption, className }: RecoveryChronosequenceProps) {
  const t = useTranslations("viz.recovery-chronosequence");
  const uid = useId();
  const [site, setSite] = useState<Site>("sthelens");
  const spec = SITES[site];
  const last = spec.points[spec.points.length - 1];

  const tone: "cyan" | "teal" | "magenta" | "amber" =
    site === "surtsey"
      ? "cyan"
      : site === "krakatau"
        ? "amber"
        : site === "paricutin"
          ? "magenta"
          : "teal";

  const options: { value: Site; label: string; tone: string }[] = (
    Object.keys(SITES) as Site[]
  ).map((s) => ({ value: s, label: t(`site.${s}.tab`), tone: SITES[s].tone }));

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`site.${site}.note`)}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle options={options} value={site} onChange={setSite} ariaLabel={t("controlLabel")} />
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full md:w-3/5" role="img" aria-label={t(`site.${site}.note`)}>
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />
          <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill={glowUrl(uid, "grid")} />

          {/* axes */}
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="var(--border-strong)" strokeWidth={1} />
          <line
            x1={PAD_L}
            y1={PAD_T + PLOT_H}
            x2={PAD_L + PLOT_W}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {/* log-year ticks */}
          {TICK_YEARS.map((yr) => (
            <g key={yr}>
              <line
                x1={lx(yr)}
                y1={PAD_T}
                x2={lx(yr)}
                y2={PAD_T + PLOT_H}
                stroke="var(--foreground)"
                strokeOpacity={0.08}
                strokeWidth={1}
              />
              <VizText x={lx(yr)} y={PAD_T + PLOT_H + 14} size="micro" tone="subtle" anchor="middle">
                {t("yearTick", { n: yr })}
              </VizText>
            </g>
          ))}

          {/* all sites dimmed, active site bold */}
          {(Object.keys(SITES) as Site[]).map((s) => (
            <path
              key={s}
              d={sitePath(SITES[s])}
              fill="none"
              stroke={SITES[s].tone}
              strokeWidth={s === site ? 2.6 : 1.1}
              strokeOpacity={s === site ? 1 : 0.18}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={s === site ? glowUrl(uid, "bloom") : undefined}
            />
          ))}

          {/* Surtsey nutrient-switch event marker */}
          {spec.eventYear !== undefined && (
            <g>
              <line
                x1={lx(spec.eventYear)}
                y1={PAD_T}
                x2={lx(spec.eventYear)}
                y2={PAD_T + PLOT_H}
                stroke={spec.tone}
                strokeDasharray="3 3"
                strokeOpacity={0.6}
                strokeWidth={1}
              />
              <VizText x={lx(spec.eventYear) + 3} y={PAD_T + 12} size="micro" tone="cyan" anchor="start">
                {t("eventLabel")}
              </VizText>
            </g>
          )}

          {/* end marker */}
          <circle cx={lx(last.year)} cy={ly(last.cover)} r={5} fill={spec.tone} filter={glowUrl(uid, "bloom")} />

          <VizText x={PAD_L + PLOT_W / 2} y={H - 6} size="micro" tone="subtle" anchor="middle">
            {t("xAxis")}
          </VizText>
          <VizText
            x={10}
            y={PAD_T + PLOT_H / 2}
            size="micro"
            tone="subtle"
            anchor="middle"
            transform={`rotate(-90 10 ${PAD_T + PLOT_H / 2})`}
          >
            {t("yAxis")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 md:w-2/5">
          <VizReadout label={t("readout.disturbance")} value={t(`site.${site}.disturbance`)} tone={spec.tone} />
          <VizReadout label={t("readout.span")} value={t(`site.${site}.span`)} tone={spec.tone} />
          <VizReadout
            label={t("readout.driver")}
            value={t(`site.${site}.driverShort`)}
            note={t(`site.${site}.driver`)}
            tone={spec.tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
