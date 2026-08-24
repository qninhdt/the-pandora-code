"use client";

import {
  BUTYRATE_YIELD,
  THAUER_LIMIT,
  breakEvenPrey,
  hydrogenLedger,
} from "@/components/content/biohydrogen-ledger-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface BiohydrogenLedgerProps {
  caption?: string;
  className?: string;
}

// A flow diagram read left to right: prey enters, fermentation evolves hydrogen,
// the microbial sink takes its cut, and permeation takes another off the far end.
// Each band's width is proportional to the gas it carries, so switching the sink
// off visibly widens the stream that reaches the bladder.

const W = 380;
const H = 200;
const BAND_X = 26;
const BAND_W = 250;
const BAND_TOP = 44;
const BAND_H = 74;
const READOUT_Y = BAND_TOP + BAND_H + 34;

/** Envelope the ledger is run against - the caravan-scale animal. */
const DIAMETER = 50;
type Gut = "earthLike" | "medusoid";

export function BiohydrogenLedger({ caption, className }: BiohydrogenLedgerProps) {
  const t = useTranslations("viz.biohydrogen-ledger");
  const uid = useId();
  const [prey, setPrey] = useState(6000);
  const [gut, setGut] = useState<Gut>("medusoid");
  const [permeates, setPermeates] = useState(true);

  const sinkSuppressed = gut === "medusoid";
  const ledger = hydrogenLedger(prey, DIAMETER, sinkSuppressed, permeates, BUTYRATE_YIELD);
  const ceiling = hydrogenLedger(prey, DIAMETER, sinkSuppressed, permeates, THAUER_LIMIT);

  const tone: "teal" | "magenta" = ledger.holding ? "teal" : "magenta";
  const toneVar = `var(--${tone})`;

  // Band widths in proportion to the gas each stage carries.
  const total = Math.max(ledger.evolved, 1e-6);
  const sinkFrac = ledger.consumedBySink / total;
  const deliveredFrac = ledger.delivered / total;
  const leakFrac = Math.min(ledger.permeated / total, deliveredFrac);
  const keptFrac = Math.max(deliveredFrac - leakFrac, 0);

  const sinkW = sinkFrac * BAND_W;
  const keptW = keptFrac * BAND_W;
  const leakW = leakFrac * BAND_W;
  const breakEven = breakEvenPrey(DIAMETER, sinkSuppressed, BUTYRATE_YIELD);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={sinkSuppressed ? t("hint.medusoid") : t("hint.earthLike")}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("gutLabel")}
          value={gut}
          onChange={setGut}
          options={[
            { value: "earthLike", label: t("gut.earthLike"), tone: "var(--magenta)" },
            { value: "medusoid", label: t("gut.medusoid"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={sinkSuppressed ? t("aria.medusoid") : t("aria.earthLike")}
      >
        <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />

        <VizText x={BAND_X} y={BAND_TOP - 22} size="small" tone="cyan" weight={700}>
          {t("stage.fermenter")}
        </VizText>
        <VizText x={BAND_X} y={BAND_TOP - 10} size="micro" tone="subtle">
          {t("stage.evolved", { v: ledger.evolved.toFixed(0) })}
        </VizText>

        {/* the full evolved stream, as a faint envelope behind the split bands */}
        <rect
          x={BAND_X}
          y={BAND_TOP}
          width={BAND_W}
          height={BAND_H}
          rx={4}
          fill="color-mix(in oklab, var(--cyan) 8%, transparent)"
          stroke="var(--border)"
          strokeWidth={1}
        />

        {/* what the microbial sink eats */}
        {sinkW > 0.5 ? (
          <g style={{ transition: "opacity 0.3s ease" }}>
            <rect
              x={BAND_X}
              y={BAND_TOP}
              width={sinkW}
              height={BAND_H}
              rx={3}
              fill="color-mix(in oklab, var(--magenta) 24%, transparent)"
              stroke="var(--magenta)"
              strokeWidth={1}
              strokeOpacity={0.6}
            />
            <VizText
              x={BAND_X + sinkW / 2}
              y={BAND_TOP + BAND_H / 2}
              size="micro"
              tone="magenta"
              anchor="middle"
            >
              {t("band.sink")}
            </VizText>
            <VizText
              x={BAND_X + sinkW / 2}
              y={BAND_TOP + BAND_H / 2 + 11}
              size="micro"
              tone="subtle"
              anchor="middle"
            >
              {t("band.sinkPct", { pct: Math.round(sinkFrac * 100) })}
            </VizText>
          </g>
        ) : null}

        {/* what reaches the bladder and stays there */}
        {keptW > 0.5 ? (
          <g>
            <rect
              x={BAND_X + sinkW}
              y={BAND_TOP}
              width={keptW}
              height={BAND_H}
              rx={3}
              fill="color-mix(in oklab, var(--teal) 26%, transparent)"
              stroke="var(--teal)"
              strokeWidth={1.2}
              filter={glowUrl(uid, "bloom")}
            />
            <VizText
              x={BAND_X + sinkW + keptW / 2}
              y={BAND_TOP + BAND_H / 2}
              size="micro"
              tone="teal"
              anchor="middle"
            >
              {t("band.kept")}
            </VizText>
          </g>
        ) : null}

        {/* what diffuses out through the wall */}
        {leakW > 0.5 ? (
          <g>
            <rect
              x={BAND_X + sinkW + keptW}
              y={BAND_TOP}
              width={leakW}
              height={BAND_H}
              rx={3}
              fill="color-mix(in oklab, var(--amber) 22%, transparent)"
              stroke="var(--amber)"
              strokeWidth={1}
              strokeOpacity={0.7}
            />
            <VizText
              x={BAND_X + sinkW + keptW + leakW / 2}
              y={BAND_TOP - 4}
              size="micro"
              tone="amber"
              anchor="middle"
            >
              {t("band.leak")}
            </VizText>
          </g>
        ) : null}

        {/* the bladder the stream has to fill */}
        <VizText x={BAND_X + BAND_W + 12} y={BAND_TOP + BAND_H / 2 - 4} size="micro" tone="cyan">
          {t("stage.bladder")}
        </VizText>
        <VizText x={BAND_X + BAND_W + 12} y={BAND_TOP + BAND_H / 2 + 8} size="micro" tone="subtle">
          {t("stage.capacity", { v: Math.round(ledger.capacity).toLocaleString() })}
        </VizText>

        <VizText x={BAND_X} y={READOUT_Y} size="small" tone={toneVar} weight={700}>
          {ledger.holding
            ? t("verdict.holding", { pct: ledger.netPctPerDay.toFixed(2) })
            : t("verdict.sinking", { pct: Math.abs(ledger.netPctPerDay).toFixed(2) })}
        </VizText>
        <VizText x={BAND_X} y={READOUT_Y + 13} size="micro" tone="subtle">
          {t("ceilingNote", { v: ceiling.netPerDay.toFixed(0) })}
        </VizText>
      </svg>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <VizSlider
          className="flex-1"
          label={t("preyLabel")}
          display={`${prey.toLocaleString()} kg`}
          min={0}
          max={20000}
          step={250}
          value={prey}
          onChange={setPrey}
          tone={toneVar}
        />
        <SegmentedToggle
          ariaLabel={t("permeationLabel")}
          value={permeates ? "on" : "off"}
          onChange={(v) => setPermeates(v === "on")}
          options={[
            { value: "on", label: t("permeation.on"), tone: "var(--amber)" },
            { value: "off", label: t("permeation.off"), tone: "var(--cyan)" },
          ]}
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("readout.delivered")}
          value={`${ledger.delivered.toFixed(0)} m³`}
          tone="var(--teal)"
        />
        <VizReadout
          label={t("readout.leak")}
          value={`${ledger.permeated.toFixed(0)} m³`}
          tone="var(--amber)"
        />
        <VizReadout
          label={t("readout.rent")}
          value={
            Number.isFinite(breakEven)
              ? `${Math.round(breakEven).toLocaleString()} kg`
              : t("readout.never")
          }
          note={t("readout.rentNote")}
          tone={toneVar}
          tinted
        />
      </div>
    </VizFigure>
  );
}
