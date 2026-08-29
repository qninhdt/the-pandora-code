"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  CO2_PANDORA,
  type Pathway,
  eventSequence,
  ledger,
} from "./rubisco-error-ledger-model";

interface RubiscoErrorLedgerProps {
  caption?: string;
  className?: string;
}

// A hundred turns of the enzyme, drawn as a hundred tiles. Teal tiles are the
// turns that caught carbon and built sugar; magenta tiles are the turns that
// caught oxygen instead and produced a fragment the cell must pay to clean up.
// Slide ambient CO2 from Earth's 425 ppm toward Pandora's ~200,000 and watch the
// magenta drain out of the grid. Then switch pathway: the pumping tricks Earth
// evolved to fight the error are worth their extra ATP in thin air and worth
// nothing at all once the air itself does the concentrating.
// Ledger math lives in rubisco-error-ledger-model.ts; all strings i18n.

const TILE_COUNT = 100;
const COLS = 20;
const TILE = 14;
const GAP = 2;
const W = COLS * TILE + (COLS - 1) * GAP;
const ROWS = TILE_COUNT / COLS;
const H = ROWS * TILE + (ROWS - 1) * GAP;

const CO2_MIN_LOG = Math.log10(200);
const CO2_MAX_LOG = Math.log10(250_000);

function formatCo2(ppm: number): string {
  if (ppm >= 10_000) return `${(ppm / 10_000).toFixed(1)}%`;
  return `${Math.round(ppm)} ppm`;
}

export function RubiscoErrorLedger({ caption, className }: RubiscoErrorLedgerProps) {
  const uid = useId();
  const t = useTranslations("viz.rubiscoLedger");
  const [co2Log, setCo2Log] = useState(Math.log10(CO2_PANDORA));
  const [pathway, setPathway] = useState<Pathway>("c3");

  const ambient = 10 ** co2Log;
  const result = ledger(ambient, pathway);
  const events = useMemo(
    () => eventSequence(result.carboxylationShare, TILE_COUNT),
    [result.carboxylationShare],
  );

  const mistakes = events.filter((e) => !e).length;
  const tone = mistakes <= 2 ? "teal" : "cyan";
  const toneVar = `var(--${tone})`;

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
          ariaLabel={t("pathwayLabel")}
          value={pathway}
          onChange={setPathway}
          options={[
            { value: "c3", label: t("c3"), tone: "var(--cyan)" },
            { value: "c4", label: t("c4"), tone: "var(--teal)" },
            { value: "cam", label: t("cam"), tone: "var(--amber)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="lg:w-[52%]">
          <svg
            viewBox={`0 0 ${W} ${H + 16}`}
            className="w-full"
            role="img"
            aria-label={t("gridLabel", { mistakes })}
          >
            <GlowDefs idBase={uid} tones={["teal", "magenta", "cyan"]} />
            {events.map((caughtCarbon, i) => {
              const col = i % COLS;
              const row = Math.floor(i / COLS);
              return (
                <rect
                  key={i}
                  x={col * (TILE + GAP)}
                  y={row * (TILE + GAP)}
                  width={TILE}
                  height={TILE}
                  rx={2.5}
                  fill={
                    caughtCarbon
                      ? `color-mix(in oklab, ${toneVar} 38%, var(--void))`
                      : "color-mix(in oklab, var(--magenta) 55%, var(--void))"
                  }
                  stroke={caughtCarbon ? toneVar : "var(--magenta)"}
                  strokeWidth={0.7}
                  strokeOpacity={caughtCarbon ? 0.45 : 0.9}
                  filter={caughtCarbon ? undefined : glowUrl(uid, "bloom")}
                />
              );
            })}
            <VizText x={0} y={H + 12} size="micro" tone={tone}>
              {t("legendSugar")}
            </VizText>
            <VizText x={W} y={H + 12} size="micro" tone="magenta" anchor="end">
              {t("legendMistake")}
            </VizText>
          </svg>
        </div>

        <div className="flex flex-col gap-3 lg:w-[48%]">
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
          <div className="grid grid-cols-2 gap-2">
            <VizReadout
              label={t("mistakesLabel")}
              value={`${mistakes}/100`}
              note={t("mistakesNote")}
              tone="var(--magenta)"
            />
            <VizReadout
              label={t("givenBackLabel")}
              value={`${(result.photorespiratoryLoss * 100).toFixed(1)}%`}
              note={t("givenBackNote")}
              tone="var(--magenta)"
            />
          </div>
          <VizReadout
            label={t("netLabel")}
            value={`${result.netCarbon.toFixed(1)}%`}
            note={t("netNote")}
            tone={toneVar}
            tinted
          />
          <VizReadout
            label={t("pumpLabel")}
            value={result.pumpCost === 0 ? t("pumpNone") : `+${result.pumpCost} ATP`}
            note={result.pumpRedundant ? t("pumpRedundant") : t("pumpEarning")}
            tone={result.pumpRedundant ? "var(--magenta)" : "var(--amber)"}
          />
          <p className="font-sans text-xs leading-relaxed text-subtle">
            {result.pumpRedundant
              ? t("verdictRedundant")
              : mistakes <= 2
                ? t("verdictClean")
                : t("verdictLeaky")}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
