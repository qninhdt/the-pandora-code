"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  DEFAULT_SIGMA,
  FIDELITY_RANGE,
  REGIMES,
  REGIME_ORDER,
  REPLICASE_LENGTH,
  SIGMA_RANGE,
  ceilingVerdict,
  maxGenomeLength,
} from "./error-threshold-model";

// The chapter's hardest point, made visible: energy is not what limits an
// origin, accuracy is. Drag the copying fidelity and watch the ceiling on how
// long a sequence can survive. The horizontal band is the length a folded
// replicase needs before it can copy anything — and bare chemistry's ceiling
// sits far below it, which is the circle the field has never closed. No slider
// setting on any world escapes it. Maths in error-threshold-model.ts.

const W = 340;
const H = 210;
const PLOT_X0 = 42;
const PLOT_X1 = 328;
const PLOT_Y0 = 18;
const PLOT_Y1 = 172;
const L_MAX_PLOT = 320;

const xForFidelity = (q: number) =>
  PLOT_X0 +
  ((q - FIDELITY_RANGE.min) / (FIDELITY_RANGE.max - FIDELITY_RANGE.min)) * (PLOT_X1 - PLOT_X0);
const yForLength = (l: number) =>
  PLOT_Y1 - (Math.min(l, L_MAX_PLOT) / L_MAX_PLOT) * (PLOT_Y1 - PLOT_Y0);

export function ErrorThresholdCeiling({
  caption,
  className,
}: { caption?: string; className?: string }) {
  const uid = useId();
  const t = useTranslations("viz.errorThreshold");

  const [fidelity, setFidelity] = useState(REGIMES.nonEnzymatic.fidelity);
  const [sigma, setSigma] = useState(DEFAULT_SIGMA);

  const ceiling = maxGenomeLength(fidelity, sigma);
  const verdict = ceilingVerdict(ceiling);
  const tone = verdict === "clearsReplicase" ? "var(--teal)" : "var(--magenta)";
  const shortfall = Math.max(0, REPLICASE_LENGTH.min - ceiling);

  // The ceiling curve across the whole fidelity range at this selection strength.
  const curve = Array.from({ length: 80 }, (_, i) => {
    const q = FIDELITY_RANGE.min + (i / 79) * (FIDELITY_RANGE.max - FIDELITY_RANGE.min);
    return `${i === 0 ? "M" : "L"} ${xForFidelity(q).toFixed(1)} ${yForLength(maxGenomeLength(q, sigma)).toFixed(1)}`;
  }).join(" ");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={verdict === "clearsReplicase" ? "teal" : "magenta"}
      hint={t(`verdict.${verdict}`, { shortfall: Math.round(shortfall) })}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", { length: Math.round(Math.min(ceiling, L_MAX_PLOT)) })}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "cyan", "amber"]} />

          {/* the length a folded replicase needs — the bar the curve must clear */}
          <rect
            x={PLOT_X0}
            y={yForLength(REPLICASE_LENGTH.max)}
            width={PLOT_X1 - PLOT_X0}
            height={yForLength(REPLICASE_LENGTH.min) - yForLength(REPLICASE_LENGTH.max)}
            fill="color-mix(in oklab, var(--cyan) 20%, transparent)"
            stroke="color-mix(in oklab, var(--cyan) 50%, transparent)"
            strokeWidth={0.7}
          />
          <VizText
            x={PLOT_X0 + 6}
            y={yForLength(REPLICASE_LENGTH.max) - 5}
            size="micro"
            tone="cyan"
          >
            {t("replicaseBand")}
          </VizText>

          <path d={curve} fill="none" stroke="var(--amber)" strokeWidth={1.6} strokeOpacity={0.8} />

          {REGIME_ORDER.map((id) => {
            const q = REGIMES[id].fidelity;
            if (q > FIDELITY_RANGE.max) return null;
            const x = xForFidelity(q);
            return (
              <g key={id}>
                <line
                  x1={x}
                  y1={PLOT_Y0}
                  x2={x}
                  y2={PLOT_Y1}
                  stroke="var(--border-strong)"
                  strokeWidth={0.6}
                  strokeDasharray="2 3"
                />
                <VizText
                  x={x + 3}
                  y={PLOT_Y0 + 10}
                  size="micro"
                  tone="subtle"
                  transform={`rotate(90 ${x + 3} ${PLOT_Y0 + 10})`}
                >
                  {t(`regime.${id}`)}
                </VizText>
              </g>
            );
          })}

          {/* the reader's current setting */}
          <circle
            cx={xForFidelity(fidelity)}
            cy={yForLength(ceiling)}
            r={4}
            fill={tone}
            filter={glowUrl(uid, "bloom")}
          />
          <line
            x1={xForFidelity(fidelity)}
            y1={yForLength(ceiling)}
            x2={xForFidelity(fidelity)}
            y2={PLOT_Y1}
            stroke={tone}
            strokeWidth={1}
            strokeOpacity={0.5}
          />

          <line
            x1={PLOT_X0}
            y1={PLOT_Y1}
            x2={PLOT_X1}
            y2={PLOT_Y1}
            stroke="var(--border)"
            strokeWidth={0.8}
          />
          {[0, 80, 160, 240, 320].map((l) => (
            <VizTick key={l} x={PLOT_X0 - 6} y={yForLength(l) + 3} anchor="end">
              {l}
            </VizTick>
          ))}
          <VizText x={PLOT_X0 - 6} y={PLOT_Y0 - 6} anchor="end" size="micro" tone="subtle">
            {t("yAxis")}
          </VizText>
          <VizText x={PLOT_X1} y={H - 6} anchor="end" size="micro" tone="subtle">
            {t("xAxis")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("ceilingLabel")}
            value={t("ntValue", { n: Math.round(Math.min(ceiling, 99999)) })}
            note={t("ceilingNote")}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("errorRateLabel")}
            value={t("perBase", { n: ((1 - fidelity) * 100).toFixed(1) })}
            note={t("errorRateNote")}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("needLabel")}
            value={t("ntValue", { n: REPLICASE_LENGTH.min })}
            note={t("needNote")}
            tone="var(--cyan)"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <VizSlider
          label={t("fidelityLabel")}
          display={fidelity.toFixed(3)}
          min={FIDELITY_RANGE.min}
          max={FIDELITY_RANGE.max}
          step={0.001}
          value={fidelity}
          onChange={setFidelity}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("sigmaLabel")}
          display={`${sigma.toFixed(1)}×`}
          min={SIGMA_RANGE.min}
          max={SIGMA_RANGE.max}
          step={0.5}
          value={sigma}
          onChange={setSigma}
          tone="var(--cyan)"
        />
      </div>
    </VizFigure>
  );
}
