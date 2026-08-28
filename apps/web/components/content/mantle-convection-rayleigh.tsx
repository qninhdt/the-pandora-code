"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL — the Rayleigh number and the onset of convection
//
//   Ra = ρ g α ΔT d³ / (η κ)
//
// ρ  mantle reference density        ~4,000 kg/m³
// g  surface gravity                 m/s²
// α  thermal expansion coefficient  ~2.5e-5 K⁻¹
// ΔT superadiabatic temperature drop across the layer, K
// d  layer thickness, m
// η  dynamic viscosity, Pa·s
// κ  thermal diffusivity            ~1e-6 m²/s
//
// Below a critical value of order 10³ (657.5 for two free-slip boundaries) a
// layer just conducts. Above it, the layer overturns. Earth's mantle runs at
// 10⁶–10⁸, so it convects vigorously and always has.
//
// Convective efficiency follows Nu ∝ Ra^(1/3): the Nusselt number is the ratio
// of the heat actually carried to what conduction alone would deliver. Because
// viscosity depends on temperature exponentially, this is a thermostat — a
// hotter mantle is runnier, convects harder, and cools itself faster.
// ─────────────────────────────────────────────────────────────────────

const RHO = 4000; // kg/m³
const ALPHA = 2.5e-5; // K⁻¹
const KAPPA = 1e-6; // m²/s
const RA_CRIT = 657.5;

/** Nu = (Ra/Ra_crit)^(1/3), floored at 1 — a subcritical layer only conducts. */
function nusselt(ra: number): number {
  if (ra <= RA_CRIT) return 1;
  return (ra / RA_CRIT) ** (1 / 3);
}

function rayleigh(g: number, dT: number, dKm: number, eta: number): number {
  const d = dKm * 1000;
  return (RHO * g * ALPHA * dT * d ** 3) / (eta * KAPPA);
}

interface Body {
  key: string;
  g: number;
  dT: number;
  dKm: number;
  logEta: number;
}

// Earth: 2,890 km mantle, ~2,500 K superadiabatic drop, ~1e21 Pa·s.
// Pandora: canon mass and radius give g = 8.76 m/s², and a core at roughly half
// the radius leaves a ~2,800 km mantle. Its viscosity is unknown; the preset
// uses a mantle a little hotter and runnier than Earth's, which is what a
// larger tidal heat budget implies.
const BODIES: Body[] = [
  { key: "earth", g: 9.81, dT: 2500, dKm: 2890, logEta: 21 },
  { key: "pandora", g: 8.76, dT: 2800, dKm: 2800, logEta: 20.5 },
  { key: "moon", g: 1.62, dT: 900, dKm: 1300, logEta: 22.5 },
];

const W = 320;
const H = 130;
const PAD_L = 30;
const PAD_R = 12;
const BAR_Y = 46;
const BAR_H = 20;
const BAR_W = W - PAD_L - PAD_R;

// Log axis spans 10⁰ … 10¹² so a subcritical layer and Earth both fit.
const LOG_MIN = 0;
const LOG_MAX = 12;

function raToX(ra: number): number {
  const l = Math.log10(Math.max(1, ra));
  return PAD_L + (Math.max(0, Math.min(1, (l - LOG_MIN) / (LOG_MAX - LOG_MIN))) * BAR_W);
}

function fmtRa(ra: number): string {
  const e = Math.floor(Math.log10(ra));
  const m = ra / 10 ** e;
  return `${m.toFixed(1)}×10${superscript(e)}`;
}

const SUPERS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function superscript(n: number): string {
  return String(Math.abs(n))
    .split("")
    .map((d) => SUPERS[Number(d)])
    .join("");
}

interface MantleConvectionRayleighProps {
  caption?: string;
  className?: string;
}

export function MantleConvectionRayleigh({ caption, className }: MantleConvectionRayleighProps) {
  const uid = useId();
  const t = useTranslations("viz.mantleRayleigh");

  const [dT, setDT] = useState(2500);
  const [dKm, setDKm] = useState(2890);
  const [logEta, setLogEta] = useState(21);
  const [g, setG] = useState(9.81);

  const eta = 10 ** logEta;
  const ra = rayleigh(g, dT, dKm, eta);
  const nu = nusselt(ra);
  const convects = ra > RA_CRIT;
  const tone = convects ? "var(--cyan)" : "var(--subtle)";

  function applyPreset(b: Body) {
    setG(b.g);
    setDT(b.dT);
    setDKm(b.dKm);
    setLogEta(b.logEta);
  }

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="cyan"
      className={className}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
        <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />

        <rect
          x={PAD_L}
          y={BAR_Y}
          width={BAR_W}
          height={BAR_H}
          rx={4}
          fill="var(--abyss)"
          stroke="var(--border)"
          strokeWidth={0.6}
        />
        <rect
          x={PAD_L}
          y={BAR_Y}
          width={Math.max(1, raToX(ra) - PAD_L)}
          height={BAR_H}
          rx={4}
          fill={tone}
          fillOpacity={0.45}
          filter={glowUrl(uid, "bloom")}
        />

        {/* The critical threshold — left of it, nothing overturns. */}
        <line
          x1={raToX(RA_CRIT)}
          y1={BAR_Y - 10}
          x2={raToX(RA_CRIT)}
          y2={BAR_Y + BAR_H + 6}
          stroke="var(--magenta)"
          strokeWidth={1.4}
          strokeDasharray="3 2"
        />
        <VizText x={raToX(RA_CRIT)} y={BAR_Y - 14} anchor="middle" size="micro" tone="magenta">
          {t("critical")}
        </VizText>

        {[0, 3, 6, 9, 12].map((d) => (
          <VizTick key={d} x={raToX(10 ** d)} y={BAR_Y + BAR_H + 16}>
            {`10${superscript(d)}`}
          </VizTick>
        ))}

        <VizText x={PAD_L + BAR_W / 2} y={H - 6} anchor="middle" size="small">
          {t("axis")}
        </VizText>

        {BODIES.map((b) => {
          const x = raToX(rayleigh(b.g, b.dT, b.dKm, 10 ** b.logEta));
          return (
            <g key={b.key}>
              <circle cx={x} cy={BAR_Y + BAR_H + 2} r={2.5} fill="var(--foreground)" />
              <VizText x={x} y={BAR_Y - 2} anchor="middle" size="micro" tone="foreground">
                {t(`body.${b.key}`)}
              </VizText>
            </g>
          );
        })}
      </svg>

      <div className="mb-3 flex flex-wrap gap-2">
        {BODIES.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => applyPreset(b)}
            className="rounded-md border border-border px-2.5 py-1 font-sans text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            {t(`preset.${b.key}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <VizSlider
          label={t("dtLabel")}
          display={`${Math.round(dT)} K`}
          min={200}
          max={4000}
          step={50}
          value={dT}
          onChange={setDT}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("thicknessLabel")}
          display={`${Math.round(dKm)} km`}
          min={100}
          max={3200}
          step={20}
          value={dKm}
          onChange={setDKm}
          tone="var(--teal)"
        />
        <VizSlider
          label={t("viscosityLabel")}
          display={`10${superscript(Math.round(logEta))} Pa·s`}
          min={18}
          max={24}
          step={0.1}
          value={logEta}
          onChange={setLogEta}
          tone="var(--magenta)"
        />
        <VizSlider
          label={t("gravityLabel")}
          display={`${g.toFixed(2)} m/s²`}
          min={1}
          max={15}
          step={0.05}
          value={g}
          onChange={setG}
          tone="var(--cyan)"
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout label={t("raLabel")} value={fmtRa(ra)} tone={tone} />
        <VizReadout
          label={t("nuLabel")}
          value={nu < 10 ? nu.toFixed(1) : Math.round(nu).toString()}
          note={t("nuNote")}
          tone="var(--teal)"
        />
        <VizReadout
          label={t("verdictLabel")}
          value={convects ? t("verdict.convects") : t("verdict.conducts")}
          note={convects ? t("verdict.convectsNote") : t("verdict.conductsNote")}
          tone={tone}
          tinted
        />
      </div>
    </VizFigure>
  );
}
