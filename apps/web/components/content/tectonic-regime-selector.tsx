"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  BODIES,
  FLUX_MAX,
  FLUX_MIN,
  PANDORA_BOX,
  REGIME_TONE,
  type Regime,
  YIELD_MAX,
  YIELD_MIN,
  convectiveStressMPa,
  failureRatio,
  fluxToPct,
  regimeFor,
  yieldToPct,
} from "./tectonic-regime-model";

// The chapter's payload figure. Move a world around the heat-flux/lid-strength
// plane and watch which tectonic regime it falls into. The point the reader
// should leave with: Earth is not the default, it occupies a narrow corner, and
// Pandora's own numbers cover a box that spans several regimes at once.

interface TectonicRegimeSelectorProps {
  caption?: string;
  className?: string;
}

const W = 340;
const H = 230;
const PAD_L = 34;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 30;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const COLS = 34;
const ROWS = 24;

const FLUX_TICKS = [0.01, 0.1, 1, 10];
const YIELD_TICKS = [20, 100, 500, 2000];

function px(flux: number): number {
  return PAD_L + (fluxToPct(flux) / 100) * PLOT_W;
}
function py(yieldMPa: number): number {
  return PAD_T + PLOT_H - (yieldToPct(yieldMPa) / 100) * PLOT_H;
}

// Coarse raster of the regime field: each cell is painted with the regime at its
// centre. Cheap, deterministic, and reads as soft bands rather than hard curves.
function regimeCells(): { x: number; y: number; w: number; h: number; regime: Regime }[] {
  const cells: { x: number; y: number; w: number; h: number; regime: Regime }[] = [];
  const cw = PLOT_W / COLS;
  const ch = PLOT_H / ROWS;
  const lf = Math.log10(FLUX_MIN);
  const hf = Math.log10(FLUX_MAX);
  const ly = Math.log10(YIELD_MIN);
  const hy = Math.log10(YIELD_MAX);
  for (let i = 0; i < COLS; i++) {
    const flux = 10 ** (lf + ((i + 0.5) / COLS) * (hf - lf));
    for (let j = 0; j < ROWS; j++) {
      const yieldMPa = 10 ** (ly + ((j + 0.5) / ROWS) * (hy - ly));
      cells.push({
        x: PAD_L + i * cw,
        y: PAD_T + PLOT_H - (j + 1) * ch,
        w: cw + 0.4,
        h: ch + 0.4,
        regime: regimeFor(flux, yieldMPa),
      });
    }
  }
  return cells;
}

export function TectonicRegimeSelector({ caption, className }: TectonicRegimeSelectorProps) {
  const uid = useId();
  const t = useTranslations("viz.tectonicRegime");

  // Log-space sliders so both axes stay reachable at every scale.
  const [logFlux, setLogFlux] = useState(-1.06); // ≈ 0.087 W/m², Earth
  const [logYield, setLogYield] = useState(2); // 100 MPa

  const flux = 10 ** logFlux;
  const yieldMPa = 10 ** logYield;
  const regime = regimeFor(flux, yieldMPa);
  const tone = REGIME_TONE[regime];
  const ratio = failureRatio(flux, yieldMPa);
  const stress = convectiveStressMPa(flux);

  const cells = useMemo(() => regimeCells(), []);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="cyan"
      className={className}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
        <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />

        {cells.map((c) => (
          <rect
            key={`${c.x}-${c.y}`}
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            fill={REGIME_TONE[c.regime]}
            opacity={0.16}
          />
        ))}

        <rect
          x={PAD_L}
          y={PAD_T}
          width={PLOT_W}
          height={PLOT_H}
          fill="none"
          stroke="var(--border)"
          strokeWidth={0.6}
        />

        {FLUX_TICKS.map((f) => (
          <g key={f}>
            <line
              x1={px(f)}
              y1={PAD_T}
              x2={px(f)}
              y2={PAD_T + PLOT_H}
              stroke="var(--border)"
              strokeWidth={0.4}
              strokeOpacity={0.6}
            />
            <VizTick x={px(f)} y={PAD_T + PLOT_H + 10}>
              {f < 1 ? f.toFixed(2) : f.toFixed(0)}
            </VizTick>
          </g>
        ))}
        {YIELD_TICKS.map((y) => (
          <VizTick key={y} x={PAD_L - 4} y={py(y) + 3} anchor="end">
            {y}
          </VizTick>
        ))}

        <VizText x={PAD_L + PLOT_W / 2} y={H - 4} anchor="middle" size="small">
          {t("axisFlux")}
        </VizText>
        <VizText
          x={0}
          y={0}
          anchor="middle"
          size="small"
          transform={`translate(9,${PAD_T + PLOT_H / 2}) rotate(-90)`}
        >
          {t("axisYield")}
        </VizText>

        {/* Pandora's parameter box — the whole point is that it is not a point. */}
        <rect
          x={px(PANDORA_BOX.fluxMin)}
          y={py(PANDORA_BOX.yieldMax)}
          width={px(PANDORA_BOX.fluxMax) - px(PANDORA_BOX.fluxMin)}
          height={py(PANDORA_BOX.yieldMin) - py(PANDORA_BOX.yieldMax)}
          fill="var(--magenta)"
          fillOpacity={0.12}
          stroke="var(--magenta)"
          strokeWidth={1}
          strokeDasharray="3 2"
        />
        <VizText
          x={px(PANDORA_BOX.fluxMin) + 3}
          y={py(PANDORA_BOX.yieldMax) - 3}
          size="micro"
          tone="magenta"
          weight={700}
        >
          {t("body.pandora")}
        </VizText>

        {BODIES.map((b) => (
          <g key={b.key}>
            <circle cx={px(b.flux)} cy={py(b.yieldMPa)} r={3} fill="var(--foreground)" />
            <VizText x={px(b.flux) + 6} y={py(b.yieldMPa) + 3} size="micro" tone="foreground">
              {t(`body.${b.key}`)}
            </VizText>
          </g>
        ))}

        {/* The reader's own world. */}
        <circle
          cx={px(flux)}
          cy={py(yieldMPa)}
          r={6}
          fill={tone}
          filter={glowUrl(uid, "bloom-strong")}
        />
      </svg>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <VizSlider
          label={t("fluxLabel")}
          display={`${flux < 1 ? flux.toFixed(2) : flux.toFixed(1)} W/m²`}
          min={-2}
          max={1}
          step={0.02}
          value={logFlux}
          onChange={setLogFlux}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("yieldLabel")}
          display={`${Math.round(yieldMPa)} MPa`}
          min={Math.log10(YIELD_MIN)}
          max={Math.log10(YIELD_MAX)}
          step={0.02}
          value={logYield}
          onChange={setLogYield}
          tone="var(--teal)"
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout label={t("stressLabel")} value={`${Math.round(stress)} MPa`} tone="var(--amber)" />
        <VizReadout label={t("ratioLabel")} value={ratio.toFixed(2)} tone="var(--teal)" />
        <VizReadout
          label={t("regimeLabel")}
          value={t(`regime.${regime}`)}
          note={t(`regimeNote.${regime}`)}
          tone={tone}
          tinted
        />
      </div>
    </VizFigure>
  );
}
