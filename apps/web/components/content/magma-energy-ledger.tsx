"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId } from "react";

interface MagmaEnergyLedgerProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL — the energy ledger that kills the "magnetism melts rock"
// trope. Each candidate heat source, order-of-magnitude power (watts):
//   • Tidal dissipation (resonance-fed) ...... ~1e14 W  (100 TW)
//   • Radiogenic decay ....................... ~1e13 W  (10 TW)
//   • Magnetic induction heating ............. ~1e8  W  (0.0001 TW)
// A static field does ZERO net work (Lorentz force ⟂ velocity); only a
// time-varying field drives eddy currents, and for a silicate moon in a
// planetary magnetosphere that power is 5–7 orders of magnitude below
// tidal/radiogenic. Bars are on a log scale so the gap is visible.
// Values from the chapter research note (Chyba/Hand/Thomas 2021 induction
// bound; Peale-Cassen-Reynolds tidal; geoneutrino radiogenic).
// ─────────────────────────────────────────────────────────────────────

const SOURCES = [
  { key: "tidal", watts: 1e14, tone: "teal" },
  { key: "radiogenic", watts: 1e13, tone: "cyan" },
  { key: "induction", watts: 1e8, tone: "magenta" },
] as const;

// Log axis: 10⁶ … 10¹⁵ W.
const LOG_MIN = 6;
const LOG_MAX = 15;

function widthPct(watts: number): number {
  const l = Math.log10(watts);
  return Math.max(0, Math.min(100, ((l - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100));
}

function fmtTW(watts: number): string {
  const tw = watts / 1e12;
  if (tw >= 1) return `${tw.toFixed(0)} TW`;
  if (tw >= 0.001) return `${(tw * 1000).toFixed(1)} GW`;
  return `${(watts / 1e6).toExponential(0)} MW`;
}

const W_SVG = 340;
const ROW_H = 46;
const TOP = 12;
const LABEL_W = 96;
const BAR_X = LABEL_W;
const BAR_W = W_SVG - BAR_X - 12;

export function MagmaEnergyLedger({ caption, className }: MagmaEnergyLedgerProps) {
  const uid = useId();
  const t = useTranslations("viz.magmaEnergyLedger");
  const H_SVG = TOP + SOURCES.length * ROW_H + 24;

  // Gridlines every 3 decades.
  const decades = [6, 9, 12, 15];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="magenta"
      className={className}
    >
      <svg
        viewBox={`0 0 ${W_SVG} ${H_SVG}`}
        className="w-full"
        role="img"
        aria-label={t("aria")}
      >
        <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta"]} />

        {/* Decade gridlines */}
        {decades.map((d) => {
          const x = BAR_X + (widthPct(10 ** d) / 100) * BAR_W;
          return (
            <g key={d}>
              <line
                x1={x}
                y1={TOP - 2}
                x2={x}
                y2={TOP + SOURCES.length * ROW_H}
                stroke="var(--border)"
                strokeWidth={0.5}
                strokeOpacity={0.6}
              />
              <VizText x={x} y={TOP + SOURCES.length * ROW_H + 14} size="micro" tone="subtle" anchor="middle">
                {t("decade", { n: d })}
              </VizText>
            </g>
          );
        })}

        {SOURCES.map((s, i) => {
          const y = TOP + i * ROW_H;
          const w = (widthPct(s.watts) / 100) * BAR_W;
          const c = `var(--${s.tone})`;
          return (
            <g key={s.key}>
              <VizText x={LABEL_W - 8} y={y + ROW_H / 2 - 2} size="small" tone={s.tone} anchor="end" weight={700}>
                {t(`source.${s.key}`)}
              </VizText>
              <rect
                x={BAR_X}
                y={y + 6}
                width={Math.max(3, w)}
                height={ROW_H - 22}
                rx={4}
                fill={c}
                opacity={0.85}
                filter={glowUrl(uid, "bloom")}
              />
              <VizText
                x={BAR_X + Math.max(3, w) + 6}
                y={y + ROW_H / 2 - 1}
                size="small"
                tone={s.tone}
                anchor="start"
                weight={700}
                numeric
              >
                {fmtTW(s.watts)}
              </VizText>
            </g>
          );
        })}

        <VizText x={W_SVG / 2} y={H_SVG - 3} size="micro" tone="subtle" anchor="middle">
          {t("axisTitle")}
        </VizText>
      </svg>
    </VizFigure>
  );
}
