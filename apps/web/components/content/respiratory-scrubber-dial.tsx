"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { breathModel } from "./respiratory-scrubber-model";

// Hurdle 2 made tangible. The reader raises Pandora's ambient CO2 and hydrogen
// sulfide and watches an unmasked human's blood pH crash and mitochondria stall
// (Fick's law: the reversed CO2 gradient floods the blood; sulfide jams the O2
// enzyme). Then they toggle the mycelial catalytic filter ON and the same
// poisonous sky becomes survivable — the symbiont eats the toxins before they
// reach the blood, the way a vent tubeworm's bacteria do. Deterministic model.

type Filter = "off" | "on";

const W = 300;
const H = 150;

export function RespiratoryScrubberDial({ className }: { className?: string }) {
  const t = useTranslations("viz.respiratoryScrubberDial");
  const uid = useId();
  const [co2, setCo2] = useState(20);
  const [h2s, setH2s] = useState(150);
  const [filter, setFilter] = useState<Filter>("off");

  const state = useMemo(() => breathModel(co2, h2s, filter === "on"), [co2, h2s, filter]);
  const tone =
    state.verdict === "safe" ? "cyan" : state.verdict === "distress" ? "amber" : "magenta";
  const toneVar = `var(--${tone})`;

  // pH bar fill: map 6.4..7.5 across the bar width.
  const phPct = Math.max(0, Math.min(1, (state.ph - 6.4) / (7.5 - 6.4)));

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={tone}
      hint={
        filter === "off"
          ? t("offHint")
          : state.verdict === "safe"
            ? t("safeHint")
            : t("partialHint")
      }
      controls={
        <SegmentedToggle<Filter>
          ariaLabel={t("filterLabel")}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "off", label: t("filterOff"), tone: "var(--magenta)" },
            { value: "on", label: t("filterOn"), tone: "var(--cyan)" },
          ]}
        />
      }
      className={className}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-1/2"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "magenta", "amber"]} />
          {/* a schematic lung sac: an ellipse whose lining glows cyan when the
              filter is active, magenta when raw poison air reaches it */}
          <ellipse
            cx={W / 2}
            cy={H / 2}
            rx={70}
            ry={48}
            fill={`color-mix(in oklab, ${toneVar} 12%, var(--void))`}
            stroke={toneVar}
            strokeWidth={filter === "on" ? 3 : 1.4}
            strokeDasharray={filter === "on" ? "0" : "4 3"}
            filter={filter === "on" ? glowUrl(uid, "bloom") : undefined}
          />
          {filter === "on" && (
            <ellipse
              cx={W / 2}
              cy={H / 2}
              rx={62}
              ry={40}
              fill="none"
              stroke="var(--cyan)"
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          )}
          <VizText x={W / 2} y={H / 2 - 4} size="small" tone={tone} anchor="middle">
            {t(`verdict.${state.verdict}`)}
          </VizText>
          <VizText x={W / 2} y={H / 2 + 12} size="micro" tone="subtle" anchor="middle">
            {filter === "on" ? t("filterLining") : t("bareLining")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/2">
          <VizReadout
            label={t("phLabel")}
            value={state.ph.toFixed(2)}
            tone={toneVar}
            tinted
            note={t("phNote")}
          />
          {/* pH bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${phPct * 100}%`, background: toneVar }}
            />
          </div>
          <VizReadout
            label={t("mitoLabel")}
            value={`${Math.round(state.mitoFunction * 100)}%`}
            tone={toneVar}
            note={t("mitoNote")}
          />
          <VizSlider
            label={t("co2Slider")}
            display={`${co2}%`}
            min={0}
            max={25}
            step={1}
            value={co2}
            onChange={setCo2}
            tone="var(--magenta)"
          />
          <VizSlider
            label={t("h2sSlider")}
            display={`${h2s} ppm`}
            min={0}
            max={400}
            step={10}
            value={h2s}
            onChange={setH2s}
            tone="var(--magenta)"
          />
        </div>
      </div>
    </VizFigure>
  );
}
