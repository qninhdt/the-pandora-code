"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE MODEL — two recovery clocks that run at wildly different speeds
//
// After a forest is cleared or burned, two things regrow on separate
// schedules, and conflating them is the mistake behind "we will replant":
//
//   BIOMASS   — leaf area and standing green weight. Pioneers within a
//               season; full pre-disturbance biomass in ~30-80 years.
//               Modelled as saturating exponential, tau ≈ 25 yr.
//
//   STRUCTURE — hollows, fissured bark, canopy soil, vertical complexity.
//               Small hollows begin at ~100-120 yr; large cavities need
//               220-500+ yr (Gibbons & Lindenmayer). Full old-growth
//               structure 200-2000+ yr. Modelled as a delayed, much
//               slower saturation with a threshold before anything counts.
//
// The log-time axis runs to 20,000 years so a Hometree-scale accumulation
// fits on the same picture as an Earth stand — which is the point.
// ─────────────────────────────────────────────────────────────────────

const MIN_LOG = 0; // 10^0 = 1 year
const MAX_LOG = 4.301; // 10^4.301 ≈ 20,000 years

function biomassAt(years: number): number {
  return 1 - Math.exp(-years / 25);
}

// Structure only starts accruing once decay and injury have had time to work,
// then climbs slowly. Zero before the threshold — a sapling has no hollow.
function structureAt(years: number): number {
  const THRESHOLD = 90;
  if (years <= THRESHOLD) return 0;
  return 1 - Math.exp(-(years - THRESHOLD) / 620);
}

// Milestones placed on the time axis, each a real Earth figure.
const MILESTONES: { id: string; years: number; tone: string }[] = [
  { id: "pioneers", years: 3, tone: "var(--teal)" },
  { id: "canopyClosed", years: 60, tone: "var(--teal)" },
  { id: "firstHollows", years: 110, tone: "var(--amber)" },
  { id: "largeCavities", years: 350, tone: "var(--amber)" },
  { id: "oldGrowth", years: 800, tone: "var(--cyan)" },
  { id: "hometree", years: 20000, tone: "var(--magenta)" },
];

const W = 340;
const H = 240;
const PAD = { l: 40, r: 16, t: 18, b: 46 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

const xOf = (years: number) =>
  PAD.l + ((Math.log10(Math.max(1, years)) - MIN_LOG) / (MAX_LOG - MIN_LOG)) * plotW;
const yOf = (frac: number) => PAD.t + (1 - frac) * plotH;

function curvePath(fn: (y: number) => number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i += 1) {
    const logYears = MIN_LOG + ((MAX_LOG - MIN_LOG) * i) / 120;
    const years = 10 ** logYears;
    pts.push(`${i === 0 ? "M" : "L"}${xOf(years).toFixed(1)},${yOf(fn(years)).toFixed(1)}`);
  }
  return pts.join(" ");
}

const BIOMASS_PATH = curvePath(biomassAt);
const STRUCTURE_PATH = curvePath(structureAt);

const DECADE_TICKS = [1, 10, 100, 1000, 10000];

interface StructureVsBiomassClockProps {
  caption?: string;
  className?: string;
}

// Scrub across four orders of magnitude of recovery time and watch the two
// curves refuse to travel together. The gap between them is the chapter's
// transferable point: biomass is purchasable, structure is not.
export function StructureVsBiomassClock({
  caption,
  className,
}: StructureVsBiomassClockProps) {
  const uid = useId();
  const t = useTranslations("viz.structureClock");
  const [logYears, setLogYears] = useState(1.78); // ~60 years: canopy closed, no structure

  const years = 10 ** logYears;
  const biomass = biomassAt(years);
  const structure = structureAt(years);
  const gap = biomass - structure;

  const yearLabel =
    years >= 1000
      ? t("yearsThousands", { n: (years / 1000).toFixed(years >= 10000 ? 0 : 1) })
      : t("years", { n: Math.round(years) });

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="amber"
      className={className}
      controls={
        <div className="w-40 sm:w-52">
          <VizSlider
            label={t("timeLabel")}
            display={yearLabel}
            min={MIN_LOG}
            max={MAX_LOG}
            step={0.01}
            value={logYears}
            onChange={setLogYears}
            tone="var(--amber)"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("title")}
        >
          <GlowDefs idBase={uid} tones={["teal", "amber", "cyan", "magenta"]} />

          <line
            x1={PAD.l}
            y1={PAD.t}
            x2={PAD.l}
            y2={PAD.t + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          <line
            x1={PAD.l}
            y1={PAD.t + plotH}
            x2={PAD.l + plotW}
            y2={PAD.t + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          {DECADE_TICKS.map((d) => (
            <g key={d}>
              <line
                x1={xOf(d)}
                y1={PAD.t}
                x2={xOf(d)}
                y2={PAD.t + plotH}
                stroke="var(--border-strong)"
                strokeWidth={1}
                strokeOpacity={0.16}
              />
              <VizTick x={xOf(d)} y={PAD.t + plotH + 14}>
                {d >= 1000 ? `${d / 1000}k` : String(d)}
              </VizTick>
            </g>
          ))}
          <VizText
            x={PAD.l + plotW / 2}
            y={H - 20}
            size="small"
            anchor="middle"
            tone="var(--muted)"
          >
            {t("axis.time")}
          </VizText>
          <VizText
            x={11}
            y={PAD.t + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 11 ${PAD.t + plotH / 2})`}
          >
            {t("axis.recovered")}
          </VizText>

          {/* The gap between the curves at the scrubbed moment — the whole point. */}
          <rect
            x={xOf(years) - 3}
            y={yOf(biomass)}
            width={6}
            height={Math.max(0, yOf(structure) - yOf(biomass))}
            fill="var(--magenta)"
            opacity={0.22}
          />

          <path d={BIOMASS_PATH} fill="none" stroke="var(--teal)" strokeWidth={2.2} />
          <path
            d={STRUCTURE_PATH}
            fill="none"
            stroke="var(--amber)"
            strokeWidth={2.2}
            filter={glowUrl(uid, "bloom")}
          />

          {MILESTONES.map((m) => (
            <circle
              key={m.id}
              cx={xOf(m.years)}
              cy={PAD.t + plotH}
              r={2.6}
              fill={m.tone}
              opacity={years >= m.years ? 0.95 : 0.3}
            />
          ))}

          <line
            x1={xOf(years)}
            y1={PAD.t}
            x2={xOf(years)}
            y2={PAD.t + plotH}
            stroke="var(--amber)"
            strokeWidth={1.4}
            strokeOpacity={0.7}
            strokeDasharray="3 3"
          />
          <circle cx={xOf(years)} cy={yOf(biomass)} r={4} fill="var(--teal)" />
          <circle
            cx={xOf(years)}
            cy={yOf(structure)}
            r={4}
            fill="var(--amber)"
            filter={glowUrl(uid, "bloom")}
          />
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.biomass")}
            value={`${Math.round(biomass * 100)}%`}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.structure")}
            value={`${Math.round(structure * 100)}%`}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("readout.gap")}
            value={`${Math.round(gap * 100)}%`}
            note={
              structure === 0
                ? t("verdict.noStructure")
                : gap > 0.3
                  ? t("verdict.lookingRecovered")
                  : t("verdict.genuinelyOld")
            }
            tone="var(--magenta)"
            tinted
          />
          <ul className="mt-1 flex flex-col gap-1">
            {MILESTONES.map((m) => (
              <li
                key={m.id}
                className="flex items-baseline gap-2 font-sans text-xs"
                style={{ opacity: years >= m.years ? 1 : 0.4 }}
              >
                <span
                  aria-hidden
                  className="mt-1 inline-block size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: m.tone }}
                />
                <span className="text-muted">{t(`milestone.${m.id}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </VizFigure>
  );
}

