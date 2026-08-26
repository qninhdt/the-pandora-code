"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE MODEL — three tiers, three clocks
//
// A body changes on three separable timescales, and the timescale decides
// which mechanism is even available:
//
//   acclimatization  reversible, hours to seasons, within one body
//   plasticity       semi-permanent, one developmental window
//   genetic          allele frequencies, tens to hundreds of generations
//   skeletal         gross reorganization, millions of years
//
// Each trait below is placed at the time its own literature says it takes.
// SOURCED: Moken-style underwater acuity fully acquired by naive children in
// ONE MONTH of training (Gislen et al. 2006); Haenyeo winter BMR elevated
// +15-30% and reversed within 2-3 years of adopting neoprene; the Sully
// children's apnea discipline over several months; thoracic expansion in
// altitude-raised children across a childhood; Bajau splenic enlargement and
// Tibetan EPAS1 as detectable selection signals requiring tens to hundreds of
// generations; the cetacean fluke over ~15 Ma.
//
// CHOSEN FOR ILLUSTRATION: the exact generation counts (60 and 250) that stand
// in for "tens" and "hundreds", and the calendar length assigned to "a season"
// or "a childhood". The tiers and their order are what the figure teaches; the
// individual placements are order-of-magnitude, not precise.
// ─────────────────────────────────────────────────────────────────────

const HOURS_PER_YEAR = 8766;

type Tier = "acclimatization" | "plasticity" | "genetic" | "skeletal";

const TIER_TONE: Record<Tier, string> = {
  acclimatization: "var(--teal)",
  plasticity: "var(--cyan)",
  genetic: "var(--amber)",
  skeletal: "var(--magenta)",
};

const FIGURE_TONE: Record<Tier, "teal" | "cyan" | "amber" | "magenta"> = {
  acclimatization: "teal",
  plasticity: "cyan",
  genetic: "amber",
  skeletal: "magenta",
};

interface Trait {
  id: string;
  tier: Tier;
  /** Hours required, or generations for the two selection signals. */
  hours?: number;
  generations?: number;
}

const TRAITS: Trait[] = [
  { id: "splenicConditioning", tier: "acclimatization", hours: 24 * 21 },
  { id: "mokenAcuity", tier: "plasticity", hours: 24 * 30 },
  { id: "haenyeoThermogenesis", tier: "acclimatization", hours: 24 * 90 },
  { id: "apneaDiscipline", tier: "acclimatization", hours: 24 * 120 },
  { id: "thoracicExpansion", tier: "plasticity", hours: 12 * HOURS_PER_YEAR },
  { id: "bajauSpleen", tier: "genetic", generations: 60 },
  { id: "tibetanEpas1", tier: "genetic", generations: 250 },
  { id: "caudalFluke", tier: "skeletal", hours: 15e6 * HOURS_PER_YEAR },
];

/** Hours a trait needs, resolving generation counts against the chosen generation length. */
function hoursFor(trait: Trait, generationYears: number): number {
  if (trait.hours !== undefined) return trait.hours;
  return (trait.generations ?? 0) * generationYears * HOURS_PER_YEAR;
}

const T_MIN = 1; // one hour
const T_MAX = 5e7 * HOURS_PER_YEAR; // 50 Ma
const LOG_MIN = Math.log10(T_MIN);
const LOG_SPAN = Math.log10(T_MAX) - LOG_MIN;

const W = 340;
const H = 176;
const PAD = { l: 16, r: 16, t: 22, b: 34 };
const axisW = W - PAD.l - PAD.r;
const AXIS_Y = H - PAD.b;

const xOf = (hours: number) =>
  PAD.l + ((Math.log10(Math.max(T_MIN, hours)) - LOG_MIN) / LOG_SPAN) * axisW;

/** Decade gridlines worth labelling: a day, a year, a millennium, a million years. */
const MARKS: { hours: number; key: string }[] = [
  { hours: 24, key: "day" },
  { hours: HOURS_PER_YEAR, key: "year" },
  { hours: 1000 * HOURS_PER_YEAR, key: "millennium" },
  { hours: 1e6 * HOURS_PER_YEAR, key: "megayear" },
];

interface AdaptationTimescaleLadderProps {
  caption?: string;
  className?: string;
}

// Slide the time budget and ask what a body can become inside it. A month buys
// doubled underwater eyesight. Nothing short of millions of years buys a fluke.
export function AdaptationTimescaleLadder({ caption, className }: AdaptationTimescaleLadderProps) {
  const uid = useId();
  const t = useTranslations("viz.adaptationTimescale");
  // Log-hours, so the slider walks decades instead of crawling through the first one.
  const [logHours, setLogHours] = useState(Math.log10(24 * 30));
  const [generationYears, setGenerationYears] = useState(25);

  const budget = 10 ** logHours;
  const resolved = TRAITS.map((trait) => ({
    trait,
    hours: hoursFor(trait, generationYears),
  })).sort((a, b) => a.hours - b.hours);

  const reachable = resolved.filter((r) => r.hours <= budget);
  const frontier = reachable.at(-1);
  const tier: Tier = frontier?.trait.tier ?? "acclimatization";
  const state = frontier ? tier : "none";
  const tone = frontier ? TIER_TONE[tier] : "var(--subtle)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${state}`)}
      caption={caption}
      tone={frontier ? FIGURE_TONE[tier] : "teal"}
      className={className}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={t("aria", { count: reachable.length, total: TRAITS.length })}
      >
        <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />

        {/* the reachable span of the axis, lit up to the reader's budget */}
        <rect
          x={PAD.l}
          y={PAD.t - 6}
          width={Math.max(0, xOf(budget) - PAD.l)}
          height={AXIS_Y - PAD.t + 6}
          fill={tone}
          opacity={0.08}
          style={{ transition: "width 0.25s ease" }}
        />

        <line
          x1={PAD.l}
          y1={AXIS_Y}
          x2={PAD.l + axisW}
          y2={AXIS_Y}
          stroke="var(--border-strong)"
          strokeWidth={1}
        />

        {MARKS.map((m) => (
          <g key={m.key}>
            <line
              x1={xOf(m.hours)}
              y1={PAD.t - 6}
              x2={xOf(m.hours)}
              y2={AXIS_Y}
              stroke="var(--border)"
              strokeWidth={0.6}
              strokeOpacity={0.7}
            />
            <VizText x={xOf(m.hours)} y={AXIS_Y + 13} size="micro" anchor="middle" tone="subtle">
              {t(`mark.${m.key}`)}
            </VizText>
          </g>
        ))}

        {/* each trait at the time its own literature says it takes */}
        {resolved.map(({ trait, hours }, i) => {
          const on = hours <= budget;
          const traitTone = TIER_TONE[trait.tier];
          const y = PAD.t + (i % 4) * 22;
          const x = xOf(hours);
          // Flip the callout inward once a trait sits in the right-hand third,
          // so late labels do not run off the plate.
          const flip = x > PAD.l + axisW * 0.6;
          return (
            <g key={trait.id} opacity={on ? 1 : 0.34}>
              <line
                x1={x}
                y1={y}
                x2={x}
                y2={AXIS_Y}
                stroke={traitTone}
                strokeWidth={on ? 1.2 : 0.8}
                strokeOpacity={on ? 0.55 : 0.3}
              />
              <circle
                cx={x}
                cy={y}
                r={on ? 3.4 : 2.4}
                fill={traitTone}
                filter={on ? glowUrl(uid, "bloom") : undefined}
              />
              <VizText
                x={flip ? x - 6 : x + 6}
                y={y + 3}
                size="micro"
                tone={on ? traitTone : "subtle"}
                anchor={flip ? "end" : "start"}
              >
                {t(`trait.${trait.id}`)}
              </VizText>
            </g>
          );
        })}

        {/* the budget cursor */}
        <line
          x1={xOf(budget)}
          y1={PAD.t - 8}
          x2={xOf(budget)}
          y2={AXIS_Y + 4}
          stroke={tone}
          strokeWidth={1.8}
          filter={glowUrl(uid, "bloom")}
          style={{ transition: "x1 0.25s ease, x2 0.25s ease" }}
        />
      </svg>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <VizReadout
          label={t("readout.reached")}
          value={t("countValue", { n: reachable.length, total: TRAITS.length })}
          note={frontier ? t(`trait.${frontier.trait.id}`) : t("readout.nothingYet")}
          tone={tone}
        />
        <VizReadout
          label={t("readout.mechanism")}
          value={t(`tier.${state}`)}
          note={t(`verdict.${state}`)}
          tone={tone}
          tinted
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VizSlider
          label={t("slider.budget")}
          display={formatDuration(budget, t)}
          min={0}
          max={Math.log10(T_MAX)}
          step={0.05}
          value={logHours}
          onChange={setLogHours}
          tone={tone}
        />
        <VizSlider
          label={t("slider.generation")}
          display={t("duration.years", { n: generationYears })}
          min={12}
          max={40}
          step={1}
          value={generationYears}
          onChange={setGenerationYears}
          tone="var(--amber)"
        />
      </div>
      <p className="mt-3 font-sans text-xs leading-relaxed text-subtle">{t("generationNote")}</p>
    </VizFigure>
  );
}

/** Render an hour count in the largest unit that keeps the number legible. */
function formatDuration(
  hours: number,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
): string {
  if (hours < 48) return t("duration.hours", { n: Math.round(hours) });
  const days = hours / 24;
  if (days < 60) return t("duration.days", { n: Math.round(days) });
  const months = days / 30.4;
  if (months < 24) return t("duration.months", { n: Math.round(months) });
  const years = hours / HOURS_PER_YEAR;
  if (years < 1e6) return t("duration.years", { n: Math.round(years) });
  return t("duration.megayears", { n: Math.round(years / 1e6) });
}
