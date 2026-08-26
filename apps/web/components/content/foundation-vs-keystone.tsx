"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE CONCEPT — why one word cannot cover two kinds of importance
//
// Power et al. (1996) made "keystone" measurable by dividing a species'
// community impact by its proportional biomass. That single division
// splits the plane into named regions:
//
//   low biomass  + high impact  → KEYSTONE      (impact disproportionate)
//   high biomass + high impact  → FOUNDATION    (impact proportional; mass IS the point)
//   high biomass + mid  impact  → DOMINANT      (monopolises resources, little depended on)
//   low biomass  + low  impact  → PASSENGER
//
// Each species is placed by (biomass share, removal impact). Hometree sits
// in the far foundation corner — which is precisely why calling it a
// keystone is a category error, not a compliment.
// ─────────────────────────────────────────────────────────────────────

type Zone = "keystone" | "foundation" | "dominant" | "passenger";

interface Species {
  id: string;
  /** Share of local community biomass, 0-1. */
  biomass: number;
  /** Community change on removal, 0-1. */
  impact: number;
  zone: Zone;
  /** Marker glyph radius hint — larger organisms read bigger. */
  size: number;
}

const SPECIES: Species[] = [
  { id: "seaStar", biomass: 0.06, impact: 0.82, zone: "keystone", size: 4 },
  { id: "seaOtter", biomass: 0.04, impact: 0.88, zone: "keystone", size: 4.5 },
  { id: "limpet", biomass: 0.08, impact: 0.14, zone: "passenger", size: 3.5 },
  { id: "meadowGrass", biomass: 0.72, impact: 0.42, zone: "dominant", size: 6 },
  { id: "giantKelp", biomass: 0.68, impact: 0.86, zone: "foundation", size: 7 },
  { id: "hemlock", biomass: 0.62, impact: 0.79, zone: "foundation", size: 7 },
  { id: "chestnut", biomass: 0.58, impact: 0.83, zone: "foundation", size: 7 },
  { id: "hometree", biomass: 0.93, impact: 0.97, zone: "foundation", size: 9.5 },
];

const ZONE_TONE: Record<Zone, string> = {
  keystone: "var(--magenta)",
  foundation: "var(--cyan)",
  dominant: "var(--teal)",
  passenger: "var(--muted)",
};

const W = 320;
const H = 260;
const PAD = { l: 44, r: 14, t: 16, b: 40 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

const sx = (v: number) => PAD.l + v * plotW;
const sy = (v: number) => PAD.t + (1 - v) * plotH;

// Region boxes drawn behind the points: [x0, x1, y0, y1] in data space.
const REGIONS: { zone: Zone; x0: number; x1: number; y0: number; y1: number }[] = [
  { zone: "keystone", x0: 0, x1: 0.4, y0: 0.55, y1: 1 },
  { zone: "foundation", x0: 0.4, x1: 1, y0: 0.55, y1: 1 },
  { zone: "dominant", x0: 0.4, x1: 1, y0: 0, y1: 0.55 },
  { zone: "passenger", x0: 0, x1: 0.4, y0: 0, y1: 0.55 },
];

interface FoundationVsKeystoneProps {
  caption?: string;
  className?: string;
}

// The keystone/foundation distinction made spatial. Selecting an organism moves
// the readouts and highlights the region its coordinates land it in, so the
// reader discovers that Hometree and Paine's sea star sit in different places
// for a structural reason rather than a rhetorical one.
export function FoundationVsKeystone({ caption, className }: FoundationVsKeystoneProps) {
  const uid = useId();
  const t = useTranslations("viz.foundationVsKeystone");
  const [selectedId, setSelectedId] = useState("hometree");

  const selected = SPECIES.find((s) => s.id === selectedId) ?? SPECIES[0];
  const tone = ZONE_TONE[selected.zone];
  // Power et al.'s ratio in spirit: impact per unit biomass share.
  const ratio = selected.impact / selected.biomass;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="cyan"
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("title")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {REGIONS.map((r) => {
            const active = r.zone === selected.zone;
            return (
              <g key={r.zone}>
                <rect
                  x={sx(r.x0)}
                  y={sy(r.y1)}
                  width={sx(r.x1) - sx(r.x0)}
                  height={sy(r.y0) - sy(r.y1)}
                  fill={ZONE_TONE[r.zone]}
                  opacity={active ? 0.14 : 0.04}
                  stroke={ZONE_TONE[r.zone]}
                  strokeOpacity={active ? 0.55 : 0.18}
                  strokeWidth={1}
                />
                <VizText
                  x={sx((r.x0 + r.x1) / 2)}
                  y={sy(r.y1) + 14}
                  size="micro"
                  anchor="middle"
                  tone={ZONE_TONE[r.zone]}
                  weight={active ? 600 : 400}
                >
                  {t(`zone.${r.zone}`)}
                </VizText>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={PAD.l}
            y1={PAD.t}
            x2={PAD.l}
            y2={PAD.t + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          <line
            x1={PAD.l}
            y1={PAD.t + plotH}
            x2={PAD.l + plotW}
            y2={PAD.t + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          <VizTick x={PAD.l} y={H - 22} anchor="start">
            {t("axis.biomassLow")}
          </VizTick>
          <VizTick x={PAD.l + plotW} y={H - 22} anchor="end">
            {t("axis.biomassHigh")}
          </VizTick>
          <VizText x={PAD.l + plotW / 2} y={H - 8} size="small" anchor="middle" tone="var(--muted)">
            {t("axis.biomass")}
          </VizText>
          <VizText
            x={12}
            y={PAD.t + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 12 ${PAD.t + plotH / 2})`}
          >
            {t("axis.impact")}
          </VizText>

          {SPECIES.map((s) => {
            const active = s.id === selected.id;
            return (
              <g key={s.id}>
                {active && (
                  <circle
                    cx={sx(s.biomass)}
                    cy={sy(s.impact)}
                    r={s.size + 8}
                    fill={glowUrl(uid, `wash-${s.zone === "keystone" ? "magenta" : "cyan"}`)}
                    opacity={0.6}
                  />
                )}
                <circle
                  cx={sx(s.biomass)}
                  cy={sy(s.impact)}
                  r={s.size}
                  fill={ZONE_TONE[s.zone]}
                  fillOpacity={active ? 0.95 : 0.4}
                  stroke={ZONE_TONE[s.zone]}
                  strokeWidth={active ? 2 : 1}
                  filter={active ? glowUrl(uid, "bloom") : undefined}
                />
              </g>
            );
          })}
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <div className="flex flex-wrap gap-1.5">
            {SPECIES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                aria-pressed={s.id === selected.id}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-sans text-xs transition-colors",
                  s.id === selected.id
                    ? "border-transparent text-void"
                    : "border-[var(--border-strong)] text-muted hover:text-fg",
                )}
                style={s.id === selected.id ? { backgroundColor: ZONE_TONE[s.zone] } : undefined}
              >
                {t(`species.${s.id}`)}
              </button>
            ))}
          </div>

          <VizReadout
            label={t("readout.zone")}
            value={t(`zone.${selected.zone}`)}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("readout.biomass")}
            value={`${Math.round(selected.biomass * 100)}%`}
            tone={tone}
          />
          <VizReadout
            label={t("readout.impact")}
            value={`${Math.round(selected.impact * 100)}%`}
            tone={tone}
          />
          <VizReadout
            label={t("readout.ratio")}
            value={ratio.toFixed(1)}
            note={t(`verdict.${selected.zone}`)}
            tone={tone}
          />
        </div>
      </div>
    </VizFigure>
  );
}
