"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface ConsciousBottleneckProps {
  caption?: string;
  className?: string;
}

// The conscious bottleneck made playable. The senses pour ~11 Mb/s into the
// nervous system, yet the stream that reaches awareness — the experienced self —
// runs at a mere handful of bits per second. The reader slides that conscious
// rate (the contested 1–50 b/s figure) and watches the million-fold compression,
// and the size of a whole lifetime's selfhood collapse to mere tens of gigabits
// — the number that lets the Tree of Souls fit inside one night's bandwidth.
// Pure slider + SVG, deterministic, SSR-safe — no animation loop.

const SENSORY_BPS = 11e6; // raw sensory inflow into the nervous system
const LIFETIME_YEARS = 40; // a self lived across roughly four decades
const SECONDS_PER_YEAR = 31_557_600;

const BPS_MIN = 1;
const BPS_MAX = 50;
const BPS_DEFAULT = 40; // the upper, generous end of the conscious estimate

function formatBits(bits: number): string {
  if (bits >= 1e12) return `${(bits / 1e12).toFixed(1)} Tb`;
  if (bits >= 1e9) return `${(bits / 1e9).toFixed(1)} Gb`;
  if (bits >= 1e6) return `${(bits / 1e6).toFixed(1)} Mb`;
  if (bits >= 1e3) return `${(bits / 1e3).toFixed(1)} kb`;
  return `${bits.toFixed(0)} b`;
}

function formatRate(bps: number): string {
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)} Mb/s`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(1)} kb/s`;
  return `${bps.toFixed(0)} b/s`;
}

const VIEW_W = 360;
const VIEW_H = 200;

export function ConsciousBottleneck({ caption, className }: ConsciousBottleneckProps) {
  const t = useTranslations("viz.consciousBottleneck");
  const uid = useId();
  const [bps, setBps] = useState(BPS_DEFAULT);

  const compression = SENSORY_BPS / bps;
  const lifetimeBits = bps * LIFETIME_YEARS * SECONDS_PER_YEAR;

  // The output trickle's drawn thickness tracks the log of the conscious rate so
  // the full 1–50 range stays visible; the firehose mouth is fixed and huge.
  const outThickness = 2 + (Math.log10(bps) / Math.log10(BPS_MAX)) * 10;
  const midY = VIEW_H / 2;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone="magenta"
      className={className}
      hint={t("hint")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            compression: Math.round(compression).toLocaleString(),
            conscious: formatRate(bps),
          })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "magenta"]} />

          {/* the firehose — a wide cyan mouth of raw sensation on the left */}
          <path
            d={`M 8 ${midY - 70} C 90 ${midY - 70}, 120 ${midY - outThickness}, 150 ${midY - outThickness}
                L 150 ${midY + outThickness} C 120 ${midY + outThickness}, 90 ${midY + 70}, 8 ${midY + 70} Z`}
            fill="color-mix(in oklab, var(--cyan) 22%, transparent)"
            stroke="var(--cyan)"
            strokeWidth={1.2}
          />
          <VizText x={12} y={midY - 78} size="small" tone="cyan">
            {t("firehose")}
          </VizText>
          <VizText x={12} y={midY + 90} size="micro" tone="cyan" numeric>
            {formatRate(SENSORY_BPS)}
          </VizText>

          {/* the bottleneck neck */}
          <rect
            x={150}
            y={midY - outThickness}
            width={26}
            height={outThickness * 2}
            fill="var(--magenta)"
            filter={glowUrl(uid, "bloom")}
          />

          {/* the conscious trickle — a thin magenta thread emerging on the right */}
          <rect
            x={176}
            y={midY - outThickness}
            width={VIEW_W - 184}
            height={outThickness * 2}
            fill="var(--magenta)"
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "height 0.2s, y 0.2s" }}
          />
          <VizText
            x={VIEW_W - 8}
            y={midY - outThickness - 8}
            size="small"
            tone="magenta"
            anchor="end"
          >
            {t("trickle")}
          </VizText>
          <VizText
            x={VIEW_W - 8}
            y={midY + outThickness + 18}
            size="micro"
            tone="magenta"
            anchor="end"
            numeric
          >
            {formatRate(bps)}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("consciousLabel")}
            value={formatRate(bps)}
            tone="var(--magenta)"
            tinted
          />
          <VizReadout
            label={t("compressionLabel")}
            value={`${Math.round(compression).toLocaleString()}×`}
            tone="var(--cyan)"
            note={t("compressionNote")}
          />
          <VizReadout
            label={t("lifetimeLabel")}
            value={formatBits(lifetimeBits)}
            tone="var(--magenta)"
            tinted
            note={t("lifetimeNote", { years: LIFETIME_YEARS })}
          />
          <VizSlider
            label={t("consciousSlider")}
            display={formatRate(bps)}
            min={BPS_MIN}
            max={BPS_MAX}
            step={1}
            value={bps}
            onChange={setBps}
            tone="var(--magenta)"
            className="mt-1"
          />
        </div>
      </div>
    </VizFigure>
  );
}
