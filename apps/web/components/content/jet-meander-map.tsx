"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  MAX_MEAN_FLOW,
  MAX_WAVENUMBER,
  MIN_MEAN_FLOW,
  MIN_WAVENUMBER,
  meanderShape,
  meanderState,
} from "./jet-meander-model";

// The jet drawn as a band across a strip of latitude, animated at its true
// ground-relative phase speed. Turn the mean flow down and the wave crawls
// westward; turn it up and the pattern races east; hit the value in between and it
// stops dead over the ground, amplifying into the stalled pattern that leaves a
// caravan with nowhere to go. The animation speed IS the physics here — a frozen
// screenshot cannot make this point.
const W = 380;
const H = 190;
const PAD_X = 16;
const MID_Y = H / 2 - 6;
const AMP_PX = 46;
const SAMPLES = 90;

const REGIME_TONE = {
  progressive: "var(--cyan)",
  stalling: "var(--amber)",
  blocked: "var(--magenta)",
} as const;

const REGIME_FIGURE_TONE = {
  progressive: "cyan",
  stalling: "amber",
  blocked: "magenta",
} as const;

interface JetMeanderMapProps {
  caption?: string;
  className?: string;
}

export function JetMeanderMap({ caption, className }: JetMeanderMapProps) {
  const t = useTranslations("viz.jet-meander");
  const uid = useId();
  const [wavenumber, setWavenumber] = useState(4);
  const [meanFlow, setMeanFlow] = useState(30);

  const state = meanderState(wavenumber, meanFlow);
  const tone = REGIME_TONE[state.regime];

  // One loop period = the time the pattern takes to travel one wavelength over the
  // ground. Near resonance that period runs to infinity, so clamp it long rather
  // than dividing by zero; a 200-second cycle reads as motionless anyway.
  const period = Math.min(200, state.wavelengthM / Math.max(1, Math.abs(state.phaseSpeed)) / 40000);
  const { phase } = usePhaseLoop({ period, playing: true, initial: 0 });
  const drift = state.phaseSpeed >= 0 ? phase : -phase;

  const offsets = meanderShape(wavenumber, meanFlow, drift, SAMPLES);
  const stepX = (W - PAD_X * 2) / (SAMPLES - 1);
  const jetPath = offsets
    .map(
      (o, i) =>
        `${i === 0 ? "M" : "L"} ${(PAD_X + i * stepX).toFixed(1)} ${(MID_Y - o * AMP_PX).toFixed(1)}`,
    )
    .join(" ");

  // The caravan sits at a fixed longitude and simply rides whatever the jet does.
  const caravanIndex = Math.round(SAMPLES * 0.3);
  const caravanX = PAD_X + caravanIndex * stepX;
  const caravanY = MID_Y - offsets[caravanIndex] * AMP_PX;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${state.regime}`)}
      caption={caption}
      tone={REGIME_FIGURE_TONE[state.regime]}
      className={className}
    >
      <div className="flex flex-col gap-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={t(`aria.${state.regime}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "amber", "magenta"]} />
          <rect
            x={PAD_X}
            y={10}
            width={W - PAD_X * 2}
            height={H - 40}
            fill={glowUrl(uid, "grid")}
          />

          {/* the latitude the jet wanders about */}
          <line
            x1={PAD_X}
            y1={MID_Y}
            x2={W - PAD_X}
            y2={MID_Y}
            stroke="var(--border-strong)"
            strokeDasharray="4 5"
            strokeWidth={1}
          />

          {/* the jet: a broad soft band with a bright core along its axis */}
          <path
            d={jetPath}
            fill="none"
            stroke={tone}
            strokeOpacity={0.18}
            strokeWidth={20}
            strokeLinecap="round"
          />
          <path
            d={jetPath}
            fill="none"
            stroke={tone}
            strokeWidth={2.6}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          />

          <circle
            cx={caravanX}
            cy={caravanY}
            r={4.6}
            fill="var(--foreground)"
            filter={glowUrl(uid, "soft-shadow")}
          />
          <VizText x={caravanX + 8} y={caravanY - 6} size="micro" tone="foreground">
            {t("caravan")}
          </VizText>

          <VizText x={PAD_X} y={MID_Y - 6} size="micro" tone="subtle">
            {t("meanLatitude")}
          </VizText>
          <VizText x={PAD_X} y={H - 6} size="micro" tone="subtle">
            {t("westward")}
          </VizText>
          <VizText x={W - PAD_X} y={H - 6} size="micro" tone="subtle" anchor="end">
            {t("eastward")}
          </VizText>
        </svg>

        <div className="grid gap-3 sm:grid-cols-2">
          <VizSlider
            label={t("control.wavenumber")}
            display={t("waveValue", { n: wavenumber })}
            min={MIN_WAVENUMBER}
            max={MAX_WAVENUMBER}
            step={1}
            value={wavenumber}
            onChange={setWavenumber}
            tone={tone}
          />
          <VizSlider
            label={t("control.meanFlow")}
            display={t("msValue", { n: meanFlow })}
            min={MIN_MEAN_FLOW}
            max={MAX_MEAN_FLOW}
            step={1}
            value={meanFlow}
            onChange={setMeanFlow}
            tone={tone}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <VizReadout
            label={t("readout.wavelength")}
            value={t("kmValue", {
              n: Math.round(state.wavelengthM / 1000).toLocaleString("en-US"),
            })}
            tone={tone}
          />
          <VizReadout
            label={t("readout.resonant")}
            value={t("msValue", { n: state.resonantFlow.toFixed(1) })}
            note={t("resonantNote")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.drift")}
            value={
              Math.abs(state.phaseSpeed) < 1
                ? t("stationary")
                : t(state.phaseSpeed > 0 ? "driftEast" : "driftWest", {
                    n: Math.abs(state.phaseSpeed).toFixed(1),
                  })
            }
            note={t(`regime.${state.regime}`)}
            tone={tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
