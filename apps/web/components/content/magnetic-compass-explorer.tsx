"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface MagneticCompassExplorerProps {
  caption?: string;
  className?: string;
}

type Field = "calm" | "vortex";

// Two machines for one missing sense, and why only one survives the flux vortex.
// A latitude slider tilts the field's inclination — steep at the poles, flat at the
// equator — and the bird "sees" that angle painted across its vision (the radical-
// pair compass, which reads direction). A field-mode toggle drops the scene into the
// flux vortex: the delicate cryptochrome compass scrambles (the overlay breaks into
// noise) while the rugged magnetite map — reading raw field strength — holds steady.
// That contrast is the chapter's inference for why banshees fly the vortex clean and
// human instruments do not. The shimmer uses usePhaseLoop; reduced motion freezes it.

const W = 340;
const H = 200;
// the retina panel (left) shows the compass overlay; the map gauge (right) shows
// the magnetite intensity read.
const EYE = { cx: 96, cy: 96, r: 64 };
const GAUGE = { cx: 256, cy: 96, r: 44 };

export function MagneticCompassExplorer({ caption, className }: MagneticCompassExplorerProps) {
  const uid = useId();
  const t = useTranslations("viz.magneticCompass");
  const reduced = useReducedMotionSafe();
  const [latitude, setLatitude] = useState(45); // 0 equator … 90 pole
  const [field, setField] = useState<Field>("calm");

  const { phase } = usePhaseLoop({ period: 3, playing: true, initial: 0 });

  // Inclination: the angle field lines dip into the ground. 0° flat at equator,
  // ~90° vertical at the poles.
  const inclination = Math.round(latitude); // degrees, ≈ magnetic latitude
  const incRad = (inclination * Math.PI) / 180;

  const vortex = field === "vortex";
  // In the vortex the quantum compass loses coherence — the overlay angle jitters
  // and washes out; the magnetite map keeps a clean reading.
  const jitter = vortex ? (reduced ? 0.4 : 0.4 + 0.35 * Math.sin(phase * Math.PI * 2 * 3)) : 0;
  const compassOpacity = vortex ? 0.22 : 0.8;
  const mapOpacity = 1; // magnetite holds in both fields

  // overlay band direction across the retina, tilted by inclination (+ vortex jitter)
  const ang = incRad + jitter;
  const dx = Math.cos(ang) * EYE.r;
  const dy = Math.sin(ang) * EYE.r;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      hint={vortex ? t("vortexNote") : t("calmNote")}
      tone={vortex ? "magenta" : "cyan"}
      controls={
        <SegmentedToggle<Field>
          ariaLabel={t("fieldLabel")}
          value={field}
          onChange={setField}
          options={[
            { value: "calm", label: t("calm"), tone: "var(--cyan)" },
            { value: "vortex", label: t("vortex"), tone: "var(--magenta)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={vortex ? t("vortexNote") : t("calmNote")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "magenta", "teal"]} />

          {/* ── left: the radical-pair compass, painted on the retina ── */}
          <circle
            cx={EYE.cx}
            cy={EYE.cy}
            r={EYE.r}
            fill="color-mix(in oklab, var(--cyan) 6%, var(--void))"
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <clipPath id={`${uid}-eye-clip`}>
            <circle cx={EYE.cx} cy={EYE.cy} r={EYE.r} />
          </clipPath>
          <g clipPath={`url(#${uid}-eye-clip)`}>
            {/* the field-angle band the compass admits — clean line in calm,
                jittered & faint in the vortex */}
            {[-2, -1, 0, 1, 2].map((k) => (
              <line
                key={k}
                x1={EYE.cx - dx + k * 14 * Math.sin(ang)}
                y1={EYE.cy - dy - k * 14 * Math.cos(ang)}
                x2={EYE.cx + dx + k * 14 * Math.sin(ang)}
                y2={EYE.cy + dy - k * 14 * Math.cos(ang)}
                stroke="var(--cyan)"
                strokeWidth={k === 0 ? 2.4 : 1.4}
                strokeOpacity={compassOpacity * (k === 0 ? 1 : 0.5)}
                filter={k === 0 ? glowUrl(uid, "bloom") : undefined}
              />
            ))}
            {/* vortex noise speckle */}
            {vortex &&
              [...Array(14)].map((_, i) => (
                <circle
                  key={`n-${i}`}
                  cx={EYE.cx - EYE.r + ((i * 47) % (EYE.r * 2))}
                  cy={EYE.cy - EYE.r + ((i * 71) % (EYE.r * 2))}
                  r={1.4}
                  fill="var(--magenta)"
                  opacity={0.4}
                />
              ))}
          </g>
          <VizText x={EYE.cx} y={EYE.cy + EYE.r + 16} size="micro" tone="cyan" anchor="middle">
            {t("compassLabel")}
          </VizText>

          {/* ── right: the magnetite map — a needle reading raw intensity ── */}
          <circle
            cx={GAUGE.cx}
            cy={GAUGE.cy}
            r={GAUGE.r}
            fill="color-mix(in oklab, var(--magenta) 6%, var(--void))"
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          {/* magnetite crystal-chain needle: stays locked to the field, both modes */}
          <g opacity={mapOpacity} transform={`rotate(${inclination - 45} ${GAUGE.cx} ${GAUGE.cy})`}>
            <line
              x1={GAUGE.cx}
              y1={GAUGE.cy + GAUGE.r * 0.7}
              x2={GAUGE.cx}
              y2={GAUGE.cy - GAUGE.r * 0.7}
              stroke="var(--magenta)"
              strokeWidth={3}
              strokeLinecap="round"
              filter={glowUrl(uid, "bloom")}
            />
            {/* crystal beads along the chain */}
            {[-0.5, -0.2, 0.1, 0.4].map((f) => (
              <circle
                key={f}
                cx={GAUGE.cx}
                cy={GAUGE.cy + GAUGE.r * 0.7 * f}
                r={2.4}
                fill="var(--magenta)"
              />
            ))}
          </g>
          <VizText
            x={GAUGE.cx}
            y={GAUGE.cy + GAUGE.r + 16}
            size="micro"
            tone="magenta"
            anchor="middle"
          >
            {t("mapLabel")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout label={t("inclinationLabel")} value={`${inclination}°`} tone="var(--cyan)" />
          <VizReadout
            label={t("compassReadLabel")}
            value={vortex ? t("scrambled") : t("clear")}
            tone="var(--cyan)"
            tinted={!vortex}
          />
          <VizReadout
            label={t("mapReadLabel")}
            value={t("holding")}
            tone="var(--magenta)"
            tinted
            note={vortex ? t("mapWhy") : undefined}
          />
          <VizSlider
            label={t("latitudeLabel")}
            display={inclination < 30 ? t("equator") : inclination > 60 ? t("pole") : t("mid")}
            min={0}
            max={90}
            step={1}
            value={latitude}
            onChange={setLatitude}
            tone="var(--cyan)"
            className="mt-1"
          />
        </div>
      </div>
    </VizFigure>
  );
}
