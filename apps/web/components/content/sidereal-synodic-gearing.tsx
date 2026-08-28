"use client";

import { arcPoint } from "@/components/content/viz/dial";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// The debt the chapter pays late: the day measured against the stars and the day
// you actually live are not the same length. A locked moon turns once against the
// far stars each lap of its planet — but the whole system has crept along its own
// orbit meanwhile, so the moon must turn a touch further to bring the sun back
// overhead. Two clocks nested inside one another: the small hand is the moon's
// lap, the big hand is the planet's year, and the gearing between them means the
// star-clock and the sun-clock disagree by exactly one whole day per year. The
// reader scrubs the year and watches the two noon markers pull apart until, at
// the year's end, one of them has lapped the other. Strings come from i18n.

interface SiderealSynodicGearingProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 300;
const VIEW_H = 196;
const CX = VIEW_W / 2;
const CY = 100;
const YEAR_R = 84; // outer ring: the planet's year
const DAY_R = 52; // inner ring: one lap of the moon

// Canon's day length, and a stellar year of roughly Earth's — the deterministic
// SSR defaults, and the pairing the chapter's prose uses.
const DEFAULT_DAY_HOURS = 26;
const DEFAULT_YEAR_DAYS = 365;

/**
 * Length of the day you live (sunrise to sunrise) for a locked moon whose lap
 * takes `dayHours` inside a year of `yearHours`. This is the synodic relation
 * 1/T_sun = 1/T_star − 1/T_year: the sun-day is always the longer of the two.
 */
function sunDayHours(dayHours: number, yearHours: number): number {
  return dayHours / (1 - dayHours / yearHours);
}

const ringPoint = (r: number, turns: number) =>
  arcPoint(CX, CY, r, Math.PI / 2 - turns * 2 * Math.PI);

export function SiderealSynodicGearing({ caption, className }: SiderealSynodicGearingProps) {
  const t = useTranslations("viz.siderealSynodicGearing");
  const uid = useId();

  const [dayHours, setDayHours] = useState(DEFAULT_DAY_HOURS);
  const [yearDays, setYearDays] = useState(DEFAULT_YEAR_DAYS);
  const [throughYear, setThroughYear] = useState(0.45);

  const yearHours = yearDays * 24;
  const sunDay = sunDayHours(dayHours, yearHours);
  const surplusMinutes = (sunDay - dayHours) * 60;

  const starDays = (throughYear * yearHours) / dayHours;
  const sunDays = (throughYear * yearHours) / sunDay;
  // The two counts diverge by exactly the fraction of the year elapsed — one
  // whole day of disagreement banked over a full circuit of the star.
  const driftDays = starDays - sunDays;

  const starMark = ringPoint(DAY_R, starDays % 1);
  const sunMark = ringPoint(DAY_R, sunDays % 1);
  const yearMark = ringPoint(YEAR_R, throughYear);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="cyan"
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full sm:w-1/2"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "amber", "teal"]} />

          {/* outer ring — the year the whole system takes around its star */}
          <circle
            cx={CX}
            cy={CY}
            r={YEAR_R}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={1.2}
          />
          <VizText x={CX} y={CY - YEAR_R - 8} size="small" tone="amber" anchor="middle">
            {t("yearRing")}
          </VizText>
          <circle
            cx={yearMark.x}
            cy={yearMark.y}
            r={5.5}
            fill="var(--amber)"
            filter={glowUrl(uid, "bloom")}
          />

          {/* inner ring — one lap of the moon around its planet */}
          <circle cx={CX} cy={CY} r={DAY_R} fill="none" stroke="var(--border)" strokeWidth={1} />
          <VizText x={CX} y={CY - DAY_R - 7} size="small" tone="cyan" anchor="middle">
            {t("dayRing")}
          </VizText>

          {/* the star at the centre, the thing both clocks are measured against */}
          <circle cx={CX} cy={CY} r={22} fill={glowUrl(uid, "wash-amber")} />
          <circle cx={CX} cy={CY} r={8} fill="var(--amber)" filter={glowUrl(uid, "bloom-strong")} />

          {/* the two noon markers, pulling apart as the year runs on */}
          <line
            x1={CX}
            y1={CY}
            x2={starMark.x}
            y2={starMark.y}
            stroke="var(--cyan)"
            strokeWidth={1.6}
          />
          <circle
            cx={starMark.x}
            cy={starMark.y}
            r={5}
            fill="var(--cyan)"
            filter={glowUrl(uid, "bloom")}
          />
          <line
            x1={CX}
            y1={CY}
            x2={sunMark.x}
            y2={sunMark.y}
            stroke="var(--teal)"
            strokeWidth={1.6}
            strokeDasharray="4 3"
          />
          <circle
            cx={sunMark.x}
            cy={sunMark.y}
            r={5}
            fill="var(--teal)"
            filter={glowUrl(uid, "bloom")}
          />

          <VizText x={12} y={VIEW_H - 20} size="small" tone="cyan">
            {t("starClock")}
          </VizText>
          <VizText x={12} y={VIEW_H - 6} size="small" tone="teal">
            {t("sunClock")}
          </VizText>
        </svg>

        <div className="grid w-full gap-2 sm:w-1/2">
          <VizReadout
            label={t("livedDay")}
            value={`${sunDay.toFixed(2)} h`}
            tone="var(--teal)"
            tinted
            note={`${t("surplus")} +${surplusMinutes.toFixed(1)} ${t("minutes")}`}
          />
          <VizReadout label={t("starDay")} value={`${dayHours.toFixed(2)} h`} tone="var(--cyan)" />
          <VizReadout
            label={t("drift")}
            value={`${driftDays.toFixed(2)}`}
            tone="var(--amber)"
            note={t("driftNote")}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <VizSlider
          label={t("dayLabel")}
          min={12}
          max={400}
          step={1}
          value={dayHours}
          display={`${dayHours.toFixed(0)} h`}
          tone="var(--cyan)"
          onChange={setDayHours}
        />
        <VizSlider
          label={t("yearLabel")}
          min={120}
          max={900}
          step={1}
          value={yearDays}
          display={`${yearDays} ${t("earthDays")}`}
          tone="var(--amber)"
          onChange={setYearDays}
        />
        <VizSlider
          label={t("scrubLabel")}
          min={0}
          max={1}
          step={0.01}
          value={throughYear}
          display={`${Math.round(throughYear * 100)}%`}
          tone="var(--teal)"
          onChange={setThroughYear}
        />
      </div>
    </VizFigure>
  );
}
