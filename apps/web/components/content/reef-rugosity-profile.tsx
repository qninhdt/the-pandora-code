"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { buildReefProfile, rugosityRegime } from "./reef-rugosity-profile-model";

// Grind the reef flat and watch the number that decides how much life it holds
// slide toward 1.0. What should land is that the reef's value as ground is
// geometric: the folds *are* the habitat, and the same erosion that flattens
// them also lets the swell through to the village behind. Contour integration
// and refuge counting live in reef-rugosity-profile-model.ts.

const W = 320;
const H = 176;
const SPAN = 260;
const LEFT = 30;
const DATUM_Y = 118;
const Y_SCALE = 1.15;

const SIZE_CLASSES = [
  { id: "small", tone: "var(--cyan)" },
  { id: "medium", tone: "var(--teal)" },
  { id: "large", tone: "var(--amber)" },
] as const;

interface ReefRugosityProfileProps {
  caption?: string;
  className?: string;
}

export function ReefRugosityProfile({ caption, className }: ReefRugosityProfileProps) {
  const uid = useId();
  const t = useTranslations("viz.reefRugosityProfile");
  const [complexity, setComplexity] = useState(0.92);

  const profile = useMemo(() => buildReefProfile(complexity, SPAN), [complexity]);
  const regime = rugosityRegime(profile.rugosity);
  const tone =
    regime === "complex" ? "var(--teal)" : regime === "reduced" ? "var(--amber)" : "var(--magenta)";
  const figureTone = regime === "complex" ? "teal" : regime === "reduced" ? "amber" : "magenta";

  const surfacePath = profile.points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${(LEFT + p.x).toFixed(1)},${(DATUM_Y - p.y * Y_SCALE).toFixed(1)}`,
    )
    .join(" ");
  const bodyPath = `${surfacePath} L${LEFT + SPAN},${H - 6} L${LEFT},${H - 6} Z`;
  const totalRefuges = profile.refuges.small + profile.refuges.medium + profile.refuges.large;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${regime}`)}
      caption={caption}
      tone={figureTone}
      className={className}
      controls={
        <div className="w-40 sm:w-52">
          <VizSlider
            label={t("controls.complexity")}
            display={t(`state.${regime}`)}
            min={0}
            max={1}
            step={0.01}
            value={complexity}
            onChange={setComplexity}
            tone={tone}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-xl border border-border/60 bg-void/50 sm:w-3/5"
          role="img"
          aria-label={t("aria", { index: profile.rugosity.toFixed(2) })}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta"]} />

          {/* the straight distance the chain has to span — the denominator */}
          <line
            x1={LEFT}
            y1={DATUM_Y + 30}
            x2={LEFT + SPAN}
            y2={DATUM_Y + 30}
            stroke="var(--border-strong)"
            strokeWidth={1.2}
            strokeDasharray="4 3"
          />
          <VizText
            x={LEFT + SPAN / 2}
            y={DATUM_Y + 42}
            size="micro"
            anchor="middle"
            tone="var(--subtle)"
          >
            {t("linearSpan")}
          </VizText>

          {/* the reef body, and the contour that is the numerator */}
          <path d={bodyPath} fill="var(--surface-raised)" opacity={0.75} />
          <path
            d={surfacePath}
            fill="none"
            stroke={tone}
            strokeWidth={2}
            strokeLinejoin="round"
            filter={glowUrl(uid, "bloom")}
          />

          {/* water above, so the swell that gets through has somewhere to be */}
          <line
            x1={LEFT - 12}
            y1={26}
            x2={LEFT + SPAN + 8}
            y2={26}
            stroke="var(--cyan)"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <VizText x={LEFT - 12} y={20} size="micro" tone="var(--cyan)">
            {t("surface")}
          </VizText>
          <rect
            x={LEFT + SPAN - 46}
            y={30}
            width={46}
            height={Math.max(2, profile.waveTransmission * 34)}
            fill="var(--cyan)"
            opacity={0.28}
          />
          <VizText x={LEFT + SPAN + 6} y={44} size="micro" tone="var(--cyan)" anchor="end">
            {t("swellThrough")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.rugosity")}
            value={profile.rugosity.toFixed(2)}
            note={t("readout.rugosityNote")}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("readout.refuges")}
            value={String(totalRefuges)}
            note={t("readout.refugesNote")}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.swell")}
            value={`${Math.round(profile.waveTransmission * 100)}%`}
            note={t("readout.swellNote")}
            tone="var(--cyan)"
          />
          <ul className="mt-1 flex flex-col gap-1">
            {SIZE_CLASSES.map((c) => (
              <li
                key={c.id}
                className="flex items-baseline justify-between gap-2 font-sans text-xs"
              >
                <span className="flex items-baseline gap-2">
                  <span
                    aria-hidden
                    className="mt-1 inline-block size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.tone }}
                  />
                  <span className="text-muted">{t(`sizeClass.${c.id}`)}</span>
                </span>
                <span className="tabular-nums text-foreground">{profile.refuges[c.id]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </VizFigure>
  );
}
