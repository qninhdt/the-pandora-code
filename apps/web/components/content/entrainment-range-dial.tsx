"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface EntrainmentRangeDialProps {
  caption?: string;
  className?: string;
}

// The range of entrainment. A clock with its own free-running period (tau) can be
// held to a world whose day (T) is close to tau, because light can only shift the
// clock by a limited amount each cycle. The required daily correction is |T - tau|;
// once that exceeds the clock's maximum daily shift, entrainment fails and the
// oscillator breaks free and runs on tau, letting the world's day slide past.
// Slider sets T; the figure reports required correction vs available capacity and
// the resulting state. Scientific constants stay in code; strings are translated.

const HUMAN_TAU = 24.2; // hours, human free-running period in temporal isolation
const MAX_DAILY_SHIFT = 1.0; // hours of daily phase shift available under ordinary light
const T_MIN = 20;
const T_MAX = 30;

// Reference day lengths marked on the axis. `key` selects the translated label.
const MARKS: { key: string; T: number; tone: string }[] = [
  { key: "earth", T: 24, tone: "var(--teal)" },
  { key: "mars", T: 24.65, tone: "var(--amber)" },
  { key: "pandora", T: 26, tone: "var(--magenta)" },
];

const W = 460;
const H = 176;
const AXIS_Y = 116;
const PAD_X = 34;

function xForT(T: number): number {
  return PAD_X + ((T - T_MIN) / (T_MAX - T_MIN)) * (W - PAD_X * 2);
}

export function EntrainmentRangeDial({ caption, className }: EntrainmentRangeDialProps) {
  const t = useTranslations("viz.entrainmentRange");
  const idBase = useId();
  const [dayLength, setDayLength] = useState(26);

  const required = Math.abs(dayLength - HUMAN_TAU);
  const locked = required <= MAX_DAILY_SHIFT;

  // Edges of the entrainable band around tau.
  const bandLo = HUMAN_TAU - MAX_DAILY_SHIFT;
  const bandHi = HUMAN_TAU + MAX_DAILY_SHIFT;
  const bandX = xForT(bandLo);
  const bandW = xForT(bandHi) - bandX;

  const stateTone = locked ? "var(--teal)" : "var(--magenta)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={locked ? "teal" : "magenta"}
      caption={caption ?? t("caption")}
      hint={t("hint")}
      className={className}
    >
      <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
          <GlowDefs idBase={idBase} tones={["teal", "magenta", "amber", "cyan"]} />

          {/* Entrainable band around the clock's own period */}
          <rect
            x={bandX}
            y={AXIS_Y - 52}
            width={bandW}
            height={52}
            rx={4}
            fill="var(--teal)"
            opacity={0.14}
          />
          <VizText x={bandX + bandW / 2} y={AXIS_Y - 58} size="micro" tone="teal" anchor="middle">
            {t("bandLabel")}
          </VizText>

          {/* Axis */}
          <line
            x1={PAD_X}
            y1={AXIS_Y}
            x2={W - PAD_X}
            y2={AXIS_Y}
            stroke="var(--border)"
            strokeWidth={1}
          />
          {[20, 22, 24, 26, 28, 30].map((tick) => (
            <g key={tick}>
              <line
                x1={xForT(tick)}
                y1={AXIS_Y}
                x2={xForT(tick)}
                y2={AXIS_Y + 5}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <VizText x={xForT(tick)} y={AXIS_Y + 16} size="micro" anchor="middle" numeric>
                {tick}
              </VizText>
            </g>
          ))}
          <VizText x={W - PAD_X} y={AXIS_Y + 30} size="micro" anchor="end">
            {t("axisLabel")}
          </VizText>

          {/* The clock's own period */}
          <line
            x1={xForT(HUMAN_TAU)}
            y1={AXIS_Y - 52}
            x2={xForT(HUMAN_TAU)}
            y2={AXIS_Y}
            stroke="var(--teal)"
            strokeWidth={1.5}
            strokeDasharray="3 2"
          />
          <VizText x={xForT(HUMAN_TAU)} y={AXIS_Y - 40} size="micro" tone="teal" anchor="middle">
            {t("tauLabel")}
          </VizText>

          {/* Reference worlds */}
          {MARKS.map((m) => (
            <g key={m.key}>
              <circle
                cx={xForT(m.T)}
                cy={AXIS_Y}
                r={3.2}
                fill={m.tone}
                filter={glowUrl(idBase, "bloom")}
              />
              <VizText x={xForT(m.T)} y={AXIS_Y - 8} size="micro" tone={m.tone} anchor="middle">
                {t(`marks.${m.key}`)}
              </VizText>
            </g>
          ))}

          {/* The selected day length */}
          <g filter={glowUrl(idBase, "bloom-strong")}>
            <line
              x1={xForT(dayLength)}
              y1={AXIS_Y - 68}
              x2={xForT(dayLength)}
              y2={AXIS_Y + 6}
              stroke={stateTone}
              strokeWidth={2}
            />
            <circle cx={xForT(dayLength)} cy={AXIS_Y - 68} r={4} fill={stateTone} />
          </g>
        </svg>

        <div className="flex flex-col gap-2">
          <VizReadout
            label={t("requiredLabel")}
            value={`${required.toFixed(2)} h`}
            note={t("requiredNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("capacityLabel")}
            value={`${MAX_DAILY_SHIFT.toFixed(1)} h`}
            note={t("capacityNote")}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("stateLabel")}
            value={locked ? t("stateLocked") : t("stateFree")}
            note={locked ? t("stateLockedNote") : t("stateFreeNote")}
            tone={stateTone}
            tinted
          />
        </div>
      </div>

      <VizSlider
        label={t("dayLengthLabel")}
        display={`${dayLength.toFixed(2)} h`}
        min={T_MIN}
        max={T_MAX}
        step={0.05}
        value={dayLength}
        onChange={setDayLength}
        tone={stateTone}
        className="mt-4"
      />
    </VizFigure>
  );
}
