"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  AMBIENT_CO2_PCT,
  type Demand,
  H2S_LIMIT_PPM,
  filterAir,
  formatCo2,
  formatH2s,
} from "./exopack-filter-budget-model";
import { FilterTrain, TRAIN_H_VIEW, TRAIN_W_VIEW } from "./exopack-filter-train";

// The exo-pack as a budget the reader has to spend, not a magic box. One finite
// mass of sorbent, two unrelated poisons, and a slider that takes from one bed to
// feed the other. What the reader should *feel*: the obvious move is to throw the
// whole pack at the seventeen percent carbon dioxide, because seventeen is the
// big frightening number — and that move kills by the quiet route, letting tens
// of ppm of hydrogen sulfide through to jam the cells while the blood stays
// perfectly balanced. Only a middle setting clears both limits, and switching
// from resting to hard work squeezes that middle until, in a bad sulfide haze, it
// closes. Chemistry lives in exopack-filter-budget-model.ts; the gas train is
// drawn by exopack-filter-train.tsx.

const DEFAULT_SCRUBBER = 85; // the naive "spend it on the big number" setting
const DEFAULT_H2S = 200; // ppm — mid of the plausible ambient haze

const VERDICT_TONE = {
  clean: "cyan",
  pass: "teal",
  co2: "amber",
  h2s: "magenta",
  both: "magenta",
} as const;

export function ExopackFilterBudget({
  caption,
  className,
}: { caption?: string; className?: string }) {
  const t = useTranslations("viz.exopackFilterBudget");
  const uid = useId();
  const [scrubber, setScrubber] = useState(DEFAULT_SCRUBBER);
  const [h2sAmbient, setH2sAmbient] = useState(DEFAULT_H2S);
  const [demand, setDemand] = useState<Demand>("rest");

  const result = useMemo(
    () => filterAir(scrubber, h2sAmbient, demand),
    [scrubber, h2sAmbient, demand],
  );
  const tone = VERDICT_TONE[result.verdict];

  // Leak fractions: how much of each poison survives its own bed.
  const co2Leak = Math.min(1, result.co2Pct / AMBIENT_CO2_PCT);
  const h2sLeak = h2sAmbient > 0 ? Math.min(1, result.h2sPpm / h2sAmbient) : 0;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      hint={t(`verdict.${result.verdict}`)}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle<Demand>
          ariaLabel={t("demandLabel")}
          value={demand}
          onChange={setDemand}
          options={[
            { value: "rest", label: t("rest"), tone: "var(--teal)" },
            { value: "work", label: t("work"), tone: "var(--amber)" },
          ]}
        />
      }
    >
      <svg
        viewBox={`0 0 ${TRAIN_W_VIEW} ${TRAIN_H_VIEW}`}
        className="w-full"
        role="img"
        aria-label={t("aria")}
      >
        <FilterTrain
          uid={uid}
          scrubberPct={scrubber}
          co2Leak={co2Leak}
          h2sLeak={h2sLeak}
          tone={tone}
          labels={{
            intake: t("intake"),
            intakeCo2: t("co2Amount", { value: `${AMBIENT_CO2_PCT}%` }),
            intakeH2s: t("h2sAmount", { value: h2sAmbient }),
            scrubberBed: t("scrubberBed"),
            sulfideBed: t("sulfideBed"),
            delivered: t("delivered"),
            deliveredCo2: t("co2Amount", { value: formatCo2(result.co2Pct) }),
            deliveredH2s: t("h2sAmount", { value: formatH2s(result.h2sPpm) }),
            flowCaption: t("flowCaption"),
            noTank: t("noTank"),
            leakLabel: t("leakLabel"),
          }}
        />
      </svg>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("co2Out")}
          value={formatCo2(result.co2Pct)}
          tone="var(--amber)"
          note={t("co2Note")}
          tinted={result.verdict === "co2" || result.verdict === "both"}
        />
        <VizReadout
          label={t("h2sOut")}
          value={`${formatH2s(result.h2sPpm)} ppm`}
          tone="var(--magenta)"
          note={t("h2sNote", { limit: H2S_LIMIT_PPM })}
          tinted={result.verdict === "h2s" || result.verdict === "both"}
        />
        <VizReadout
          label={t("oxygenOut")}
          value={`${result.o2Kpa.toFixed(1)} kPa`}
          tone="var(--teal)"
          note={t("oxygenNote", { raw: result.rawO2Kpa.toFixed(1) })}
        />
      </div>

      <div className="mt-3 space-y-3">
        <VizSlider
          label={t("splitLabel")}
          display={t("splitDisplay", { scrubber, bed: 100 - scrubber })}
          min={0}
          max={100}
          step={1}
          value={scrubber}
          onChange={setScrubber}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("h2sLabel")}
          display={`${h2sAmbient} ppm`}
          min={0}
          max={400}
          step={10}
          value={h2sAmbient}
          onChange={setH2sAmbient}
          tone="var(--magenta)"
        />
      </div>

      <p className="mt-3 font-sans text-xs leading-relaxed text-muted">
        {Number.isFinite(result.serviceDays)
          ? t("service", { days: result.serviceDays.toFixed(1) })
          : t("serviceClean")}
      </p>
    </VizFigure>
  );
}
