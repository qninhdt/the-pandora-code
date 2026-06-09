"use client";

import { GlowDefs, glowId, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface NightEyeOpticsProps {
  caption?: string;
  className?: string;
}

// The eye as a light-bucket, with physics charging on the way out. A pupil-size
// slider sets the aperture: light gathered scales with pupil *area* (radius²), and
// the same widening drives the three costs the chapter names — photon noise falls
// (more photons = less grainy), edge aberration rises (big lenses smear at the rim),
// depth of field shrinks (a wide pupil focuses only a thin slice). A tapetum toggle
// lays a mirror behind the retina so missed photons get a second pass — the capture
// readout jumps, the cat's-eye flare. Shows why a dim-world animal converges on a
// large, mirror-backed eye. The optics maths stays in code; strings are translated.

const W = 300;
const H = 200;
const EYE_CX = 150;
const EYE_CY = 100;
const EYE_R = 76; // outer globe
const PUPIL_MIN = 14;
const PUPIL_MAX = 52;

export function NightEyeOptics({ caption, className }: NightEyeOpticsProps) {
  const uid = useId();
  const t = useTranslations("viz.nightEyeOptics");
  const reduced = useReducedMotionSafe();
  const [pupil, setPupil] = useState(0.62); // 0..1 along PUPIL_MIN..MAX
  const [tapetum, setTapetum] = useState(true);

  const pr = PUPIL_MIN + pupil * (PUPIL_MAX - PUPIL_MIN);

  // Light gathered ∝ pupil area; tapetum gives a second pass (~+45% of the misses).
  const areaFrac = (pr * pr) / (PUPIL_MAX * PUPIL_MAX);
  const capture = useMemo(() => {
    const base = areaFrac; // 0..1 of the max single-pass capture
    const withMirror = tapetum ? base + (1 - base) * 0.45 : base;
    return Math.min(1, withMirror);
  }, [areaFrac, tapetum]);

  // The three costs, each 0..1 (higher = worse).
  const noise = 1 - areaFrac; // grain: high when little light is gathered
  const aberration = pupil; // edge smear grows with aperture
  const shallowDof = pupil; // depth of field shrinks with aperture

  // Deterministic photon count — density tracks capture so the aperture visibly
  // drinks more light as it widens. Positions are derived from the index at render
  // time (seeded, so SSR stays stable).
  const photons = useMemo(
    () => Array.from({ length: Math.round(8 + capture * 30) }, (_, i) => i),
    [capture],
  );

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      hint={t("hint")}
      tone="amber"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["amber", "cyan"]} />
          <defs>
            <radialGradient id={glowId(uid, "globe")} cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="color-mix(in oklab, var(--cyan) 14%, var(--surface))" />
              <stop offset="100%" stopColor="var(--void)" />
            </radialGradient>
            <clipPath id={glowId(uid, "globe-clip")}>
              <circle cx={EYE_CX} cy={EYE_CY} r={EYE_R} />
            </clipPath>
          </defs>

          {/* photon rain falling toward the pupil — only those that "enter" count */}
          {photons.map((i) => {
            const startX = EYE_CX - EYE_R + ((i * 53) % (EYE_R * 2));
            const enters = Math.abs(startX - EYE_CX) < pr;
            return (
              <line
                key={`ph-${i}`}
                x1={startX}
                y1={6 + ((i * 17) % 20)}
                x2={enters ? EYE_CX + (startX - EYE_CX) * 0.4 : startX}
                y2={enters ? EYE_CY - pr * 0.5 : 30 + ((i * 17) % 20)}
                stroke="var(--cyan)"
                strokeWidth={1}
                strokeOpacity={enters ? 0.55 : 0.14}
                strokeLinecap="round"
              />
            );
          })}

          {/* the globe */}
          <circle
            cx={EYE_CX}
            cy={EYE_CY}
            r={EYE_R}
            fill={`url(#${glowId(uid, "globe")})`}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
          />

          {/* tapetum mirror behind the retina — a bright arc at the back of the globe */}
          {tapetum && (
            <g clipPath={`url(#${glowId(uid, "globe-clip")})`}>
              <path
                d={`M ${EYE_CX - EYE_R + 10} ${EYE_CY + EYE_R - 26} A ${EYE_R - 8} ${EYE_R - 8} 0 0 0 ${EYE_CX + EYE_R - 10} ${EYE_CY + EYE_R - 26}`}
                fill="none"
                stroke="var(--amber)"
                strokeWidth={3}
                strokeOpacity={0.5}
                filter={glowUrl(uid, "bloom")}
              />
              {/* bounced-back rays: a second pass through the retina */}
              {[-0.4, 0, 0.4].map((off, i) => (
                <line
                  key={`bounce-${i}`}
                  x1={EYE_CX + off * pr}
                  y1={EYE_CY + EYE_R - 30}
                  x2={EYE_CX + off * pr * 2}
                  y2={EYE_CY - pr * 0.4}
                  stroke="var(--amber)"
                  strokeWidth={1}
                  strokeOpacity={0.4}
                  strokeDasharray="2 2"
                />
              ))}
            </g>
          )}

          {/* the pupil — the aperture; its glow tracks how much light it admits */}
          <circle
            cx={EYE_CX}
            cy={EYE_CY}
            r={pr}
            fill="var(--void)"
            stroke="var(--cyan)"
            strokeWidth={1.5}
            strokeOpacity={0.5}
          />
          <circle
            cx={EYE_CX}
            cy={EYE_CY}
            r={pr}
            fill="var(--cyan)"
            fillOpacity={0.08 + capture * 0.4}
            filter={glowUrl(uid, "bloom")}
            style={{ transition: reduced ? "none" : "fill-opacity 0.3s ease" }}
          />
          {/* a catch-light to read it as an eye */}
          <circle
            cx={EYE_CX - pr * 0.35}
            cy={EYE_CY - pr * 0.35}
            r={Math.max(2, pr * 0.12)}
            fill="var(--foreground)"
            opacity={0.5}
          />

          <VizText x={EYE_CX} y={EYE_CY + EYE_R + 14} size="micro" tone="subtle" anchor="middle">
            {t("apertureAxis")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("captureLabel")}
            value={`${Math.round(capture * 100)}%`}
            tone="var(--cyan)"
            tinted
          />
          <div className="grid grid-cols-1 gap-2">
            <CostBar label={t("noiseLabel")} value={noise} tone="var(--cyan)" reduced={reduced} />
            <CostBar
              label={t("aberrationLabel")}
              value={aberration}
              tone="var(--amber)"
              reduced={reduced}
            />
            <CostBar
              label={t("dofLabel")}
              value={shallowDof}
              tone="var(--magenta)"
              reduced={reduced}
            />
          </div>
          <button
            type="button"
            onClick={() => setTapetum((v) => !v)}
            aria-pressed={tapetum}
            className="mt-1 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 font-sans text-xs font-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            style={{
              borderColor: tapetum
                ? "color-mix(in oklab, var(--amber) 50%, transparent)"
                : "var(--border)",
              background: tapetum
                ? "color-mix(in oklab, var(--amber) 12%, var(--void))"
                : "var(--void)",
              color: tapetum ? "var(--amber)" : "var(--subtle)",
            }}
          >
            <span>{t("tapetumLabel")}</span>
            <span>{tapetum ? t("on") : t("off")}</span>
          </button>
        </div>
      </div>

      <VizSlider
        label={t("pupilLabel")}
        display={`${Math.round(pr)} px`}
        min={0}
        max={1}
        step={0.01}
        value={pupil}
        onChange={setPupil}
        tone="var(--cyan)"
        className="mt-3"
      />
    </VizFigure>
  );
}

// A horizontal cost meter — higher fill = steeper price paid for the aperture.
function CostBar({
  label,
  value,
  tone,
  reduced,
}: {
  label: string;
  value: number;
  tone: string;
  reduced: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-void/30 px-3 py-1.5">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-sans text-xs text-muted">{label}</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.round(value * 100)}%`,
            background: tone,
            transition: reduced ? "none" : "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
