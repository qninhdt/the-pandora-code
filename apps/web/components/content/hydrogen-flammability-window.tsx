"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface HydrogenFlammabilityWindowProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL
// Hydrogen in air burns across an extraordinarily wide band - roughly 4% to 75%
// by volume - and needs almost nothing to start it: about 0.017 mJ, an order of
// magnitude below methane or petrol vapour. A spark you cannot feel is enough.
//
// An inert diluent changes both numbers. Carbon dioxide carries away more heat per
// mole than nitrogen does (37.1 vs 29.1 J/mol/K), so it absorbs the energy the
// flame front needs to propagate. As dilution rises, the rich limit falls fast and
// the lean limit creeps up, until the two meet at the inertion point and no
// mixture of any composition will burn.
//
// The lean limit is set by fuel scarcity and barely moves; the rich limit is set
// by oxidiser scarcity and collapses. The band closes from the top down, which is
// modelled here as a linear retreat of the rich limit toward the lean one.
//
// The minimum ignition energy climbs the other way as the window narrows - the
// flame needs a bigger kick to survive in a thermally loaded atmosphere.
// ─────────────────────────────────────────────────────────────────────

const LEAN_LIMIT_DRY = 4.0; // vol % H2 in air
const RICH_LIMIT_DRY = 75.0;
const MIE_DRY = 0.017; // mJ

/** CO2 fraction of the atmosphere at which no H2 mixture burns at all. */
const INERTION_CO2 = 58;

/** Pandora's published carbon dioxide share, vol %. */
const PANDORA_CO2 = 17;
/** Earth's, for the comparison marker. */
const EARTH_CO2 = 0.04;

interface Window {
  lean: number;
  rich: number;
  width: number;
  mie: number;
  inert: boolean;
}

function flammabilityWindow(co2Pct: number): Window {
  const progress = Math.min(co2Pct / INERTION_CO2, 1);
  // The rich limit collapses toward the lean one; the lean limit drifts up a little.
  const lean = LEAN_LIMIT_DRY + progress * 3.5;
  const rich = RICH_LIMIT_DRY - progress * (RICH_LIMIT_DRY - LEAN_LIMIT_DRY - 3.5);
  const width = Math.max(rich - lean, 0);
  // Ignition energy climbs steeply as the window closes.
  const mie = MIE_DRY / Math.max(1 - progress ** 1.5, 0.004);
  return { lean, rich, width, mie, inert: width <= 0.05 };
}

const W = 380;
const H = 150;
const PAD_L = 30;
const PAD_R = 18;
const BAR_Y = 52;
const BAR_H = 40;
const BAR_W = W - PAD_L - PAD_R;

const px = (pct: number) => PAD_L + (pct / 100) * BAR_W;

type Preset = "earth" | "pandora" | "custom";

export function HydrogenFlammabilityWindow({
  caption,
  className,
}: HydrogenFlammabilityWindowProps) {
  const t = useTranslations("viz.hydrogen-flammability-window");
  const uid = useId();
  const [preset, setPreset] = useState<Preset>("pandora");
  const [customCo2, setCustomCo2] = useState(PANDORA_CO2);

  const co2 = preset === "earth" ? EARTH_CO2 : preset === "pandora" ? PANDORA_CO2 : customCo2;
  const w = flammabilityWindow(co2);

  const tone: "magenta" | "teal" = w.inert ? "teal" : "magenta";
  const toneVar = `var(--${tone})`;
  const narrowing =
    ((RICH_LIMIT_DRY - LEAN_LIMIT_DRY - w.width) / (RICH_LIMIT_DRY - LEAN_LIMIT_DRY)) * 100;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={w.inert ? t("hint.inert") : t("hint.flammable")}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("presetLabel")}
          value={preset}
          onChange={(v) => {
            setPreset(v);
            if (v === "earth") setCustomCo2(EARTH_CO2);
            if (v === "pandora") setCustomCo2(PANDORA_CO2);
          }}
          options={[
            { value: "earth", label: t("preset.earth"), tone: "var(--cyan)" },
            { value: "pandora", label: t("preset.pandora"), tone: "var(--teal)" },
            { value: "custom", label: t("preset.custom"), tone: "var(--amber)" },
          ]}
        />
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={
          w.inert
            ? t("aria.inert")
            : t("aria.flammable", { lean: w.lean.toFixed(1), rich: w.rich.toFixed(0) })
        }
      >
        <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />

        <VizText x={PAD_L} y={BAR_Y - 22} size="small" tone="cyan" weight={700}>
          {t("scaleLabel")}
        </VizText>

        {/* the dry-air band, held as a faint reference behind the live one */}
        <rect
          x={px(LEAN_LIMIT_DRY)}
          y={BAR_Y - 6}
          width={px(RICH_LIMIT_DRY) - px(LEAN_LIMIT_DRY)}
          height={BAR_H + 12}
          rx={4}
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity={0.18}
          strokeDasharray="3 4"
          strokeWidth={1}
        />
        <VizText x={px(RICH_LIMIT_DRY)} y={BAR_Y - 10} size="micro" tone="subtle" anchor="end">
          {t("dryBand")}
        </VizText>

        {/* the full concentration axis */}
        <rect
          x={PAD_L}
          y={BAR_Y}
          width={BAR_W}
          height={BAR_H}
          rx={4}
          fill="color-mix(in oklab, var(--void) 45%, transparent)"
          stroke="var(--border)"
          strokeWidth={1}
        />

        {/* the live flammable window */}
        {!w.inert ? (
          <g style={{ transition: "opacity 0.3s ease" }}>
            <rect
              x={px(w.lean)}
              y={BAR_Y}
              width={px(w.rich) - px(w.lean)}
              height={BAR_H}
              rx={3}
              fill="color-mix(in oklab, var(--magenta) 28%, transparent)"
              stroke="var(--magenta)"
              strokeWidth={1.4}
              filter={glowUrl(uid, "bloom")}
              style={{ transition: "x 0.3s ease, width 0.3s ease" }}
            />
            <VizText
              x={(px(w.lean) + px(w.rich)) / 2}
              y={BAR_Y + BAR_H / 2 + 3}
              size="small"
              tone="magenta"
              anchor="middle"
              weight={700}
            >
              {t("burns")}
            </VizText>
          </g>
        ) : (
          <VizText
            x={PAD_L + BAR_W / 2}
            y={BAR_Y + BAR_H / 2 + 3}
            size="small"
            tone="teal"
            anchor="middle"
            weight={700}
          >
            {t("noBurn")}
          </VizText>
        )}

        {/* limit markers */}
        {!w.inert ? (
          <>
            <VizTick x={px(w.lean)} y={BAR_Y + BAR_H + 14}>
              {w.lean.toFixed(1)}
            </VizTick>
            <VizTick x={px(w.rich)} y={BAR_Y + BAR_H + 14}>
              {w.rich.toFixed(0)}
            </VizTick>
          </>
        ) : null}
        <VizTick x={PAD_L} y={BAR_Y + BAR_H + 14} anchor="start">
          0
        </VizTick>
        <VizTick x={PAD_L + BAR_W} y={BAR_Y + BAR_H + 14} anchor="end">
          100
        </VizTick>

        <VizText x={PAD_L + BAR_W / 2} y={H - 6} size="micro" tone="subtle" anchor="middle">
          {t("xAxis")}
        </VizText>
      </svg>

      {preset === "custom" ? (
        <VizSlider
          className="mt-4"
          label={t("co2Label")}
          display={`${customCo2.toFixed(0)}%`}
          min={0}
          max={70}
          step={1}
          value={customCo2}
          onChange={setCustomCo2}
          tone="var(--amber)"
        />
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("readout.width")}
          value={w.inert ? t("readout.closed") : `${w.width.toFixed(0)} pts`}
          note={t("readout.narrowing", { pct: Math.round(narrowing) })}
          tone={toneVar}
        />
        <VizReadout
          label={t("readout.mie")}
          value={`${w.mie.toFixed(3)} mJ`}
          note={t("readout.mieNote")}
          tone="var(--amber)"
        />
        <VizReadout
          label={t("readout.verdict")}
          value={w.inert ? t("readout.safe") : t("readout.ignitable")}
          note={w.inert ? t("readout.safeNote") : t("readout.ignitableNote")}
          tone={toneVar}
          tinted
        />
      </div>
    </VizFigure>
  );
}
