"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE MODEL — a pigment cell needs photons it did not make
//
// Downwelling light falls off exponentially, and it does so at a rate
// that depends on wavelength:
//
//   E_d(z, λ) = E_d(0, λ) · e^(−K_d(λ) z)
//
// In clear ocean water red is gone within tens of metres
// (K_d ≈ 0.35 m^-1) while a blue-green window near 470–490 nm survives
// two orders of magnitude deeper (K_d ≈ 0.018 m^-1). Below ~200 m there
// is not enough light for photosynthesis; below ~1000 m there is
// effectively none at all.
//
// That matters for a skin built like a cephalopod's, because two of its
// three tiers only work by reflection. Chromatophores are pigment sacs:
// they subtract wavelengths from light that is already there.
// Iridophores are Bragg stacks: they reflect a tuned band. Leucophores
// scatter broadband. None of them emits anything.
//
// A reflective signal is not dead the instant the light dims, though —
// contrast is judged by a dark-adapting eye, so what matters is whether
// the remaining irradiance still clears a retinal threshold. Deep-sea
// eyes run about four orders of magnitude below surface irradiance, and
// that is the number this model uses: the reflective channel is scored in
// decades of headroom above threshold, which puts its extinction near
// 500 m rather than in the first few tens of metres. The red band is out
// of the game long before that.
//
// A photophore does not care about any of this. It makes its own photons,
// so its output is flat with depth — which is why deep-sea signalling is
// emissive, and why counter-illumination has to track a fading target
// rather than a fixed one. Deterministic; no randomness.
// ─────────────────────────────────────────────────────────────────────

/** Diffuse attenuation coefficients for clear oceanic water (m^-1). */
const K_RED = 0.35;
const K_BLUE = 0.018;

/** Retinal detection threshold, as a fraction of surface irradiance. */
const VISUAL_THRESHOLD = 1e-4;

/** Decades of irradiance between the surface and that threshold. */
const THRESHOLD_DECADES = 4;

/** Emissive output is set by the animal, not the sun. */
const PHOTOPHORE_OUTPUT = 0.62;

type Mode = "crypsis" | "chatter" | "counterlight";

/** Surviving fraction of surface irradiance in each band. */
function irradiance(depthM: number) {
  return {
    red: Math.exp(-K_RED * depthM),
    blue: Math.exp(-K_BLUE * depthM),
  };
}

/**
 * How much of a reflective signal survives, scored as headroom above the
 * retinal threshold rather than as raw irradiance.
 */
function reflectiveStrength(blue: number): number {
  const decades = Math.log10(blue / VISUAL_THRESHOLD);
  return Math.max(0, Math.min(1, decades / THRESHOLD_DECADES));
}

const W = 340;
const H = 220;
const STACK_X = 26;
const STACK_W = 150;

/** The three dermal tiers, top to bottom, as the light meets them. */
const TIERS = [
  { id: "chromatophore", y: 44, tone: "var(--magenta)", reflective: true },
  { id: "iridophore", y: 92, tone: "var(--cyan)", reflective: true },
  { id: "leucophore", y: 140, tone: "var(--mist, var(--foreground))", reflective: true },
  { id: "photophore", y: 188, tone: "var(--teal)", reflective: false },
] as const;

interface AbyssalSignalStackProps {
  caption?: string;
  className?: string;
}

export function AbyssalSignalStack({ caption, className }: AbyssalSignalStackProps) {
  const uid = useId();
  const t = useTranslations("viz.abyssalSignalStack");
  const [depth, setDepth] = useState(600); // m
  const [mode, setMode] = useState<Mode>("chatter");

  const { red, blue } = irradiance(depth);
  // A reflective tier can only show contrast while the light reaching it still
  // clears a dark-adapted retinal threshold. Past that, expanding a pigment sac
  // changes nothing an eye can see.
  const reflectiveContrast = reflectiveStrength(blue);
  const emissiveContrast = PHOTOPHORE_OUTPUT;
  const emissionDominates = emissiveContrast > reflectiveContrast;
  const tone = emissionDominates ? "teal" : "cyan";
  const toneVar = `var(--${tone})`;

  // Counter-illumination is the one mode that must match a moving target: emit
  // exactly as much as the water above still delivers, no more.
  const modeOutput =
    mode === "counterlight"
      ? Math.min(PHOTOPHORE_OUTPUT, reflectiveContrast)
      : mode === "chatter"
        ? PHOTOPHORE_OUTPUT
        : 0.04;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(emissionDominates ? "hint.emissive" : "hint.reflective", {
        pct: Math.round(reflectiveContrast * 100),
      })}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          options={[
            {
              value: "crypsis" as Mode,
              label: t("mode.crypsis"),
              tone: "var(--stone, var(--subtle))",
            },
            { value: "chatter" as Mode, label: t("mode.chatter"), tone: "var(--magenta)" },
            { value: "counterlight" as Mode, label: t("mode.counterlight"), tone: "var(--teal)" },
          ]}
          value={mode}
          onChange={setMode}
          ariaLabel={t("modeLabel")}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            depth: Math.round(depth),
            reflective: Math.round(reflectiveContrast * 100),
          })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta"]} />

          {/* downwelling light arriving from above, thinning with depth */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`ray-${i}`}
              x1={STACK_X + 14 + i * 30}
              y1={10}
              x2={STACK_X + 14 + i * 30}
              y2={30}
              stroke="var(--cyan)"
              strokeOpacity={0.12 + blue * 0.6}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          ))}
          <VizText x={STACK_X} y={20} size="micro" anchor="end" tone="subtle">
            {t("downwelling")}
          </VizText>

          {TIERS.map((tier) => {
            const strength = tier.reflective ? reflectiveContrast : modeOutput;
            return (
              <g key={tier.id}>
                <rect
                  x={STACK_X}
                  y={tier.y - 14}
                  width={STACK_W}
                  height={26}
                  rx={4}
                  fill={tier.tone}
                  opacity={0.1 + strength * 0.7}
                  filter={!tier.reflective && strength > 0.2 ? glowUrl(uid, "bloom") : undefined}
                  style={{ transition: "opacity 0.25s ease" }}
                />
                <VizText
                  x={STACK_X + STACK_W + 8}
                  y={tier.y - 2}
                  size="small"
                  tone={tier.tone}
                  weight={700}
                >
                  {t(`tier.${tier.id}`)}
                </VizText>
                <VizText x={STACK_X + STACK_W + 8} y={tier.y + 9} size="micro" tone="subtle">
                  {t(`tierNote.${tier.id}`)}
                </VizText>
              </g>
            );
          })}

          {/* the divider: everything above works by reflection, the last one does not */}
          <line
            x1={STACK_X - 4}
            y1={TIERS[3].y - 22}
            x2={W - 12}
            y2={TIERS[3].y - 22}
            stroke="var(--border-strong)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.blue")}
            value={`${(blue * 100).toFixed(blue < 0.01 ? 3 : 1)}%`}
            note={t("readout.blueNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.red")}
            value={red < 0.001 ? t("readout.gone") : `${(red * 100).toFixed(2)}%`}
            note={t("readout.redNote")}
            tone="var(--magenta)"
          />
          <VizReadout
            label={t("readout.channel")}
            value={t(emissionDominates ? "channel.emissive" : "channel.reflective")}
            note={t("readout.channelNote")}
            tone={toneVar}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">
            {t(`modeNote.${mode}`)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <VizSlider
          label={t("slider.depth")}
          display={t("slider.depthValue", { v: Math.round(depth) })}
          min={0}
          max={2000}
          step={10}
          value={depth}
          onChange={setDepth}
          tone={toneVar}
        />
      </div>
    </VizFigure>
  );
}
