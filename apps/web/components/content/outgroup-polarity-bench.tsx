"use client";

import { PolarityMatrix } from "@/components/content/outgroup-polarity-bench-matrix";
import {
  CANDIDATE_OUTGROUPS,
  CHARACTERS,
  type OutgroupId,
  type Polarity,
  TAXA,
  polarize,
  summarize,
} from "@/components/content/outgroup-polarity-bench-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface OutgroupPolarityBenchProps {
  caption?: string;
  className?: string;
}

// Hennig's rule can only fire once you know which way is "new" — and nothing in
// the specimens tells you that. The baseline creature does. The reader nominates
// one, and the same unchanged scores are re-read against it: with a creature that
// branched off first, carbon bone and the queue light up as novelties shared by
// everything else; nominate a deeply derived member of the family instead and the
// crest goes dark (everyone already has it) while genuinely ancient six-limbed
// anatomy is promoted to a novelty. What the reader should feel: the compass, not
// the bones, decides the tree. Scoring lives in the model file; the scored table
// lives beside this file.

const W = 360;
const ROW_H = 30;
const TRACK_X = 118;
const TRACK_W = 190;

function toneFor(kind: Polarity["kind"]): string {
  if (kind === "synapomorphy") return "var(--canon)";
  if (kind === "autapomorphy") return "var(--inference)";
  return "var(--subtle)";
}

export function OutgroupPolarityBench({ caption, className }: OutgroupPolarityBenchProps) {
  const uid = useId();
  const t = useTranslations("viz.outgroupPolarityBench");
  const [baseline, setBaseline] = useState<OutgroupId>("marine");

  const polarities = useMemo(() => polarize(baseline), [baseline]);
  const summary = useMemo(() => summarize(polarities), [polarities]);

  const tone = summary.verdict === "clean" ? "cyan" : "magenta";
  const height = CHARACTERS.length * ROW_H + 26;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone={tone}
      className={className}
      hint={t(`verdict.${summary.verdict}`)}
      controls={
        <SegmentedToggle<OutgroupId>
          ariaLabel={t("baselineLabel")}
          value={baseline}
          onChange={setBaseline}
          options={CANDIDATE_OUTGROUPS.map((id) => ({
            value: id,
            label: t(`taxa.${id}`),
            tone: id === "marine" ? "var(--canon)" : "var(--inference)",
          }))}
        />
      }
    >
      <div className="flex flex-col gap-4 lg:flex-row">
        <PolarityMatrix
          baseline={baseline}
          polarityOf={(i) => polarities[i]}
          heading={t("matrixHead")}
          specimenHeading={t("specimen")}
          label={(key) => t(key)}
        />

        {/* One track per character: baseline state on the left, the novelty it
            polarizes to on the right, bar length = how many specimens share it. */}
        <div className="lg:w-[54%]">
          <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label={t("aria")}>
            <GlowDefs idBase={uid} tones={["cyan", "amber"]} />
            <VizText x={0} y={9} size="micro" tone="subtle">
              {t("baselineSide")}
            </VizText>
            <VizText x={W} y={9} size="micro" tone="cyan" anchor="end">
              {t("noveltySide")}
            </VizText>
            {polarities.map((p, i) => {
              const y = 26 + i * ROW_H;
              const share = p.grouping / (TAXA.length - 1);
              const barW = Math.max(share * TRACK_W, 2);
              const stroke = toneFor(p.kind);
              return (
                <g key={p.character}>
                  <VizText x={0} y={y + 4} size="small" tone="foreground" weight={600}>
                    {t(`chars.${p.character}.short`)}
                  </VizText>
                  <VizText x={0} y={y + 15} size="micro" tone={p.inverted ? "amber" : "subtle"}>
                    {t(`chars.${p.character}.states.${p.ancestral}`)}
                  </VizText>
                  <line
                    x1={TRACK_X}
                    y1={y}
                    x2={TRACK_X + TRACK_W}
                    y2={y}
                    stroke="var(--border)"
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                  <line
                    x1={TRACK_X}
                    y1={y}
                    x2={TRACK_X + barW}
                    y2={y}
                    stroke={stroke}
                    strokeWidth={6}
                    strokeLinecap="round"
                    filter={p.kind === "synapomorphy" ? glowUrl(uid, "bloom") : undefined}
                    style={{ transition: "all 0.4s ease" }}
                  />
                  <VizText x={TRACK_X} y={y + 15} size="micro" tone={stroke}>
                    {t(`kind.${p.kind}`, { count: p.grouping })}
                  </VizText>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("readout.grouping")}
          value={summary.grouping}
          tone="var(--canon)"
          note={t("readout.groupingNote")}
        />
        <VizReadout
          label={t("readout.loners")}
          value={summary.loners}
          tone="var(--inference)"
          note={t("readout.lonersNote")}
        />
        <VizReadout
          label={t("readout.crest")}
          value={summary.crestRecovered ? t("readout.crestHeld") : t("readout.crestLost")}
          tone={summary.crestRecovered ? "var(--teal)" : "var(--magenta)"}
          tinted
        />
      </div>
    </VizFigure>
  );
}
