"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// The chapter asks whether a temperate world can *stay* in place around one star
// of a close pair. Holman and Wiegert's numerical answer is a hard edge: an orbit
// around one member of a binary survives the long haul only inside roughly a
// fifth of the companion's closest approach. The reader slides the companion in
// and out and walks the world outward, and watches the safe circle shrink until
// it no longer contains the warm band — the moment "warm" and "survivable" stop
// overlapping. Beyond the edge the drawn orbit stretches, because that is how the
// world is actually lost: the companion pumps its eccentricity until nothing on
// it can hold a climate. Strings come from i18n.

interface BinaryStabilityWindowProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 340;
const VIEW_H = 220;
const CX = 150;
const CY = VIEW_H / 2;
const MAX_AU = 5.5; // plotted radius of the inner system
const PX_PER_AU = 26;

// Holman–Wiegert: the critical semi-major axis for a stable orbit around one
// star of a pair is about a fifth of the companion's periastron distance.
const STABILITY_FRACTION = 0.2;

// Conservative habitable zone of Alpha Centauri A — the runaway-greenhouse and
// maximum-greenhouse edges scaled by √L for a star ~1.5× the Sun's luminosity.
const HZ_INNER = 1.16;
const HZ_OUTER = 1.68;

// Real Alpha Centauri: B's closest approach to A, and the distance canon parks
// Polyphemus at. Both are the deterministic SSR defaults.
const DEFAULT_PERIASTRON = 11.2;
const DEFAULT_A = 1.25;

const r = (au: number) => au * PX_PER_AU;

type Verdict = "safe" | "marginal" | "lost";

export function BinaryStabilityWindow({ caption, className }: BinaryStabilityWindowProps) {
  const t = useTranslations("viz.binaryStabilityWindow");
  const uid = useId();

  const [periastron, setPeriastron] = useState(DEFAULT_PERIASTRON);
  const [semiMajor, setSemiMajor] = useState(DEFAULT_A);

  const limit = STABILITY_FRACTION * periastron;
  const ratio = semiMajor / limit;

  const verdict: Verdict = ratio > 1 ? "lost" : ratio > 0.85 ? "marginal" : "safe";
  const temperate = semiMajor >= HZ_INNER && semiMajor <= HZ_OUTER;
  // The companion's pull pumps eccentricity as the orbit nears the edge; past it
  // the orbit stretches without bound and the world does not stay.
  const ecc = Math.min(0.72, Math.max(0, (ratio - 0.6) * 0.85));
  const tone =
    verdict === "lost" ? "var(--magenta)" : verdict === "marginal" ? "var(--amber)" : "var(--teal)";
  const bandFits = HZ_OUTER <= limit;

  // Draw the world's path as an ellipse with the star at one focus, so a pumped
  // orbit visibly swings far from the star rather than just growing.
  const rx = r(semiMajor);
  const ry = rx * Math.sqrt(1 - ecc * ecc);
  const focusShift = rx * ecc;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`verdict.${verdict}`)}
      caption={caption}
      tone={verdict === "lost" ? "magenta" : verdict === "marginal" ? "amber" : "teal"}
      className={className}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={`${t("aria")} — ${t(`verdict.${verdict}`)}`}
      >
        <GlowDefs idBase={uid} tones={["amber", "teal", "cyan", "magenta"]} />

        {/* temperate annulus — where liquid water survives */}
        <circle
          cx={CX}
          cy={CY}
          r={(r(HZ_INNER) + r(HZ_OUTER)) / 2}
          fill="none"
          stroke="var(--teal)"
          strokeOpacity={0.22}
          strokeWidth={r(HZ_OUTER) - r(HZ_INNER)}
        />
        <VizText x={CX} y={CY - r(HZ_OUTER) - 6} size="small" tone="teal" anchor="middle">
          {t("temperate")}
        </VizText>

        {/* the survival edge — everything outside is eventually flung away */}
        <circle
          cx={CX}
          cy={CY}
          r={r(Math.min(limit, MAX_AU))}
          fill="none"
          style={{ stroke: bandFits ? "var(--cyan)" : "var(--magenta)" }}
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />
        <VizText
          x={CX}
          y={CY + r(Math.min(limit, MAX_AU)) + 13}
          size="small"
          tone={bandFits ? "cyan" : "magenta"}
          anchor="middle"
        >
          {t("survivalEdge")}
        </VizText>

        {/* the world's path */}
        <ellipse
          cx={CX + focusShift}
          cy={CY}
          rx={rx}
          ry={ry}
          fill="none"
          style={{ stroke: tone }}
          strokeWidth={1.8}
          filter={glowUrl(uid, "bloom")}
        />
        <circle cx={CX - rx + focusShift} cy={CY} r={5} style={{ fill: tone }} />

        {/* the primary star */}
        <circle cx={CX} cy={CY} r={26} fill={glowUrl(uid, "wash-amber")} />
        <circle cx={CX} cy={CY} r={9} fill="var(--amber)" filter={glowUrl(uid, "bloom-strong")} />
        <VizText x={CX} y={CY + 24} size="small" tone="amber" anchor="middle">
          {t("primary")}
        </VizText>

        {/* the companion, held off-frame with its distance stated in words */}
        <line
          x1={VIEW_W - 74}
          y1={CY}
          x2={VIEW_W - 30}
          y2={CY}
          stroke="var(--border-strong)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <circle
          cx={VIEW_W - 22}
          cy={CY}
          r={7}
          fill="var(--cyan)"
          fillOpacity={0.85}
          filter={glowUrl(uid, "bloom")}
        />
        <VizText x={VIEW_W - 22} y={CY - 14} size="small" tone="cyan" anchor="middle">
          {t("companion")}
        </VizText>
        <VizText x={VIEW_W - 22} y={CY + 22} size="micro" tone="muted" anchor="middle" numeric>
          {periastron.toFixed(1)} AU
        </VizText>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <VizReadout label={t("fateLabel")} value={t(`fate.${verdict}`)} tone={tone} tinted />
        <VizReadout
          label={t("limit")}
          value={`${limit.toFixed(2)} AU`}
          tone="var(--cyan)"
          note={bandFits ? t("bandFits") : t("bandCut")}
        />
        <VizReadout
          label={t("climate")}
          value={temperate ? t("wet") : semiMajor < HZ_INNER ? t("boiled") : t("frozen")}
          tone="var(--teal)"
        />
      </div>

      <div className="mt-4 space-y-3">
        <VizSlider
          label={t("periastronLabel")}
          min={4}
          max={26}
          step={0.1}
          value={periastron}
          display={`${periastron.toFixed(1)} AU`}
          tone="var(--cyan)"
          onChange={setPeriastron}
        />
        <VizSlider
          label={t("orbitLabel")}
          min={0.4}
          max={MAX_AU}
          step={0.01}
          value={semiMajor}
          display={`${semiMajor.toFixed(2)} AU`}
          tone="var(--teal)"
          onChange={setSemiMajor}
        />
      </div>
    </VizFigure>
  );
}
