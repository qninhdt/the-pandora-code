"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface TidalHeatBudgetProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL — Peale–Cassen–Reynolds tidal dissipation
//
// For a synchronously rotating satellite on an eccentric orbit, the
// tidal heating power is:
//   Ė = (21/2) · (k2/Q) · R⁵ · n⁵ · e² / G
// where R = satellite radius, n = mean motion, e = eccentricity,
// k2 = degree-2 Love number, Q = tidal quality factor, G = grav const.
// Surface heat flux F = Ė / (4πR²).
//
// Pandora canon parameters (Activist Survival Guide): R ≈ 5.7235e6 m,
// orbital period ≈ 1.43 d → n ≈ 5.085e-5 rad/s. At e=1e-3, k2/Q=1e-3
// this yields ≈ 330 TW and ≈ 0.80 W/m² — nine times Earth's heat flow,
// but well below biosphere-sterilizing flux. See the chapter.
// ─────────────────────────────────────────────────────────────────────

const G = 6.674e-11; // m³ kg⁻¹ s⁻²
const R = 5.7235e6; // Pandora radius (m)
const N = 5.085e-5; // Pandora mean motion (rad/s), P ≈ 1.43 d
const SURFACE_AREA = 4 * Math.PI * R * R; // m²
const R5 = R ** 5;
const N5 = N ** 5;

function tidalPowerW(e: number, k2q: number): number {
  return (21 / 2) * k2q * R5 * N5 * e * e * (1 / G);
}

// Reference surface fluxes (W/m²) for the log-scale gauge.
const REF = {
  moon: 0.018,
  earth: 0.087,
  io: 2.4,
} as const;

// Log gauge spans 10⁻³ … 10³ W/m².
const LOG_MIN = -3;
const LOG_MAX = 3;

function fluxToPct(flux: number): number {
  const l = Math.log10(Math.max(1e-6, flux));
  return Math.max(0, Math.min(100, ((l - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100));
}

type Regime = "quiescent" | "active" | "extreme" | "sterilizing";

function regimeOf(flux: number): Regime {
  if (flux < 0.05) return "quiescent";
  if (flux < 3) return "active";
  if (flux < 50) return "extreme";
  return "sterilizing";
}

const REGIME_TONE: Record<Regime, string> = {
  quiescent: "var(--teal)",
  active: "var(--cyan)",
  extreme: "var(--amber)",
  sterilizing: "var(--magenta)",
};

// Band edges as flux values → pct positions for the colored track.
const BANDS: { to: number; tone: string }[] = [
  { to: 0.05, tone: "var(--teal)" },
  { to: 3, tone: "var(--cyan)" },
  { to: 50, tone: "var(--amber)" },
  { to: 1000, tone: "var(--magenta)" },
];

function fmtPower(tw: number): string {
  if (tw >= 1000) return `${(tw / 1000).toFixed(1)}×10³`;
  if (tw >= 100) return tw.toFixed(0);
  if (tw >= 10) return tw.toFixed(1);
  return tw.toFixed(2);
}

function fmtFlux(f: number): string {
  if (f >= 100) return f.toFixed(0);
  if (f >= 1) return f.toFixed(1);
  if (f >= 0.01) return f.toFixed(3);
  return f.toExponential(1);
}

const W_SVG = 320;
const H_SVG = 150;

export function TidalHeatBudget({ caption, className }: TidalHeatBudgetProps) {
  const uid = useId();
  const t = useTranslations("viz.tidalHeatBudget");

  // Sliders operate in log space so tiny eccentricities are reachable.
  const [logE, setLogE] = useState(-3); // e = 1e-3
  const [logK, setLogK] = useState(-3); // k2/Q = 1e-3

  const e = 10 ** logE;
  const k2q = 10 ** logK;

  const powerTW = tidalPowerW(e, k2q) / 1e12;
  const flux = (powerTW * 1e12) / SURFACE_AREA;
  const regime = regimeOf(flux);
  const tone = REGIME_TONE[regime];

  const trackX = 24;
  const trackW = W_SVG - 48;
  const trackY = 78;
  const trackH = 14;

  const bandRects = useMemo(() => {
    let fromPct = 0;
    return BANDS.map((b) => {
      const toPct = fluxToPct(b.to);
      const rect = { x: fromPct, w: toPct - fromPct, tone: b.tone };
      fromPct = toPct;
      return rect;
    });
  }, []);

  const pandoraPct = fluxToPct(flux);

  const refMarkers = [
    { key: "moon", pct: fluxToPct(REF.moon) },
    { key: "earth", pct: fluxToPct(REF.earth) },
    { key: "io", pct: fluxToPct(REF.io) },
  ] as const;

  const px = (pct: number) => trackX + (pct / 100) * trackW;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="amber"
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W_SVG} ${H_SVG}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta"]} />

          {/* Colored regime bands */}
          {bandRects.map((r, i) => (
            <rect
              key={i}
              x={px(r.x)}
              y={trackY}
              width={(r.w / 100) * trackW}
              height={trackH}
              fill={r.tone}
              opacity={0.28}
              rx={i === 0 ? 4 : 0}
            />
          ))}
          {/* Track outline */}
          <rect
            x={trackX}
            y={trackY}
            width={trackW}
            height={trackH}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
            rx={4}
          />

          {/* Reference markers (Moon, Earth, Io) below the track */}
          {refMarkers.map((m) => (
            <g key={m.key}>
              <line
                x1={px(m.pct)}
                y1={trackY - 4}
                x2={px(m.pct)}
                y2={trackY + trackH + 4}
                stroke="var(--subtle)"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.7}
              />
              <VizText
                x={px(m.pct)}
                y={trackY + trackH + 16}
                size="micro"
                tone="subtle"
                anchor="middle"
              >
                {t(`ref.${m.key}`)}
              </VizText>
            </g>
          ))}

          {/* Pandora marker — glowing needle at the current flux */}
          <line
            x1={px(pandoraPct)}
            y1={trackY - 14}
            x2={px(pandoraPct)}
            y2={trackY + trackH + 2}
            stroke={tone}
            strokeWidth={2.5}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          />
          <circle
            cx={px(pandoraPct)}
            cy={trackY - 16}
            r={4.5}
            fill={tone}
            filter={glowUrl(uid, "bloom")}
          />
          <VizText
            x={px(pandoraPct)}
            y={trackY - 24}
            size="small"
            tone={tone}
            anchor="middle"
            weight={700}
          >
            {t("pandora")}
          </VizText>

          {/* Axis end labels */}
          <VizText x={trackX} y={trackY - 6} size="micro" tone="subtle" anchor="start">
            {t("axisLow")}
          </VizText>
          <VizText x={trackX + trackW} y={trackY - 6} size="micro" tone="subtle" anchor="end">
            {t("axisHigh")}
          </VizText>
          <VizText x={W_SVG / 2} y={H_SVG - 6} size="small" tone="subtle" anchor="middle">
            {t("axisTitle")}
          </VizText>
        </svg>

        {/* Right panel — controls + readouts */}
        <div className="flex flex-col justify-center gap-3 sm:w-2/5">
          <VizSlider
            label={t("eLabel")}
            display={e.toExponential(1)}
            min={-4}
            max={-2}
            step={0.05}
            value={logE}
            onChange={setLogE}
            tone={tone}
          />
          <VizSlider
            label={t("kLabel")}
            display={k2q.toExponential(1)}
            min={-3}
            max={-1.5}
            step={0.05}
            value={logK}
            onChange={setLogK}
            tone={tone}
          />
          <div className="grid grid-cols-2 gap-2">
            <VizReadout
              label={t("powerLabel")}
              value={`${fmtPower(powerTW)}`}
              note={t("powerUnit")}
              tone={tone}
            />
            <VizReadout
              label={t("fluxLabel")}
              value={fmtFlux(flux)}
              note={t("fluxUnit")}
              tone={tone}
              tinted
            />
          </div>
          <VizReadout label={t("regimeLabel")} value={t(`regime.${regime}`)} tone={tone} tinted />
        </div>
      </div>
    </VizFigure>
  );
}
