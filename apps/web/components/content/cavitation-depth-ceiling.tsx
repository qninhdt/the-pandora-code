"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE MODEL — how fast you may swim is set by how deep you are
//
// Accelerate water over a fin or through a nozzle and its local static
// pressure drops. If it falls to the vapour pressure of seawater the
// liquid tears into bubbles, and the bubbles collapse against the
// surface at gigapascal pressures. The onset condition is the cavitation
// number falling to a critical value:
//
//   σ = (p∞ − p_v) / (½ ρ U²)  ,  cavitation when σ ≤ σ_crit
//
// Ambient pressure grows with depth, p∞ = P0 + ρgz, so the speed ceiling
// grows with the square root of depth:
//
//   U_crit = √( 2(P0 + ρgz − p_v) / (ρ σ_crit) )   ∝ √z
//
// At this surface anchor the ceiling lands at 14 m/s with σ_crit = 1, matching
// the measured burst limit for dolphins and fast teleosts (Iosilevskii & Weihs
// 2008) — cetacean flukes carry pain receptors, so the limit is enforced
// behaviourally before the tissue erodes. That anchor is the calibration; the
// depth dependence then follows from ambient pressure alone. Two hundred metres
// down the ceiling has already quadrupled, and a kilometre down the same geometry
// can run an order of magnitude faster without a single bubble forming.
//
// A real fin cavitates at its local suction peak rather than at free-stream
// dynamic pressure, so σ_crit is left adjustable rather than fixed — raising it
// lowers the whole boundary without changing its √z shape.
// ─────────────────────────────────────────────────────────────────────

const P0 = 101_325; // surface atmospheric pressure (Pa)
const RHO = 1025; // seawater density (kg m^-3)
const G = 9.81;
const P_VAPOUR = 2340; // vapour pressure of seawater at ~20 °C (Pa)

/** Fastest cavitation-free speed at this depth (m s^-1). */
function criticalVelocity(depthM: number, sigmaCrit: number): number {
  const ambient = P0 + RHO * G * depthM;
  return Math.sqrt((2 * (ambient - P_VAPOUR)) / (RHO * sigmaCrit));
}

/** Shallowest depth at which this speed stays cavitation-free (m). */
function minimumSafeDepth(speedMs: number, sigmaCrit: number): number {
  const needed = (RHO * sigmaCrit * speedMs * speedMs) / 2 + P_VAPOUR;
  return Math.max(0, (needed - P0) / (RHO * G));
}

const W = 320;
const H = 250;
const PAD = { l: 46, r: 16, t: 20, b: 42 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

const DEPTH_MAX = 4000;
const SPEED_MAX = 300;
/** Depth runs downward, like a real water column. */
const yOf = (depthM: number) => PAD.t + (depthM / DEPTH_MAX) * plotH;
const xOf = (speedMs: number) => PAD.l + (Math.min(speedMs, SPEED_MAX) / SPEED_MAX) * plotW;

/** The cavitation boundary: safe to the left, bubbles to the right. */
function boundaryPath(sigmaCrit: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 80; i += 1) {
    const depth = (DEPTH_MAX * i) / 80;
    pts.push(
      `${i === 0 ? "M" : "L"}${xOf(criticalVelocity(depth, sigmaCrit)).toFixed(1)},${yOf(depth).toFixed(1)}`,
    );
  }
  return pts.join(" ");
}

interface CavitationDepthCeilingProps {
  caption?: string;
  className?: string;
}

export function CavitationDepthCeiling({ caption, className }: CavitationDepthCeilingProps) {
  const uid = useId();
  const t = useTranslations("viz.cavitationCeiling");
  const [depth, setDepth] = useState(1200); // m
  const [burst, setBurst] = useState(35); // m/s
  const [sigmaCrit, setSigmaCrit] = useState(1);

  const ceiling = criticalVelocity(depth, sigmaCrit);
  const safeDepth = minimumSafeDepth(burst, sigmaCrit);
  const cavitating = burst > ceiling;
  const tone = cavitating ? "magenta" : "teal";
  const toneVar = `var(--${tone})`;
  const surfaceCeiling = criticalVelocity(0, sigmaCrit);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(cavitating ? "hint.cavitating" : "hint.clean", {
        depth: Math.round(safeDepth),
      })}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <div className="w-40 sm:w-52">
          <VizSlider
            label={t("slider.sigma")}
            display={sigmaCrit.toFixed(2)}
            min={0.5}
            max={1.2}
            step={0.05}
            value={sigmaCrit}
            onChange={setSigmaCrit}
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
          aria-label={t("aria", {
            depth: Math.round(depth),
            ceiling: Math.round(ceiling),
          })}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "amber"]} />

          {/* the cavitating half of the plane */}
          <path
            d={`${boundaryPath(sigmaCrit)} L ${PAD.l + plotW} ${PAD.t + plotH} L ${PAD.l + plotW} ${PAD.t} Z`}
            fill="var(--magenta)"
            opacity={0.09}
          />
          <path
            d={boundaryPath(sigmaCrit)}
            fill="none"
            stroke="var(--magenta)"
            strokeWidth={1.8}
            strokeOpacity={0.8}
          />

          {/* the measured surface ceiling for fast Earth swimmers */}
          <rect
            x={xOf(10)}
            y={PAD.t}
            width={xOf(15) - xOf(10)}
            height={plotH}
            fill="var(--amber)"
            opacity={0.16}
          />
          <VizText x={xOf(15) + 4} y={PAD.t + 12} size="micro" tone="var(--amber)">
            {t("band.dolphin")}
          </VizText>

          {/* axes */}
          <line
            x1={PAD.l}
            y1={PAD.t}
            x2={PAD.l}
            y2={PAD.t + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD.l}
            y1={PAD.t}
            x2={PAD.l + plotW}
            y2={PAD.t}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <VizTick x={PAD.l - 7} y={yOf(0) + 3} anchor="end">
            0
          </VizTick>
          <VizTick x={PAD.l - 7} y={yOf(2000) + 3} anchor="end">
            2000
          </VizTick>
          <VizTick x={PAD.l - 7} y={yOf(4000) + 3} anchor="end">
            4000
          </VizTick>
          <VizText
            x={12}
            y={PAD.t + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 12 ${PAD.t + plotH / 2})`}
          >
            {t("axis.depth")}
          </VizText>
          <VizText x={PAD.l + plotW / 2} y={H - 8} size="small" anchor="middle" tone="var(--muted)">
            {t("axis.speed")}
          </VizText>
          <VizTick x={xOf(100)} y={PAD.t - 6}>
            100
          </VizTick>
          <VizTick x={xOf(200)} y={PAD.t - 6}>
            200
          </VizTick>

          {/* the animal's chosen burst speed, and where it currently is */}
          <line
            x1={xOf(burst)}
            y1={PAD.t}
            x2={xOf(burst)}
            y2={PAD.t + plotH}
            stroke={toneVar}
            strokeWidth={1.2}
            strokeOpacity={0.6}
            strokeDasharray="3 3"
          />
          <circle
            cx={xOf(burst)}
            cy={yOf(depth)}
            r={5}
            fill={toneVar}
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "cx 0.2s ease, cy 0.2s ease" }}
          />
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.ceiling")}
            value={`${Math.round(ceiling)} m/s`}
            note={t("readout.ceilingNote", { factor: (ceiling / surfaceCeiling).toFixed(1) })}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.safeDepth")}
            value={safeDepth < 1 ? t("readout.anyDepth") : `${Math.round(safeDepth)} m`}
            note={t("readout.safeDepthNote")}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.verdict")}
            value={t(cavitating ? "verdict.cavitating" : "verdict.clean")}
            note={t("readout.verdictNote")}
            tone={toneVar}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("units")}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VizSlider
          label={t("slider.depth")}
          display={t("slider.depthValue", { v: Math.round(depth) })}
          min={0}
          max={DEPTH_MAX}
          step={25}
          value={depth}
          onChange={setDepth}
          tone="var(--cyan)"
        />
        <VizSlider
          label={t("slider.burst")}
          display={`${burst.toFixed(0)} m/s`}
          min={5}
          max={120}
          step={1}
          value={burst}
          onChange={setBurst}
          tone={toneVar}
        />
      </div>
    </VizFigure>
  );
}
