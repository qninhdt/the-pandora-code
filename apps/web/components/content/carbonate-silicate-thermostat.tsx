"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface CarbonateSilicateThermostatProps {
  caption?: string;
  className?: string;
}

// Earth's deep thermostat, made drivable, and the resolution of the faint-young-
// sun paradox in the reader's hands. Slide the sun from its dim early value to
// today's: a bare rock would scorch from frozen to hot in lockstep with the star,
// but the carbonate–silicate cycle self-corrects. Warmer rock in acid rain
// weathers faster, drawing CO₂ down and thinning the greenhouse; a cold planet
// lets volcanic CO₂ pile up until the greenhouse thickens. The negative feedback
// holds the regulated temperature nearly flat — and the steady-state CO₂ runs
// HIGH under a faint sun, exactly why the early Earth stayed liquid. A simple
// fixed-point solve, deterministic, SSR-safe, no animation loop.

const S_MIN = 0.7; // the faint young sun, ~30% dimmer
const S_MAX = 1.15; // a little brighter than today
const S_DEFAULT = 0.7;
const T_TARGET = 15; // °C the weathering thermostat parks the planet near

// Bare-rock equilibrium temperature: scales straight with solar input, no
// greenhouse buffering. Tuned so the lifeless line sweeps frozen→hot across the
// solar range, making the contrast with the regulated line vivid.
function bareTempC(s: number): number {
  return -35 + (s - S_MIN) * (95 / (S_MAX - S_MIN));
}

// Solve the thermostat's steady state. Greenhouse warming from CO₂ adds to the
// bare temperature; weathering (which consumes CO₂) rises with temperature, so
// CO₂ settles where draw-down balances volcanic out-gassing. We invert that: the
// CO₂ needed to lift the bare temperature up to ~T_TARGET, clamped to a floor so
// a bright sun still leaves a thin greenhouse rather than going negative.
function solve(s: number): { tempC: number; co2Rel: number } {
  const bare = bareTempC(s);
  // Greenhouse needed to reach target; weathering caps how much the planet can
  // overshoot, so above target the temperature creeps up only gently.
  const deficit = T_TARGET - bare;
  // CO₂ (relative to today=1) the cycle parks at: high when the sun is faint
  // (large deficit to cover), low when bright. Logarithmic greenhouse forcing.
  const co2Rel = Math.max(0.05, 2 ** (deficit / 8));
  // Realised temperature: thermostat covers most of the deficit but not quite
  // all of it at the extremes, so the regulated line has a gentle slope.
  const greenhouse = 8 * Math.log2(co2Rel);
  const tempC = bare + greenhouse;
  return { tempC, co2Rel };
}

const VIEW_W = 460;
const VIEW_H = 240;
const PAD = { left: 40, right: 14, top: 18, bottom: 34 };
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;
const T_LO = -40;
const T_HI = 70;

function sx(s: number): number {
  return PAD.left + ((s - S_MIN) / (S_MAX - S_MIN)) * PLOT_W;
}
function ty(tempC: number): number {
  const c = Math.max(T_LO, Math.min(T_HI, tempC));
  return PAD.top + (1 - (c - T_LO) / (T_HI - T_LO)) * PLOT_H;
}
function pathFrom(pts: { x: number; y: number }[]): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

const SAMPLES = Array.from({ length: 48 }, (_, i) => S_MIN + (i / 47) * (S_MAX - S_MIN));
const REGULATED_PATH = pathFrom(SAMPLES.map((s) => ({ x: sx(s), y: ty(solve(s).tempC) })));
const BARE_PATH = pathFrom(SAMPLES.map((s) => ({ x: sx(s), y: ty(bareTempC(s)) })));

export function CarbonateSilicateThermostat({
  caption,
  className,
}: CarbonateSilicateThermostatProps) {
  const t = useTranslations("viz.carbonateSilicate");
  const uid = useId();
  const [sun, setSun] = useState(S_DEFAULT);

  const { tempC, co2Rel } = solve(sun);
  const bare = bareTempC(sun);
  const cx = sx(sun);
  const habitable = tempC > 0 && tempC < 50;
  const tone = habitable ? "teal" : "amber";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone={tone}
      className={className}
      hint={sun < 0.85 ? t("hintFaint") : t("hintBright")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["teal", "amber", "cyan"]} />

          <rect
            x={PAD.left}
            y={PAD.top}
            width={PLOT_W}
            height={PLOT_H}
            fill={glowUrl(uid, "grid")}
            opacity={0.5}
          />

          {/* the liquid-water band */}
          <rect
            x={PAD.left}
            y={ty(50)}
            width={PLOT_W}
            height={ty(0) - ty(50)}
            fill="color-mix(in oklab, var(--teal) 12%, transparent)"
          />
          <VizText x={PAD.left + 4} y={ty(25) - 2} size="micro" tone="teal">
            {t("liquidBand")}
          </VizText>

          {/* axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT_H} stroke="var(--border-strong)" />
          <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={PAD.left + PLOT_W} y2={PAD.top + PLOT_H} stroke="var(--border-strong)" />
          <VizText
            x={PAD.left - 30}
            y={PAD.top + PLOT_H / 2}
            size="micro"
            tone="subtle"
            anchor="middle"
            transform={`rotate(-90 ${PAD.left - 30} ${PAD.top + PLOT_H / 2})`}
          >
            {t("tempAxis")}
          </VizText>
          <VizText x={PAD.left + PLOT_W / 2} y={VIEW_H - 4} size="micro" tone="subtle" anchor="middle">
            {t("sunAxis")}
          </VizText>

          {/* bare-rock line — scorches straight through */}
          <path d={BARE_PATH} fill="none" stroke="var(--border-strong)" strokeWidth={1.5} strokeDasharray="4 3" />
          <VizText x={sx(S_MAX) - 4} y={ty(bareTempC(S_MAX)) - 6} size="micro" tone="subtle" anchor="end">
            {t("bareLine")}
          </VizText>

          {/* regulated line — held flat by the thermostat */}
          <path d={REGULATED_PATH} fill="none" stroke="var(--teal)" strokeWidth={2.4} filter={glowUrl(uid, "bloom")} />

          {/* current-sun marker */}
          <line x1={cx} y1={PAD.top} x2={cx} y2={PAD.top + PLOT_H} stroke="var(--amber)" strokeWidth={1} strokeOpacity={0.5} />
          <circle cx={cx} cy={ty(bare)} r={3.5} fill="var(--border-strong)" />
          <circle cx={cx} cy={ty(tempC)} r={5} fill={`var(--${tone})`} filter={glowUrl(uid, "bloom")} />
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout
            label={t("tempLabel")}
            value={`${tempC.toFixed(1)}°C`}
            tone={`var(--${tone})`}
            tinted
            note={`${t("bareWould")}: ${bare.toFixed(0)}°C`}
          />
          <VizReadout
            label={t("co2Label")}
            value={`${co2Rel.toFixed(1)}×`}
            tone="var(--cyan)"
            note={t("co2Note")}
          />
          <VizSlider
            label={t("sunSlider")}
            display={`${sun.toFixed(2)} L☉`}
            min={S_MIN}
            max={S_MAX}
            step={0.01}
            value={sun}
            onChange={setSun}
            tone="var(--amber)"
            className="mt-1"
          />
        </div>
      </div>
    </VizFigure>
  );
}
