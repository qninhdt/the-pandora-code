"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  PATHWAYS,
  PATHWAY_IDS,
  type PathwayId,
  bestEnrichment,
  hostsPathway,
  pathwayCount,
} from "./ore-genesis-regime-model";
import { REGIMES, REGIME_TONE, type Regime } from "./tectonic-regime-model";

// The mining question turned into a geology question. Choose a tectonic regime
// and see which routes to ore-grade concentration remain open. Magmatic
// segregation works anywhere; the routes that build Earth's richest provinces
// need plate boundaries and circulating water. Pick a stagnant lid and most of
// the ledger goes dark — which is the tension a minable unobtanium deposit sits in.

interface OreGenesisRegimeLedgerProps {
  caption?: string;
  className?: string;
}

const W = 340;
const ROW_H = 30;
const TOP = 18;
const LABEL_W = 128;
const BAR_X = LABEL_W;
const BAR_W = W - BAR_X - 14;

// Log axis over enrichment factors 10¹ … 10⁵.
const LOG_MIN = 1;
const LOG_MAX = 5;

function barWidth(enrichment: number): number {
  const l = Math.log10(enrichment);
  const f = (l - LOG_MIN) / (LOG_MAX - LOG_MIN);
  return Math.max(4, Math.min(1, f) * BAR_W);
}

const SUPERS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function decadeLabel(d: number): string {
  return `10${String(d)
    .split("")
    .map((c) => SUPERS[Number(c)])
    .join("")}`;
}

function decadeX(d: number): number {
  return BAR_X + ((d - LOG_MIN) / (LOG_MAX - LOG_MIN)) * BAR_W;
}

export function OreGenesisRegimeLedger({ caption, className }: OreGenesisRegimeLedgerProps) {
  const uid = useId();
  const t = useTranslations("viz.oreGenesis");

  const [regime, setRegime] = useState<Regime>("mobileLid");
  const [selected, setSelected] = useState<PathwayId>("arcHydrothermal");

  const open = hostsPathway(regime, selected);
  const count = pathwayCount(regime);
  const best = bestEnrichment(regime);
  const H = TOP + PATHWAY_IDS.length * ROW_H + 26;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="amber"
      controls={
        <SegmentedToggle
          ariaLabel={t("regimeToggle")}
          value={regime}
          onChange={setRegime}
          options={REGIMES.map((r) => ({
            value: r,
            label: t(`regimeShort.${r}`),
            tone: REGIME_TONE[r],
          }))}
        />
      }
      className={className}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
        <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />

        {[1, 2, 3, 4, 5].map((d) => (
          <g key={d}>
            <line
              x1={decadeX(d)}
              y1={TOP - 6}
              x2={decadeX(d)}
              y2={TOP + PATHWAY_IDS.length * ROW_H - 6}
              stroke="var(--border)"
              strokeWidth={0.4}
              strokeOpacity={0.6}
            />
            <VizTick x={decadeX(d)} y={TOP + PATHWAY_IDS.length * ROW_H + 8}>
              {decadeLabel(d)}
            </VizTick>
          </g>
        ))}

        {PATHWAY_IDS.map((id, i) => {
          const p = PATHWAYS[id];
          const y = TOP + i * ROW_H;
          const available = hostsPathway(regime, id);
          const isSelected = id === selected;
          return (
            <g key={id} opacity={available ? 1 : 0.28}>
              <VizText
                x={0}
                y={y + 6}
                size="micro"
                tone={isSelected ? "foreground" : undefined}
                weight={isSelected ? 700 : undefined}
              >
                {t(`pathway.${id}`)}
              </VizText>
              <rect
                x={BAR_X}
                y={y - 4}
                width={barWidth(p.enrichment)}
                height={13}
                rx={3}
                fill={p.tone}
                fillOpacity={available ? 0.55 : 0.2}
                filter={isSelected && available ? glowUrl(uid, "bloom") : undefined}
              />
              {!available ? (
                <VizText x={BAR_X + 6} y={y + 6} size="micro" tone="magenta">
                  {t("closed")}
                </VizText>
              ) : null}
            </g>
          );
        })}

        <VizText x={BAR_X + BAR_W / 2} y={H - 6} anchor="middle" size="small">
          {t("axis")}
        </VizText>
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        {PATHWAY_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelected(id)}
            aria-pressed={id === selected}
            className="rounded-md border px-2.5 py-1 font-sans text-xs transition-colors"
            style={{
              borderColor:
                id === selected
                  ? `color-mix(in oklab, ${PATHWAYS[id].tone} 55%, transparent)`
                  : "var(--border)",
              color: id === selected ? PATHWAYS[id].tone : "var(--muted)",
            }}
          >
            {t(`pathway.${id}`)}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("openLabel")}
          value={`${count} / ${PATHWAY_IDS.length}`}
          note={t("openNote")}
          tone={REGIME_TONE[regime]}
        />
        <VizReadout
          label={t("bestLabel")}
          value={`×${decadeLabel(Math.round(Math.log10(best)))}`}
          note={t("bestNote")}
          tone="var(--teal)"
        />
        <VizReadout
          label={t("selectedLabel")}
          value={open ? t("selected.open") : t("selected.closed")}
          note={
            open
              ? t(`requirement.${selected}`)
              : t("selected.closedNote", { regime: t(`regimeShort.${regime}`) })
          }
          tone={open ? PATHWAYS[selected].tone : "var(--magenta)"}
          tinted
        />
      </div>
    </VizFigure>
  );
}
