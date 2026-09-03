"use client";

import {
  URNS,
  type UrnSpec,
  benchSignal,
  outcomeFor,
  urnPath,
} from "@/components/content/pitcher-convergence-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// Four Pandoran urn-formers over a soil the reader impoverishes. As the ground is
// leached the traps light up and start paying for themselves — but the number that
// never moves is how much the shared urn tells you about shared ancestry, because
// the bench holds two independent origins and one secondary abandonment.

const W = 340;
const H = 122;
const URN_W = 30;
const URN_H = 62;

interface PitcherConvergenceBenchProps {
  caption?: string;
  className?: string;
}

export function PitcherConvergenceBench({ caption, className }: PitcherConvergenceBenchProps) {
  const uid = useId();
  const t = useTranslations("viz.pitcherConvergence");
  const [nitrogen, setNitrogen] = useState(0.18);
  const [phosphorus, setPhosphorus] = useState(0.22);

  const soil = useMemo(() => ({ nitrogen, phosphorus }), [nitrogen, phosphorus]);
  const signal = useMemo(() => benchSignal(soil), [soil]);
  const outcomes = useMemo(() => URNS.map((urn) => outcomeFor(urn, soil)), [soil]);
  const scarce = signal.soilSignal > 0.5;
  const tone = scarce ? "var(--teal)" : "var(--amber)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={scarce ? "teal" : "amber"}
      caption={caption}
      hint={t("hint")}
      className={className}
    >
      <div className="flex flex-col gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {/* the substrate the three rooted taxa draw on */}
          <rect
            x={0}
            y={H - 14}
            width={W}
            height={14}
            fill={`color-mix(in oklab, ${tone} ${Math.round(signal.soilSignal * 18) + 4}%, var(--void))`}
            stroke="var(--border)"
            strokeWidth={0.5}
          />

          {URNS.map((urn, i) => (
            <Urn
              key={urn.key}
              urn={urn}
              cx={(i + 0.5) * (W / URNS.length)}
              uid={uid}
              name={t(`taxon.${urn.key}`)}
              harvestLabel={t(`harvest.${outcomes[i].harvest}`)}
              favoured={outcomes[i].favoured}
              budget={outcomes[i].budget}
            />
          ))}
        </svg>

        <div className="grid gap-3 sm:grid-cols-2">
          <VizSlider
            label={t("soil.nitrogen")}
            display={t("soil.percent", { pct: Math.round(nitrogen * 100) })}
            min={0}
            max={1}
            step={0.01}
            value={nitrogen}
            onChange={setNitrogen}
            tone={tone}
          />
          <VizSlider
            label={t("soil.phosphorus")}
            display={t("soil.percent", { pct: Math.round(phosphorus * 100) })}
            min={0}
            max={1}
            step={0.01}
            value={phosphorus}
            onChange={setPhosphorus}
            tone={tone}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <VizReadout
            label={t("readout.soilSignal")}
            value={t("readout.percent", { pct: Math.round(signal.soilSignal * 100) })}
            note={t("readout.soilSignalNote")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.origins")}
            value={signal.origins}
            note={t("readout.originsNote")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.kinshipSignal")}
            value={t("readout.percent", { pct: Math.round(signal.kinshipSignal * 100) })}
            note={t("readout.kinshipSignalNote")}
            tone={tone}
            tinted
          />
        </div>

        <p className="font-sans text-xs leading-relaxed text-muted">
          {t(scarce ? "verdict.leached" : "verdict.rich")}
        </p>
      </div>
    </VizFigure>
  );
}

/** One urn: vessel outline, fill level for the nutrient budget, and what it catches. */
function Urn({
  urn,
  cx,
  uid,
  name,
  harvestLabel,
  favoured,
  budget,
}: {
  urn: UrnSpec;
  cx: number;
  uid: string;
  name: string;
  harvestLabel: string;
  favoured: boolean;
  budget: number;
}) {
  const tone = `var(--${urn.tone})`;
  const top = 16;
  const flare = urn.strategy === "tank" ? 0.9 : 0.62;
  const fill = Math.max(0, Math.min(1, budget)) * URN_H * 0.5;

  return (
    <g transform={`translate(${cx} ${top})`}>
      <path
        d={urnPath(URN_W, URN_H, flare)}
        fill={`color-mix(in oklab, ${tone} ${favoured ? 16 : 7}%, transparent)`}
        stroke={tone}
        strokeWidth={favoured ? 1.6 : 1}
        strokeOpacity={0.85}
        filter={favoured ? glowUrl(uid, "bloom") : undefined}
      />
      {/* what has collected in the basin */}
      <rect
        x={-URN_W * 0.36}
        y={URN_H - fill - 3}
        width={URN_W * 0.72}
        height={fill}
        rx={2}
        fill={`color-mix(in oklab, ${tone} 38%, transparent)`}
      />
      {/* the epiphyte hangs in the canopy with no soil beneath it */}
      {urn.rooted ? (
        <path
          d={`M 0 ${URN_H} L 0 ${URN_H + 14}`}
          stroke={tone}
          strokeWidth={1}
          strokeOpacity={0.5}
        />
      ) : (
        <path
          d={`M ${-URN_W * 0.7} ${-2} L ${URN_W * 0.7} ${-2}`}
          stroke="var(--border-strong)"
          strokeWidth={1.2}
          strokeDasharray="3 2"
        />
      )}
      <VizText x={0} y={URN_H + 26} size="micro" anchor="middle" tone={urn.tone} weight={600}>
        {name}
      </VizText>
      <VizText x={0} y={URN_H + 35} size="micro" anchor="middle">
        {harvestLabel}
      </VizText>
    </g>
  );
}
