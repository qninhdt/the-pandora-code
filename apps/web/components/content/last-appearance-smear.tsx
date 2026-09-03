"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { TAXA, TRUE_EXTINCTION, analyzeSection } from "./last-appearance-smear-model";

const W = 340;
const H = 236;
const PAD_L = 66;
const PAD_R = 18;
const PAD_T = 26;
const PAD_B = 30;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const LANE_H = plotH / TAXA.length;

const TAXON_TONE = [
  "var(--cyan)",
  "var(--teal)",
  "var(--cyan)",
  "var(--amber)",
  "var(--magenta)",
] as const;

type ConfidenceKey = "c90" | "c95" | "c99";

const CONFIDENCE: Record<ConfidenceKey, number> = { c90: 0.9, c95: 0.95, c99: 0.99 };

interface LastAppearanceSmearProps {
  caption?: string;
  className?: string;
}

// Five taxa, one abrupt extinction, wildly different fossil abundances. Each lane
// shows that taxon's find horizons as dots, its observed last appearance as a
// bright tick, and the Strauss-Sadler confidence interval above it as a bar
// reaching toward the truth. Drop the sampling effort and the single true event
// smears into a staggered decline that never happened.
export function LastAppearanceSmear({ caption, className }: LastAppearanceSmearProps) {
  const uid = useId();
  const t = useTranslations("viz.lastAppearance");
  const [effort, setEffort] = useState(70);
  const [confidence, setConfidence] = useState<ConfidenceKey>("c95");

  const out = useMemo(() => analyzeSection(effort, CONFIDENCE[confidence]), [effort, confidence]);

  // The section is drawn bottom-up: horizon 0 at the base, the true extinction at
  // the top, with headroom above it for intervals that overshoot.
  const CEILING = TRUE_EXTINCTION * 1.35;
  const yOf = (h: number) => PAD_T + (1 - h / CEILING) * plotH;
  const trueY = yOf(TRUE_EXTINCTION);

  const rare = out.ranges[out.ranges.length - 1];
  const sparse = out.found < TAXA.length || out.covered < TAXA.length;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={sparse ? t("hint.sparse") : t("hint.dense")}
      caption={caption}
      tone={sparse ? "magenta" : "teal"}
      className={className}
      controls={
        <div className="flex w-full flex-col items-end gap-2">
          <SegmentedToggle<ConfidenceKey>
            options={[
              { value: "c90", label: t("confidence.c90"), tone: "var(--teal)" },
              { value: "c95", label: t("confidence.c95"), tone: "var(--cyan)" },
              { value: "c99", label: t("confidence.c99"), tone: "var(--magenta)" },
            ]}
            value={confidence}
            onChange={setConfidence}
            ariaLabel={t("controls.confidence")}
          />
          <VizSlider
            className="w-40 sm:w-52"
            label={t("controls.effort")}
            display={`${effort}%`}
            min={10}
            max={100}
            step={5}
            value={effort}
            onChange={setEffort}
            tone="var(--cyan)"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria.chart")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {/* the single instant every one of these taxa actually died out */}
          <line
            x1={PAD_L - 10}
            y1={trueY}
            x2={PAD_L + plotW}
            y2={trueY}
            stroke="var(--foreground)"
            strokeWidth={1.4}
            strokeOpacity={0.75}
          />
          <VizText x={PAD_L - 10} y={trueY - 6} size="micro" tone="var(--foreground)">
            {t("marker.truth")}
          </VizText>

          {out.ranges.map((r, i) => {
            const tone = TAXON_TONE[i];
            const laneX = PAD_L + LANE_H * 0 + (i + 0.5) * (plotW / TAXA.length);
            const half = Math.min(13, plotW / TAXA.length / 2 - 3);
            return (
              <g key={r.taxon.id}>
                {/* the taxon's lane */}
                <line
                  x1={laneX}
                  y1={yOf(0)}
                  x2={laneX}
                  y2={trueY}
                  stroke="var(--border)"
                  strokeWidth={0.75}
                />

                {/* Strauss-Sadler interval above the highest find */}
                {r.last !== null ? (
                  <rect
                    x={laneX - half * 0.55}
                    y={yOf(r.intervalTop)}
                    width={half * 1.1}
                    height={Math.max(1, yOf(r.last) - yOf(r.intervalTop))}
                    rx={2}
                    fill={tone}
                    fillOpacity={0.16}
                    stroke={tone}
                    strokeWidth={0.75}
                    strokeOpacity={0.55}
                    strokeDasharray="3 2"
                  />
                ) : null}

                {/* every horizon this taxon is found at */}
                {r.horizons.map((h, k) => (
                  <circle
                    key={`${r.taxon.id}-${k}`}
                    cx={laneX}
                    cy={yOf(h)}
                    r={1.6}
                    fill={tone}
                    fillOpacity={0.55}
                  />
                ))}

                {/* the observed last appearance - what a naive reading calls the end */}
                {r.last !== null ? (
                  <line
                    x1={laneX - half}
                    y1={yOf(r.last)}
                    x2={laneX + half}
                    y2={yOf(r.last)}
                    stroke={tone}
                    strokeWidth={2.2}
                    filter={glowUrl(uid, "bloom")}
                  />
                ) : (
                  <VizText x={laneX} y={yOf(0) - 4} size="micro" anchor="middle" tone={tone}>
                    {t("marker.absent")}
                  </VizText>
                )}

                <VizText
                  x={laneX}
                  y={H - 16}
                  size="micro"
                  anchor="middle"
                  tone={r.covers ? "var(--subtle)" : tone}
                >
                  {t(`taxon.${r.taxon.id}`)}
                </VizText>
                <VizText
                  x={laneX}
                  y={H - 5}
                  size="micro"
                  anchor="middle"
                  tone="var(--subtle)"
                  numeric
                >
                  {`n=${r.n}`}
                </VizText>
              </g>
            );
          })}

          <VizText
            x={12}
            y={PAD_T + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 12 ${PAD_T + plotH / 2})`}
          >
            {t("axis.section")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.decline")}
            value={`${Math.round(out.apparentDecline)}`}
            note={t("readout.declineNote")}
            tone={out.apparentDecline > 20 ? "var(--magenta)" : "var(--teal)"}
            tinted
          />
          <VizReadout
            label={t("readout.covered")}
            value={`${out.covered} / ${TAXA.length}`}
            note={t("readout.coveredNote")}
            tone={out.covered === TAXA.length ? "var(--teal)" : "var(--amber)"}
          />
          <VizReadout
            label={t("readout.rarest")}
            value={
              rare.n < 2 ? t("readout.unbounded") : `+${Math.round(Math.min(rare.alpha, 999))}`
            }
            note={t("readout.rarestNote")}
            tone="var(--magenta)"
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("units")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
