"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { useTranslations } from "next-intl";
import { useState } from "react";

// Pandora keeps two independent records of its own past, and the chapter's claim
// is that their blind spots are complementary rather than overlapping. Eywa's
// network holds what something alive experienced and was connected to relay; the
// rock holds what happened, including everywhere nothing was networked to notice.
// Pick a question and the grid shows which archive can answer it and which is
// structurally — not accidentally — unable to.

type ArchiveKey = "neural" | "songcord" | "rock";
type QuestionKey = "grandmotherSong" | "lastHunt" | "anoxicEvent" | "stemAncestor";

/** How well an archive can answer a question. */
type Verdict = "answers" | "partial" | "blind";

const ARCHIVES: ArchiveKey[] = ["neural", "songcord", "rock"];
const QUESTIONS: QuestionKey[] = ["grandmotherSong", "lastHunt", "anoxicEvent", "stemAncestor"];

const ARCHIVE_TONE: Record<ArchiveKey, string> = {
  neural: "var(--teal)",
  songcord: "var(--amber)",
  rock: "var(--cyan)",
};

const VERDICT_TONE: Record<Verdict, string> = {
  answers: "var(--teal)",
  partial: "var(--amber)",
  blind: "var(--magenta)",
};

// The grid. Read a row as "this question, put to each of the three archives".
const MATRIX: Record<QuestionKey, Record<ArchiveKey, Verdict>> = {
  // A song a specific person sang: experiential, recent, and networked.
  grandmotherSong: { neural: "answers", songcord: "partial", rock: "blind" },
  // A hunt last season: witnessed and told, but it leaves nothing in the ground.
  lastHunt: { neural: "answers", songcord: "answers", rock: "blind" },
  // An ocean that went anoxic long before anything was there to remember it.
  anoxicEvent: { neural: "blind", songcord: "blind", rock: "answers" },
  // The ancestor that predates the queue itself, so it was never on the network.
  stemAncestor: { neural: "blind", songcord: "blind", rock: "partial" },
};

/** Which archive to trust for this question, for the summary readout. */
function bestArchive(question: QuestionKey): ArchiveKey | null {
  const row = MATRIX[question];
  return (
    ARCHIVES.find((a) => row[a] === "answers") ?? ARCHIVES.find((a) => row[a] === "partial") ?? null
  );
}

interface ArchiveBlindspotMatrixProps {
  caption?: string;
  className?: string;
}

export function ArchiveBlindspotMatrix({ caption, className }: ArchiveBlindspotMatrixProps) {
  const t = useTranslations("viz.archiveBlindspot");
  const [question, setQuestion] = useState<QuestionKey>("grandmotherSong");

  const row = MATRIX[question];
  const best = bestArchive(question);
  const blindCount = ARCHIVES.filter((a) => row[a] === "blind").length;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${question}`)}
      caption={caption}
      tone={best === "rock" ? "cyan" : best === "neural" ? "teal" : "amber"}
      className={className}
      controls={
        <SegmentedToggle<QuestionKey>
          options={QUESTIONS.map((q) => ({
            value: q,
            label: t(`questionShort.${q}`),
            tone: MATRIX[q].rock === "blind" ? "var(--teal)" : "var(--cyan)",
          }))}
          value={question}
          onChange={setQuestion}
          ariaLabel={t("controls.question")}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <p className="font-serif text-sm leading-relaxed text-muted">{t(`question.${question}`)}</p>

        <div className="grid gap-2 sm:grid-cols-3">
          {ARCHIVES.map((archive) => {
            const verdict = row[archive];
            const tone = VERDICT_TONE[verdict];
            return (
              <div
                key={archive}
                className="relative overflow-hidden rounded-lg border px-3 py-3"
                style={{
                  borderColor: `color-mix(in oklab, ${tone} ${verdict === "blind" ? 35 : 50}%, transparent)`,
                  background: `color-mix(in oklab, ${tone} ${verdict === "blind" ? 5 : 10}%, var(--void))`,
                }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="font-display text-sm font-700"
                    style={{ color: ARCHIVE_TONE[archive] }}
                  >
                    {t(`archive.${archive}`)}
                  </span>
                  <span
                    className="font-sans text-xs font-600 uppercase tracking-wider"
                    style={{ color: tone }}
                  >
                    {t(`verdict.${verdict}`)}
                  </span>
                </div>
                <p className="mt-2 font-sans text-xs leading-relaxed text-subtle">
                  {t(`reason.${question}.${archive}`)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <VizReadout
            label={t("readout.trust")}
            value={best ? t(`archive.${best}`) : t("readout.none")}
            note={best ? t(`archiveNote.${best}`) : undefined}
            tone={best ? ARCHIVE_TONE[best] : "var(--subtle)"}
            tinted
          />
          <VizReadout
            label={t("readout.blind")}
            value={`${blindCount} / ${ARCHIVES.length}`}
            note={t("readout.blindNote")}
            tone={blindCount > 1 ? "var(--magenta)" : "var(--teal)"}
          />
        </div>
      </div>
    </VizFigure>
  );
}
