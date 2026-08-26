"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { propulsionComparison } from "./jet-versus-foil-model";

// Both engines are asked to do the identical job — hold this animal at this speed
// — and the difference is entirely in how much water each one grabs. A siphon has
// a small aperture, so it must throw its water fast, and everything it throws
// faster than the body is moving is wasted in the wake. A wing sweeps a disk
// hundreds of times larger and barely disturbs it. Widen the aperture and the jet
// closes the gap, which is the joke: at the aperture where a jet would be as
// efficient as a wing, it has become a wing. Maths in the model; strings translate.

const W = 340;
const H = 210;
const PAD = { l: 42, r: 14, t: 20, b: 46 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

/** Wake-velocity axis, normalised to swimming speed. */
const RATIO_MAX = 9;
const xOf = (ratio: number) => PAD.l + (Math.min(ratio, RATIO_MAX) / RATIO_MAX) * plotW;
const yOf = (eff: number) => PAD.t + (1 - eff) * plotH;

/** η = 2/(1 + u_j/u) — the whole trade-off in one curve. */
function efficiencyCurve(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i += 1) {
    const ratio = 1 + ((RATIO_MAX - 1) * i) / 120;
    pts.push(`${i === 0 ? "M" : "L"}${xOf(ratio).toFixed(1)},${yOf(2 / (1 + ratio)).toFixed(1)}`);
  }
  return pts.join(" ");
}
const EFFICIENCY_PATH = efficiencyCurve();

type Duty = "pulsed" | "continuous";

interface JetVersusFoilEfficiencyProps {
  caption?: string;
  className?: string;
}

export function JetVersusFoilEfficiency({ caption, className }: JetVersusFoilEfficiencyProps) {
  const uid = useId();
  const t = useTranslations("viz.jetVersusFoil");
  const [mass, setMass] = useState(4000); // kg
  const [speed, setSpeed] = useState(2); // m/s
  const [aperture, setAperture] = useState(200); // cm² total, both siphons
  const [duty, setDuty] = useState<Duty>("pulsed");

  const r = propulsionComparison(mass, speed, aperture, duty === "pulsed");
  const jetRatio = r.jetVelocityMs / speed;
  const jetWins = r.jetPenaltyFactor <= 1;
  const tone = jetWins ? "teal" : r.jetPenaltyFactor < 2 ? "amber" : "magenta";
  const toneVar = `var(--${tone})`;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(jetWins ? "hint.competitive" : "hint.penalised", {
        factor: r.jetPenaltyFactor.toFixed(1),
      })}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          options={[
            { value: "pulsed" as Duty, label: t("duty.pulsed"), tone: "var(--magenta)" },
            { value: "continuous" as Duty, label: t("duty.continuous"), tone: "var(--teal)" },
          ]}
          value={duty}
          onChange={setDuty}
          ariaLabel={t("dutyLabel")}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            jet: Math.round(r.jet.froudeEfficiency * 100),
            foil: Math.round(r.foil.froudeEfficiency * 100),
          })}
        >
          <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />

          <rect
            x={PAD.l}
            y={PAD.t}
            width={plotW}
            height={plotH}
            fill={glowUrl(uid, "grid")}
            opacity={0.5}
          />

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
            y1={PAD.t + plotH}
            x2={PAD.l + plotW}
            y2={PAD.t + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <VizTick x={PAD.l - 7} y={yOf(1) + 3} anchor="end">
            100%
          </VizTick>
          <VizTick x={PAD.l - 7} y={yOf(0.5) + 3} anchor="end">
            50%
          </VizTick>
          <VizText
            x={11}
            y={PAD.t + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 11 ${PAD.t + plotH / 2})`}
          >
            {t("axis.efficiency")}
          </VizText>
          <VizText
            x={PAD.l + plotW / 2}
            y={H - 26}
            size="small"
            anchor="middle"
            tone="var(--muted)"
          >
            {t("axis.wakeRatio")}
          </VizText>

          <path
            d={EFFICIENCY_PATH}
            fill="none"
            stroke="var(--stone, var(--subtle))"
            strokeWidth={1.6}
            strokeOpacity={0.55}
          />

          {/* the wing: a broad slow disk, so its wake barely outruns the body */}
          <circle
            cx={xOf(1 + 0.27)}
            cy={yOf(r.foil.froudeEfficiency)}
            r={5}
            fill="var(--teal)"
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "cy 0.2s ease" }}
          />
          <VizText
            x={xOf(1.27) + 10}
            y={yOf(r.foil.froudeEfficiency) + 3}
            size="small"
            tone="var(--teal)"
            weight={700}
          >
            {t("marker.foil")}
          </VizText>

          {/* the siphon: pushed right along the curve as the aperture narrows */}
          <line
            x1={xOf(jetRatio)}
            y1={yOf(r.jet.froudeEfficiency)}
            x2={xOf(jetRatio)}
            y2={PAD.t + plotH}
            stroke={toneVar}
            strokeWidth={1.1}
            strokeOpacity={0.55}
            strokeDasharray="3 3"
          />
          <circle
            cx={xOf(jetRatio)}
            cy={yOf(r.jet.froudeEfficiency)}
            r={5}
            fill={toneVar}
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "cx 0.2s ease, cy 0.2s ease" }}
          />
          <VizText
            x={xOf(jetRatio) - 10}
            y={yOf(r.jet.froudeEfficiency) - 8}
            size="small"
            anchor="end"
            tone={toneVar}
            weight={700}
          >
            {t("marker.jet")}
          </VizText>

          <VizText x={PAD.l + 4} y={H - 8} size="micro" tone="subtle">
            {t("footnote", { area: (r.breakEvenApertureM2 * 10_000).toFixed(0) })}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.jetVelocity")}
            value={`${r.jetVelocityMs.toFixed(1)} m/s`}
            note={t("readout.jetVelocityNote", { ratio: jetRatio.toFixed(1) })}
            tone={toneVar}
          />
          <VizReadout
            label={t("readout.wasted")}
            value={`${(r.jet.wastedPowerW / 1000).toFixed(1)} kW`}
            note={t("readout.wastedNote")}
            tone="var(--magenta)"
          />
          <VizReadout
            label={t("readout.cost")}
            value={`${r.jet.costOfTransport.toFixed(2)} / ${r.foil.costOfTransport.toFixed(2)}`}
            note={t("readout.costNote", { factor: r.jetPenaltyFactor.toFixed(1) })}
            tone={toneVar}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("units")}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <VizSlider
          label={t("slider.mass")}
          display={t("slider.massValue", { v: (mass / 1000).toFixed(1) })}
          min={200}
          max={8000}
          step={100}
          value={mass}
          onChange={setMass}
          tone="var(--cyan)"
        />
        <VizSlider
          label={t("slider.speed")}
          display={`${speed.toFixed(1)} m/s`}
          min={0.5}
          max={8}
          step={0.1}
          value={speed}
          onChange={setSpeed}
          tone="var(--teal)"
        />
        <VizSlider
          label={t("slider.aperture")}
          display={t("slider.apertureValue", { v: aperture.toFixed(0) })}
          min={40}
          max={900}
          step={10}
          value={aperture}
          onChange={setAperture}
          tone="var(--amber)"
        />
      </div>
    </VizFigure>
  );
}
