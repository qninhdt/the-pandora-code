"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE MODEL — depth is not pressure; weight is
//
// Hydrostatic pressure rises with the weight of the water overhead:
//
//   P(h) = P0 + rho * g * h
//
// and a sealed gas volume shrinks against it by Boyle's law:
//
//   V(h) = TLC * P0 / P(h)
//
// Weaken gravity and the same metre of water weighs less, so every
// pressure threshold slides deeper. Sourced anchors:
//
//   Earth    g = 9.81 m/s^2  ->  1 atm per ~10.1 m; 30 m = 3.98 atm
//   Pandora  g = 7.84 m/s^2  ->  1 atm per ~12.6 m; 30 m = 3.38 atm
//   TLC 6.0 L, RV 1.5 L      ->  V = RV at 30 m on Earth (4.0 atm)
//   thoracic squeeze opens where V < RV (30-40 m, untrained human)
//   nitrogen narcosis at P_N2 > 3.2 atm (~30 m on Earth)
//
// rho = 1025 kg/m^3 is an ASSUMPTION imported from Earth seawater —
// canon never states Pandoran ocean density, and the figure says so.
// ─────────────────────────────────────────────────────────────────────

const RHO_SEAWATER = 1025; // kg/m^3 — Earth tropical seawater, assumed for Pandora
const P_ATM = 101_325; // Pa
const RESIDUAL_VOLUME = 1.5; // L — untrained human, sourced
const N2_FRACTION = 0.78; // narcosis tracks the inert fraction
const NARCOSIS_PN2 = 3.2; // atm — Meyer-Overton onset, sourced

const GRAVITY = { earth: 9.81, pandora: 7.84 } as const;
type World = keyof typeof GRAVITY;

/** Metres of water per additional atmosphere, for a given surface gravity. */
export function metresPerAtm(world: World): number {
  return P_ATM / (RHO_SEAWATER * GRAVITY[world]);
}

/** Absolute pressure (atm) at depth `h` metres. */
export function absolutePressure(h: number, world: World): number {
  return 1 + h / metresPerAtm(world);
}

/** Compressed lung volume (L) at depth, by Boyle. */
function lungVolume(h: number, tlc: number, world: World): number {
  return tlc / absolutePressure(h, world);
}

const W = 320;
const H = 232;
const PAD = { l: 40, r: 14, t: 16, b: 40 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

const DEPTH_MAX = 150; // m
const VOL_MAX = 9; // L — headroom for a packed 130% vital capacity

const xOf = (h: number) => PAD.l + (h / DEPTH_MAX) * plotW;
const yOf = (v: number) => PAD.t + (1 - v / VOL_MAX) * plotH;

function volumePath(tlc: number, world: World): string {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i += 1) {
    const h = (DEPTH_MAX * i) / 120;
    pts.push(
      `${i === 0 ? "M" : "L"}${xOf(h).toFixed(1)},${yOf(lungVolume(h, tlc, world)).toFixed(1)}`,
    );
  }
  return pts.join(" ");
}

interface HydrostaticDepthDialProps {
  caption?: string;
  className?: string;
}

// Drag the depth down and watch the lung shrink toward residual volume. Then
// switch worlds: at 0.8 g the same metre of water weighs less, so the squeeze
// line and the narcosis line both retreat a quarter deeper.
export function HydrostaticDepthDial({ caption, className }: HydrostaticDepthDialProps) {
  const uid = useId();
  const t = useTranslations("viz.hydrostaticDepth");
  const [world, setWorld] = useState<World>("earth");
  const [depth, setDepth] = useState(30);
  const [tlc, setTlc] = useState(6);

  const pAbs = absolutePressure(depth, world);
  const volume = lungVolume(depth, tlc, world);
  const squeezing = volume < RESIDUAL_VOLUME;
  const narcotic = N2_FRACTION * pAbs > NARCOSIS_PN2;

  // Depths where each threshold opens, for the shaded band and the readouts.
  const mpa = metresPerAtm(world);
  const squeezeDepth = (tlc / RESIDUAL_VOLUME - 1) * mpa;
  const narcosisDepth = (NARCOSIS_PN2 / N2_FRACTION - 1) * mpa;

  const state = squeezing ? "squeeze" : narcotic ? "narcosis" : "safe";
  const tone = squeezing ? "var(--magenta)" : narcotic ? "var(--amber)" : "var(--cyan)";
  const figureTone = squeezing ? "magenta" : narcotic ? "amber" : "cyan";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${state}`)}
      caption={caption}
      tone={figureTone}
      className={className}
      controls={
        <SegmentedToggle
          options={[
            { value: "earth", label: t("world.earth"), tone: "var(--teal)" },
            { value: "pandora", label: t("world.pandora"), tone: "var(--cyan)" },
          ]}
          value={world}
          onChange={setWorld}
          ariaLabel={t("worldControl")}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", { depth: Math.round(depth), atm: pAbs.toFixed(2) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />
          <rect x={PAD.l} y={PAD.t} width={plotW} height={plotH} fill={glowUrl(uid, "grid")} />

          {/* the zone where the lung is smaller than it can physically go */}
          <rect
            x={PAD.l}
            y={yOf(RESIDUAL_VOLUME)}
            width={plotW}
            height={PAD.t + plotH - yOf(RESIDUAL_VOLUME)}
            fill="var(--magenta)"
            opacity={0.09}
          />
          <line
            x1={PAD.l}
            y1={yOf(RESIDUAL_VOLUME)}
            x2={PAD.l + plotW}
            y2={yOf(RESIDUAL_VOLUME)}
            stroke="var(--magenta)"
            strokeWidth={1.4}
            strokeOpacity={0.7}
            strokeDasharray="4 3"
          />
          <VizText x={PAD.l + 4} y={yOf(RESIDUAL_VOLUME) + 11} size="micro" tone="var(--magenta)">
            {t("residualLabel")}
          </VizText>

          {/* the inactive world, kept faint so the shift between them reads */}
          <path
            d={volumePath(tlc, world === "earth" ? "pandora" : "earth")}
            fill="none"
            stroke="var(--subtle)"
            strokeWidth={1.2}
            strokeOpacity={0.4}
            strokeDasharray="3 3"
          />
          <path
            d={volumePath(tlc, world)}
            fill="none"
            stroke={tone}
            strokeWidth={2.4}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "d 0.35s ease" }}
          />

          {/* where the squeeze opens on the active world */}
          {squeezeDepth <= DEPTH_MAX ? (
            <line
              x1={xOf(squeezeDepth)}
              y1={PAD.t}
              x2={xOf(squeezeDepth)}
              y2={PAD.t + plotH}
              stroke="var(--magenta)"
              strokeWidth={1}
              strokeOpacity={0.45}
            />
          ) : null}

          <line
            x1={xOf(depth)}
            y1={PAD.t}
            x2={xOf(depth)}
            y2={PAD.t + plotH}
            stroke="var(--foreground)"
            strokeOpacity={0.26}
            strokeWidth={1}
          />
          <circle
            cx={xOf(depth)}
            cy={yOf(volume)}
            r={4.8}
            fill={tone}
            filter={glowUrl(uid, "bloom-strong")}
            style={{ transition: "cx 0.2s ease, cy 0.3s ease" }}
          />

          {/* axes */}
          <VizTick x={PAD.l - 6} y={yOf(6) + 3} anchor="end">
            6
          </VizTick>
          <VizTick x={PAD.l - 6} y={yOf(3) + 3} anchor="end">
            3
          </VizTick>
          <VizTick x={PAD.l} y={PAD.t + plotH + 13} anchor="start">
            0
          </VizTick>
          <VizTick x={PAD.l + plotW} y={PAD.t + plotH + 13} anchor="end">
            {DEPTH_MAX}
          </VizTick>
          <VizText x={PAD.l + plotW / 2} y={H - 6} size="small" anchor="middle" tone="var(--muted)">
            {t("axis.depth")}
          </VizText>
          <VizText
            x={11}
            y={PAD.t + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 11 ${PAD.t + plotH / 2})`}
          >
            {t("axis.volume")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.pressure")}
            value={t("atmValue", { n: pAbs.toFixed(2) })}
            note={t("readout.perAtm", { n: mpa.toFixed(1) })}
            tone={tone}
          />
          <VizReadout
            label={t("readout.volume")}
            value={t("litreValue", { n: volume.toFixed(2) })}
            tone={tone}
          />
          <VizReadout
            label={t("readout.squeeze")}
            value={
              squeezeDepth > DEPTH_MAX
                ? t("readout.beyondRange")
                : t("metreValue", { n: Math.round(squeezeDepth) })
            }
            note={t(`verdict.${state}`)}
            tone={tone}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("assumption")}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VizSlider
          label={t("slider.depth")}
          display={t("metreValue", { n: Math.round(depth) })}
          min={0}
          max={DEPTH_MAX}
          step={1}
          value={depth}
          onChange={setDepth}
          tone={tone}
        />
        <VizSlider
          label={t("slider.tlc")}
          display={t("litreValue", { n: tlc.toFixed(1) })}
          min={4}
          max={8}
          step={0.1}
          value={tlc}
          onChange={setTlc}
          tone="var(--teal)"
        />
      </div>
      <p className="mt-3 font-sans text-xs leading-relaxed text-subtle">
        {t("narcosisNote", { n: Math.round(narcosisDepth) })}
      </p>
    </VizFigure>
  );
}
