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
  CO2_EARTH,
  CO2_PANDORA,
  type World,
  exchange,
  stomatalDensity,
} from "./stomatal-bargain-dial-model";

interface StomatalBargainDialProps {
  caption?: string;
  className?: string;
}

// The trade every leaf makes, put in the reader's hands. Open the pore and carbon
// comes in — but water goes out through the same opening, and nothing can separate
// the two flows. Under Earth's thin carbon the leaf must gape and bleed to feed
// itself. Push ambient CO2 up to Pandora's ~200,000 ppm and the gradient does the
// work instead: a barely-cracked pore feeds the leaf outright, and the water bill
// nearly vanishes. The pore graphic opens and closes with the conductance slider,
// and the vapour plume thickens with the water actually being spent.
// Exchange math lives in stomatal-bargain-dial-model.ts; all strings i18n.

const W = 320;
const H = 210;
const PORE_CX = 108;
const PORE_CY = 112;

/** Log slider: the CO2 range spans three orders of magnitude. */
const CO2_MIN_LOG = Math.log10(200);
const CO2_MAX_LOG = Math.log10(250_000);

function formatCo2(ppm: number): string {
  if (ppm >= 10_000) return `${(ppm / 10_000).toFixed(1)}%`;
  return `${Math.round(ppm)} ppm`;
}

export function StomatalBargainDial({ caption, className }: StomatalBargainDialProps) {
  const uid = useId();
  const t = useTranslations("viz.stomatalBargain");
  const [world, setWorld] = useState<World>("pandora");
  const [co2Log, setCo2Log] = useState(Math.log10(CO2_PANDORA));
  const [gs, setGs] = useState(0.05);
  const [vpd, setVpd] = useState(1.2);

  const ambient = 10 ** co2Log;
  const result = exchange(world, ambient, gs, vpd);
  const density = stomatalDensity(ambient);

  const tone = world === "pandora" ? "teal" : "cyan";
  const toneVar = `var(--${tone})`;

  // Pore aperture: guard cells bow apart as conductance rises. Kept above zero so
  // a fully closed pore still reads as a pore.
  const aperture = 2 + Math.min(1, gs / 0.4) * 20;
  const plumeWidth = Math.min(30, 3 + result.transpiration * 0.9);
  const plumeOpacity = Math.min(0.85, 0.08 + result.transpiration * 0.045);
  const carbonOpacity = Math.min(0.9, 0.12 + result.assimilation * 0.02);

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
          ariaLabel={t("worldLabel")}
          value={world}
          onChange={(next) => {
            setWorld(next);
            setCo2Log(Math.log10(next === "earth" ? CO2_EARTH : CO2_PANDORA));
          }}
          options={[
            { value: "earth", label: t("earth"), tone: "var(--cyan)" },
            { value: "pandora", label: t("pandora"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full lg:w-[55%]"
          role="img"
          aria-label={t("poreLabel")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {/* Leaf surface in cross-section: epidermis with one pore through it. */}
          <rect
            x={0}
            y={PORE_CY - 6}
            width={W}
            height={44}
            fill="color-mix(in oklab, var(--surface-raised) 80%, transparent)"
          />
          <line
            x1={0}
            y1={PORE_CY - 6}
            x2={W}
            y2={PORE_CY - 6}
            stroke="var(--border-strong)"
            strokeWidth={1}
            strokeOpacity={0.7}
          />

          {/* Guard cells — two kidney shapes bowing apart as the pore opens. */}
          <ellipse
            cx={PORE_CX - aperture / 2 - 13}
            cy={PORE_CY + 16}
            rx={13}
            ry={20}
            fill={`color-mix(in oklab, ${toneVar} 26%, var(--surface))`}
            stroke={toneVar}
            strokeWidth={1.2}
            strokeOpacity={0.8}
          />
          <ellipse
            cx={PORE_CX + aperture / 2 + 13}
            cy={PORE_CY + 16}
            rx={13}
            ry={20}
            fill={`color-mix(in oklab, ${toneVar} 26%, var(--surface))`}
            stroke={toneVar}
            strokeWidth={1.2}
            strokeOpacity={0.8}
          />
          {/* The gap itself: the one door both gases must use. */}
          <rect
            x={PORE_CX - aperture / 2}
            y={PORE_CY - 4}
            width={aperture}
            height={40}
            rx={aperture / 2}
            fill="var(--void)"
          />

          {/* Water leaving, upward — width and opacity track the real bill. */}
          <path
            d={`M ${PORE_CX} ${PORE_CY - 6} C ${PORE_CX - plumeWidth} ${PORE_CY - 40}, ${
              PORE_CX + plumeWidth
            } ${PORE_CY - 62}, ${PORE_CX} ${PORE_CY - 96}`}
            fill="none"
            stroke="var(--magenta)"
            strokeWidth={Math.max(1.4, plumeWidth / 4)}
            strokeOpacity={plumeOpacity}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          />
          <VizText x={PORE_CX + 12} y={PORE_CY - 84} size="micro" tone="magenta">
            {t("waterOut")}
          </VizText>

          {/* Carbon arriving, downward through the same gap. */}
          <path
            d={`M ${PORE_CX + 74} ${PORE_CY - 90} C ${PORE_CX + 54} ${PORE_CY - 54}, ${
              PORE_CX + 20
            } ${PORE_CY - 40}, ${PORE_CX + 3} ${PORE_CY - 8}`}
            fill="none"
            stroke={toneVar}
            strokeWidth={2}
            strokeOpacity={carbonOpacity}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          />
          <VizText x={PORE_CX + 80} y={PORE_CY - 94} size="micro" tone={tone}>
            {t("carbonIn")}
          </VizText>

          {/* Mesophyll below, where the carbon is spent. */}
          <VizText x={W - 10} y={PORE_CY + 54} size="micro" anchor="end">
            {t("insideLeaf")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-3 lg:w-[45%]">
          <VizSlider
            label={t("co2Label")}
            display={formatCo2(ambient)}
            min={CO2_MIN_LOG}
            max={CO2_MAX_LOG}
            step={0.01}
            value={co2Log}
            onChange={setCo2Log}
            tone={toneVar}
          />
          <VizSlider
            label={t("apertureLabel")}
            display={gs.toFixed(3)}
            min={0.005}
            max={0.4}
            step={0.005}
            value={gs}
            onChange={setGs}
            tone={toneVar}
          />
          <VizSlider
            label={t("vpdLabel")}
            display={`${vpd.toFixed(1)} kPa`}
            min={0.2}
            max={3}
            step={0.1}
            value={vpd}
            onChange={setVpd}
            tone="var(--magenta)"
          />
          <div className="grid grid-cols-2 gap-2">
            <VizReadout
              label={t("carbonLabel")}
              value={result.assimilation.toFixed(1)}
              note={t("carbonNote")}
              tone={toneVar}
            />
            <VizReadout
              label={t("waterLabel")}
              value={result.transpiration.toFixed(1)}
              note={t("waterNote")}
              tone="var(--magenta)"
            />
          </div>
          <VizReadout
            label={t("wueLabel")}
            value={Math.round(result.intrinsicWue).toLocaleString()}
            note={t("wueNote")}
            tone={toneVar}
            tinted
          />
          <VizReadout
            label={t("densityLabel")}
            value={`${density}/mm²`}
            note={t("densityNote")}
            tone="var(--amber)"
          />
          <p className="font-sans text-xs leading-relaxed text-subtle">
            {result.saturated ? t("verdictSaturated") : t("verdictHungry")}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
