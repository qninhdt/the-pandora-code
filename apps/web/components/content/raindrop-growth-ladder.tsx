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
  NUCLEI,
  STALL_RADIUS_M,
  type World,
  criticalRadius,
  criticalSupersaturation,
  growthTrack,
  kohlerS,
  terminalVelocity,
  volumeRatio,
} from "./raindrop-growth-ladder-model";

// Rain is not condensation that kept going. Two separate barriers stand between
// vapour and a falling drop, and this figure puts them side by side.
//
// LEFT: the Köhler curve. Pick a nucleus, then raise the ambient humidity. Below
// the curve's peak the droplet sits as stable haze — push the humidity and it
// merely breathes. Cross the peak and there is no equilibrium left anywhere to
// the right, and the drop runs away. That is activation.
//
// RIGHT: the growth track on a log-radius axis. Diffusion carries the new drop
// briskly at first and then visibly gives up around 20 um, where it is still
// cloud, falling at centimetres a second. Coalescence takes over and the curve
// bends upward into rain. Switch the world and every fall speed drops by about a
// fifth, which is Pandora keeping its water aloft longer.
//
// Physics in raindrop-growth-ladder-model.ts.

const W = 300;
const H = 210;
const PAD = { l: 38, r: 14, t: 16, b: 34 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

// Both panels share a log-radius x axis so the reader can carry one mental ruler
// from the activation curve to the growth track: 0.05 um to 2.5 mm.
const R_MIN = 5e-8;
const R_MAX = 2.5e-3;
const logR = (m: number) => Math.log10(m);
const xOfR = (m: number) => PAD.l + ((logR(m) - logR(R_MIN)) / (logR(R_MAX) - logR(R_MIN))) * plotW;

// Köhler panel: supersaturation on y, in percent, log-free but clipped so the
// curve's peak sits comfortably inside the box.
const S_MAX = 0.6; // percent
const S_MIN = -0.25;
const yOfS = (pct: number) =>
  PAD.t + (1 - (Math.min(pct, S_MAX) - S_MIN) / (S_MAX - S_MIN)) * plotH;

// Growth panel: fall speed on y, log scale from 1 cm/s to 10 m/s.
const V_MIN = 0.008;
const V_MAX = 12;
const yOfV = (ms: number) =>
  PAD.t +
  (1 -
    (Math.log10(Math.max(ms, V_MIN)) - Math.log10(V_MIN)) /
      (Math.log10(V_MAX) - Math.log10(V_MIN))) *
    plotH;

const R_TICKS: Array<[m: number, label: string]> = [
  [1e-7, "0.1"],
  [1e-6, "1"],
  [1e-5, "10"],
  [1e-4, "100"],
  [1e-3, "1000"],
];

export function RaindropGrowthLadder({
  caption,
  className,
}: { caption?: string; className?: string }) {
  const t = useTranslations("viz.raindropGrowthLadder");
  const uid = useId();
  const [world, setWorld] = useState<World>("pandora");
  const [nucleusIdx, setNucleusIdx] = useState(1);
  // Ambient supersaturation the reader dials, in percent.
  const [ambient, setAmbient] = useState(0.12);

  const nucleus = NUCLEI[nucleusIdx];
  const rc = criticalRadius(nucleus);
  const sc = criticalSupersaturation(nucleus) * 100;
  const activated = ambient >= sc;

  const kohlerPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 140; i++) {
      const m = R_MIN * (R_MAX / R_MIN) ** (i / 140);
      const s = kohlerS(m, nucleus) * 100;
      if (s < S_MIN) continue;
      pts.push(`${pts.length === 0 ? "M" : "L"}${xOfR(m).toFixed(2)} ${yOfS(s).toFixed(2)}`);
    }
    return pts.join(" ");
  }, [nucleus]);

  const { track, stallMinutes } = useMemo(() => growthTrack(world), [world]);

  const growthPath = useMemo(
    () =>
      track
        .map(
          (s, i) =>
            `${i === 0 ? "M" : "L"}${xOfR(s.radiusM).toFixed(2)} ${yOfV(s.fallMs).toFixed(2)}`,
        )
        .join(" "),
    [track],
  );

  const stallSample = track.find((s) => s.radiusM >= STALL_RADIUS_M) ?? track[0];
  const finalSample = track[track.length - 1];
  const jump = Math.round(volumeRatio(1e-5, 1e-3));
  const tone = activated ? "cyan" : "amber";
  const toneVar = `var(--${tone})`;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      hint={activated ? t("hint.activated") : t("hint.haze")}
      tone={tone}
      className={className}
      controls={
        <div className="flex w-40 flex-col gap-2 sm:w-52">
          <SegmentedToggle<World>
            ariaLabel={t("worldLabel")}
            value={world}
            onChange={setWorld}
            options={[
              { value: "earth", label: t("earth"), tone: "var(--muted)" },
              { value: "pandora", label: t("pandora"), tone: "var(--teal)" },
            ]}
          />
          <VizSlider
            label={t("controls.nucleus")}
            display={t(`nucleus.${nucleus.id}`)}
            min={0}
            max={NUCLEI.length - 1}
            step={1}
            value={nucleusIdx}
            onChange={setNucleusIdx}
            tone="var(--magenta)"
          />
          <VizSlider
            label={t("controls.ambient")}
            display={`${ambient.toFixed(2)}%`}
            min={0}
            max={0.5}
            step={0.01}
            value={ambient}
            onChange={setAmbient}
            tone="var(--cyan)"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* ── Panel 1: can it start? ───────────────────────────────── */}
          <div>
            <p className="mb-1 font-sans text-xs text-muted">{t("panel.kohler")}</p>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              role="img"
              aria-label={t("aria.kohler", { sc: sc.toFixed(2), rc: (rc * 1e6).toFixed(2) })}
            >
              <GlowDefs idBase={`${uid}-k`} tones={["cyan", "amber", "magenta"]} />

              {/* the humidity the reader has dialled in */}
              <line
                x1={PAD.l}
                y1={yOfS(ambient)}
                x2={PAD.l + plotW}
                y2={yOfS(ambient)}
                stroke="var(--cyan)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.85}
              />
              <VizText x={PAD.l + 3} y={yOfS(ambient) - 4} size="micro" tone="cyan">
                {t("ambientMark", { pct: ambient.toFixed(2) })}
              </VizText>

              {/* saturation, i.e. s = 0 */}
              <line
                x1={PAD.l}
                y1={yOfS(0)}
                x2={PAD.l + plotW}
                y2={yOfS(0)}
                stroke="var(--border-strong)"
                strokeWidth={1}
                opacity={0.6}
              />

              <path
                d={kohlerPath}
                fill="none"
                stroke="var(--magenta)"
                strokeWidth={2}
                filter={glowUrl(`${uid}-k`, "bloom")}
              />

              {/* the peak: cross it and equilibrium is gone */}
              <circle
                cx={xOfR(rc)}
                cy={yOfS(sc)}
                r={4}
                fill={activated ? "var(--cyan)" : "var(--amber)"}
                filter={glowUrl(`${uid}-k`, "bloom-strong")}
              />
              <VizText
                x={xOfR(rc) + 7}
                y={yOfS(sc) - 5}
                size="micro"
                tone={activated ? "cyan" : "amber"}
              >
                {t("peakMark", { pct: sc.toFixed(2) })}
              </VizText>

              {R_TICKS.map(([m, label]) => (
                <VizTick key={m} x={xOfR(m)} y={PAD.t + plotH + 12}>
                  {label}
                </VizTick>
              ))}
              <VizText
                x={PAD.l + plotW / 2}
                y={H - 4}
                size="micro"
                anchor="middle"
                tone="var(--subtle)"
              >
                {t("axis.radius")}
              </VizText>
              <VizText
                x={10}
                y={PAD.t + plotH / 2}
                size="micro"
                anchor="middle"
                tone="var(--subtle)"
                transform={`rotate(-90 10 ${PAD.t + plotH / 2})`}
              >
                {t("axis.supersaturation")}
              </VizText>
            </svg>
          </div>

          {/* ── Panel 2: can it fall? ────────────────────────────────── */}
          <div>
            <p className="mb-1 font-sans text-xs text-muted">{t("panel.growth")}</p>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              role="img"
              aria-label={t("aria.growth", {
                stall: stallMinutes.toFixed(0),
                fall: finalSample.fallMs.toFixed(1),
              })}
            >
              <GlowDefs idBase={`${uid}-g`} tones={["cyan", "teal", "amber"]} />

              {/* the stall: where diffusion has effectively finished */}
              <line
                x1={xOfR(STALL_RADIUS_M)}
                y1={PAD.t}
                x2={xOfR(STALL_RADIUS_M)}
                y2={PAD.t + plotH}
                stroke="var(--amber)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.8}
              />
              <VizText x={xOfR(STALL_RADIUS_M) + 3} y={PAD.t + 9} size="micro" tone="amber">
                {t("stallMark")}
              </VizText>

              <path
                d={growthPath}
                fill="none"
                stroke="var(--teal)"
                strokeWidth={2}
                filter={glowUrl(`${uid}-g`, "bloom")}
              />

              {/* the two drops, at true relative position on the ruler */}
              <circle
                cx={xOfR(1e-5)}
                cy={yOfV(terminalVelocity(1e-5, world))}
                r={2.5}
                fill="var(--cyan)"
              />
              <circle
                cx={xOfR(1e-3)}
                cy={yOfV(terminalVelocity(1e-3, world))}
                r={5}
                fill="var(--cyan)"
              />

              {R_TICKS.map(([m, label]) => (
                <VizTick key={m} x={xOfR(m)} y={PAD.t + plotH + 12}>
                  {label}
                </VizTick>
              ))}
              <VizTick x={PAD.l - 6} y={yOfV(0.01) + 3} anchor="end">
                0.01
              </VizTick>
              <VizTick x={PAD.l - 6} y={yOfV(1) + 3} anchor="end">
                1
              </VizTick>
              <VizTick x={PAD.l - 6} y={yOfV(10) + 3} anchor="end">
                10
              </VizTick>
              <VizText
                x={PAD.l + plotW / 2}
                y={H - 4}
                size="micro"
                anchor="middle"
                tone="var(--subtle)"
              >
                {t("axis.radius")}
              </VizText>
              <VizText
                x={10}
                y={PAD.t + plotH / 2}
                size="micro"
                anchor="middle"
                tone="var(--subtle)"
                transform={`rotate(-90 10 ${PAD.t + plotH / 2})`}
              >
                {t("axis.fall")}
              </VizText>
            </svg>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <VizReadout
            label={t("readout.activation")}
            value={`${sc.toFixed(2)}%`}
            note={activated ? t("readout.activationYes") : t("readout.activationNo")}
            tone={toneVar}
            tinted
          />
          <VizReadout
            label={t("readout.stall")}
            value={t("cmPerSecond", { v: (stallSample.fallMs * 100).toFixed(1) })}
            note={t("readout.stallNote", { min: stallMinutes.toFixed(0) })}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("readout.rain")}
            value={t("mPerSecond", { v: finalSample.fallMs.toFixed(1) })}
            note={t("readout.rainNote", { jump: jump.toLocaleString() })}
            tone="var(--teal)"
          />
        </div>
        <p className="font-sans text-xs leading-relaxed text-subtle">{t("footnote")}</p>
      </div>
    </VizFigure>
  );
}
