"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Fire keeps a double-entry ledger. On the debit side, nitrogen and sulfur leave
// as gas — nitrogen starts volatilising around 200 C and most of it is gone above
// 500 C. On the credit side, calcium, magnesium and potassium cannot boil away at
// those temperatures, so they settle as oxides and carbonates in an alkaline ash
// bed that lifts soil pH and hands the next generation of seedlings a mineral
// windfall. Which side wins sets whether a burn regenerates a landscape or
// sterilises it. Bury the ash under metres of tephra and cut the root network, and
// the credit column is unreachable — which is the Ashlands. Volatilisation
// temperatures are measured; strings translate.
const W = 340;
const H = 196;
const PAD_L = 18;
const PAD_R = 18;
const MID_Y = 96;
const COL_W = W - PAD_L - PAD_R;
const MAX_BAR = 62;

type Case = "exposed" | "buried";

/** Fraction of ecosystem nitrogen volatilised at a given peak fire temperature. */
function nitrogenLost(peakC: number): number {
  if (peakC < 200) return 0.02;
  // Rises from a trace at 200 C through most of the pool by 500 C, saturating high.
  return Math.min(0.97, 0.02 + 0.95 * ((peakC - 200) / 420) ** 1.35);
}

/** Fraction of the alkaline cation pool retained in the ash bed. */
function cationsRetained(peakC: number): number {
  // Cations stay put until particulate lofting starts carrying ash away wholesale.
  return Math.max(0.35, 1 - Math.max(0, (peakC - 800) / 1200));
}

/** Soil pH rise delivered by the ash bed, in pH units. */
function phRise(peakC: number, retained: number): number {
  const mineralised = Math.min(1, Math.max(0, (peakC - 250) / 400));
  return 3 * mineralised * retained;
}

export interface PyricNutrientLedgerProps {
  caption?: string;
  className?: string;
}

export function PyricNutrientLedger({ caption, className }: PyricNutrientLedgerProps) {
  const t = useTranslations("viz.pyric-ledger");
  const uid = useId();
  const [peakC, setPeakC] = useState(450);
  const [scenario, setScenario] = useState<Case>("exposed");

  const nLost = nitrogenLost(peakC);
  const retained = cationsRetained(peakC);
  // Burial is the whole point of the second case: the ash bed exists, but nothing
  // rooted can reach it, so the credit column reads zero at the surface.
  const reachable = scenario === "buried" ? 0 : retained;
  const ph = scenario === "buried" ? 0 : phRise(peakC, retained);

  const regenerative = reachable > 0.5 && nLost < 0.85;
  const tone = regenerative ? "teal" : "magenta";
  const toneVar = `var(--${tone})`;

  const verdictKey = scenario === "buried" ? "buried" : regenerative ? "regenerative" : "stripping";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${verdictKey}`)}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          options={[
            { value: "exposed" as Case, label: t("case.exposed"), tone: "var(--teal)" },
            { value: "buried" as Case, label: t("case.buried"), tone: "var(--magenta)" },
          ]}
          value={scenario}
          onChange={setScenario}
          ariaLabel={t("caseLabel")}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            lost: Math.round(nLost * 100),
            kept: Math.round(reachable * 100),
          })}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "amber"]} />

          {/* the ground line: everything above it leaves, everything below stays */}
          <line
            x1={PAD_L}
            y1={MID_Y}
            x2={PAD_L + COL_W}
            y2={MID_Y}
            stroke="var(--border-strong)"
            strokeWidth={1.2}
          />
          <VizText x={PAD_L} y={MID_Y - 6} size="micro" tone="var(--magenta)">
            {t("debitSide")}
          </VizText>
          <VizText x={PAD_L} y={MID_Y + 14} size="micro" tone="var(--teal)">
            {t("creditSide")}
          </VizText>

          {/* debit: nitrogen leaving upward as gas */}
          <LedgerBar
            x={PAD_L + COL_W * 0.24}
            baseY={MID_Y - 2}
            height={nLost * MAX_BAR}
            up
            tone="var(--magenta)"
            filterUrl={glowUrl(uid, "bloom")}
            label={t("bar.nitrogen")}
            value={`${Math.round(nLost * 100)}%`}
          />

          {/* credit: cations settling downward into the ash bed */}
          <LedgerBar
            x={PAD_L + COL_W * 0.6}
            baseY={MID_Y + 2}
            height={reachable * MAX_BAR}
            up={false}
            tone="var(--teal)"
            filterUrl={glowUrl(uid, "bloom")}
            label={t("bar.cations")}
            value={`${Math.round(reachable * 100)}%`}
          />

          {/* the burial layer, drawn only when it is in the way */}
          {scenario === "buried" ? (
            <>
              <rect
                x={PAD_L}
                y={MID_Y + 2}
                width={COL_W}
                height={30}
                fill="var(--subtle)"
                fillOpacity={0.22}
              />
              <VizText
                x={PAD_L + COL_W / 2}
                y={MID_Y + 21}
                size="micro"
                tone="subtle"
                anchor="middle"
              >
                {t("tephraLayer")}
              </VizText>
            </>
          ) : null}
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.nitrogen")}
            value={`${Math.round(nLost * 100)}%`}
            note={t("readout.nitrogenNote")}
            tone="var(--magenta)"
          />
          <VizReadout
            label={t("readout.ph")}
            value={ph < 0.05 ? t("readout.phNone") : t("readout.phValue", { v: ph.toFixed(1) })}
            note={t("readout.phNote")}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.verdict")}
            value={t(`verdict.${verdictKey}`)}
            note={t("readout.verdictNote")}
            tone={toneVar}
            tinted
          />
        </div>
      </div>

      <div className="mt-4">
        <VizSlider
          label={t("slider.peak")}
          display={`${peakC} °C`}
          min={150}
          max={1100}
          step={25}
          value={peakC}
          onChange={setPeakC}
          tone="var(--amber)"
        />
      </div>
    </VizFigure>
  );
}

// One column of the ledger. Debits grow upward off the ground line, credits
// downward, so the two sides read as opposite entries on the same account.
function LedgerBar({
  x,
  baseY,
  height,
  up,
  tone,
  filterUrl,
  label,
  value,
}: {
  x: number;
  baseY: number;
  height: number;
  up: boolean;
  tone: string;
  filterUrl: string;
  label: string;
  value: string;
}) {
  const h = Math.max(1, height);
  const barW = 34;
  return (
    <g>
      <rect
        x={x - barW / 2}
        y={up ? baseY - h : baseY}
        width={barW}
        height={h}
        rx={2}
        fill={tone}
        fillOpacity={0.45}
        stroke={tone}
        strokeOpacity={0.85}
        strokeWidth={0.9}
        filter={h > 6 ? filterUrl : undefined}
        style={{ transition: "y 0.35s ease, height 0.35s ease" }}
      />
      <VizText
        x={x}
        y={up ? baseY - h - 14 : baseY + h + 20}
        size="micro"
        tone="subtle"
        anchor="middle"
      >
        {label}
      </VizText>
      <VizText
        x={x}
        y={up ? baseY - h - 4 : baseY + h + 11}
        size="small"
        tone={tone}
        anchor="middle"
        numeric
        weight={700}
      >
        {value}
      </VizText>
    </g>
  );
}
