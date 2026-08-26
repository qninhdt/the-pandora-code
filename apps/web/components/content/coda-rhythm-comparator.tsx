"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  TRACK,
  TRACK_SPAN,
  VOICE_ROWS,
  type Voice,
  onsetX,
  rowY,
  tightestGap,
} from "./coda-rhythm-comparator-model";

// Four tracks of pure timing. The reader should notice that nothing about the
// *sound* is on screen — every mark is the same click — and that the clans are
// still unmistakably different, because rhythm alone is carrying a social
// border. Then the tulkun row refuses to resolve, which is where the film's
// assertion of language outruns anything a hydrophone could analyse.
// Row data and geometry live in coda-rhythm-comparator-model.ts.

interface CodaRhythmComparatorProps {
  caption?: string;
  className?: string;
}

export function CodaRhythmComparator({ caption, className }: CodaRhythmComparatorProps) {
  const uid = useId();
  const t = useTranslations("viz.codaRhythmComparator");
  const reduced = useReducedMotionSafe();
  const [voice, setVoice] = useState<Voice>("plusOneOneThree");
  const [sympatric, setSympatric] = useState(false);
  const [playing, setPlaying] = useState(true);
  const { phase } = usePhaseLoop({ period: 3.2, playing: playing && !reduced, initial: 0 });

  const selected = VOICE_ROWS.find((r) => r.id === voice) ?? VOICE_ROWS[0];
  const isTulkun = voice === "tulkun";
  const tone = selected.tone;
  const gap = tightestGap(selected);
  const playX = onsetX(phase);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(isTulkun ? "hint.tulkun" : sympatric ? "hint.sympatric" : "hint.clan")}
      caption={caption}
      tone={isTulkun ? "magenta" : "cyan"}
      className={className}
      controls={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSympatric((s) => !s)}
            aria-pressed={sympatric}
            className={cn(
              "rounded-lg border px-3 py-2 font-sans text-xs font-600 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan",
              sympatric
                ? "border-cyan/60 bg-cyan/10 text-cyan"
                : "border-border bg-void/40 text-subtle hover:text-foreground",
            )}
          >
            {t("sympatricToggle")}
          </button>
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t("pause") : t("play")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-all hover:border-cyan/60 hover:bg-void/70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${TRACK.width} ${TRACK.height}`}
          className="w-full rounded-xl border border-border/60 bg-void/50 sm:w-3/5"
          role="img"
          aria-label={t("aria", { voice: t(`voice.${voice}`) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />
          <VizText x={TRACK.x} y={18} size="micro" tone="var(--subtle)">
            {t("timeAxis")}
          </VizText>

          {VOICE_ROWS.map((row, index) => {
            const shown = sympatric || row.id === voice;
            const active = row.id === voice;
            const y = rowY(index);
            return (
              <g key={row.id} opacity={shown ? 1 : 0.22}>
                <VizText
                  x={TRACK.x - 8}
                  y={y + 3}
                  size="micro"
                  anchor="end"
                  tone={active ? row.tone : "var(--subtle)"}
                  weight={active ? 700 : 400}
                >
                  {t(`voice.${row.id}`)}
                </VizText>
                <line
                  x1={TRACK.x}
                  y1={y}
                  x2={TRACK.x + TRACK_SPAN}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth={0.8}
                />
                {row.onsets.length === 0 ? (
                  <>
                    <rect
                      x={TRACK.x}
                      y={y - 7}
                      width={TRACK_SPAN}
                      height={14}
                      rx={7}
                      fill={row.tone}
                      opacity={0.18}
                    />
                    <VizText
                      x={TRACK.x + TRACK_SPAN / 2}
                      y={y + 3}
                      size="micro"
                      anchor="middle"
                      tone={row.tone}
                    >
                      {t("unresolved")}
                    </VizText>
                  </>
                ) : (
                  row.onsets.map((f) => (
                    <rect
                      key={f}
                      x={onsetX(f) - 1.6}
                      y={y - 11}
                      width={3.2}
                      height={22}
                      rx={1.6}
                      fill={row.tone}
                      opacity={active ? 0.95 : 0.6}
                      filter={active ? glowUrl(uid, "bloom") : undefined}
                    />
                  ))
                )}
              </g>
            );
          })}

          <line
            x1={playX}
            y1={TRACK.rowTop - 16}
            x2={playX}
            y2={rowY(VOICE_ROWS.length - 1) + 16}
            stroke={tone}
            strokeWidth={1.2}
            strokeOpacity={0.75}
          />
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <SegmentedToggle
            options={VOICE_ROWS.map((r) => ({
              value: r.id,
              label: t(`voiceShort.${r.id}`),
              tone: r.tone,
            }))}
            value={voice}
            onChange={setVoice}
            ariaLabel={t("voiceLabel")}
            className="flex-wrap self-start"
          />
          <VizReadout
            label={t("readout.signature")}
            value={t(`signature.${voice}`)}
            note={t(`signatureNote.${voice}`)}
            tone={tone}
          />
          <VizReadout
            label={t("readout.gap")}
            value={
              gap === null
                ? t("readout.gapNone")
                : t("readout.gapValue", { pct: Math.round(gap * 100) })
            }
            note={t("readout.gapNote")}
            tone="var(--amber)"
          />
          <VizReadout label={t("readout.range")} value={t(`range.${voice}`)} tone="var(--cyan)" />
          <VizReadout
            label={t("readout.carries")}
            value={t(`carries.${voice}`)}
            note={t(`limit.${voice}`)}
            tone={tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
