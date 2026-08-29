"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  EARTH_PIGMENT_PEAKS,
  SPECTRUM_MAX,
  SPECTRUM_MIN,
  type StarKey,
  capturedFraction,
  peakWavelength,
  reflectedColor,
  sampleSpectrum,
} from "./pigment-spectrum-tuner-model";

interface PigmentSpectrumTunerProps {
  caption?: string;
  className?: string;
}

// A leaf is the colour of the light it refuses. Pick a sky, then drag the window
// of wavelengths the pigments absorb: the readouts show what fraction of arriving
// photons that window harvests, and the swatch shows the colour left over — the
// colour an observer would call the leaf. Park the window on blue and red under
// our own Sun and a green leaf falls out, which is the point: green is a choice
// Earth made, not a law. Slide it out to the orange and near-infrared that Alpha
// Centauri B pours down and the leftovers turn violet.
// Spectrum arithmetic lives in pigment-spectrum-tuner-model.ts; all strings i18n.

const W = 340;
const H = 210;
const PAD_L = 34;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 30;

function xFor(nm: number): number {
  return PAD_L + ((nm - SPECTRUM_MIN) / (SPECTRUM_MAX - SPECTRUM_MIN)) * (W - PAD_L - PAD_R);
}

function yFor(flux: number): number {
  return H - PAD_B - flux * (H - PAD_T - PAD_B);
}

const AXIS_TICKS = [400, 500, 600, 700, 800, 900];

export function PigmentSpectrumTuner({ caption, className }: PigmentSpectrumTunerProps) {
  const uid = useId();
  const t = useTranslations("viz.pigmentSpectrum");
  const [star, setStar] = useState<StarKey>("binary");
  const [lo, setLo] = useState(500);
  const [hi, setHi] = useState(850);

  // Keep the window ordered no matter which handle the reader drags past which.
  const winLo = Math.min(lo, hi);
  const winHi = Math.max(lo, hi);

  const spectrum = useMemo(() => sampleSpectrum(star), [star]);
  const captured = capturedFraction(star, winLo, winHi);
  const leafColor = reflectedColor(star, winLo, winHi);
  const peak = peakWavelength(star);

  const curvePath = useMemo(
    () =>
      spectrum
        .map((s, i) => `${i === 0 ? "M" : "L"} ${xFor(s.nm).toFixed(1)} ${yFor(s.flux).toFixed(1)}`)
        .join(" "),
    [spectrum],
  );

  const fillPath = useMemo(
    () =>
      `${curvePath} L ${xFor(SPECTRUM_MAX).toFixed(1)} ${yFor(0).toFixed(1)} L ${xFor(
        SPECTRUM_MIN,
      ).toFixed(1)} ${yFor(0).toFixed(1)} Z`,
    [curvePath],
  );

  const tone = star === "sun" ? "cyan" : star === "centauriB" ? "amber" : "teal";
  const toneVar = `var(--${tone})`;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("skyLabel")}
          value={star}
          onChange={setStar}
          options={[
            { value: "sun", label: t("sun"), tone: "var(--cyan)" },
            { value: "centauriA", label: t("centauriA"), tone: "var(--teal)" },
            { value: "centauriB", label: t("centauriB"), tone: "var(--amber)" },
            { value: "binary", label: t("binary"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full lg:w-[62%]"
          role="img"
          aria-label={t("plotLabel")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          <rect
            x={PAD_L}
            y={PAD_T}
            width={W - PAD_L - PAD_R}
            height={H - PAD_T - PAD_B}
            fill={glowUrl(uid, "grid")}
            opacity={0.4}
          />

          {/* The absorbed band, drawn behind the curve so the harvest reads as
              the slice of arriving light the pigments actually take. */}
          <rect
            x={xFor(winLo)}
            y={PAD_T}
            width={Math.max(0, xFor(winHi) - xFor(winLo))}
            height={H - PAD_T - PAD_B}
            fill={`color-mix(in oklab, ${toneVar} 20%, transparent)`}
          />
          <line
            x1={xFor(winLo)}
            y1={PAD_T}
            x2={xFor(winLo)}
            y2={H - PAD_B}
            stroke={toneVar}
            strokeWidth={1.2}
            strokeOpacity={0.75}
          />
          <line
            x1={xFor(winHi)}
            y1={PAD_T}
            x2={xFor(winHi)}
            y2={H - PAD_B}
            stroke={toneVar}
            strokeWidth={1.2}
            strokeOpacity={0.75}
          />

          {/* Arriving photon flux. */}
          <path
            d={fillPath}
            fill={`color-mix(in oklab, ${toneVar} 12%, transparent)`}
            stroke="none"
          />
          <path
            d={curvePath}
            fill="none"
            stroke={toneVar}
            strokeWidth={1.6}
            filter={glowUrl(uid, "bloom")}
          />

          {/* Where Earth's chlorophyll happens to absorb — the two peaks that
              leave the green gap between them. */}
          {EARTH_PIGMENT_PEAKS.map((p) => (
            <line
              key={`${p.pigment}-${p.nm}`}
              x1={xFor(p.nm)}
              y1={H - PAD_B}
              x2={xFor(p.nm)}
              y2={H - PAD_B - 14}
              stroke="var(--magenta)"
              strokeWidth={1}
              strokeOpacity={0.8}
            />
          ))}
          <VizText x={xFor(546)} y={H - PAD_B - 18} size="micro" tone="magenta" anchor="middle">
            {t("chlorophyll")}
          </VizText>

          {/* Axes */}
          <line
            x1={PAD_L}
            y1={H - PAD_B}
            x2={W - PAD_R}
            y2={H - PAD_B}
            stroke="var(--border-strong)"
            strokeWidth={1}
            strokeOpacity={0.6}
          />
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={H - PAD_B}
            stroke="var(--border-strong)"
            strokeWidth={1}
            strokeOpacity={0.6}
          />
          {AXIS_TICKS.map((nm) => (
            <VizTick key={nm} x={xFor(nm)} y={H - PAD_B + 11}>
              {nm}
            </VizTick>
          ))}
          <VizText x={W - PAD_R} y={H - 4} size="micro" anchor="end">
            {t("axisWavelength")}
          </VizText>
          <VizText
            x={0}
            y={0}
            size="micro"
            anchor="middle"
            transform={`translate(11, ${(H - PAD_B + PAD_T) / 2}) rotate(-90)`}
          >
            {t("axisFlux")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-3 lg:w-[38%]">
          <VizSlider
            label={t("windowStart")}
            display={`${winLo} nm`}
            min={SPECTRUM_MIN}
            max={SPECTRUM_MAX}
            step={10}
            value={lo}
            onChange={setLo}
            tone={toneVar}
          />
          <VizSlider
            label={t("windowEnd")}
            display={`${winHi} nm`}
            min={SPECTRUM_MIN}
            max={SPECTRUM_MAX}
            step={10}
            value={hi}
            onChange={setHi}
            tone={toneVar}
          />
          <VizReadout label={t("peakLabel")} value={`${peak} nm`} note={t("peakNote")} tone={toneVar} />
          <VizReadout
            label={t("capturedLabel")}
            value={`${Math.round(captured * 100)}%`}
            note={t("capturedNote")}
            tone={toneVar}
            tinted
          />
          <VizReadout
            label={t("leafColorLabel")}
            value={
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-4 w-8 rounded-sm border border-border"
                  style={{ background: leafColor }}
                />
              </span>
            }
            note={t("leafColorNote")}
            tone={toneVar}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
