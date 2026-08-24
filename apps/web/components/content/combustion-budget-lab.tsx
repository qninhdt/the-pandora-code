"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  DAMKOHLER_BLOWOFF,
  EARTH_AIR,
  PANDORA_AIR,
  combustionBudget,
} from "./combustion-budget-model";

// A flame is a bookkeeping contest: enthalpy released by the reaction against
// enthalpy carried away by the product gas and the passing airstream. Carbon
// dioxide loses that contest for the flame twice over — it soaks up reaction heat
// (a triatomic molecule has more ways to store energy than N2 does) and it
// quenches the radical chain that keeps the reaction fed. Raise the airspeed and
// convection strips heat faster still, until the flame cannot outrun its own
// losses and blows off. Maths in code; strings translate.
const W = 340;
const H = 200;
const BASE_Y = 176;
const FLAME_X = 96;
const AIR_X = 236;

type Preset = "earth" | "pandora" | "custom";

export interface CombustionBudgetLabProps {
  caption?: string;
  className?: string;
}

export function CombustionBudgetLab({ caption, className }: CombustionBudgetLabProps) {
  const t = useTranslations("viz.combustion-budget");
  const uid = useId();
  const [preset, setPreset] = useState<Preset>("pandora");
  const [o2, setO2] = useState(PANDORA_AIR.o2Pct);
  const [co2, setCo2] = useState(PANDORA_AIR.co2Pct);
  const [wind, setWind] = useState(2);

  function applyPreset(next: Preset) {
    setPreset(next);
    const air = next === "earth" ? EARTH_AIR : PANDORA_AIR;
    if (next !== "custom") {
      setO2(air.o2Pct);
      setCo2(air.co2Pct);
    }
  }

  const budget = combustionBudget(o2, co2, wind);
  const blownOff = budget.damkohler < DAMKOHLER_BLOWOFF;
  const tone = blownOff ? "magenta" : budget.flameSpeedRatio < 0.75 ? "amber" : "teal";
  const toneVar = `var(--${tone})`;

  // Flame silhouette scales with burning velocity: a slow flame sits squat and
  // dim, a fast one climbs. Height is the visual proxy for the whole budget.
  const flameH = blownOff ? 12 : 26 + budget.flameSpeedRatio * 92;
  const flameW = blownOff ? 22 : 18 + budget.flameSpeedRatio * 16;
  const lean = Math.min(30, wind * 3.4);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={blownOff ? t("hint.blownOff") : t(`hint.${budget.verdict}`)}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          options={[
            { value: "earth" as Preset, label: t("preset.earth"), tone: "var(--teal)" },
            { value: "pandora" as Preset, label: t("preset.pandora"), tone: "var(--amber)" },
          ]}
          value={preset === "custom" ? "pandora" : preset}
          onChange={applyPreset}
          ariaLabel={t("presetLabel")}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            speed: Math.round(budget.flameSpeedRatio * 100),
            temp: Math.round(budget.flameTempK),
          })}
        >
          <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />

          {/* ground line the fuel bed sits on */}
          <line
            x1={16}
            y1={BASE_Y}
            x2={W - 16}
            y2={BASE_Y}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {/* the fuel bed */}
          <rect
            x={FLAME_X - 26}
            y={BASE_Y - 7}
            width={52}
            height={7}
            rx={2}
            fill="color-mix(in oklab, var(--stone, var(--subtle)) 40%, var(--void))"
          />

          {/* radial wash behind the flame, sized with the flame itself */}
          {!blownOff ? (
            <ellipse
              cx={FLAME_X}
              cy={BASE_Y - flameH * 0.45}
              rx={flameW * 2.1}
              ry={flameH * 0.7}
              fill={glowUrl(uid, `wash-${tone}`)}
            />
          ) : null}

          {/* the flame: a leaning teardrop whose height tracks burning velocity */}
          <path
            d={`M ${FLAME_X - flameW / 2} ${BASE_Y - 7}
                C ${FLAME_X - flameW / 2} ${BASE_Y - flameH * 0.55},
                  ${FLAME_X + lean - flameW * 0.1} ${BASE_Y - flameH * 0.72},
                  ${FLAME_X + lean} ${BASE_Y - flameH}
                C ${FLAME_X + lean + flameW * 0.5} ${BASE_Y - flameH * 0.6},
                  ${FLAME_X + flameW / 2} ${BASE_Y - flameH * 0.4},
                  ${FLAME_X + flameW / 2} ${BASE_Y - 7} Z`}
            fill={toneVar}
            fillOpacity={blownOff ? 0.3 : 0.72}
            filter={blownOff ? undefined : glowUrl(uid, "bloom")}
            style={{ transition: "d 0.4s ease, fill-opacity 0.3s ease" }}
          />

          <VizText x={FLAME_X} y={BASE_Y + 15} size="micro" tone="subtle" anchor="middle">
            {t("fuelBed")}
          </VizText>

          {/* the two heat-loss channels, drawn as arrows leaving the flame */}
          <LossArrow
            x={AIR_X}
            y={54}
            label={t("loss.diluent")}
            value={`${Math.round(budget.diluentSinkPct)}%`}
            tone="var(--cyan)"
          />
          <LossArrow
            x={AIR_X}
            y={104}
            label={t("loss.convective")}
            value={`${Math.round(budget.convectiveStripPct)}%`}
            tone="var(--cyan)"
          />

          {/* airstream ticks — density of marks tracks the wind slider */}
          {Array.from({ length: Math.max(1, Math.round(wind)) }, (_, i) => (
            <line
              key={`gust-${i}`}
              x1={20}
              y1={30 + i * 9}
              x2={20 + 34}
              y2={30 + i * 9}
              stroke="var(--cyan)"
              strokeOpacity={0.3}
              strokeWidth={1}
              strokeLinecap="round"
            />
          ))}
          <VizText x={20} y={24} size="micro" tone="subtle">
            {t("airstream")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.flameSpeed")}
            value={`${Math.round(budget.flameSpeedRatio * 100)}%`}
            note={t("readout.flameSpeedNote")}
            tone={toneVar}
          />
          <VizReadout
            label={t("readout.flameTemp")}
            value={`${Math.round(budget.flameTempK)} K`}
            note={t("readout.flameTempNote", { delta: Math.round(budget.flameTempDropK) })}
            tone={toneVar}
          />
          <VizReadout
            label={t("readout.verdict")}
            value={blownOff ? t("verdict.blownOff") : t(`verdict.${budget.verdict}`)}
            note={t("readout.verdictNote")}
            tone={toneVar}
            tinted
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <VizSlider
          label={t("slider.o2")}
          display={`${o2.toFixed(0)}%`}
          min={12}
          max={30}
          step={1}
          value={o2}
          onChange={(v) => {
            setO2(v);
            setPreset("custom");
          }}
          tone="var(--teal)"
        />
        <VizSlider
          label={t("slider.co2")}
          display={co2 < 1 ? `${co2.toFixed(2)}%` : `${co2.toFixed(0)}%`}
          min={0}
          max={25}
          step={1}
          value={co2}
          onChange={(v) => {
            setCo2(v);
            setPreset("custom");
          }}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("slider.wind")}
          display={t("slider.windValue", { v: wind.toFixed(0) })}
          min={0}
          max={12}
          step={1}
          value={wind}
          onChange={setWind}
          tone="var(--cyan)"
        />
      </div>
    </VizFigure>
  );
}

// One heat-loss channel: a short arrow leaving the flame with its share of the
// reaction enthalpy. Both losses point the same way — away from the reaction.
function LossArrow({
  x,
  y,
  label,
  value,
  tone,
}: {
  x: number;
  y: number;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <g>
      <line
        x1={x - 46}
        y1={y}
        x2={x + 10}
        y2={y}
        stroke={tone}
        strokeOpacity={0.45}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <path d={`M ${x + 10} ${y - 4} L ${x + 18} ${y} L ${x + 10} ${y + 4} Z`} fill={tone} />
      <VizText x={x - 44} y={y - 6} size="micro" tone="subtle">
        {label}
      </VizText>
      <VizText x={x + 24} y={y + 3} size="small" tone={tone} numeric weight={700}>
        {value}
      </VizText>
    </g>
  );
}
