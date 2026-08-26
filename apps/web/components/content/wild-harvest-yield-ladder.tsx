"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE DATA — what wild harvest actually costs per gram of product
//
// Documented yields from the natural-products literature. Each row is the wet
// biomass that had to be destroyed to obtain one unit of the finished compound,
// and how the supply problem was eventually solved. The pattern is the point:
// every terrestrial case escaped wild harvest through synthesis, semi-synthesis,
// or fermentation, because wild harvest does not scale.
//
// Amrita is the outlier - not because its yield is uniquely bad, but because
// canon gives no synthetic route, so the wild harvest never ends.
// ─────────────────────────────────────────────────────────────────────

interface Case {
  id: string;
  /** Kilograms of wet source biomass per gram of product. */
  kgPerGram: number;
  /** Whether Earth industry escaped wild harvest for this compound. */
  escaped: boolean;
  tone: string;
}

// Paclitaxel: ~10,000 kg bark per 1 kg drug → 10 kg/g.
// Trabectedin: 1 mg per kg biomass → 1,000 kg/g.
// Bryostatin-1: 18 g from 14 tonnes → ~778 kg/g.
// Eribulin's precursor halichondrin B sat below 0.0001% wet weight → ~1,000 kg/g.
// Amrita: a mature tulkun of order 40 tonnes yields ~1.5 L (~1.5 kg) → ~27 kg/g.
const CASES: Case[] = [
  { id: "paclitaxel", kgPerGram: 10, escaped: true, tone: "var(--teal)" },
  { id: "halichondrin", kgPerGram: 1000, escaped: true, tone: "var(--cyan)" },
  { id: "bryostatin", kgPerGram: 778, escaped: true, tone: "var(--cyan)" },
  { id: "trabectedin", kgPerGram: 1000, escaped: true, tone: "var(--teal)" },
  { id: "amrita", kgPerGram: 27, escaped: false, tone: "var(--magenta)" },
];

const W = 330;
const H = 220;
const PAD_L = 78;
const PAD_R = 20;
const PAD_T = 18;
const PAD_B = 34;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

// Log scale, since the cases span three orders of magnitude.
const LOG_MIN = 0; // 1 kg/g
const LOG_MAX = 3.2; // ~1,600 kg/g
const xOf = (v: number) =>
  PAD_L + ((Math.log10(Math.max(1, v)) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * plotW;

const BAR_GAP = 8;
const barH = (plotH - BAR_GAP * (CASES.length - 1)) / CASES.length;

interface WildHarvestYieldLadderProps {
  caption?: string;
  className?: string;
}

// Click a rung to read what that compound cost in destroyed biomass, and how (or
// whether) industry stopped paying it.
export function WildHarvestYieldLadder({ caption, className }: WildHarvestYieldLadderProps) {
  const uid = useId();
  const t = useTranslations("viz.wildHarvestLadder");
  const [selected, setSelected] = useState("amrita");

  const active = CASES.find((c) => c.id === selected) ?? CASES[4];
  // Biomass destroyed for one therapeutic course, taken as 300 mg of compound.
  const perCourseKg = active.kgPerGram * 0.3;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={active.escaped ? t("hint.escaped") : t("hint.trapped")}
      caption={caption}
      tone={active.escaped ? "cyan" : "magenta"}
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria.chart")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta"]} />

          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {CASES.map((c, i) => {
            const y = PAD_T + i * (barH + BAR_GAP);
            const isActive = c.id === selected;
            const w = Math.max(2, xOf(c.kgPerGram) - PAD_L);
            return (
              <g key={c.id}>
                {/* Hit target spans the full row so touch works on mobile, and
                    carries the row's accessible name + keyboard activation. */}
                <rect
                  x={PAD_L}
                  y={y}
                  width={plotW}
                  height={barH}
                  fill="transparent"
                  className="cursor-pointer focus-visible:outline focus-visible:outline-1"
                  role="button"
                  tabIndex={0}
                  aria-label={t(`case.${c.id}.short`)}
                  aria-pressed={isActive}
                  onClick={() => setSelected(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(c.id);
                    }
                  }}
                />
                <rect
                  x={PAD_L}
                  y={y}
                  width={w}
                  height={barH}
                  rx={2}
                  fill={c.tone}
                  opacity={isActive ? 0.95 : 0.32}
                  filter={isActive ? glowUrl(uid, "bloom") : undefined}
                  className="pointer-events-none"
                />
                <VizText
                  x={PAD_L - 6}
                  y={y + barH / 2 + 3}
                  size="micro"
                  anchor="end"
                  tone={isActive ? c.tone : "var(--subtle)"}
                  className="pointer-events-none"
                >
                  {t(`case.${c.id}.short`)}
                </VizText>
              </g>
            );
          })}

          <VizText x={PAD_L} y={H - 18} size="micro" anchor="middle" tone="var(--subtle)" numeric>
            1
          </VizText>
          <VizText x={xOf(10)} y={H - 18} size="micro" anchor="middle" tone="var(--subtle)" numeric>
            10
          </VizText>
          <VizText
            x={xOf(100)}
            y={H - 18}
            size="micro"
            anchor="middle"
            tone="var(--subtle)"
            numeric
          >
            100
          </VizText>
          <VizText
            x={xOf(1000)}
            y={H - 18}
            size="micro"
            anchor="middle"
            tone="var(--subtle)"
            numeric
          >
            1000
          </VizText>
          <VizText x={PAD_L + plotW / 2} y={H - 5} size="small" anchor="middle" tone="var(--muted)">
            {t("axis.ratio")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.source")}
            value={t(`case.${active.id}.source`)}
            tone={active.tone}
          />
          <VizReadout
            label={t("readout.course")}
            value={`${perCourseKg < 10 ? perCourseKg.toFixed(1) : Math.round(perCourseKg)} kg`}
            note={t("note.course")}
            tone={active.tone}
            tinted
          />
          <VizReadout
            label={t("readout.solution")}
            value={t(`case.${active.id}.solution`)}
            tone={active.escaped ? "var(--teal)" : "var(--magenta)"}
          />
        </div>
      </div>
    </VizFigure>
  );
}
