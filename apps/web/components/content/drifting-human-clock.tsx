"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type Setting = "pandora" | "mars";

interface DriftingHumanClockProps {
  caption?: string;
  className?: string;
}

// Free-running: what happens when a world's day sits outside a clock's range of
// entrainment. A human clock runs ~24.2 h and can absorb roughly an hour of daily
// correction. Pandora asks for ~1.8 h and Mars for ~0.65 h — one impossible, one
// merely damaging. Step through days and watch the body's sleep block walk out of
// phase with local time. Constants are the established figures; strings translated.

const HUMAN_TAU = 24.2;
const MAX_DAILY_SHIFT = 1.0;

const SETTINGS: Record<Setting, { day: number; tone: string }> = {
  pandora: { day: 26, tone: "var(--magenta)" },
  mars: { day: 24.65, tone: "var(--amber)" },
};

const DAYS = 12;
const SLEEP_LEN = 8; // hours of the body's sleep block
const BODY_SLEEP_START = 23; // hour of the body's own night, on day zero

const W = 430;
const ROW_H = 17;
const PAD_L = 34;
const PAD_T = 26;

export function DriftingHumanClock({ caption, className }: DriftingHumanClockProps) {
  const t = useTranslations("viz.driftingClock");
  const idBase = useId();
  const [setting, setSetting] = useState<Setting>("pandora");
  const [day, setDay] = useState(6);

  const worldDay = SETTINGS[setting].day;
  const tone = SETTINGS[setting].tone;

  // Each local day, the body's clock falls behind by (worldDay - tau) hours,
  // because it cannot be dragged the full distance the world demands.
  const requiredShift = worldDay - HUMAN_TAU;
  const entrainable = Math.abs(requiredShift) <= MAX_DAILY_SHIFT;
  // Even a partially entrainable clock only absorbs what it can; the remainder
  // accumulates as drift.
  const driftPerDay = entrainable ? 0 : requiredShift - MAX_DAILY_SHIFT;
  const totalDrift = driftPerDay * day;

  const plotW = W - PAD_L - 16;
  const H = PAD_T + DAYS * ROW_H + 30;

  const xForHour = (hour: number) => PAD_L + (hour / worldDay) * plotW;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={setting === "pandora" ? "magenta" : "amber"}
      caption={caption ?? t("caption")}
      hint={t("hint")}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("settingLabel")}
          value={setting}
          onChange={setSetting}
          options={[
            { value: "pandora", label: t("pandoraOption"), tone: "var(--magenta)" },
            { value: "mars", label: t("marsOption"), tone: "var(--amber)" },
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
        <GlowDefs idBase={idBase} tones={["cyan", "teal", "magenta", "amber"]} />

        {/* Local night: the world's own dark phase, fixed in local time */}
        {Array.from({ length: DAYS }, (_, d) => (
          <rect
            key={`ln-${d}`}
            x={xForHour(worldDay / 2)}
            y={PAD_T + d * ROW_H}
            width={xForHour(worldDay) - xForHour(worldDay / 2)}
            height={ROW_H - 2}
            fill="var(--cyan)"
            opacity={0.09}
          />
        ))}
        <VizText
          x={xForHour(worldDay * 0.75)}
          y={PAD_T - 8}
          size="micro"
          tone="cyan"
          anchor="middle"
        >
          {t("localNightLabel")}
        </VizText>

        {/* The body's sleep block, sliding a little later each local day */}
        {Array.from({ length: DAYS }, (_, d) => {
          const start = (BODY_SLEEP_START + driftPerDay * d) % worldDay;
          const past = d <= day;
          const wrap = start + SLEEP_LEN > worldDay;
          const w1 = wrap ? worldDay - start : SLEEP_LEN;
          return (
            <g key={`bs-${d}`} opacity={past ? 1 : 0.22}>
              <rect
                x={xForHour(start)}
                y={PAD_T + d * ROW_H + 2}
                width={(w1 / worldDay) * plotW}
                height={ROW_H - 6}
                rx={2}
                fill={tone}
                opacity={0.9}
                filter={d === day ? glowUrl(idBase, "bloom") : undefined}
              />
              {wrap ? (
                <rect
                  x={xForHour(0)}
                  y={PAD_T + d * ROW_H + 2}
                  width={((SLEEP_LEN - w1) / worldDay) * plotW}
                  height={ROW_H - 6}
                  rx={2}
                  fill={tone}
                  opacity={0.9}
                />
              ) : null}
              <VizText x={PAD_L - 7} y={PAD_T + d * ROW_H + 11} size="micro" anchor="end" numeric>
                {d + 1}
              </VizText>
            </g>
          );
        })}

        {/* Local-time axis */}
        <line
          x1={PAD_L}
          y1={PAD_T + DAYS * ROW_H}
          x2={W - 16}
          y2={PAD_T + DAYS * ROW_H}
          stroke="var(--border)"
        />
        {[0, worldDay / 4, worldDay / 2, (worldDay * 3) / 4, worldDay].map((hr, i) => (
          <VizText
            key={i}
            x={xForHour(hr)}
            y={PAD_T + DAYS * ROW_H + 13}
            size="micro"
            anchor="middle"
            numeric
          >
            {hr.toFixed(0)}
          </VizText>
        ))}
        <VizText x={W - 16} y={PAD_T + DAYS * ROW_H + 26} size="micro" anchor="end">
          {t("axisLabel")}
        </VizText>
        <VizText x={PAD_L - 7} y={PAD_T - 8} size="micro" anchor="end">
          {t("dayAxis")}
        </VizText>
      </svg>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("requiredLabel")}
          value={`${requiredShift.toFixed(2)} h`}
          note={t("requiredNote")}
          tone="var(--cyan)"
        />
        <VizReadout
          label={t("capacityLabel")}
          value={`${MAX_DAILY_SHIFT.toFixed(1)} h`}
          note={t("capacityNote")}
          tone="var(--teal)"
        />
        <VizReadout
          label={t("driftLabel")}
          value={`${totalDrift.toFixed(1)} h`}
          note={t("driftNote", { days: day + 1 })}
          tone={tone}
          tinted
        />
      </div>

      <VizSlider
        label={t("dayLabel")}
        display={`${day + 1} / ${DAYS}`}
        min={0}
        max={DAYS - 1}
        step={1}
        value={day}
        onChange={setDay}
        tone={tone}
        className="mt-3"
      />
    </VizFigure>
  );
}
