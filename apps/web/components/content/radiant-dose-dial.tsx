"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Radiant transfer is the reason a fire reaches things it never touches. A flame
// radiates as sigma*T^4, so the temperature term is brutally steep: double the
// absolute temperature and the emitted flux goes up sixteenfold. What arrives at
// a target is that emission cut down by the view factor — how much of the
// target's sky the flame fills — which falls off roughly as the square of
// distance once you are more than a flame-width away. Ignition is then a
// threshold on the arriving flux, and injury a threshold on flux times time.
// Thresholds are measured values from fire-safety engineering; strings translate.
const SIGMA = 5.670374e-8; // Stefan-Boltzmann constant, W/(m^2 K^4)
const EMISSIVITY = 0.92; // sooty wildland flame envelope, optically thick
const FLAME_RADIUS = 0.9; // m — the radiating body's characteristic size

const W = 360;
const H = 216;
const PAD_L = 34;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 30;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const FLUX_MIN = 0.5; // kW/m^2, bottom of the log y-axis
const FLUX_MAX = 200; // kW/m^2, top of the log y-axis
const DIST_MAX = 8; // m, right edge of the x-axis

interface Threshold {
  key: string;
  flux: number; // kW/m^2
  tone: string;
}

// The measured ladder from fire-safety engineering: what each arriving flux does.
const THRESHOLDS: Threshold[] = [
  { key: "pain", flux: 2.5, tone: "var(--cyan)" },
  { key: "blister", flux: 4.5, tone: "var(--teal)" },
  { key: "ignition", flux: 11, tone: "var(--amber)" },
  { key: "autoignition", flux: 37, tone: "var(--magenta)" },
];

/** Incident flux (kW/m^2) on a target at `dist` metres from a flame at `tempK`. */
export function incidentFlux(tempK: number, dist: number): number {
  const emitted = EMISSIVITY * SIGMA * tempK ** 4; // W/m^2 at the flame surface
  // View factor for a sphere-like emitter: unity at the surface, ~ (r/d)^2 far off.
  const viewFactor = (FLAME_RADIUS / (FLAME_RADIUS + dist)) ** 2;
  return (emitted * viewFactor) / 1000;
}

/**
 * Seconds of exposure before a second-degree burn, from the flux-dose curve fitted
 * through the published pairs: ~30 s at 2.5 kW/m², ~12 s at 4.5 kW/m².
 */
function timeToBurn(flux: number): number | null {
  if (flux < 1.7) return null; // below the injury threshold, exposure is survivable
  return 126 * flux ** -1.56;
}

const px = (dist: number) => PAD_L + (dist / DIST_MAX) * PLOT_W;

// Flux spans two and a half decades across the useful range, so the y-axis is
// logarithmic — a linear one would bunch every threshold into the bottom sliver.
const LOG_MIN = Math.log10(FLUX_MIN);
const LOG_SPAN = Math.log10(FLUX_MAX) - LOG_MIN;
const py = (flux: number) => {
  const clamped = Math.max(FLUX_MIN, Math.min(flux, FLUX_MAX));
  return PAD_T + PLOT_H * (1 - (Math.log10(clamped) - LOG_MIN) / LOG_SPAN);
};

function fluxPath(tempK: number): string {
  const N = 88;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const dist = (i / N) * DIST_MAX;
    d += `${i === 0 ? "M" : " L"} ${px(dist).toFixed(1)} ${py(incidentFlux(tempK, dist)).toFixed(1)}`;
  }
  return d;
}

export interface RadiantDoseDialProps {
  caption?: string;
  className?: string;
}

export function RadiantDoseDial({ caption, className }: RadiantDoseDialProps) {
  const t = useTranslations("viz.radiant-dose");
  const uid = useId();
  const [tempK, setTempK] = useState(1400);
  const [dist, setDist] = useState(2.5);

  const flux = incidentFlux(tempK, dist);
  const burnSeconds = timeToBurn(flux);

  // The highest rung the arriving flux clears — that is what actually happens.
  const reached = [...THRESHOLDS].reverse().find((th) => flux >= th.flux);
  const tone = reached?.tone ?? "var(--subtle)";
  const figureTone: "cyan" | "teal" | "magenta" | "amber" =
    reached?.key === "autoignition"
      ? "magenta"
      : reached?.key === "ignition"
        ? "amber"
        : reached?.key === "blister"
          ? "teal"
          : "cyan";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={reached ? t(`hint.${reached.key}`) : t("hint.none")}
      caption={caption}
      tone={figureTone}
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", { flux: flux.toFixed(1), dist: dist.toFixed(1) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />
          <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill={glowUrl(uid, "grid")} />

          {/* the measured threshold ladder */}
          {THRESHOLDS.map((th) => (
            <g key={th.key}>
              <line
                x1={PAD_L}
                y1={py(th.flux)}
                x2={PAD_L + PLOT_W}
                y2={py(th.flux)}
                stroke={th.tone}
                strokeOpacity={flux >= th.flux ? 0.65 : 0.22}
                strokeDasharray="3 4"
                strokeWidth={1}
              />
              <VizText
                x={PAD_L + PLOT_W}
                y={py(th.flux) - 4}
                size="micro"
                tone={flux >= th.flux ? th.tone : "subtle"}
                anchor="end"
              >
                {t(`threshold.${th.key}`)}
              </VizText>
            </g>
          ))}

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

          {/* flux-versus-distance curve for the chosen flame temperature */}
          <path
            d={fluxPath(tempK)}
            fill="none"
            stroke={tone}
            strokeWidth={2.4}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "d 0.35s ease" }}
          />

          {/* the reader's chosen standoff */}
          <line
            x1={px(dist)}
            y1={PAD_T}
            x2={px(dist)}
            y2={PAD_T + PLOT_H}
            stroke="var(--foreground)"
            strokeOpacity={0.28}
            strokeWidth={1}
          />
          <circle
            cx={px(dist)}
            cy={py(flux)}
            r={5}
            fill={tone}
            filter={glowUrl(uid, "bloom-strong")}
            style={{ transition: "cx 0.2s ease, cy 0.35s ease" }}
          />

          {/* axis furniture */}
          <VizTick x={PAD_L} y={PAD_T + PLOT_H + 13} anchor="start">
            0
          </VizTick>
          <VizTick x={PAD_L + PLOT_W} y={PAD_T + PLOT_H + 13} anchor="end">
            {t("distMax")}
          </VizTick>
          {[1, 10, 100].map((decade) => (
            <VizTick key={decade} x={PAD_L - 5} y={py(decade) + 3} anchor="end">
              {decade}
            </VizTick>
          ))}
          <VizText x={PAD_L + PLOT_W / 2} y={H - 5} size="micro" tone="subtle" anchor="middle">
            {t("xAxis")}
          </VizText>
          <VizText
            x={11}
            y={PAD_T + PLOT_H / 2}
            size="micro"
            tone="subtle"
            anchor="middle"
            transform={`rotate(-90 11 ${PAD_T + PLOT_H / 2})`}
          >
            {t("yAxis")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.flux")}
            value={`${flux < 10 ? flux.toFixed(1) : Math.round(flux)} kW/m²`}
            note={t("readout.fluxNote")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.dose")}
            value={
              burnSeconds === null
                ? t("readout.doseSafe")
                : t("readout.doseValue", {
                    s: burnSeconds < 10 ? burnSeconds.toFixed(1) : Math.round(burnSeconds),
                  })
            }
            note={t("readout.doseNote")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.outcome")}
            value={reached ? t(`outcome.${reached.key}`) : t("outcome.none")}
            note={t("readout.outcomeNote")}
            tone={tone}
            tinted
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VizSlider
          label={t("slider.temp")}
          display={`${tempK} K`}
          min={700}
          max={2200}
          step={25}
          value={tempK}
          onChange={setTempK}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("slider.dist")}
          display={t("slider.distValue", { v: dist.toFixed(1) })}
          min={0.2}
          max={DIST_MAX}
          step={0.1}
          value={dist}
          onChange={setDist}
          tone="var(--cyan)"
        />
      </div>
    </VizFigure>
  );
}
