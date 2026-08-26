"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  DependentSpeciesLedgerChart,
  LedgerBar,
  MAX_YEARS,
} from "./dependent-species-ledger-chart";
import {
  ASH_ASSOCIATED,
  ASH_OBLIGATE_PCT,
  LUEHEA_OBLIGATE_PCT,
  apparentRichnessAt,
  debtPaidAt,
  ledgerOf,
} from "./dependent-species-ledger-model";

// A census taken the week after a giant falls tells you almost nothing, and this
// figure is built so the reader discovers that by walking the clipboard forward.
// Set how many species lived on the tree and how many of them had nowhere else to
// go; the ledger fixes the doomed total on the day of the felling. Then scrub the
// years and watch the line a census would draw sag toward a floor it was always
// heading for. The gap between what is recorded and what is already owed is
// extinction debt — the number the morning-after estimate misses.
// Arithmetic lives in dependent-species-ledger-model.ts; strings come from i18n.

type Calibration = "ash" | "canopy" | "hometree";

// Each preset is an Earth count from the chapter's research note; the Hometree
// column is this chapter's own stated inference, not a canon figure.
const PRESETS: Record<Calibration, { associated: number; obligatePct: number }> = {
  ash: { associated: ASH_ASSOCIATED, obligatePct: ASH_OBLIGATE_PCT },
  canopy: { associated: 1200, obligatePct: LUEHEA_OBLIGATE_PCT },
  hometree: { associated: 2000, obligatePct: 20 },
};

const CAL_TONE: Record<Calibration, string> = {
  ash: "var(--teal)",
  canopy: "var(--cyan)",
  hometree: "var(--magenta)",
};

interface DependentSpeciesLedgerProps {
  caption?: string;
  className?: string;
}

export function DependentSpeciesLedger({ caption, className }: DependentSpeciesLedgerProps) {
  const t = useTranslations("viz.dependentSpeciesLedger");

  const [calibration, setCalibration] = useState<Calibration>("ash");
  const [obligatePct, setObligatePct] = useState(PRESETS.ash.obligatePct);
  // Share of each tenant's local host supply that stood in this one tree.
  const [hostSharePct, setHostSharePct] = useState(60);
  const [years, setYears] = useState(8);

  const associated = PRESETS[calibration].associated;
  const tone = CAL_TONE[calibration];

  const ledger = useMemo(
    () =>
      ledgerOf({
        associated,
        obligateShare: obligatePct / 100,
        hostShare: hostSharePct / 100,
      }),
    [associated, obligatePct, hostSharePct],
  );

  const recorded = apparentRichnessAt(ledger, years);
  const paid = debtPaidAt(ledger, years);

  const bands = [
    { id: "safe", label: t("band.safe"), n: ledger.safe, fill: "var(--teal)" },
    {
      id: "affiliates",
      label: t("band.affiliates"),
      n: ledger.affiliatesDoomed,
      fill: "var(--amber)",
    },
    {
      id: "obligates",
      label: t("band.obligates"),
      n: ledger.obligatesDoomed,
      fill: "var(--magenta)",
    },
  ];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone={calibration === "hometree" ? "magenta" : "cyan"}
      className={className}
    >
      {/* Full width rather than in the header: three tree names do not fit
          alongside the title at phone width. */}
      <SegmentedToggle<Calibration>
        ariaLabel={t("calibrationLabel")}
        value={calibration}
        onChange={(c) => {
          setCalibration(c);
          setObligatePct(PRESETS[c].obligatePct);
        }}
        options={[
          { value: "ash", label: t("calibration.ash"), tone: CAL_TONE.ash },
          { value: "canopy", label: t("calibration.canopy"), tone: CAL_TONE.canopy },
          { value: "hometree", label: t("calibration.hometree"), tone: CAL_TONE.hometree },
        ]}
        className="mb-4 w-full"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <DependentSpeciesLedgerChart
          ledger={ledger}
          associated={associated}
          years={years}
          tone={tone}
          ariaLabel={t("aria", {
            doomed: Math.round(ledger.doomed),
            recorded: Math.round(recorded),
            years: Math.round(years),
          })}
          axisTime={t("axis.time")}
          axisSpecies={t("axis.species")}
          floorLabel={t("floor")}
        />

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.recorded")}
            value={Math.round(recorded)}
            note={t("readout.recordedNote", { years: Math.round(years) })}
            tone={tone}
          />
          <VizReadout
            label={t("readout.doomed")}
            value={Math.round(ledger.doomed)}
            note={t("readout.doomedNote")}
            tone="var(--magenta)"
            tinted
          />
          <VizReadout
            label={t("readout.paid")}
            value={`${Math.round(paid * 100)}%`}
            note={
              paid < 0.4
                ? t("verdict.early")
                : paid < 0.85
                  ? t("verdict.paying")
                  : t("verdict.settled")
            }
            tone="var(--amber)"
          />
          <LedgerBar bands={bands} total={associated} label={t("barLabel")} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <VizSlider
          label={t("slider.obligates")}
          display={t("pct", { n: obligatePct.toFixed(1) })}
          min={0}
          max={40}
          step={0.5}
          value={obligatePct}
          onChange={setObligatePct}
          tone="var(--magenta)"
        />
        <VizSlider
          label={t("slider.hostShare")}
          display={t("pct", { n: String(hostSharePct) })}
          min={0}
          max={100}
          step={1}
          value={hostSharePct}
          onChange={setHostSharePct}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("slider.years")}
          display={t("years", { n: String(years) })}
          min={0}
          max={MAX_YEARS}
          step={1}
          value={years}
          onChange={setYears}
          tone={tone}
        />
      </div>
    </VizFigure>
  );
}
