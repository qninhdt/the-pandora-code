"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface TemporalNichePartitionProps {
  caption?: string;
  className?: string;
}

// Time as an axis of the niche. Scrub the Pandoran day and watch the roster hand
// over: the day shift settles as the night shift comes on, with the afternoon
// eclipse cutting a band of true dark into the bright phase. Each animal carries
// its canon tier, because the day-shift assignments are largely inferred from what
// the films show while several night-shift ones are stated in companion material.
type Tier = "stated" | "inferred";

interface Occupant {
  key: string;
  start: number; // activity window start, hours into the 26-hour day
  end: number;
  tone: "cyan" | "teal" | "magenta" | "amber";
  tier: Tier;
}

const DAY_HOURS = 26;
// Sun up at 0, down at ~13; the eclipse falls mid-afternoon.
const DUSK = 13;
const ECLIPSE_START = 9.5;
const ECLIPSE_END = 11.2;

const OCCUPANTS: Occupant[] = [
  { key: "banshee", start: 0.8, end: 13.6, tone: "amber", tier: "stated" },
  { key: "hexapede", start: 0.5, end: 12.8, tone: "amber", tier: "inferred" },
  { key: "prolemuris", start: 1.5, end: 12.2, tone: "amber", tier: "inferred" },
  { key: "viperwolf", start: 12.6, end: 25.4, tone: "magenta", tier: "stated" },
  { key: "thanator", start: 13.4, end: 24.6, tone: "magenta", tier: "stated" },
  { key: "fanLizard", start: 13.8, end: 25.0, tone: "teal", tier: "stated" },
];

const W = 440;
const ROW_H = 26;
const PAD_L = 84;
const PAD_T = 30;
const PLOT_W = W - PAD_L - 16;
const H = PAD_T + OCCUPANTS.length * ROW_H + 34;

function xForHour(hour: number): number {
  return PAD_L + (hour / DAY_HOURS) * PLOT_W;
}

function isActive(o: Occupant, hour: number): boolean {
  return hour >= o.start && hour <= o.end;
}

export function TemporalNichePartition({ caption, className }: TemporalNichePartitionProps) {
  const t = useTranslations("viz.temporalNiche");
  const idBase = useId();
  const [hour, setHour] = useState(10.4);

  const active = useMemo(() => OCCUPANTS.filter((o) => isActive(o, hour)), [hour]);
  const inEclipse = hour >= ECLIPSE_START && hour <= ECLIPSE_END;
  const isNight = hour > DUSK;

  const phaseKey = inEclipse ? "eclipse" : isNight ? "night" : "day";
  const phaseTone = inEclipse ? "var(--magenta)" : isNight ? "var(--teal)" : "var(--amber)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={inEclipse ? "magenta" : isNight ? "teal" : "amber"}
      caption={caption ?? t("caption")}
      hint={t("hint")}
      className={className}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
        <GlowDefs idBase={idBase} tones={["cyan", "teal", "magenta", "amber"]} />

        {/* Night half of the day */}
        <rect
          x={xForHour(DUSK)}
          y={PAD_T - 8}
          width={xForHour(DAY_HOURS) - xForHour(DUSK)}
          height={OCCUPANTS.length * ROW_H + 8}
          fill="var(--void)"
          opacity={0.55}
        />
        {/* The afternoon eclipse: a band of true dark inside the bright phase */}
        <rect
          x={xForHour(ECLIPSE_START)}
          y={PAD_T - 8}
          width={xForHour(ECLIPSE_END) - xForHour(ECLIPSE_START)}
          height={OCCUPANTS.length * ROW_H + 8}
          fill="var(--magenta)"
          opacity={0.16}
        />
        <VizText
          x={(xForHour(ECLIPSE_START) + xForHour(ECLIPSE_END)) / 2}
          y={PAD_T - 13}
          size="micro"
          tone="magenta"
          anchor="middle"
        >
          {t("eclipseLabel")}
        </VizText>
        <VizText x={xForHour(DUSK / 2)} y={PAD_T - 13} size="micro" tone="amber" anchor="middle">
          {t("dayLabel")}
        </VizText>
        <VizText
          x={xForHour((DUSK + DAY_HOURS) / 2)}
          y={PAD_T - 13}
          size="micro"
          tone="teal"
          anchor="middle"
        >
          {t("nightLabel")}
        </VizText>

        {/* Activity bars */}
        {OCCUPANTS.map((o, i) => {
          const y = PAD_T + i * ROW_H;
          const on = isActive(o, hour);
          const c = `var(--${o.tone})`;
          return (
            <g key={o.key}>
              <VizText
                x={PAD_L - 8}
                y={y + 12}
                size="small"
                anchor="end"
                tone={on ? o.tone : undefined}
              >
                {t(`occupants.${o.key}`)}
              </VizText>
              <VizText x={PAD_L - 8} y={y + 21} size="micro" anchor="end">
                {t(`tiers.${o.tier}`)}
              </VizText>
              <rect
                x={xForHour(o.start)}
                y={y + 3}
                width={xForHour(o.end) - xForHour(o.start)}
                height={ROW_H - 12}
                rx={3}
                fill={c}
                opacity={on ? 0.85 : 0.28}
                filter={on ? glowUrl(idBase, "bloom") : undefined}
              />
            </g>
          );
        })}

        {/* The scrub head */}
        <line
          x1={xForHour(hour)}
          y1={PAD_T - 8}
          x2={xForHour(hour)}
          y2={PAD_T + OCCUPANTS.length * ROW_H}
          stroke={phaseTone}
          strokeWidth={1.6}
          filter={glowUrl(idBase, "bloom")}
        />

        {/* Hour axis */}
        {[0, 6, 13, 19, 26].map((hr) => (
          <g key={hr}>
            <line
              x1={xForHour(hr)}
              y1={PAD_T + OCCUPANTS.length * ROW_H}
              x2={xForHour(hr)}
              y2={PAD_T + OCCUPANTS.length * ROW_H + 5}
              stroke="var(--border)"
            />
            <VizText
              x={xForHour(hr)}
              y={PAD_T + OCCUPANTS.length * ROW_H + 16}
              size="micro"
              anchor="middle"
              numeric
            >
              {hr}
            </VizText>
          </g>
        ))}
        <VizText x={W - 16} y={PAD_T + OCCUPANTS.length * ROW_H + 29} size="micro" anchor="end">
          {t("axisLabel")}
        </VizText>
      </svg>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <VizReadout
          label={t("phaseLabel")}
          value={t(`phases.${phaseKey}`)}
          note={t(`phaseNotes.${phaseKey}`)}
          tone={phaseTone}
          tinted
        />
        <VizReadout
          label={t("onShiftLabel")}
          value={`${active.length} / ${OCCUPANTS.length}`}
          note={
            active.length > 0
              ? active.map((o) => t(`occupants.${o.key}`)).join(" · ")
              : t("nobodyOnShift")
          }
          tone="var(--cyan)"
        />
      </div>

      <VizSlider
        label={t("hourLabel")}
        display={`${hour.toFixed(1)} h`}
        min={0}
        max={DAY_HOURS}
        step={0.1}
        value={hour}
        onChange={setHour}
        tone={phaseTone}
        className="mt-3"
      />
    </VizFigure>
  );
}
