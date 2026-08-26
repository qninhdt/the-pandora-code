"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { CRITICAL_DENSITY, type NetworkShape, runRace } from "./regeneration-race-model";
import { RegenerationRacePlot } from "./regeneration-race-plot";

interface RegenerationRaceProps {
  caption?: string;
  className?: string;
}

// Damage is only half the story; repair is the other half, and it is the half
// graph theory leaves out. The reader sets how fast the network is burned and how
// fast it reseeds itself, and watches the standing density either level off at a
// scarred but connected plateau or slide past the critical density — at which
// point the line does not sag, it falls off the cliff. The feeling to leave
// behind: resilience is not armour, it is a rate, and a rate can be outrun.
// Race arithmetic lives in regeneration-race-model.ts; the plot geometry in
// regeneration-race-plot.tsx.

const BURN_DEFAULT = 1.2; // percent of the original network cleared per year
const REGROW_DEFAULT = 12; // percent per year at the network's most productive

export function RegenerationRace({ caption, className }: RegenerationRaceProps) {
  const t = useTranslations("viz.regenerationRace");
  const uid = useId();

  const [burnPct, setBurnPct] = useState(BURN_DEFAULT);
  const [regrowPct, setRegrowPct] = useState(REGROW_DEFAULT);
  const [shape, setShape] = useState<NetworkShape>("scaleFree");

  const result = useMemo(
    () => runRace(burnPct / 100, regrowPct / 100, shape),
    [burnPct, regrowPct, shape],
  );
  const critical = CRITICAL_DENSITY[shape];
  const shattered = result.shatterYear !== null;

  const tone = shattered ? "var(--magenta)" : "var(--teal)";
  const figTone = shattered ? "magenta" : "teal";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={figTone}
      hint={
        shattered
          ? t("hint.shattered", { year: String(result.shatterYear) })
          : t("hint.holding", { pct: Math.round(result.settled * 100) })
      }
      controls={
        <SegmentedToggle<NetworkShape>
          ariaLabel={t("shapeLabel")}
          value={shape}
          onChange={setShape}
          options={[
            { value: "scaleFree", label: t("shapes.scaleFree"), tone: "var(--teal)" },
            { value: "lattice", label: t("shapes.lattice"), tone: "var(--amber)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <RegenerationRacePlot
          density={result.density}
          critical={critical}
          shatterYear={result.shatterYear}
          tone={tone}
          idBase={uid}
          ariaLabel={t("aria", {
            pct: Math.round(result.settled * 100),
            verdict: shattered ? t("verdict.shattered") : t("verdict.holding"),
          })}
          criticalLabel={t("criticalLabel", { pct: (critical * 100).toFixed(0) })}
          axisFull={t("axisFull")}
          axisGone={t("axisGone")}
          axisYears={t("axisYears")}
        />

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("verdictLabel")}
            value={shattered ? t("verdict.shattered") : t("verdict.holding")}
            tone={tone}
            tinted
            note={
              shattered
                ? t("shatterNote", { year: String(result.shatterYear) })
                : t("holdingNote", { pct: Math.round(result.settled * 100) })
            }
          />
          <VizSlider
            label={t("burnSlider")}
            display={t("perYear", { n: burnPct.toFixed(1) })}
            min={0}
            max={6}
            step={0.1}
            value={burnPct}
            onChange={setBurnPct}
            tone="var(--magenta)"
          />
          <VizSlider
            label={t("regrowSlider")}
            display={t("perYear", { n: regrowPct.toFixed(0) })}
            min={0}
            max={40}
            step={1}
            value={regrowPct}
            onChange={setRegrowPct}
            tone="var(--teal)"
          />
          <p className="font-sans text-xs leading-relaxed text-subtle">{t("regrowNote")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
