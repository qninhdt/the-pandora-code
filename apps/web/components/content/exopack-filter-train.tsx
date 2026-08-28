"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText } from "@/components/content/viz/viz-svg-text";

// The gas train drawn for ExopackFilterBudget: raw Pandoran air on the left, the
// two sorbent stages in the middle sized by the mass the reader gave them, and
// the breathable mixture on the right. Split out of the component so both files
// stay small. The geometry carries the argument — a starved stage is visibly thin
// and its leak bar visibly bright — so the numbers underneath only confirm what
// the picture already said.

export const TRAIN_W_VIEW = 400;
export const TRAIN_H_VIEW = 176;
const TRAIN_X = 96;
const TRAIN_SPAN = 208;
const TRAIN_Y = 44;
const BED_H = 58;

export interface FilterTrainLabels {
  intake: string;
  intakeCo2: string;
  intakeH2s: string;
  scrubberBed: string;
  sulfideBed: string;
  delivered: string;
  deliveredCo2: string;
  deliveredH2s: string;
  flowCaption: string;
  noTank: string;
  leakLabel: string;
}

interface FilterTrainProps {
  uid: string;
  /** Share of sorbent given to the carbon dioxide scrubber, 0-100. */
  scrubberPct: number;
  /** 0-1 share of ambient carbon dioxide surviving the scrubber. */
  co2Leak: number;
  /** 0-1 share of ambient hydrogen sulfide surviving the bed. */
  h2sLeak: number;
  /** Token hue for the delivered-air panel, reflecting the verdict. */
  tone: string;
  labels: FilterTrainLabels;
}

export function FilterTrain({
  uid,
  scrubberPct,
  co2Leak,
  h2sLeak,
  tone,
  labels,
}: FilterTrainProps) {
  const scrubberW = (scrubberPct / 100) * TRAIN_SPAN;
  const bedW = TRAIN_SPAN - scrubberW;
  const toneVar = `var(--${tone})`;

  return (
    <>
      <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

      {/* raw intake — the air as the moon supplies it */}
      <rect
        x={4}
        y={TRAIN_Y}
        width={78}
        height={BED_H}
        rx={6}
        fill="color-mix(in oklab, var(--magenta) 14%, var(--void))"
        stroke="color-mix(in oklab, var(--magenta) 40%, transparent)"
      />
      <VizText x={43} y={TRAIN_Y + 18} size="small" tone="magenta" anchor="middle" weight={600}>
        {labels.intake}
      </VizText>
      <VizText x={43} y={TRAIN_Y + 33} size="micro" tone="muted" anchor="middle" numeric>
        {labels.intakeCo2}
      </VizText>
      <VizText x={43} y={TRAIN_Y + 45} size="micro" tone="muted" anchor="middle" numeric>
        {labels.intakeH2s}
      </VizText>

      <SorbentBed
        x={TRAIN_X}
        width={scrubberW}
        uid={uid}
        hue="amber"
        label={labels.scrubberBed}
        share={scrubberPct}
        leak={co2Leak}
        leakLabel={labels.leakLabel}
      />
      <SorbentBed
        x={TRAIN_X + scrubberW}
        width={bedW}
        uid={uid}
        hue="magenta"
        label={labels.sulfideBed}
        share={100 - scrubberPct}
        leak={h2sLeak}
        leakLabel={labels.leakLabel}
      />

      {/* delivered air — the mask side */}
      <rect
        x={TRAIN_X + TRAIN_SPAN + 14}
        y={TRAIN_Y}
        width={68}
        height={BED_H}
        rx={6}
        fill={`color-mix(in oklab, ${toneVar} 16%, var(--void))`}
        stroke={`color-mix(in oklab, ${toneVar} 55%, transparent)`}
        filter={glowUrl(uid, "bloom")}
      />
      <VizText
        x={TRAIN_W_VIEW - 34}
        y={TRAIN_Y + 18}
        size="small"
        tone={tone}
        anchor="middle"
        weight={600}
      >
        {labels.delivered}
      </VizText>
      <VizText
        x={TRAIN_W_VIEW - 34}
        y={TRAIN_Y + 33}
        size="micro"
        tone="muted"
        anchor="middle"
        numeric
      >
        {labels.deliveredCo2}
      </VizText>
      <VizText
        x={TRAIN_W_VIEW - 34}
        y={TRAIN_Y + 45}
        size="micro"
        tone="muted"
        anchor="middle"
        numeric
      >
        {labels.deliveredH2s}
      </VizText>

      <VizText x={TRAIN_W_VIEW / 2} y={20} size="small" anchor="middle" tone="subtle">
        {labels.flowCaption}
      </VizText>
      <VizText x={TRAIN_W_VIEW / 2} y={TRAIN_H_VIEW - 8} size="micro" anchor="middle" tone="subtle">
        {labels.noTank}
      </VizText>
    </>
  );
}

// One sorbent stage. Its width is the mass it was given; the bar along its foot is
// the share of its own poison that survives the bed, so a starved stage reads as a
// bright leak even while its neighbour looks generously supplied.
function SorbentBed({
  x,
  width,
  uid,
  hue,
  label,
  share,
  leak,
  leakLabel,
}: {
  x: number;
  width: number;
  uid: string;
  hue: "amber" | "magenta";
  label: string;
  share: number;
  leak: number;
  leakLabel: string;
}) {
  const c = `var(--${hue})`;
  const narrow = width < 66;
  return (
    <g>
      <rect
        x={x}
        y={TRAIN_Y}
        width={Math.max(width, 1)}
        height={BED_H}
        fill={`color-mix(in oklab, ${c} 22%, var(--void))`}
        stroke={`color-mix(in oklab, ${c} 50%, transparent)`}
        strokeWidth={1}
      />
      {width >= 40 ? (
        <>
          <VizText
            x={x + width / 2}
            y={TRAIN_Y + 22}
            size={narrow ? "micro" : "small"}
            tone={hue}
            anchor="middle"
            weight={600}
          >
            {label}
          </VizText>
          <VizText
            x={x + width / 2}
            y={TRAIN_Y + 37}
            size="micro"
            tone="subtle"
            anchor="middle"
            numeric
          >
            {`${Math.round(share)}%`}
          </VizText>
        </>
      ) : null}
      <rect
        x={x + 3}
        y={TRAIN_Y + BED_H - 9}
        width={Math.max(width - 6, 0)}
        height={4}
        rx={2}
        fill="var(--border)"
      />
      <rect
        x={x + 3}
        y={TRAIN_Y + BED_H - 9}
        width={Math.max((width - 6) * leak, 0)}
        height={4}
        rx={2}
        fill={c}
        filter={glowUrl(uid, "bloom")}
      >
        <title>{leakLabel}</title>
      </rect>
    </g>
  );
}
