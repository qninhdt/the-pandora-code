"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface IsochronPlotProps {
  caption?: string;
  className?: string;
}

// Plot geometry, in SVG user units. A fixed viewBox keeps it crisp at any
// rendered width; the wrapper makes it responsive.
const VIEW_W = 440;
const VIEW_H = 300;
const PAD = { left: 46, right: 18, top: 18, bottom: 38 };
const DOMAIN = { x: 1.35, y: 1.35 }; // data-space extent shown on each axis

// Co-genetic mineral grains: each crystallized from the same melt with the same
// initial daughter ratio (D0) but a different amount of radioactive parent. The
// spread of parent values is what makes the isochron pivot legibly.
const D0 = 0.18; // initial daughter/stable ratio — the y-intercept the method recovers
const PARENTS = [0.16, 0.42, 0.68, 0.94, 1.18]; // initial parent/stable per grain
const MAX_HALF_LIVES = 2.4;
const INITIAL_T = 0.8; // deterministic for SSR; a meaningful tilt for static viewers
const SWEEP_PERIOD = MAX_HALF_LIVES / 0.6; // seconds for a full 0→MAX sweep

// Map data coordinates to SVG pixel coordinates.
function sx(x: number): number {
  return PAD.left + (x / DOMAIN.x) * (VIEW_W - PAD.left - PAD.right);
}
function sy(y: number): number {
  return VIEW_H - PAD.bottom - (y / DOMAIN.y) * (VIEW_H - PAD.top - PAD.bottom);
}

// An animated, interactive isochron diagram. As time runs (in half-lives),
// parent-rich grains climb faster than parent-poor ones, so a flat line of
// points pivots into a sloped isochron whose slope encodes the age and whose
// y-intercept recovers the initial daughter ratio — the whole point of the
// method being that the starting amount need never be assumed. SVG-only, so it
// renders identically on the server; motion is opt-in and reduced-motion-safe.
export function IsochronPlot({ caption, className }: IsochronPlotProps) {
  const tr = useTranslations("viz.isochron");
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [playing, setPlaying] = useState(false);
  // Phase loop drives the build; reduced-motion freezes advancement.
  const { phase, setPhase } = usePhaseLoop({
    period: SWEEP_PERIOD,
    playing,
    initial: INITIAL_T / MAX_HALF_LIVES,
  });
  // Manual time override when the reader scrubs the slider.
  const [manualT, setManualT] = useState<number | null>(null);

  const t = manualT ?? phase * MAX_HALF_LIVES; // elapsed time, in half-lives

  function scrub(next: number) {
    setPlaying(false);
    setManualT(next);
    setPhase(next / MAX_HALF_LIVES);
  }

  function reset() {
    setPlaying(false);
    setManualT(0);
    setPhase(0);
  }

  function togglePlay() {
    setManualT(null); // hand control back to the loop
    setPlaying((p) => !p);
  }

  const f = 2 ** -t; // fraction of parent remaining
  const slope = 2 ** t - 1; // isochron slope = e^(λt) − 1

  // Current position of each grain: parent decays (x shrinks), daughter
  // accumulates (y grows), and all grains stay on the line y = D0 + slope·x.
  const points = PARENTS.map((p0) => {
    const x = p0 * f;
    const y = D0 + p0 * (1 - f);
    return { x, y };
  });

  // The isochron line itself, drawn from the y-axis across the current spread.
  const lineEndX = Math.min(DOMAIN.x, PARENTS[PARENTS.length - 1] * f * 1.04);
  const lineEndY = D0 + slope * lineEndX;

  return (
    <VizFigure
      title={tr("title")}
      caption={caption}
      tone="cyan"
      className={className}
      controls={
        <>
          {!reduced && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? tr("pause") : tr("play")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-all hover:border-cyan/60 hover:bg-void/70 hover:shadow-[0_0_0_1px_var(--cyan),0_0_16px_-3px_var(--cyan)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            aria-label={tr("reset")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-muted transition-all hover:border-cyan/40 hover:bg-void/70 hover:text-cyan hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--cyan)_45%,transparent),0_0_14px_-3px_var(--cyan)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <RotateCcw size={15} />
          </button>
        </>
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={tr("aria", { t: t.toFixed(2), slope: slope.toFixed(2) })}
      >
        <GlowDefs idBase={uid} tones={["cyan", "teal", "amber"]} />

        {/* faint grid backdrop */}
        <rect
          x={sx(0)}
          y={sy(DOMAIN.y)}
          width={sx(DOMAIN.x) - sx(0)}
          height={sy(0) - sy(DOMAIN.y)}
          fill={glowUrl(uid, "grid")}
        />

        {/* axes */}
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(DOMAIN.x)}
          y2={sy(0)}
          stroke="var(--border-strong)"
          strokeWidth={1.5}
        />
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(0)}
          y2={sy(DOMAIN.y)}
          stroke="var(--border-strong)"
          strokeWidth={1.5}
        />
        {/* axis labels */}
        <VizText x={sx(DOMAIN.x / 2)} y={VIEW_H - 8} size="small" anchor="middle">
          {tr("xAxis")}
        </VizText>
        <VizText
          x={14}
          y={sy(DOMAIN.y / 2)}
          size="small"
          anchor="middle"
          transform={`rotate(-90 14 ${sy(DOMAIN.y / 2)})`}
        >
          {tr("yAxis")}
        </VizText>

        {/* the flat starting line (ghost), to anchor "they all began equal" */}
        <line
          x1={sx(0)}
          y1={sy(D0)}
          x2={sx(DOMAIN.x)}
          y2={sy(D0)}
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="3 4"
        />

        {/* the isochron line */}
        <line
          x1={sx(0)}
          y1={sy(D0)}
          x2={sx(lineEndX)}
          y2={sy(lineEndY)}
          stroke="var(--cyan)"
          strokeWidth={2.5}
          strokeLinecap="round"
          filter={glowUrl(uid, "bloom")}
        />

        {/* y-intercept marker: the recovered initial ratio D0 */}
        <circle cx={sx(0)} cy={sy(D0)} r={4.5} fill="var(--teal)" filter={glowUrl(uid, "bloom")} />
        <VizText x={sx(0) + 8} y={sy(D0) - 8} size="micro" tone="teal">
          {tr("initialRatio")}
        </VizText>

        {/* mineral grains */}
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={sx(pt.x)}
            cy={sy(pt.y)}
            r={5}
            fill="var(--amber)"
            filter={glowUrl(uid, "bloom-strong")}
          />
        ))}
      </svg>

      {/* readouts */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        <VizReadout
          label={tr("elapsed")}
          value={tr("elapsedValue", { t: t.toFixed(2) })}
          tone="var(--amber)"
          tinted
        />
        <VizReadout label={tr("slope")} value={slope.toFixed(2)} tone="var(--cyan)" />
        <VizReadout label={tr("parentLeft")} value={`${Math.round(f * 100)}%`} tone="var(--teal)" />
      </div>

      {/* control */}
      <input
        type="range"
        min={0}
        max={MAX_HALF_LIVES}
        step={0.01}
        value={t}
        onChange={(e) => scrub(Number(e.target.value))}
        aria-label={tr("timeLabel")}
        className="viz-range mt-3 w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        style={{
          background: `linear-gradient(to right, var(--cyan) ${(t / MAX_HALF_LIVES) * 100}%, var(--border) ${(t / MAX_HALF_LIVES) * 100}%)`,
          ["--viz-thumb" as string]: "var(--cyan)",
        }}
      />
    </VizFigure>
  );
}
