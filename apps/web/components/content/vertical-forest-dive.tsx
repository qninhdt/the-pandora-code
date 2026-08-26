"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface VerticalForestDiveProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL
// Light extinction through foliage follows Beer-Lambert:
//   I(z) = I₀ · exp(−k · LAI_cumulative(z))
// where LAI accumulates downward from the emergent crown. The vertical
// profile is split into four ecological strata — each a genuinely
// different world in light, wind, humidity, and temperature swing.
// ─────────────────────────────────────────────────────────────────────
const K = 0.55; // canopy extinction coefficient (broadleaf ~0.4–0.7)

interface Stratum {
  top: number; // fraction of total height (1 = emergent peak)
  bottom: number;
  lai: number; // leaf-area added crossing THIS band from above
  toneVar: string; // ambient glow tone for this layer
}

const STRATA: Stratum[] = [
  { top: 1.0, bottom: 0.78, lai: 0.4, toneVar: "var(--amber)" }, // emergent
  { top: 0.78, bottom: 0.45, lai: 3.6, toneVar: "var(--teal)" }, // canopy
  { top: 0.45, bottom: 0.18, lai: 1.8, toneVar: "var(--cyan)" }, // understory
  { top: 0.18, bottom: 0.0, lai: 0.6, toneVar: "var(--magenta)" }, // floor
];

// Cumulative LAI from top down to a given fractional height (0–1).
function cumulativeLai(frac: number): number {
  let sum = 0;
  for (const s of STRATA) {
    if (frac >= s.bottom) {
      // Entirely above this band
      if (frac >= s.top) continue;
      // Partially inside: proportion of the band traversed
      const bandSpan = s.top - s.bottom;
      const traversed = s.top - frac;
      sum += s.lai * (traversed / bandSpan);
    } else {
      // Fully crossed this band
      sum += s.lai;
    }
  }
  return sum;
}

// Light surviving at fractional height (0=floor, 1=top), in percent.
function lightAt(frac: number): number {
  return Math.exp(-K * cumulativeLai(frac)) * 100;
}

// Wind speed approximation (relative): exponential decay into the canopy.
function windAt(frac: number): number {
  if (frac >= 0.78) return 80 + ((frac - 0.78) / 0.22) * 20;
  return 80 * Math.exp(-3.5 * (0.78 - frac));
}

// Humidity (relative %): inversion of light — humid below, dry above.
function humidityAt(frac: number): number {
  return 40 + 55 * (1 - frac);
}

// Temperature swing (°C range): large swings exposed at top, buffered below.
function tempSwingAt(frac: number): number {
  return 2 + 14 * frac;
}

// Which stratum index a fractional height falls in.
function stratumAt(frac: number): number {
  for (let i = 0; i < STRATA.length; i++) {
    if (frac >= STRATA[i].bottom && frac <= STRATA[i].top) return i;
  }
  return STRATA.length - 1;
}

// Fauna silhouettes at each stratum — simple SVG paths.
// Emergent: banshee (wings spread). Canopy: prolemuris (swinging).
// Understory: Na'vi figure. Floor: hexapede (browsing).
const FAUNA_PATHS: Record<number, { d: string; w: number; h: number }> = {
  0: {
    // Banshee — spread wings
    d: "M16 8 L4 2 L2 6 L10 10 L2 14 L4 18 L16 12 L28 18 L30 14 L22 10 L30 6 L28 2 Z",
    w: 32,
    h: 20,
  },
  1: {
    // Prolemuris — climbing figure
    d: "M8 4 Q6 2 8 0 Q10 2 8 4 M8 4 L8 10 M5 7 L11 7 M8 10 L5 16 M8 10 L11 16 M11 7 L14 4 M5 7 L2 4",
    w: 16,
    h: 16,
  },
  2: {
    // Na'vi — standing figure with bow
    d: "M8 3 Q6 1 8 0 Q10 1 8 3 M8 3 L8 12 M4 6 L12 6 M8 12 L5 20 M8 12 L11 20 M12 6 L14 0",
    w: 16,
    h: 20,
  },
  3: {
    // Hexapede — quadruped
    d: "M4 6 L20 6 Q24 6 24 4 Q24 2 22 2 M4 6 Q0 6 0 8 M4 6 L2 12 M8 6 L6 12 M16 6 L14 12 M20 6 L18 12",
    w: 24,
    h: 12,
  },
};

// ─────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────
const W = 320;
const H = 280;
const COL_X = 60; // trunk center x
const COL_W = 12; // trunk visual width

export function VerticalForestDive({ caption, className }: VerticalForestDiveProps) {
  const uid = useId();
  const t = useTranslations("viz.forestDive");
  const [depth, setDepth] = useState(0.88); // start near the emergent top

  const heightM = Math.round(depth * 300); // Hometree ~ 300 m
  const light = lightAt(depth);
  const wind = windAt(depth);
  const humidity = humidityAt(depth);
  const tempSwing = tempSwingAt(depth);
  const si = stratumAt(depth);

  // Y mapping: top of SVG = height 1.0, bottom = 0.0
  const PAD_T = 16;
  const PAD_B = 20;
  const plotH = H - PAD_T - PAD_B;
  const yFor = (frac: number) => PAD_T + (1 - frac) * plotH;

  // Light-fall curve: sample every 2% of height
  const lightCurvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const f = i / 50;
      const lx = 140 + (lightAt(f) / 100) * 140;
      const ly = PAD_T + (1 - f) * plotH;
      pts.push(`${i === 0 ? "M" : "L"} ${lx.toFixed(1)} ${ly.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [plotH]);

  // Background darkness: the whole card gets dimmer as you descend
  const bgOpacity = 0.04 + (1 - depth) * 0.18;

  // Current position marker
  const cy = yFor(depth);
  const fauna = FAUNA_PATHS[si];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone="teal"
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        {/* SVG forest cross-section */}
        <div className="relative sm:w-3/5">
          {/* Ambient darkening overlay — gets darker as you descend */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-500"
            style={{ background: `rgba(0,0,0,${bgOpacity})` }}
          />
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="relative w-full"
            role="img"
            aria-label={t("title")}
          >
            <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta"]} />

            {/* Strata bands */}
            {STRATA.map((s, i) => {
              const y1 = yFor(s.top);
              const y2 = yFor(s.bottom);
              const bandH = y2 - y1;
              const lightMid = lightAt((s.top + s.bottom) / 2);
              const alpha = 0.06 + (lightMid / 100) * 0.2;
              const isActive = si === i;
              return (
                <g key={i}>
                  <rect
                    x={COL_X + COL_W + 4}
                    y={y1}
                    width={70}
                    height={bandH}
                    rx={4}
                    fill={
                      isActive
                        ? `color-mix(in oklab, ${s.toneVar} 22%, transparent)`
                        : `color-mix(in oklab, var(--cyan) ${Math.round(alpha * 100)}%, transparent)`
                    }
                    stroke={isActive ? s.toneVar : "var(--border)"}
                    strokeWidth={isActive ? 1.5 : 0.5}
                    strokeOpacity={isActive ? 1 : 0.4}
                    style={{ transition: "all 0.4s ease" }}
                  />
                  <VizText
                    x={COL_X + COL_W + 10}
                    y={y1 + 14}
                    size="micro"
                    tone={isActive ? s.toneVar : "subtle"}
                    weight={isActive ? 700 : 400}
                  >
                    {t(`strata.${i}`)}
                  </VizText>
                </g>
              );
            })}

            {/* Trunk */}
            <rect
              x={COL_X - COL_W / 2}
              y={PAD_T}
              width={COL_W}
              height={plotH}
              rx={4}
              fill="color-mix(in oklab, var(--teal) 15%, var(--void))"
              stroke="var(--border)"
              strokeWidth={0.5}
            />

            {/* Light extinction curve */}
            <path
              d={lightCurvePath}
              fill="none"
              stroke="var(--amber)"
              strokeWidth={2}
              strokeOpacity={0.8}
              filter={glowUrl(uid, "bloom")}
            />

            {/* Light axis label */}
            <VizText x={210} y={PAD_T - 2} size="micro" tone="amber" anchor="middle">
              {t("lightCurve")}
            </VizText>

            {/* Height ticks */}
            {[0, 75, 150, 225, 300].map((m) => (
              <g key={m}>
                <line
                  x1={COL_X - COL_W / 2 - 6}
                  y1={yFor(m / 300)}
                  x2={COL_X - COL_W / 2 - 2}
                  y2={yFor(m / 300)}
                  stroke="var(--subtle)"
                  strokeWidth={1}
                  strokeOpacity={0.5}
                />
                <VizText
                  x={COL_X - COL_W / 2 - 8}
                  y={yFor(m / 300) + 4}
                  size="micro"
                  anchor="end"
                  numeric
                >
                  {m}
                </VizText>
              </g>
            ))}

            {/* Current depth indicator — horizontal probe line */}
            <line
              x1={COL_X - 20}
              y1={cy}
              x2={W - 20}
              y2={cy}
              stroke="var(--foreground)"
              strokeWidth={1}
              strokeOpacity={0.3}
              strokeDasharray="3 3"
              style={{ transition: "y1 0.15s ease, y2 0.15s ease" }}
            />
            <circle
              cx={COL_X}
              cy={cy}
              r={5}
              fill={STRATA[si].toneVar}
              filter={glowUrl(uid, "bloom-strong")}
              style={{ transition: "cy 0.15s ease" }}
            />

            {/* Light value at current depth */}
            <circle
              cx={140 + (light / 100) * 140}
              cy={cy}
              r={4}
              fill="var(--amber)"
              filter={glowUrl(uid, "bloom")}
              style={{ transition: "cx 0.15s ease, cy 0.15s ease" }}
            />

            {/* Fauna silhouette at current stratum */}
            {fauna && (
              <g
                transform={`translate(${COL_X + COL_W + 80}, ${cy - fauna.h / 2})`}
                opacity={0.7}
                style={{ transition: "transform 0.4s ease, opacity 0.4s ease" }}
              >
                <path
                  d={fauna.d}
                  fill="none"
                  stroke={STRATA[si].toneVar}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={glowUrl(uid, "bloom")}
                />
              </g>
            )}
          </svg>
        </div>

        {/* Right panel — live environment readouts */}
        <div className="flex flex-col justify-center gap-2 sm:w-2/5">
          <VizReadout
            label={t("heightLabel")}
            value={`${heightM} m`}
            tone={STRATA[si].toneVar}
            tinted
          />
          <VizReadout
            label={t("lightLabel")}
            value={`${light < 10 ? light.toFixed(1) : Math.round(light)}%`}
            note={t("lightNote")}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("windLabel")}
            value={`${Math.round(wind)}%`}
            note={t("windNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("humidityLabel")}
            value={`${Math.round(humidity)}%`}
            note={t("humidityNote")}
          />
          <VizReadout
            label={t("tempLabel")}
            value={`±${tempSwing.toFixed(1)} °C`}
            note={t("tempNote")}
          />
          <div
            className="mt-1 rounded-lg border px-3 py-2 font-sans text-xs text-muted"
            style={{
              borderColor: `color-mix(in oklab, ${STRATA[si].toneVar} 40%, transparent)`,
              background: `color-mix(in oklab, ${STRATA[si].toneVar} 8%, var(--void))`,
            }}
          >
            {t(`fauna.${si}`)}
          </div>
        </div>
      </div>

      <VizSlider
        className="mt-4"
        label={t("depthLabel")}
        display={`${heightM} m`}
        min={0}
        max={1}
        step={0.005}
        value={depth}
        onChange={setDepth}
        tone={STRATA[si].toneVar}
      />
    </VizFigure>
  );
}
