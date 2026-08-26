"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { SEAWATER_OSMOLARITY, TMAO_CEILING_DEPTH, depthStress } from "./depth-stress-model";

// Four things that could stop a body from going deeper, ranked by how much they
// actually matter. The first — being crushed — is the one everybody names, and it
// is the one that does nothing: the bar barely leaves zero all the way down. The
// two molecular effects bite steadily. The osmotic one arrives all at once at a
// specific depth, and that is where the bony fish stop. Maths in the model.

const W = 320;
const H = 250;
const PAD = { l: 60, r: 20, t: 22, b: 30 };
const plotW = W - PAD.l - PAD.r;

const DEPTH_MAX = 11_000;

/** Four rows, drawn as horizontal bars filling toward the right. */
const ROWS = ["crush", "enzyme", "membrane", "osmotic"] as const;
type Row = (typeof ROWS)[number];

const ROW_TONE: Record<Row, string> = {
  crush: "var(--stone, var(--subtle))",
  enzyme: "var(--cyan)",
  membrane: "var(--teal)",
  osmotic: "var(--magenta)",
};

const rowY = (i: number) => PAD.t + 22 + i * 42;

interface PressureDoesNotCrushProps {
  caption?: string;
  className?: string;
}

export function PressureDoesNotCrush({ caption, className }: PressureDoesNotCrushProps) {
  const uid = useId();
  const t = useTranslations("viz.pressureDoesNotCrush");
  const [depth, setDepth] = useState(4000); // m
  const [activationVolume, setActivationVolume] = useState(30); // cm³/mol

  const s = depthStress(depth, activationVolume);
  const past = s.pastOsmoticCeiling;
  const tone = past ? "magenta" : depth > 6000 ? "amber" : "cyan";
  const toneVar = `var(--${tone})`;

  // Each bar reads as "how much of this stress is in play", 0 to 1.
  const severity: Record<Row, number> = {
    crush: s.volumeLossPct / 100,
    enzyme: 1 - s.reactionRateFraction,
    membrane: s.lipidUnsaturationPct / 100,
    osmotic: Math.min(1, (s.osmolarity - 350) / (SEAWATER_OSMOLARITY - 350)),
  };
  const READOUT: Record<Row, string> = {
    crush: `${s.volumeLossPct.toFixed(1)}%`,
    enzyme: `${Math.round(s.reactionRateFraction * 100)}%`,
    membrane: `${Math.round(s.lipidUnsaturationPct)}%`,
    osmotic: `${Math.round(s.osmolarity)}`,
  };

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(past ? "hint.pastCeiling" : "hint.withinCeiling", {
        headroom: Math.round(Math.max(0, s.osmoticHeadroom)),
      })}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <div className="w-40 sm:w-52">
          <VizSlider
            label={t("slider.activationVolume")}
            display={t("slider.activationVolumeValue", { v: activationVolume.toFixed(0) })}
            min={5}
            max={80}
            step={5}
            value={activationVolume}
            onChange={setActivationVolume}
            tone="var(--cyan)"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            depth: Math.round(depth),
            pressure: Math.round(s.pressureMPa),
          })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {ROWS.map((row, i) => {
            const y = rowY(i);
            const barTone = ROW_TONE[row];
            const width = Math.max(1.5, severity[row] * plotW);
            const critical = row === "osmotic" && past;
            return (
              <g key={row}>
                <VizText x={PAD.l - 8} y={y + 3} size="micro" anchor="end" tone="var(--muted)">
                  {t(`row.${row}`)}
                </VizText>
                {/* the empty track: how much room this stress has to grow into */}
                <rect
                  x={PAD.l}
                  y={y - 7}
                  width={plotW}
                  height={14}
                  rx={3}
                  fill="color-mix(in oklab, var(--void) 45%, transparent)"
                  stroke="var(--border)"
                  strokeWidth={0.6}
                />
                <rect
                  x={PAD.l}
                  y={y - 7}
                  width={width}
                  height={14}
                  rx={3}
                  fill={barTone}
                  opacity={critical ? 0.95 : 0.7}
                  filter={critical ? glowUrl(uid, "bloom") : undefined}
                  style={{ transition: "width 0.25s ease" }}
                />
                <VizText
                  x={PAD.l + plotW + 4}
                  y={y + 3}
                  size="small"
                  tone={barTone}
                  numeric
                  weight={700}
                >
                  {READOUT[row]}
                </VizText>
                <VizText x={PAD.l + 4} y={y + 20} size="micro" tone="subtle">
                  {t(`rowNote.${row}`)}
                </VizText>
              </g>
            );
          })}

          {/* the osmotic wall, marked on the row it belongs to */}
          <line
            x1={PAD.l + plotW}
            y1={rowY(3) - 12}
            x2={PAD.l + plotW}
            y2={rowY(3) + 12}
            stroke="var(--magenta)"
            strokeWidth={1.6}
            strokeDasharray="3 2"
          />

          <VizTick x={PAD.l + plotW / 2} y={H - 10}>
            {t("scaleNote")}
          </VizTick>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.pressure")}
            value={`${s.pressureMPa.toFixed(1)} MPa`}
            note={t("readout.pressureNote", { atm: Math.round(s.pressureAtm) })}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.volume")}
            value={`−${s.volumeLossPct.toFixed(1)}%`}
            note={t("readout.volumeNote")}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.osmotic")}
            value={
              past
                ? t("readout.osmoticBreached")
                : t("readout.osmoticHeadroom", { v: Math.round(s.osmoticHeadroom) })
            }
            note={t("readout.osmoticNote", { depth: TMAO_CEILING_DEPTH })}
            tone={toneVar}
            tinted
          />
        </div>
      </div>

      <div className="mt-4">
        <VizSlider
          label={t("slider.depth")}
          display={t("slider.depthValue", { v: Math.round(depth) })}
          min={0}
          max={DEPTH_MAX}
          step={100}
          value={depth}
          onChange={setDepth}
          tone={toneVar}
        />
      </div>
    </VizFigure>
  );
}
