"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { ventBudget } from "./vent-energy-model";

// The pyramid is drawn on a log scale because a linear one would be useless: the
// apex tier is a thousandth of the base and would vanish. Even so, the two numbers
// that matter are printed side by side — what the field delivers to the top, and
// what the pack standing there needs. They are not close, and no plausible setting
// of these sliders makes them close. Maths in the model; strings translate.

const W = 320;
const H = 216;
const CENTRE = 150;
const TOP_Y = 26;
const TIER_H = 34;

/** Widest tier, in SVG units, for the primary producers. */
const BASE_W = 250;

interface VentEnergyBudgetProps {
  caption?: string;
  className?: string;
}

export function VentEnergyBudget({ caption, className }: VentEnergyBudgetProps) {
  const uid = useId();
  const t = useTranslations("viz.ventEnergyBudget");
  const [area, setArea] = useState(5000); // m²
  const [production, setProduction] = useState(1); // kg C m^-2 yr^-1
  const [transfer, setTransfer] = useState(10); // %
  const [packCount, setPackCount] = useState(8);

  const bodyMass = 4000; // kg — the mid-range visual estimate for the animal
  const levels = 4;
  const b = ventBudget(area, production, levels, transfer / 100, packCount, bodyMass);
  const canPay = b.supplyRatio >= 1;
  const tone = canPay ? "teal" : "magenta";
  const toneVar = `var(--${tone})`;

  // Tier widths shrink by the transfer efficiency, drawn on a log scale so the
  // apex tier stays visible at all.
  const tiers = [0, 1, 2, 3].map((i) => {
    const share = (transfer / 100) ** i;
    const logSpan = Math.log10(1 / (transfer / 100) ** 3);
    const shrink = logSpan > 0 ? Math.log10(1 / share) / logSpan : 0;
    return {
      index: i,
      width: BASE_W * (1 - shrink * 0.86),
      carbon: b.fixedCarbonKgYr * share,
    };
  });

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(canPay ? "hint.sufficient" : "hint.deficit", {
        shortfall: b.supplyRatio > 0 ? Math.round(1 / b.supplyRatio) : 0,
        resident: b.maxResidentMassKg.toFixed(1),
      })}
      caption={caption}
      tone={tone}
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            apex: Math.round(b.apexCarbonKgYr),
            demand: Math.round(b.packDemandKgYr),
          })}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "magenta"]} />

          {tiers
            .slice()
            .reverse()
            .map((tier) => {
              const y = TOP_Y + (3 - tier.index) * TIER_H;
              const apex = tier.index === 3;
              return (
                <g key={tier.index}>
                  <rect
                    x={CENTRE - tier.width / 2}
                    y={y}
                    width={tier.width}
                    height={TIER_H - 8}
                    rx={3}
                    fill={apex ? toneVar : "var(--cyan)"}
                    opacity={apex ? 0.9 : 0.24 + tier.index * 0.08}
                    filter={apex ? glowUrl(uid, "bloom") : undefined}
                    style={{ transition: "width 0.25s ease" }}
                  />
                  <VizText
                    x={CENTRE}
                    y={y + TIER_H / 2 - 1}
                    size="micro"
                    anchor="middle"
                    tone={apex ? "var(--void)" : "var(--foreground)"}
                    weight={700}
                  >
                    {t(`tier.${tier.index}`)}
                  </VizText>
                  <VizText
                    x={CENTRE + BASE_W / 2 + 8}
                    y={y + TIER_H / 2 - 1}
                    size="micro"
                    tone="subtle"
                    numeric
                  >
                    {tier.carbon >= 10 ? Math.round(tier.carbon) : tier.carbon.toFixed(1)}
                  </VizText>
                </g>
              );
            })}

          <VizText x={CENTRE} y={H - 10} size="micro" anchor="middle" tone="subtle">
            {t("scaleNote")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.apexSupply")}
            value={t("readout.carbonPerYear", {
              v:
                b.apexCarbonKgYr >= 10 ? Math.round(b.apexCarbonKgYr) : b.apexCarbonKgYr.toFixed(1),
            })}
            note={t("readout.apexSupplyNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.packDemand")}
            value={t("readout.carbonPerYear", { v: Math.round(b.packDemandKgYr) })}
            note={t("readout.packDemandNote", { n: packCount })}
            tone="var(--magenta)"
          />
          <VizReadout
            label={t("readout.maxResident")}
            value={t("readout.massKg", { v: b.maxResidentMassKg.toFixed(1) })}
            note={t("readout.maxResidentNote")}
            tone={toneVar}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("earthCheck")}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VizSlider
          label={t("slider.area")}
          display={t("slider.areaValue", { v: area.toLocaleString("en-US") })}
          min={200}
          max={50_000}
          step={200}
          value={area}
          onChange={setArea}
          tone="var(--cyan)"
        />
        <VizSlider
          label={t("slider.production")}
          display={t("slider.productionValue", { v: production.toFixed(1) })}
          min={0.1}
          max={2}
          step={0.1}
          value={production}
          onChange={setProduction}
          tone="var(--teal)"
        />
        <VizSlider
          label={t("slider.transfer")}
          display={`${transfer}%`}
          min={5}
          max={25}
          step={1}
          value={transfer}
          onChange={setTransfer}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("slider.pack")}
          display={t("slider.packValue", { v: packCount })}
          min={1}
          max={20}
          step={1}
          value={packCount}
          onChange={setPackCount}
          tone="var(--magenta)"
        />
      </div>
    </VizFigure>
  );
}
