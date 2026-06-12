"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface TreeHeightCeilingProps {
  caption?: string;
  className?: string;
}

// A tree has no pump: it drinks by pulling an unbroken water column up the xylem
// (cohesion-tension). Leaf water potential at height h is
//   Psi(h) = Psi_soil - rho*g*h - f*h        (hydrostatic + frictional drop)
// As Psi falls, top-leaf turgor falls with it; once turgor can no longer expand
// a new leaf, net carbon gain hits zero and the tree can climb no higher. Koch &
// Sillett (2004) measured that break-even in coast redwoods at ~122-130 m.
//
// We plot "top-leaf vigour" (turgor capacity, normalised to 100% at the base)
// against height. It falls roughly linearly to zero AT the ceiling. The ceiling
// itself is the model's answer, and it moves with the planet:
//   - lower gravity shrinks the rho*g*h term (Pandora ~0.8 g)
//   - a CO2-drenched, humid atmosphere lets a leaf feed while barely opening its
//     pores, so far less water is spent at the top -> less tension -> higher reach
// Tuned so Earth lands at 130 m and Pandora is lifted to ~245 m: a real, large
// gain that still leaves the canonical 300 m Hometree poking past the stretched
// ceiling - exactly the honest "strained, not impossible" verdict.
const EARTH_CEILING = 130; // m, Koch & Sillett upper bound
const GRAVITY_REL = { earth: 1, pandora: 0.8 } as const; // surface gravity vs Earth
const ATMO_WATER_GAIN = { earth: 1, pandora: 1.45 } as const; // transpiration-saving multiplier

function ceilingFor(world: "earth" | "pandora"): number {
  // Two transparent, separable levers multiply Earth's hydraulic ceiling:
  //   1/g   — lower gravity lightens the hanging column (reach scales ~1/g)
  //   atmo  — CO2-rich, humid air cuts transpiration, easing tension at the top
  // Earth: 130 * 1 * 1 = 130 m.  Pandora: 130 * 1.25 * 1.45 ≈ 236 m — a large,
  // real gain that still leaves the canonical 300 m Hometree past the ceiling.
  return EARTH_CEILING * (1 / GRAVITY_REL[world]) * ATMO_WATER_GAIN[world];
}

// vigour at height h for a world: linear decline to 0 at the ceiling, clamped.
function vigour(h: number, world: "earth" | "pandora"): number {
  const c = ceilingFor(world);
  return Math.max(0, Math.min(100, (1 - h / c) * 100));
}

const W = 320;
const H = 210;
const PAD_L = 30;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 28;
const H_MAX = 320; // m, plotting span — fits a 300 m Hometree

// Real reference heights, drawn as vertical markers on the curve.
const REDWOOD = 116; // tallest living coast redwood (Hyperion)
const HOMETREE = 300; // Omatikaya Hometree, canon

export function TreeHeightCeiling({ caption, className }: TreeHeightCeilingProps) {
  const t = useTranslations("viz.treeHeightCeiling");
  const uid = useId();
  const [world, setWorld] = useState<"earth" | "pandora">("pandora");
  const [probe, setProbe] = useState(116); // m — the height the reader is testing

  const ceiling = ceilingFor(world);
  const probeVigour = vigour(probe, world);
  const overCeiling = probe > ceiling;

  const xFor = (m: number) => PAD_L + (m / H_MAX) * (W - PAD_L - PAD_R);
  const yFor = (v: number) => H - PAD_B - (v / 100) * (H - PAD_T - PAD_B);

  // The vigour line for the active world, base (100%) to ceiling (0%).
  const lineEnd = Math.min(ceiling, H_MAX);
  const linePath = `M ${xFor(0).toFixed(1)} ${yFor(100).toFixed(1)} L ${xFor(lineEnd).toFixed(1)} ${yFor(0).toFixed(1)}`;
  // Filled "viable" region beneath the line — where a top leaf still pays its way.
  const fillPath = `${linePath} L ${xFor(lineEnd).toFixed(1)} ${yFor(0).toFixed(1)} L ${xFor(0).toFixed(1)} ${yFor(0).toFixed(1)} Z`;

  const tone = world === "pandora" ? "teal" : "cyan";
  const toneVar = `var(--${tone})`;
  const cx = xFor(probe);
  const cy = yFor(probeVigour);

  return (
    <VizFigure
      title={t("title")}
      hint={t("hint")}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("envLabel")}
          value={world}
          onChange={setWorld}
          options={[
            { value: "earth", label: t("earth"), tone: "var(--cyan)" },
            { value: "pandora", label: t("pandora"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("title")}>
        <GlowDefs idBase={uid} tones={["teal", "cyan", "magenta"]} />
        <rect
          x={PAD_L}
          y={PAD_T}
          width={W - PAD_L - PAD_R}
          height={H - PAD_T - PAD_B}
          fill={glowUrl(uid, "grid")}
          opacity={0.5}
        />
        {/* axes */}
        <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="var(--border-strong)" strokeWidth={1} strokeOpacity={0.6} />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="var(--border-strong)" strokeWidth={1} strokeOpacity={0.6} />

        {/* dead zone beyond the ceiling — the column snaps, nothing grows */}
        {ceiling < H_MAX && (
          <rect
            x={xFor(ceiling)}
            y={PAD_T}
            width={W - PAD_R - xFor(ceiling)}
            height={H - PAD_T - PAD_B}
            fill="color-mix(in oklab, var(--magenta) 9%, transparent)"
          />
        )}

        {/* viable region + vigour line */}
        <path d={fillPath} fill={`color-mix(in oklab, ${toneVar} 15%, transparent)`} stroke="none" filter={glowUrl(uid, "bloom")} />
        <path d={linePath} fill="none" stroke={toneVar} strokeWidth={2.5} filter={glowUrl(uid, "bloom")} />

        {/* ceiling marker */}
        {ceiling < H_MAX && (
          <>
            <line x1={xFor(ceiling)} y1={PAD_T} x2={xFor(ceiling)} y2={H - PAD_B} stroke="var(--magenta)" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.8} />
            <VizText x={xFor(ceiling) - 4} y={PAD_T + 10} size="micro" anchor="end" tone="magenta" numeric>
              {`${t("ceiling")} ~${Math.round(ceiling)}m`}
            </VizText>
          </>
        )}

        {/* real-tree reference markers */}
        {[
          { m: REDWOOD, label: t("redwood"), tn: "subtle" },
          { m: HOMETREE, label: t("hometree"), tn: "teal" },
        ].map((r) => (
          <g key={r.label}>
            <line x1={xFor(r.m)} y1={H - PAD_B} x2={xFor(r.m)} y2={H - PAD_B - 6} stroke={`var(--${r.tn})`} strokeWidth={1.5} />
            <VizTick x={xFor(r.m)} y={H - PAD_B + 12}>{`${r.m}m`}</VizTick>
          </g>
        ))}

        {/* probe point — where the reader's slider lands on the curve */}
        <circle cx={cx} cy={cy} r={16} fill={glowUrl(uid, overCeiling ? "wash-magenta" : `wash-${tone}`)} opacity={0.8} />
        <circle cx={cx} cy={cy} r={4.5} fill={overCeiling ? "var(--magenta)" : toneVar} filter={glowUrl(uid, "bloom-strong")} />

        {/* axis labels */}
        <VizTick x={W - PAD_R} y={H - PAD_B + 22} anchor="end">{t("heightAxis")}</VizTick>
        <VizText x={PAD_L - 4} y={PAD_T + 4} size="micro" anchor="end" tone="subtle">{t("vigourAxis")}</VizText>
      </svg>

      <VizSlider
        className="mt-3"
        label={t("heightLabel")}
        display={`${probe} m`}
        min={10}
        max={H_MAX}
        step={5}
        value={probe}
        onChange={setProbe}
        tone={toneVar}
      />

      <VizReadout
        className="mt-3"
        label={t("turgorLabel")}
        value={`${Math.round(probeVigour)}%`}
        note={overCeiling ? t("failNote") : t("turgorNote")}
        tone={overCeiling ? "var(--magenta)" : toneVar}
        tinted
      />
      <p className="mt-2 font-sans text-xs leading-relaxed text-subtle">
        {overCeiling ? t("verdictOver") : t("verdictOk")}
      </p>
    </VizFigure>
  );
}
