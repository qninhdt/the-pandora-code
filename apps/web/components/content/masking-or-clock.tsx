"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type Mechanism = "clock" | "masking";

interface MaskingOrClockProps {
  caption?: string;
  className?: string;
}

// The release-into-constant-darkness test, the founding diagnostic of the field.
// Under a normal light cycle a true endogenous clock and a light-driven reflex
// (masking) produce identical activity records. Remove the light cycle and they
// diverge: the clock free-runs, drifting by (tau - 24) each day and revealing an
// internal oscillator; the masked behaviour loses its only timing source and
// scatters. Toggle picks the mechanism; the record shows both phases.

const DAYS = 10;
const CYCLE_DAYS = 4; // days of entraining light cycle before release into darkness
const TAU = 25.1; // the free-running period the clock reverts to, hours
const ONSET_LD = 12.5; // activity onset under the light cycle, hours into the day

const W = 420;
const H = 250;
const PAD_L = 46;
const PAD_T = 22;
const ROW_H = 20;
const PLOT_W = W - PAD_L - 18;

function xForHour(hour: number): number {
  return PAD_L + (hour / 24) * PLOT_W;
}

// Activity onset per day. During the light cycle both mechanisms sit at the same
// hour. After release, the clock drifts by (TAU - 24) per day; masking has no
// timing source at all, so it returns null and is drawn as scatter.
function onsetForDay(day: number, mechanism: Mechanism): number | null {
  if (day < CYCLE_DAYS) return ONSET_LD;
  const daysFree = day - CYCLE_DAYS + 1;
  if (mechanism === "clock") return ONSET_LD + daysFree * (TAU - 24);
  return null;
}

// Deterministic pseudo-random scatter so SSR and client agree. Masked activity
// with no cue does not vanish; it loses its daily organisation.
function scatterBouts(day: number): { hour: number; w: number }[] {
  const bouts: { hour: number; w: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const seed = (day * 7 + i * 13) % 23;
    bouts.push({ hour: (seed / 23) * 22 + 0.5, w: 1.1 + (seed % 3) * 0.5 });
  }
  return bouts;
}

export function MaskingOrClock({ caption, className }: MaskingOrClockProps) {
  const t = useTranslations("viz.maskingOrClock");
  const idBase = useId();
  const [mechanism, setMechanism] = useState<Mechanism>("clock");

  const tone = mechanism === "clock" ? "var(--teal)" : "var(--magenta)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={mechanism === "clock" ? "teal" : "magenta"}
      caption={caption ?? t("caption")}
      hint={t("hint")}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("mechanismLabel")}
          value={mechanism}
          onChange={setMechanism}
          options={[
            { value: "clock", label: t("clockOption"), tone: "var(--teal)" },
            { value: "masking", label: t("maskingOption"), tone: "var(--magenta)" },
          ]}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-[1.7fr_1fr]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
          <GlowDefs idBase={idBase} tones={["teal", "magenta", "cyan"]} />

          {/* Night shading for the entrained phase: the light cycle's dark half */}
          {Array.from({ length: CYCLE_DAYS }, (_, day) => (
            <rect
              key={`night-${day}`}
              x={xForHour(12)}
              y={PAD_T + day * ROW_H}
              width={xForHour(24) - xForHour(12)}
              height={ROW_H - 3}
              fill="var(--cyan)"
              opacity={0.08}
            />
          ))}

          {/* Constant darkness after release */}
          <rect
            x={PAD_L}
            y={PAD_T + CYCLE_DAYS * ROW_H}
            width={PLOT_W}
            height={(DAYS - CYCLE_DAYS) * ROW_H - 3}
            fill="var(--void)"
            opacity={0.5}
          />

          {/* The release line */}
          <line
            x1={PAD_L - 6}
            y1={PAD_T + CYCLE_DAYS * ROW_H - 1.5}
            x2={W - 14}
            y2={PAD_T + CYCLE_DAYS * ROW_H - 1.5}
            stroke="var(--amber)"
            strokeWidth={1.2}
            strokeDasharray="4 3"
          />
          <VizText
            x={W - 14}
            y={PAD_T + CYCLE_DAYS * ROW_H - 5}
            size="micro"
            tone="amber"
            anchor="end"
          >
            {t("releaseLabel")}
          </VizText>

          {/* Activity records, one row per day */}
          {Array.from({ length: DAYS }, (_, day) => {
            const y = PAD_T + day * ROW_H;
            const onset = onsetForDay(day, mechanism);
            return (
              <g key={`day-${day}`}>
                <VizText x={PAD_L - 8} y={y + 9} size="micro" anchor="end" numeric>
                  {day + 1}
                </VizText>
                {onset === null ? (
                  scatterBouts(day).map((b, i) => (
                    <rect
                      key={`s-${i}`}
                      x={xForHour(b.hour)}
                      y={y + 2}
                      width={(b.w / 24) * PLOT_W}
                      height={ROW_H - 8}
                      rx={1.5}
                      fill={tone}
                      opacity={0.75}
                    />
                  ))
                ) : (
                  <rect
                    x={xForHour(onset % 24)}
                    y={y + 2}
                    width={(7 / 24) * PLOT_W}
                    height={ROW_H - 8}
                    rx={1.5}
                    fill={tone}
                    opacity={0.9}
                    filter={day >= CYCLE_DAYS ? glowUrl(idBase, "bloom") : undefined}
                  />
                )}
              </g>
            );
          })}

          {/* Hour axis */}
          {[0, 6, 12, 18, 24].map((hr) => (
            <VizText
              key={hr}
              x={xForHour(hr)}
              y={PAD_T + DAYS * ROW_H + 12}
              size="micro"
              anchor="middle"
              numeric
            >
              {hr}
            </VizText>
          ))}
          <VizText x={PAD_L} y={14} size="micro">
            {t("hourAxis")}
          </VizText>
          <VizText x={PAD_L - 8} y={14} size="micro" anchor="end">
            {t("dayAxis")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2">
          <VizReadout
            label={t("underCycleLabel")}
            value={t("underCycleValue")}
            note={t("underCycleNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("afterReleaseLabel")}
            value={mechanism === "clock" ? t("afterClockValue") : t("afterMaskingValue")}
            note={mechanism === "clock" ? t("afterClockNote") : t("afterMaskingNote")}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("verdictLabel")}
            value={mechanism === "clock" ? t("verdictClock") : t("verdictMasking")}
            note={mechanism === "clock" ? t("verdictClockNote") : t("verdictMaskingNote")}
            tone={tone}
          />
        </div>
      </div>
    </VizFigure>
  );
}
