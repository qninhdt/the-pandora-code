"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

interface SuperconductorCooldownProps {
  caption?: string;
  /** Critical temperature in kelvin. Defaults to a YBCO-like 92 K. */
  tcKelvin?: number;
  className?: string;
}

const VIEW_W = 460;
const VIEW_H = 220;
// Graph occupies the left half; the levitation scene the right half.
const G = { left: 44, top: 16, w: 200, h: 150 };
const T_MIN = 5; // kelvin floor of the sweep
const T_MAX = 160; // kelvin shown on the slider/axis
const DEFAULT_TC = 92;
const DEFAULT_T = 60; // below Tc → starts levitating, the signature image
const SWEEP_PERIOD = 7.75; // seconds for a full T_MIN→T_MAX→T_MIN cool/warm cycle

// Resistance as a fraction of its room-temperature value: a normal metal's
// resistance rises with temperature, but at Tc it collapses abruptly to exactly
// zero — the superconducting transition.
function resistanceFrac(temp: number, tc: number): number {
  if (temp <= tc) return 0;
  return (temp - tc) / (T_MAX - tc);
}

// Map a 0→1 phase onto a triangle wave over [T_MIN, T_MAX] so the animation
// cools to the floor then warms back up, indefinitely.
function phaseToTemp(phase: number): number {
  const tri = phase < 0.5 ? 1 - phase * 2 : (phase - 0.5) * 2; // 1→0→1
  return T_MIN + (1 - tri) * (T_MAX - T_MIN);
}
function tempToPhase(temp: number): number {
  // Inverse on the cooling half (phase 0→0.5) — used to seed scrubbing.
  const frac = (temp - T_MIN) / (T_MAX - T_MIN);
  return frac / 2;
}

function gx(temp: number): number {
  return G.left + (temp / T_MAX) * G.w;
}
function gy(frac: number): number {
  return G.top + (1 - frac) * G.h;
}

// An interactive cool-down: the reader lowers the temperature through the
// critical point and watches two things happen at once — the resistance curve
// drops off a cliff to zero, and the magnet over the sample stops resting and
// locks into levitation (the Meissner effect plus flux pinning). SVG-only and
// deterministic for SSR; the cool/warm sweep is gated on reduced-motion.
export function SuperconductorCooldown({
  caption,
  tcKelvin = DEFAULT_TC,
  className,
}: SuperconductorCooldownProps) {
  const t = useTranslations("viz.superconductor");
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [playing, setPlaying] = useState(false);
  // Phase loop drives the cool/warm sweep; reduced-motion freezes advancement.
  const { phase, setPhase } = usePhaseLoop({
    period: SWEEP_PERIOD,
    playing,
    initial: tempToPhase(DEFAULT_T),
  });
  // Manual temperature override when the reader scrubs the slider.
  const [manualTemp, setManualTemp] = useState<number | null>(null);

  const temp = manualTemp ?? phaseToTemp(phase);

  // Stop the loop and disable controls under reduced-motion.
  useEffect(() => {
    if (reduced && playing) setPlaying(false);
  }, [reduced, playing]);

  const frac = resistanceFrac(temp, tcKelvin);
  const isSuper = temp <= tcKelvin;
  // Levitation height: 0 (resting) just above Tc, rising as it cools below.
  const lift = Math.max(0, Math.min(1, (tcKelvin - temp) / 45));

  // Resistance curve: flat zero up to Tc, a jump, then linear to T_MAX.
  const curve = [
    `${gx(0)},${gy(0)}`,
    `${gx(tcKelvin)},${gy(0)}`,
    `${gx(tcKelvin)},${gy(resistanceFrac(tcKelvin + 0.001, tcKelvin))}`,
    `${gx(T_MAX)},${gy(1)}`,
  ];

  // Right-hand levitation scene geometry.
  const sceneCx = 350;
  const discY = 150;
  const magnetY = discY - 30 - lift * 36;

  function scrub(next: number) {
    setPlaying(false);
    setManualTemp(next);
    // Keep the phase in sync so resuming play continues from here.
    setPhase(tempToPhase(next));
  }

  function togglePlay() {
    setManualTemp(null); // hand control back to the loop
    setPlaying((p) => !p);
  }

  return (
    <VizFigure
      title={t("title")}
      hint={reduced ? undefined : t("hint")}
      caption={caption}
      tone="cyan"
      className={className}
      controls={
        reduced ? undefined : (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? t("pause") : t("play")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-colors hover:bg-void/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
        )
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={`${t("temp")} ${temp.toFixed(0)} K, ${t("state")}: ${isSuper ? t("superconducting") : t("normal")}`}
      >
        <GlowDefs idBase={uid} tones={["cyan", "magenta", "amber"]} />

        {/* ---- resistance graph ---- */}
        <line
          x1={G.left}
          y1={G.top}
          x2={G.left}
          y2={G.top + G.h}
          stroke="var(--border-strong)"
          strokeWidth={1.5}
        />
        <line
          x1={G.left}
          y1={G.top + G.h}
          x2={G.left + G.w}
          y2={G.top + G.h}
          stroke="var(--border-strong)"
          strokeWidth={1.5}
        />
        <VizTick x={G.left + G.w / 2} y={G.top + G.h + 22}>
          {t("tempAxis")}
        </VizTick>
        <VizText
          x={14}
          y={G.top + G.h / 2}
          size="micro"
          anchor="middle"
          transform={`rotate(-90 14 ${G.top + G.h / 2})`}
        >
          {t("resAxis")}
        </VizText>

        {/* Tc marker */}
        <line
          x1={gx(tcKelvin)}
          y1={G.top}
          x2={gx(tcKelvin)}
          y2={G.top + G.h}
          stroke="var(--magenta)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <VizText x={gx(tcKelvin)} y={G.top - 4} size="micro" tone="magenta" anchor="middle">
          Tc
        </VizText>

        {/* resistance curve */}
        <polyline
          points={curve.join(" ")}
          fill="none"
          stroke="var(--cyan)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          filter={glowUrl(uid, "bloom")}
        />
        {/* current-temperature marker on the curve */}
        <circle
          cx={gx(temp)}
          cy={gy(frac)}
          r={5}
          fill="var(--amber)"
          filter={glowUrl(uid, "bloom-strong")}
        />

        {/* ---- levitation scene ---- */}
        {/* radial wash blooms behind the magnet as it locks into levitation */}
        {isSuper && (
          <circle
            cx={sceneCx}
            cy={magnetY}
            r={48}
            fill={glowUrl(uid, "wash-cyan")}
            opacity={0.4 + 0.5 * lift}
          />
        )}
        {/* flux-pinning lock lines when superconducting */}
        {isSuper &&
          [-18, -9, 0, 9, 18].map((dx) => (
            <line
              key={dx}
              x1={sceneCx + dx}
              y1={magnetY + 10}
              x2={sceneCx + dx}
              y2={discY - 8}
              stroke="var(--cyan)"
              strokeOpacity={0.35 * lift + 0.15}
              strokeWidth={1.25}
              strokeDasharray="2 3"
              filter={glowUrl(uid, "bloom")}
            />
          ))}

        {/* cast shadow on the disc — tightens as the magnet settles, widens as
            it lifts; sells the gap between magnet and surface */}
        <ellipse
          cx={sceneCx}
          cy={discY - 2}
          rx={18 + lift * 8}
          ry={3.5}
          fill="var(--void)"
          opacity={0.45 - 0.25 * lift}
        />

        {/* the magnet — a beveled puck: shadowed base, lit body, top highlight */}
        <g
          transform={`translate(${sceneCx} ${magnetY})`}
          style={{ transition: reduced ? undefined : "transform 0.2s" }}
          filter={isSuper ? glowUrl(uid, "bloom-strong") : glowUrl(uid, "soft-shadow")}
        >
          <rect
            x={-24}
            y={-10}
            width={48}
            height={20}
            rx={4}
            fill="color-mix(in oklab, var(--magenta) 55%, var(--void))"
          />
          <rect x={-24} y={-10} width={48} height={12} rx={4} fill="var(--magenta)" />
          {/* top sheen */}
          <rect
            x={-20}
            y={-8}
            width={40}
            height={3.5}
            rx={1.75}
            fill="color-mix(in oklab, var(--magenta) 40%, var(--foreground))"
            opacity={0.55}
          />
        </g>

        {/* the superconductor disc — body + lit top rim for thickness */}
        <ellipse
          cx={sceneCx}
          cy={discY + 5}
          rx={40}
          ry={11}
          fill={
            isSuper
              ? "color-mix(in oklab, var(--cyan) 22%, var(--void))"
              : "color-mix(in oklab, var(--surface-overlay) 80%, var(--void))"
          }
          stroke="var(--border-strong)"
          strokeWidth={1}
        />
        <ellipse
          cx={sceneCx}
          cy={discY}
          rx={40}
          ry={11}
          fill={
            isSuper ? "color-mix(in oklab, var(--cyan) 35%, var(--void))" : "var(--surface-overlay)"
          }
          stroke="var(--border-strong)"
          strokeWidth={1}
        />
        {/* inner highlight ring on the disc face */}
        <ellipse
          cx={sceneCx}
          cy={discY - 1}
          rx={30}
          ry={7}
          fill="none"
          stroke={isSuper ? "var(--cyan)" : "var(--border-strong)"}
          strokeWidth={0.75}
          strokeOpacity={isSuper ? 0.5 : 0.3}
        />
        {/* vapor when cold */}
        {isSuper &&
          [-26, 0, 26].map((dx, i) => (
            <ellipse
              key={dx}
              cx={sceneCx + dx}
              cy={discY + 12 + (i % 2) * 4}
              rx={9}
              ry={3}
              fill="var(--cyan)"
              opacity={0.12}
            />
          ))}
        <VizText
          x={sceneCx}
          y={discY + 30}
          size="micro"
          tone={isSuper ? "cyan" : "subtle"}
          anchor="middle"
        >
          {isSuper ? t("levitating") : t("resting")}
        </VizText>
      </svg>

      {/* readouts */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        <VizReadout label={t("temp")} value={`${temp.toFixed(0)} K`} tone="var(--amber)" />
        <VizReadout
          label={t("resistance")}
          value={`${Math.round(frac * 100)}%`}
          tone="var(--cyan)"
        />
        <VizReadout
          label={t("state")}
          value={isSuper ? t("superconducting") : t("normal")}
          tone={isSuper ? "var(--teal)" : "var(--subtle)"}
        />
      </div>

      {/* temperature scrub */}
      <input
        id={`${uid}-temp`}
        type="range"
        min={T_MIN}
        max={T_MAX}
        step={1}
        value={Math.round(temp)}
        onChange={(e) => scrub(Number(e.target.value))}
        aria-label={t("temp")}
        className="viz-range mt-3 w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        style={{
          background: `linear-gradient(to right, var(--cyan) ${(temp / T_MAX) * 100}%, var(--border) ${(temp / T_MAX) * 100}%)`,
          ["--viz-thumb" as string]: "var(--cyan)",
        }}
      />
    </VizFigure>
  );
}
