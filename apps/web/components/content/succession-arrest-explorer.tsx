"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type Regime = "sterilized" | "blast" | "ashfall";

// Three disturbances of similar violence produce wildly different futures. What
// separates them is not how hard the land was hit but what survived underneath
// (biological legacies) and whether the substrate will let a pioneer root. Each
// regime is a saturating recovery curve toward full canopy cover; the sterilized
// case barely lifts off the floor across the same century the ashfall case closes
// its canopy in a handful of years. The maths stays in code; strings translate.
const W = 360;
const H = 210;
const PAD_L = 26;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 28;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const YEARS = 120; // x-axis span

interface RegimeSpec {
  tone: string;
  legacies: number; // surviving legacies per hectare (relative index 0-100)
  rate: number; // recovery rate constant (per year) for 1 - e^(-rate*t)
  ceiling: number; // max fractional cover reachable on this substrate
  yearsToCanopy: number | null; // years to 60% cover; null = never within span
}

const REGIMES: Record<Regime, RegimeSpec> = {
  sterilized: {
    tone: "var(--magenta)",
    legacies: 2,
    rate: 0.006,
    ceiling: 0.22,
    yearsToCanopy: null,
  },
  blast: { tone: "var(--amber)", legacies: 46, rate: 0.05, ceiling: 0.92, yearsToCanopy: 30 },
  ashfall: { tone: "var(--teal)", legacies: 88, rate: 0.42, ceiling: 0.98, yearsToCanopy: 3 },
};

function cover(spec: RegimeSpec, year: number): number {
  return spec.ceiling * (1 - Math.exp(-spec.rate * year));
}

const px = (year: number) => PAD_L + (year / YEARS) * PLOT_W;
const py = (frac: number) => PAD_T + (1 - frac) * PLOT_H;

function coverPath(spec: RegimeSpec): string {
  const N = 72;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const year = (i / N) * YEARS;
    d += `${i === 0 ? "M" : " L"} ${px(year).toFixed(1)} ${py(cover(spec, year)).toFixed(1)}`;
  }
  return d;
}

interface SuccessionArrestExplorerProps {
  caption?: string;
  className?: string;
}

export function SuccessionArrestExplorer({ caption, className }: SuccessionArrestExplorerProps) {
  const t = useTranslations("viz.succession-arrest");
  const uid = useId();
  const [regime, setRegime] = useState<Regime>("sterilized");
  const spec = REGIMES[regime];
  const coverNow = cover(spec, YEARS);

  const tone: "cyan" | "teal" | "magenta" | "amber" =
    regime === "sterilized" ? "magenta" : regime === "blast" ? "amber" : "teal";

  const options: { value: Regime; label: string; tone: string }[] = [
    { value: "sterilized", label: t("regime.sterilized"), tone: REGIMES.sterilized.tone },
    { value: "blast", label: t("regime.blast"), tone: REGIMES.blast.tone },
    { value: "ashfall", label: t("regime.ashfall"), tone: REGIMES.ashfall.tone },
  ];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${regime}`)}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          options={options}
          value={regime}
          onChange={setRegime}
          ariaLabel={t("controlLabel")}
        />
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full md:w-3/5"
          role="img"
          aria-label={t(`aria.${regime}`)}
        >
          <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />
          <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill={glowUrl(uid, "grid")} />

          {/* canopy-closure reference line at 60% cover */}
          <line
            x1={PAD_L}
            y1={py(0.6)}
            x2={PAD_L + PLOT_W}
            y2={py(0.6)}
            stroke="var(--foreground)"
            strokeOpacity={0.22}
            strokeDasharray="3 4"
            strokeWidth={1}
          />
          <VizText x={PAD_L + PLOT_W} y={py(0.6) - 4} size="micro" tone="subtle" anchor="end">
            {t("canopyLine")}
          </VizText>

          {/* axes */}
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD_L}
            y1={PAD_T + PLOT_H}
            x2={PAD_L + PLOT_W}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {/* the three curves, dimmed except the active one */}
          {(Object.keys(REGIMES) as Regime[]).map((r) => (
            <path
              key={r}
              d={coverPath(REGIMES[r])}
              fill="none"
              stroke={REGIMES[r].tone}
              strokeWidth={r === regime ? 2.6 : 1.2}
              strokeOpacity={r === regime ? 1 : 0.22}
              strokeLinecap="round"
              filter={r === regime ? glowUrl(uid, "bloom") : undefined}
            />
          ))}

          {/* end-of-span marker on the active curve */}
          <circle
            cx={px(YEARS)}
            cy={py(coverNow)}
            r={5}
            fill={spec.tone}
            filter={glowUrl(uid, "bloom")}
          />

          {/* axis labels */}
          <VizText x={PAD_L + PLOT_W / 2} y={H - 6} size="micro" tone="subtle" anchor="middle">
            {t("xAxis")}
          </VizText>
          <VizText
            x={10}
            y={PAD_T + PLOT_H / 2}
            size="micro"
            tone="subtle"
            anchor="middle"
            transform={`rotate(-90 10 ${PAD_T + PLOT_H / 2})`}
          >
            {t("yAxis")}
          </VizText>
          <VizText x={PAD_L} y={PAD_T + PLOT_H + 14} size="micro" tone="subtle" anchor="start">
            0
          </VizText>
          <VizText
            x={PAD_L + PLOT_W}
            y={PAD_T + PLOT_H + 14}
            size="micro"
            tone="subtle"
            anchor="end"
          >
            {t("yearsMax")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 md:w-2/5">
          <VizReadout
            label={t("readout.legacies")}
            value={t(`legacyLevel.${regime}`)}
            tone={spec.tone}
          />
          <VizReadout
            label={t("readout.cover")}
            value={`${Math.round(coverNow * 100)}%`}
            tone={spec.tone}
          />
          <VizReadout
            label={t("readout.canopy")}
            value={
              spec.yearsToCanopy === null ? t("never") : t("yearsValue", { n: spec.yearsToCanopy })
            }
            note={t(`verdict.${regime}`)}
            tone={spec.tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
