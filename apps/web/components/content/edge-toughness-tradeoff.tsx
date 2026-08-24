"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Sharpness and toughness are not on the same axis; they are close to opposite
// ends of one. An edge is sharp because the material parts along a smooth,
// flaw-free surface — which is exactly what a material with no plastic give does.
// Griffith's criterion says a crack runs when the strain energy it releases
// exceeds the energy needed to make the new surface, and a brittle solid has
// almost nothing standing in the way. So volcanic glass takes an edge a few
// nanometres across and loses it on the first hard impact, while steel is blunter
// by an order of magnitude and survives. Plotting edge radius against fracture
// toughness puts every material on one line and makes the trade visible.
const W = 360;
const H = 226;
const PAD_L = 36;
const PAD_R = 18;
const PAD_T = 16;
const PAD_B = 34;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

type MaterialKey = "glass" | "chert" | "bone" | "steel" | "salvage";

interface Material {
  /** Edge radius achievable, in nanometres. */
  edgeNm: number;
  /** Plane-strain fracture toughness, MPa*m^0.5. */
  toughness: number;
  /** Hard impacts the edge survives before it must be replaced or reground. */
  strikes: number;
  /** Furnace temperature the material demands, in C. Zero means none at all. */
  forgeC: number;
  tone: string;
}

// Measured property ranges, taken at their representative midpoints.
const MATERIALS: Record<MaterialKey, Material> = {
  glass: { edgeNm: 2.5, toughness: 0.82, strikes: 1, forgeC: 0, tone: "var(--magenta)" },
  chert: { edgeNm: 22, toughness: 1.5, strikes: 4, forgeC: 300, tone: "var(--amber)" },
  bone: { edgeNm: 90000, toughness: 5.2, strikes: 25, forgeC: 0, tone: "var(--subtle)" },
  steel: { edgeNm: 35, toughness: 35, strikes: 200, forgeC: 1475, tone: "var(--cyan)" },
  salvage: { edgeNm: 18000, toughness: 60, strikes: 400, forgeC: 600, tone: "var(--teal)" },
};

const ORDER: MaterialKey[] = ["glass", "chert", "bone", "steel", "salvage"];

// Both axes span four to five decades, so both are logarithmic.
const EDGE_MIN = 1;
const EDGE_MAX = 200000;
const TOUGH_MIN = 0.5;
const TOUGH_MAX = 100;

const logPos = (v: number, min: number, max: number) =>
  (Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));

const px = (edgeNm: number) => PAD_L + logPos(edgeNm, EDGE_MIN, EDGE_MAX) * PLOT_W;
const py = (toughness: number) => PAD_T + PLOT_H * (1 - logPos(toughness, TOUGH_MIN, TOUGH_MAX));

export interface EdgeToughnessTradeoffProps {
  caption?: string;
  className?: string;
}

export function EdgeToughnessTradeoff({ caption, className }: EdgeToughnessTradeoffProps) {
  const t = useTranslations("viz.edge-toughness");
  const uid = useId();
  const [selected, setSelected] = useState<MaterialKey>("glass");
  const mat = MATERIALS[selected];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${selected}`)}
      caption={caption}
      tone="magenta"
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["magenta", "amber", "cyan", "teal"]} />
          <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill={glowUrl(uid, "grid")} />

          {/* the trade-off band: sharp-and-fragile bottom-left to blunt-and-tough top-right */}
          <path
            d={`M ${px(1.6)} ${py(0.62)} L ${px(150000)} ${py(88)}`}
            stroke="var(--foreground)"
            strokeOpacity={0.14}
            strokeWidth={18}
            strokeLinecap="round"
          />

          {/* axes */}
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD_L}
            y1={PAD_T + PLOT_H}
            x2={PAD_L + PLOT_W}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {/* one point per material, the chosen one lit */}
          {ORDER.map((key) => {
            const m = MATERIALS[key];
            const active = key === selected;
            return (
              <g key={key}>
                <circle
                  cx={px(m.edgeNm)}
                  cy={py(m.toughness)}
                  r={active ? 6.5 : 4}
                  fill={m.tone}
                  fillOpacity={active ? 1 : 0.4}
                  filter={active ? glowUrl(uid, "bloom-strong") : undefined}
                />
                <VizText
                  x={px(m.edgeNm) + (m.edgeNm > 3000 ? -9 : 9)}
                  y={py(m.toughness) + 3}
                  size="micro"
                  tone={active ? m.tone : "subtle"}
                  anchor={m.edgeNm > 3000 ? "end" : "start"}
                  weight={active ? 700 : undefined}
                >
                  {t(`material.${key}`)}
                </VizText>
              </g>
            );
          })}

          {/* axis furniture — decade ticks on both log scales */}
          {[1, 10, 100, 1000, 100000].map((nm) => (
            <VizTick key={`x-${nm}`} x={px(nm)} y={PAD_T + PLOT_H + 13}>
              {nm >= 1000 ? `${nm / 1000}µ` : nm}
            </VizTick>
          ))}
          {[1, 10, 100].map((k) => (
            <VizTick key={`y-${k}`} x={PAD_L - 5} y={py(k) + 3} anchor="end">
              {k}
            </VizTick>
          ))}
          <VizText x={PAD_L + PLOT_W / 2} y={H - 4} size="micro" tone="subtle" anchor="middle">
            {t("xAxis")}
          </VizText>
          <VizText
            x={11}
            y={PAD_T + PLOT_H / 2}
            size="micro"
            tone="subtle"
            anchor="middle"
            transform={`rotate(-90 11 ${PAD_T + PLOT_H / 2})`}
          >
            {t("yAxis")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.edge")}
            value={
              mat.edgeNm >= 1000
                ? t("readout.edgeMicron", { v: (mat.edgeNm / 1000).toFixed(0) })
                : t("readout.edgeNano", { v: mat.edgeNm })
            }
            note={t("readout.edgeNote")}
            tone={mat.tone}
          />
          <VizReadout
            label={t("readout.toughness")}
            value={mat.toughness < 10 ? mat.toughness.toFixed(2) : Math.round(mat.toughness)}
            note={t("readout.toughnessNote")}
            tone={mat.tone}
          />
          <VizReadout
            label={t("readout.strikes")}
            value={mat.strikes === 1 ? t("readout.strikesOne") : `${mat.strikes}+`}
            note={
              mat.forgeC === 0 ? t("readout.forgeNone") : t("readout.forgeNote", { c: mat.forgeC })
            }
            tone={mat.tone}
            tinted
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ORDER.map((key) => {
          const active = key === selected;
          const tone = MATERIALS[key].tone;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              aria-pressed={active}
              className="rounded-lg border px-3 py-2 text-left font-sans text-xs font-600 transition-all duration-200"
              style={{
                borderColor: active
                  ? `color-mix(in oklab, ${tone} 55%, transparent)`
                  : "var(--border)",
                background: active
                  ? `color-mix(in oklab, ${tone} 12%, var(--void))`
                  : "color-mix(in oklab, var(--void) 30%, transparent)",
                color: active ? tone : "var(--subtle)",
              }}
            >
              {t(`material.${key}`)}
            </button>
          );
        })}
      </div>
    </VizFigure>
  );
}
