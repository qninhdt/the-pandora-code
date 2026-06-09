"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface TwentySecondsTimelineProps {
  caption?: string;
  className?: string;
}

const MAX_T = 20; // seconds of consciousness after the mask comes off
const DEFAULT_T = 8; // deterministic SSR default: mid-crisis, the paradox is visible
const SWEEP_PERIOD = MAX_T / 2.2; // seconds to play out the 20s window

// The physiological sequence, paced to the chapter's "about twenty seconds". The
// timing (`at`) is the science; the title/body copy lives in messages.
const STAGES = [
  { at: 0, key: "maskOff" },
  { at: 3, key: "h2sFloods" },
  { at: 8, key: "histotoxic" },
  { at: 14, key: "collapse" },
  { at: 18, key: "unconscious" },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

function currentStageKey(t: number): StageKey {
  let key: StageKey = STAGES[0].key;
  for (const stage of STAGES) if (t >= stage.at) key = stage.key;
  return key;
}

// An interactive timeline of the "twenty seconds" the chapter opens on. The
// reader scrubs from mask-off to collapse and watches the central paradox: blood
// oxygen stays full while the oxygen cells can use crashes, because hydrogen
// sulfide jams the mitochondrial enzyme. SVG bars + a range input, deterministic
// for SSR, with an optional reduced-motion-gated play loop.
export function TwentySecondsTimeline({ caption, className }: TwentySecondsTimelineProps) {
  const t = useTranslations("viz.journeyTimeline");
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [playing, setPlaying] = useState(false);
  // Phase loop drives the playback; reduced-motion freezes advancement.
  const { phase, setPhase } = usePhaseLoop({
    period: SWEEP_PERIOD,
    playing,
    initial: DEFAULT_T / MAX_T,
  });
  // Manual time override when the reader scrubs the slider.
  const [manualTime, setManualTime] = useState<number | null>(null);

  const time = manualTime ?? phase * MAX_T;

  function scrub(next: number) {
    setPlaying(false);
    setManualTime(next);
    setPhase(next / MAX_T);
  }

  function reset() {
    setPlaying(false);
    setManualTime(0);
    setPhase(0);
  }

  function togglePlay() {
    setManualTime(null); // hand control back to the loop
    setPlaying((p) => !p);
  }

  // Blood stays oxygen-rich; usable oxygen decays once H₂S takes hold (~after 2s).
  const bloodO2 = 100;
  const usableO2 = Math.round(100 * Math.exp(-Math.max(0, time - 2) / 6));
  const stageKey = currentStageKey(time);
  const stageTitle = t(`stages.${stageKey}.title`);
  const stageBody = t(`stages.${stageKey}.body`);

  const BAR_X = 168;
  const BAR_W = 240;
  const bar = (value: number) => (value / 100) * BAR_W;

  return (
    <VizFigure
      title={t("title")}
      hint={reduced ? undefined : t("hint")}
      caption={caption}
      tone="magenta"
      className={className}
      controls={
        <>
          {!reduced && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? t("pause") : t("play")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-magenta transition-all hover:border-magenta/60 hover:bg-void/70 hover:shadow-[0_0_0_1px_var(--magenta),0_0_16px_-3px_var(--magenta)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            aria-label={t("reset")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-muted transition-all hover:border-magenta/40 hover:bg-void/70 hover:text-magenta hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--magenta)_45%,transparent),0_0_14px_-3px_var(--magenta)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta"
          >
            <RotateCcw size={15} />
          </button>
        </>
      }
    >
      <svg
        viewBox="0 0 460 168"
        className="w-full"
        role="img"
        aria-label={t("aria", { time: time.toFixed(0), stage: stageTitle })}
      >
        <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />
        {/* big countdown */}
        <VizText
          x={20}
          y={52}
          tone="magenta"
          numeric
          weight={800}
          className="font-display"
          style={{ fontSize: 46 }}
        >
          {time.toFixed(0)}
        </VizText>
        <VizText x={22} y={70} size="small">
          {t("seconds")}
        </VizText>

        {/* blood O2 bar — stays full */}
        <VizText x={BAR_X} y={36} size="small" tone="teal">
          {t("bloodO2")}
        </VizText>
        <rect
          x={BAR_X}
          y={42}
          width={BAR_W}
          height={16}
          rx={5}
          fill="var(--void)"
          stroke="var(--border)"
          strokeWidth={1}
        />
        <rect
          x={BAR_X}
          y={42}
          width={bar(bloodO2)}
          height={16}
          rx={5}
          fill="var(--teal)"
          filter={glowUrl(uid, "bloom")}
        />
        <VizText
          x={BAR_X + BAR_W + 6}
          y={54}
          size="small"
          tone="teal"
          numeric
          className="font-display"
        >
          {bloodO2}%
        </VizText>

        {/* usable O2 bar — collapses */}
        <VizText x={BAR_X} y={92} size="small" tone="amber">
          {t("usableO2")}
        </VizText>
        <rect
          x={BAR_X}
          y={98}
          width={BAR_W}
          height={16}
          rx={5}
          fill="var(--void)"
          stroke="var(--border)"
          strokeWidth={1}
        />
        <rect
          x={BAR_X}
          y={98}
          width={bar(usableO2)}
          height={16}
          rx={5}
          fill="var(--amber)"
          filter={glowUrl(uid, "bloom")}
        />
        <VizText
          x={BAR_X + BAR_W + 6}
          y={110}
          size="small"
          tone="amber"
          numeric
          className="font-display"
        >
          {usableO2}%
        </VizText>

        {/* stage markers along a mini timeline */}
        <line
          x1={BAR_X}
          y1={140}
          x2={BAR_X + BAR_W}
          y2={140}
          stroke="var(--border-strong)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* elapsed portion of the track, lit in tone */}
        <line
          x1={BAR_X}
          y1={140}
          x2={BAR_X + (Math.min(time, MAX_T) / MAX_T) * BAR_W}
          y2={140}
          stroke="var(--magenta)"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.55}
        />
        {STAGES.map((s) => {
          const x = BAR_X + (s.at / MAX_T) * BAR_W;
          const active = time >= s.at;
          return (
            <circle
              key={s.at}
              cx={x}
              cy={140}
              r={active ? 4 : 3}
              fill={active ? "var(--magenta)" : "var(--border-strong)"}
              filter={active ? glowUrl(uid, "soft-shadow") : undefined}
            />
          );
        })}
        {/* current-moment marker — a glowing pin riding the track */}
        <circle
          cx={BAR_X + (Math.min(time, MAX_T) / MAX_T) * BAR_W}
          cy={140}
          r={6}
          fill="var(--magenta)"
          filter={glowUrl(uid, "bloom-strong")}
        />
        <circle
          cx={BAR_X + (Math.min(time, MAX_T) / MAX_T) * BAR_W}
          cy={140}
          r={2.4}
          fill="var(--void)"
          opacity={0.6}
        />
      </svg>

      {/* stage text */}
      <div className="mt-1 rounded-lg border border-border bg-void/30 px-3 py-2">
        <p className="font-display text-sm font-700" style={{ color: "var(--magenta)" }}>
          {stageTitle}
        </p>
        <p className="mt-0.5 font-serif text-sm leading-relaxed text-muted">{stageBody}</p>
      </div>

      {/* control */}
      <input
        id={`${uid}-t`}
        type="range"
        min={0}
        max={MAX_T}
        step={0.1}
        value={time}
        onChange={(e) => scrub(Number(e.target.value))}
        aria-label={t("timeline")}
        className="viz-range mt-3 w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        style={{
          background: `linear-gradient(to right, var(--magenta) ${(time / MAX_T) * 100}%, var(--border) ${(time / MAX_T) * 100}%)`,
          ["--viz-thumb" as string]: "var(--magenta)",
        }}
      />
    </VizFigure>
  );
}
