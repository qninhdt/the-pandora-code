"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface ReynoldsRegimeExplorerProps {
  caption?: string;
  className?: string;
}

// Reynolds number Re = ρ·v·L / μ — how much the air a flier moves through behaves
// like a thin gas (high Re, clean aerofoil) vs a thick syrup (low Re, the
// viscous world of insects). Re scales with body size, speed, AND air density,
// so denser Pandoran air pushes a flier of a given size up into a friendlier
// regime. The slider sweeps a characteristic length (wing chord, log scale); the
// world toggle swaps air density. The readout names the regime the Re lands in.
type World = "earth" | "pandora";

// Air kinematic factor ρ/μ (relative). Pandora's air is ~20% denser; viscosity
// taken similar, so the ratio rises ~1.2x. Speed scales mildly with size; folded
// into K so the displayed Re lands in textbook ranges across the size sweep.
const DENSITY_FACTOR: Record<World, number> = { earth: 1, pandora: 1.2 };

// Re ≈ K · (ρ/μ) · L^1.5  — the L^1.5 bundles the way bigger fliers also fly
// faster, so Re climbs faster than length alone. K tuned so a fruit-fly chord
// (~2 mm) sits ~10^2 and a giant-flier chord (~2 m) sits ~10^6 on Earth.
const K = 7.5e4;

// Slider is log10 of chord length in metres: -3 (1 mm) to 0.7 (~5 m).
const L_MIN = -3;
const L_MAX = 0.7;

function reynolds(logL: number, world: World): number {
  const L = 10 ** logL;
  return K * DENSITY_FACTOR[world] * L ** 1.5;
}

// Regime thresholds on Re. Below ~1e3: viscous/insect. 1e3–1e5: transitional.
// Above ~1e5: inertial/clean-aerofoil (large birds, pterosaurs, banshees).
function regimeKey(re: number): "viscous" | "transitional" | "inertial" {
  if (re < 1e3) return "viscous";
  if (re < 1e5) return "transitional";
  return "inertial";
}

function formatRe(re: number): string {
  const exp = Math.floor(Math.log10(re));
  const mant = re / 10 ** exp;
  return `${mant.toFixed(1)}×10${superscript(exp)}`;
}

function superscript(n: number): string {
  const map: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
  };
  return String(n)
    .split("")
    .map((c) => map[c] ?? c)
    .join("");
}

const W = 300;
const H = 120;
const PAD = 20;

export function ReynoldsRegimeExplorer({ caption, className }: ReynoldsRegimeExplorerProps) {
  const t = useTranslations("viz.reynoldsRegime");
  const uid = useId();
  const [world, setWorld] = useState<World>("pandora");
  const [logL, setLogL] = useState<number>(0); // 1 m chord — a large flier

  const re = reynolds(logL, world);
  const regime = regimeKey(re);
  const lengthM = 10 ** logL;

  const regimeTone =
    regime === "viscous" ? "var(--magenta)" : regime === "transitional" ? "var(--amber)" : "var(--cyan)";

  // log-Re position along the regime bar (Re 10^1 .. 10^7)
  const RE_LOG_MIN = 1;
  const RE_LOG_MAX = 7;
  const reLog = Math.log10(re);
  const reClamped = Math.max(RE_LOG_MIN, Math.min(RE_LOG_MAX, reLog));
  const barX0 = PAD;
  const barW = W - 2 * PAD;
  const markerX = barX0 + ((reClamped - RE_LOG_MIN) / (RE_LOG_MAX - RE_LOG_MIN)) * barW;

  // Threshold positions (Re 1e3 and 1e5) splitting the three regimes.
  const xForReLog = (l: number) =>
    barX0 + ((l - RE_LOG_MIN) / (RE_LOG_MAX - RE_LOG_MIN)) * barW;
  const t1 = xForReLog(3);
  const t2 = xForReLog(5);
  const barY = 52;
  const barH = 16;

  const lengthDisplay =
    lengthM >= 1 ? t("metres", { n: lengthM.toFixed(1) }) : t("millimetres", { n: Math.round(lengthM * 1000) });

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone="cyan"
      className={className}
      hint={t("hint")}
      controls={
        <SegmentedToggle
          ariaLabel={t("title")}
          value={world}
          onChange={setWorld}
          options={[
            { value: "earth", label: t("earth") },
            { value: "pandora", label: t("pandora") },
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("title")}>
        <GlowDefs idBase={uid} tones={["cyan", "amber", "magenta"]} />

        {/* three-regime bar */}
        <rect x={barX0} y={barY} width={t1 - barX0} height={barH} rx={2} fill="color-mix(in oklab, var(--magenta) 28%, transparent)" />
        <rect x={t1} y={barY} width={t2 - t1} height={barH} fill="color-mix(in oklab, var(--amber) 26%, transparent)" />
        <rect x={t2} y={barY} width={barX0 + barW - t2} height={barH} rx={2} fill="color-mix(in oklab, var(--cyan) 28%, transparent)" />

        <VizText x={(barX0 + t1) / 2} y={barY - 6} size="micro" tone="magenta" anchor="middle">
          {t("viscousLabel")}
        </VizText>
        <VizText x={(t1 + t2) / 2} y={barY - 6} size="micro" tone="amber" anchor="middle">
          {t("transitionalLabel")}
        </VizText>
        <VizText x={(t2 + barX0 + barW) / 2} y={barY - 6} size="micro" tone="cyan" anchor="middle">
          {t("inertialLabel")}
        </VizText>

        {/* current-Re marker */}
        <line x1={markerX} y1={barY - 2} x2={markerX} y2={barY + barH + 2} stroke={regimeTone} strokeWidth={2} filter={glowUrl(uid, "bloom")} />
        <circle cx={markerX} cy={barY + barH / 2} r={4} fill={regimeTone} filter={glowUrl(uid, "bloom-strong")} />

        {/* Re axis ticks (powers of ten) */}
        {[1, 3, 5, 7].map((l) => (
          <VizText key={l} x={xForReLog(l)} y={barY + barH + 16} size="micro" anchor="middle">
            10{superscript(l)}
          </VizText>
        ))}
        <VizText x={W - PAD} y={H - 4} size="micro" anchor="end">
          {t("axis")}
        </VizText>
      </svg>

      <VizSlider
        className="mt-2"
        label={t("sizeLabel")}
        display={lengthDisplay}
        min={L_MIN}
        max={L_MAX}
        step={0.01}
        value={logL}
        onChange={setLogL}
        tone={regimeTone}
      />

      <VizReadout
        className="mt-3"
        label={t("reLabel")}
        value={`Re ≈ ${formatRe(re)}`}
        tone={regimeTone}
        tinted
      />
    </VizFigure>
  );
}
