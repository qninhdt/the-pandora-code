"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { FactorGroup } from "./evidence-grade-ladder-factors";
import {
  DOWNGRADES,
  type Design,
  type Downgrade,
  LEVELS,
  LEVEL_TONE,
  START_SCORE,
  UPGRADES,
  type Upgrade,
  gradeScore,
} from "./evidence-grade-ladder-model";

// Medicine's GRADE framework, made playable — the chapter's claim that graded
// confidence is machinery rather than a mood. The reader picks a study design,
// which sets the starting rung, then adds the flaws and the strengths a real
// appraisal would find and watches the certainty rung slide. The feeling to earn
// is the one that took medicine decades: a gold-standard trial dragged down by
// three flaws ends up *below* a humble cohort study lifted by two strengths.
// Provenance sets the starting line; rigour decides where you finish.
// All strings live in i18n; the scoring rules live in the model file.

interface EvidenceGradeLadderProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 300;
const VIEW_H = 176;
const RUNG_H = 32;
const RUNG_GAP = 6;
const RUNG_X = 10;
const RUNG_W = VIEW_W - 2 * RUNG_X;

// Rungs are drawn top-down from "high" (score 4) to "very low" (score 1).
function rungY(score: number): number {
  return 14 + (4 - score) * (RUNG_H + RUNG_GAP);
}

export function EvidenceGradeLadder({ caption, className }: EvidenceGradeLadderProps) {
  const t = useTranslations("viz.evidenceGradeLadder");
  const uid = useId();

  const [design, setDesign] = useState<Design>("randomized");
  const [flaws, setFlaws] = useState<Downgrade[]>([]);
  const [strengths, setStrengths] = useState<Upgrade[]>([]);

  const start = START_SCORE[design];
  const score = gradeScore(design, flaws.length, strengths.length);
  const level = LEVELS[score - 1];
  const tone = LEVEL_TONE[level];
  const moved = score - start;

  const toggle = <T extends string>(list: T[], set: (v: T[]) => void, value: T) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`licence.${level}`)}
      caption={caption}
      tone={level === "high" ? "teal" : level === "moderate" ? "cyan" : "amber"}
      className={className}
      controls={
        <SegmentedToggle<Design>
          ariaLabel={t("designLabel")}
          value={design}
          onChange={(d) => {
            setDesign(d);
            setFlaws([]);
            setStrengths([]);
          }}
          options={[
            { value: "randomized", label: t("design.randomized"), tone: "var(--teal)" },
            { value: "observational", label: t("design.observational"), tone: "var(--amber)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full lg:w-1/2"
          role="img"
          aria-label={`${t("certainty")}: ${t(`level.${level}`)}`}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta"]} />
          {LEVELS.map((key, index) => {
            const rungScore = index + 1;
            const y = rungY(rungScore);
            const active = rungScore === score;
            const isStart = rungScore === start;
            const c = LEVEL_TONE[key];
            return (
              <g key={key}>
                <rect
                  x={RUNG_X}
                  y={y}
                  width={RUNG_W}
                  height={RUNG_H}
                  rx={7}
                  fill={
                    active ? `color-mix(in oklab, ${c} 22%, var(--void))` : "var(--surface-raised)"
                  }
                  style={{ stroke: active ? c : "var(--border)" }}
                  strokeWidth={active ? 2 : 1}
                  strokeDasharray={!active && isStart ? "4 3" : undefined}
                  filter={active ? glowUrl(uid, "bloom") : undefined}
                />
                <VizText
                  x={RUNG_X + 12}
                  y={y + RUNG_H / 2 + 3.5}
                  size="base"
                  tone={active ? c : "subtle"}
                  weight={700}
                >
                  {t(`level.${key}`)}
                </VizText>
                {isStart ? (
                  <VizText
                    x={RUNG_X + RUNG_W - 12}
                    y={y + RUNG_H / 2 + 3}
                    size="micro"
                    tone="muted"
                    anchor="end"
                  >
                    {t("startsHere")}
                  </VizText>
                ) : null}
                {active && !isStart ? (
                  <VizText
                    x={RUNG_X + RUNG_W - 12}
                    y={y + RUNG_H / 2 + 3}
                    size="micro"
                    tone={c}
                    anchor="end"
                  >
                    {moved > 0 ? t("liftedTo") : t("draggedTo")}
                  </VizText>
                ) : null}
              </g>
            );
          })}
        </svg>

        <div className="flex w-full flex-col gap-3 lg:w-1/2">
          <VizReadout label={t("certainty")} value={t(`level.${level}`)} tone={tone} tinted />
          <VizReadout
            label={t("netMove")}
            value={moved === 0 ? t("noMove") : `${moved > 0 ? "+" : ""}${moved}`}
            tone={moved < 0 ? "var(--magenta)" : moved > 0 ? "var(--teal)" : "var(--muted)"}
            note={`${t("startedAt")} ${t(`level.${LEVELS[start - 1]}`)}`}
          />
        </div>
      </div>

      <FactorGroup
        legend={t("flawsLabel")}
        tone="var(--magenta)"
        options={DOWNGRADES}
        selected={flaws}
        label={(k) => t(`flaw.${k}`)}
        onToggle={(k) => toggle(flaws, setFlaws, k)}
      />
      <FactorGroup
        legend={t("strengthsLabel")}
        tone="var(--teal)"
        options={UPGRADES}
        selected={strengths}
        label={(k) => t(`strength.${k}`)}
        onToggle={(k) => toggle(strengths, setStrengths, k)}
      />
    </VizFigure>
  );
}
