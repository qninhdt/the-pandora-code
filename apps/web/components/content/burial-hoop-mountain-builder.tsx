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
// SCIENCE MODEL — two ways to build a mountain, only one of which needs plates
//
// COLLISION (Earth). Thickened low-density crust floats on denser mantle. Airy
// isostasy fixes the hidden root:
//   r = h · ρc / (ρm − ρc)
// With ρc = 2,800 and ρm = 3,300 kg/m³, a 5 km peak hides a ~28 km root. The
// mountain is buoyant; most of it is underground.
//
// BURIAL (Io). Continuous volcanic resurfacing buries older crust, carrying it
// downward. On a sphere, sinking by depth z shrinks the shell's surface area
// (A ∝ R²), so the crust must accommodate the same material in less area. That
// puts it in horizontal compression:
//   σ_θθ ≈ E · z / R      (thin-shell hoop stress from radial subsidence)
// with Young's modulus E ~ 65 GPa for basalt. Bury 20 km of crust on a 1,821 km
// radius body and the stress passes 1 GPa — far above the lithosphere's
// strength, so it fails on deep thrust faults and shoves fault blocks skyward.
// Io's mountains reach 17.5 km this way, with no plate tectonics at all.
// (McKinnon et al. 2001; Kirchoff & McKinnon 2009; Bland & McKinnon 2016.)
//
// Burial depth accumulates at the resurfacing rate, so the time to reach a given
// depth is z / rate — of order a million years at Io's centimetre-per-year pace.
// ─────────────────────────────────────────────────────────────────────

type Mode = "burial" | "collision";

const RHO_CRUST = 2800; // kg/m³
const RHO_MANTLE = 3300; // kg/m³
const YOUNGS_GPA = 65;

/** Airy isostatic root depth (km) beneath a peak of the given height (km). */
function airyRootKm(heightKm: number): number {
  return (heightKm * RHO_CRUST) / (RHO_MANTLE - RHO_CRUST);
}

/** Thin-shell hoop stress (MPa) from burying crust to depth z on radius R. */
function hoopStressMPa(burialKm: number, radiusKm: number): number {
  return (YOUNGS_GPA * 1000 * burialKm) / radiusKm;
}

/** Lithospheric strength that a thrust fault has to beat (MPa). */
const THRUST_THRESHOLD_MPA = 200;

const W = 330;
const H = 190;
const GROUND_Y = 96;
const CENTER_X = W / 2;

interface BurialHoopMountainBuilderProps {
  caption?: string;
  className?: string;
}

export function BurialHoopMountainBuilder({
  caption,
  className,
}: BurialHoopMountainBuilderProps) {
  const uid = useId();
  const t = useTranslations("viz.burialMountain");

  const [mode, setMode] = useState<Mode>("burial");
  const [heightKm, setHeightKm] = useState(12);
  const [burialKm, setBurialKm] = useState(20);
  const [radiusKm, setRadiusKm] = useState(1821); // Io

  const stress = hoopStressMPa(burialKm, radiusKm);
  const fails = stress >= THRUST_THRESHOLD_MPA;
  const rootKm = airyRootKm(heightKm);

  // Vertical exaggeration: 2.2 px per km, so 18 km reads as ~40 px of relief.
  const KM = 2.2;
  const peakY = GROUND_Y - heightKm * KM;
  const rootY = GROUND_Y + Math.min(70, rootKm * KM * 0.35);

  const tone = mode === "burial" ? "var(--amber)" : "var(--cyan)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t(`subtitle.${mode}`)}
      hint={t(`hint.${mode}`)}
      caption={caption}
      tone={mode === "burial" ? "amber" : "cyan"}
      controls={
        <SegmentedToggle
          ariaLabel={t("modeToggle")}
          value={mode}
          onChange={setMode}
          options={[
            { value: "burial", label: t("mode.burial"), tone: "var(--amber)" },
            { value: "collision", label: t("mode.collision"), tone: "var(--cyan)" },
          ]}
        />
      }
      className={className}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t(`aria.${mode}`)}>
        <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />

        {/* Mantle below, crust above. */}
        <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill="var(--abyss)" />
        <rect
          x={0}
          y={GROUND_Y}
          width={W}
          height={22}
          fill="var(--surface-overlay)"
          fillOpacity={0.7}
        />
        <line x1={0} y1={GROUND_Y} x2={W} y2={GROUND_Y} stroke="var(--border)" strokeWidth={0.8} />

        {mode === "burial" ? (
          <>
            {/* Stacked lava sheets, each burying the one before it. */}
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={i}
                x={0}
                y={GROUND_Y + i * 5}
                width={W}
                height={4}
                fill="var(--amber)"
                fillOpacity={0.26 - i * 0.05}
              />
            ))}
            {/* Inward-pointing compression arrows: the shell running out of room. */}
            {[-1, 1].map((s) => (
              <path
                key={s}
                d={`M ${CENTER_X + s * 130} ${GROUND_Y + 14} L ${CENTER_X + s * 92} ${GROUND_Y + 14}`}
                stroke="var(--magenta)"
                strokeWidth={2}
                strokeOpacity={0.8}
                markerEnd=""
              />
            ))}
            <VizText x={CENTER_X} y={GROUND_Y + 34} anchor="middle" size="micro" tone="magenta">
              {t("compression")}
            </VizText>

            {/* A fault-bounded block shoved up along a deep thrust. */}
            <path
              d={`M ${CENTER_X - 54} ${GROUND_Y} L ${CENTER_X - 20} ${peakY} L ${CENTER_X + 40} ${peakY + 6} L ${CENTER_X + 62} ${GROUND_Y} Z`}
              fill="var(--surface-raised)"
              stroke={fails ? "var(--amber)" : "var(--border-strong)"}
              strokeWidth={1.2}
              filter={fails ? glowUrl(uid, "bloom") : undefined}
              opacity={fails ? 1 : 0.45}
            />
            <path
              d={`M ${CENTER_X - 54} ${GROUND_Y} L ${CENTER_X - 96} ${GROUND_Y + 40}`}
              stroke="var(--magenta)"
              strokeWidth={1.4}
              strokeDasharray="4 2"
            />
            <VizText x={CENTER_X - 104} y={GROUND_Y + 50} size="micro" tone="magenta">
              {t("thrustFault")}
            </VizText>
          </>
        ) : (
          <>
            {/* Two converging plates and the folded pile between them. */}
            {[-1, 1].map((s) => (
              <path
                key={s}
                d={`M ${CENTER_X + s * 90} ${GROUND_Y + 6} L ${CENTER_X + s * 148} ${GROUND_Y + 6}`}
                stroke="var(--cyan)"
                strokeWidth={2}
                strokeOpacity={0.75}
              />
            ))}
            <path
              d={`M ${CENTER_X - 72} ${GROUND_Y} Q ${CENTER_X - 30} ${peakY} ${CENTER_X} ${peakY + 4} Q ${CENTER_X + 34} ${peakY} ${CENTER_X + 72} ${GROUND_Y} Z`}
              fill="var(--surface-raised)"
              stroke="var(--cyan)"
              strokeWidth={1.2}
              filter={glowUrl(uid, "bloom")}
            />
            {/* The hidden buoyant root — most of the mountain. */}
            <path
              d={`M ${CENTER_X - 72} ${GROUND_Y} Q ${CENTER_X} ${rootY} ${CENTER_X + 72} ${GROUND_Y} Z`}
              fill="var(--cyan)"
              fillOpacity={0.18}
              stroke="var(--cyan)"
              strokeWidth={0.8}
              strokeDasharray="3 2"
            />
            <VizText x={CENTER_X} y={rootY + 12} anchor="middle" size="micro" tone="cyan">
              {t("root", { km: Math.round(rootKm) })}
            </VizText>
          </>
        )}

        <line
          x1={CENTER_X + 84}
          y1={peakY}
          x2={CENTER_X + 84}
          y2={GROUND_Y}
          stroke="var(--foreground)"
          strokeWidth={0.6}
          strokeOpacity={0.5}
        />
        <VizText x={CENTER_X + 90} y={(peakY + GROUND_Y) / 2} size="micro" tone="foreground">
          {t("peak", { km: heightKm.toFixed(1) })}
        </VizText>
      </svg>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <VizSlider
          label={t("heightLabel")}
          display={`${heightKm.toFixed(1)} km`}
          min={1}
          max={20}
          step={0.5}
          value={heightKm}
          onChange={setHeightKm}
          tone={tone}
        />
        {mode === "burial" ? (
          <VizSlider
            label={t("burialLabel")}
            display={`${Math.round(burialKm)} km`}
            min={1}
            max={50}
            step={1}
            value={burialKm}
            onChange={setBurialKm}
            tone="var(--magenta)"
          />
        ) : (
          <VizSlider
            label={t("radiusLabel")}
            display={`${Math.round(radiusKm)} km`}
            min={500}
            max={6400}
            step={50}
            value={radiusKm}
            onChange={setRadiusKm}
            tone="var(--teal)"
          />
        )}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {mode === "burial" ? (
          <>
            <VizReadout
              label={t("stressLabel")}
              value={`${Math.round(stress)} MPa`}
              note={t("stressNote")}
              tone="var(--magenta)"
            />
            <VizReadout
              label={t("thresholdLabel")}
              value={`${THRUST_THRESHOLD_MPA} MPa`}
              tone="var(--subtle)"
            />
            <VizReadout
              label={t("outcomeLabel")}
              value={fails ? t("outcome.thrusts") : t("outcome.holds")}
              note={fails ? t("outcome.thrustsNote") : t("outcome.holdsNote")}
              tone={fails ? "var(--amber)" : "var(--subtle)"}
              tinted
            />
          </>
        ) : (
          <>
            <VizReadout
              label={t("rootLabel")}
              value={`${Math.round(rootKm)} km`}
              note={t("rootNote")}
              tone="var(--cyan)"
            />
            <VizReadout
              label={t("hiddenLabel")}
              value={`${Math.round((rootKm / (rootKm + heightKm)) * 100)}%`}
              note={t("hiddenNote")}
              tone="var(--teal)"
            />
            <VizReadout
              label={t("outcomeLabel")}
              value={t("outcome.collision")}
              note={t("outcome.collisionNote")}
              tone="var(--cyan)"
              tinted
            />
          </>
        )}
      </div>
    </VizFigure>
  );
}
