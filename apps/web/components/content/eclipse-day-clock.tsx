"use client";

import { arcPoint } from "@/components/content/viz/dial";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface EclipseDayClockProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 460;
const VIEW_H = 240;
const HORIZON = 198;
const ARC_CX = 230;
const ARC_CY = HORIZON;
const ARC_R = 150;
const SUN_R = 13;
const POLY_R = 34;

// Pandora's day, in hours, used only to label the clock readout.
const DAY_HOURS = 26;
// The eclipse falls in mid-afternoon; this day-fraction places Polyphemus so
// the sun slides behind it there. Used as the deterministic SSR default so the
// chapter's signature moment is the first thing a static reader sees.
const ECLIPSE_FRAC = 0.72;

// Sun position on the daytime arc for a given fraction of the day (0 = sunrise
// at the left horizon, 0.5 = noon overhead, 1 = sunset at the right horizon).
function sunPos(frac: number): { x: number; y: number } {
  return arcPoint(ARC_CX, ARC_CY, ARC_R, Math.PI * (1 - frac));
}

const POLY = sunPos(ECLIPSE_FRAC);

// An interactive sky-clock for a tidally locked moon. Polyphemus never moves in
// Pandora's sky; the sun rises, arcs over, and on its way down passes behind the
// giant — the daily eclipse the Na'vi set their afternoons by. The reader scrubs
// the time of day and watches the eclipse happen. SVG-only and deterministic for
// SSR; the play loop is gated on reduced-motion.
export function EclipseDayClock({ caption, className }: EclipseDayClockProps) {
  const reduced = useReducedMotionSafe();
  const t = useTranslations("viz.eclipseClock");
  const uid = useId();
  const [playing, setPlaying] = useState(false);
  // ~8s per full day; deterministic eclipse-afternoon start for SSR.
  const { phase: frac, setPhase: setFrac } = usePhaseLoop({
    period: 8,
    playing,
    initial: ECLIPSE_FRAC,
  });

  const sun = sunPos(frac);
  const dist = Math.hypot(sun.x - POLY.x, sun.y - POLY.y);
  // Eclipse coverage: 1 when the sun is fully behind the giant, 0 when clear.
  const coverage = Math.max(0, Math.min(1, (POLY_R - dist + SUN_R) / (2 * SUN_R)));
  // Sun near the horizon at either end of the daytime arc is dawn/dusk.
  const lowSun = sun.y > HORIZON - 16;

  const state =
    coverage >= 0.85 ? "eclipse" : coverage > 0.05 ? "partial" : lowSun ? "twilight" : "daylight";
  const stateText =
    state === "twilight"
      ? t("twilight")
      : state === "eclipse"
        ? t("eclipse")
        : state === "partial"
          ? t("partial")
          : t("daylight");
  const stateTone =
    state === "eclipse"
      ? "--magenta"
      : state === "partial"
        ? "--amber"
        : state === "twilight"
          ? "--cyan"
          : "--amber";

  // Daylight dims toward dusk and during the eclipse.
  const dayBrightness = 1 - 0.5 * Math.abs(frac - 0.5) * 2;
  const skyDark = Math.max(1 - dayBrightness, coverage * 0.85);

  const hour = (frac * DAY_HOURS).toFixed(1);

  const controls = !reduced ? (
    <button
      type="button"
      onClick={() => setPlaying((p) => !p)}
      aria-label={playing ? t("pause") : t("play")}
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-all hover:border-cyan/60 hover:bg-void/70 hover:shadow-[0_0_0_1px_var(--cyan),0_0_16px_-3px_var(--cyan)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
    >
      {playing ? <Pause size={16} /> : <Play size={16} />}
    </button>
  ) : undefined;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      controls={controls}
      hint={t("hint")}
      tone="magenta"
      className={className}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={`${t("timeLabel")} ${hour}h, ${t("state")}: ${stateText}`}
      >
        <GlowDefs idBase={uid} />
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--surface-overlay)" />
            <stop offset="100%" stopColor="var(--surface)" />
          </linearGradient>
          <radialGradient id={`${uid}-poly`} cx="40%" cy="38%" r="70%">
            <stop offset="0%" stopColor="var(--surface-overlay)" />
            <stop offset="100%" stopColor="var(--void)" />
          </radialGradient>
        </defs>

        {/* sky */}
        <rect x={0} y={0} width={VIEW_W} height={HORIZON} fill={`url(#${uid}-sky)`} />

        {/* daytime arc guide */}
        <path
          d={`M ${ARC_CX - ARC_R} ${ARC_CY} A ${ARC_R} ${ARC_R} 0 0 1 ${ARC_CX + ARC_R} ${ARC_CY}`}
          fill="none"
          style={{ stroke: "var(--border)" }}
          strokeWidth={1}
          strokeDasharray="2 5"
        />

        {/* the sun (drawn before Polyphemus so it can be occulted) */}
        {/* warm wash radiating from the sun's current position */}
        <circle
          cx={sun.x}
          cy={sun.y}
          r={SUN_R * 3.2}
          fill={glowUrl(uid, "wash-amber")}
          opacity={(1 - coverage) * (lowSun ? 0.5 : 0.85)}
        />
        <circle
          cx={sun.x}
          cy={sun.y}
          r={SUN_R}
          style={{ fill: "var(--amber)" }}
          filter={glowUrl(uid, "bloom-strong")}
        />

        {/* Polyphemus — fixed in the sky, with bands */}
        <g filter={glowUrl(uid, "soft-shadow")}>
          <circle
            cx={POLY.x}
            cy={POLY.y}
            r={POLY_R}
            fill={`url(#${uid}-poly)`}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          {[-16, -7, 2, 11, 20].map((dy, i) => (
            <ellipse
              key={i}
              cx={POLY.x}
              cy={POLY.y + dy}
              rx={Math.sqrt(Math.max(0, POLY_R * POLY_R - dy * dy))}
              ry={2.4}
              fill="none"
              style={{ stroke: "var(--cyan)", opacity: 0.28 }}
              strokeWidth={1.4}
            />
          ))}
          {/* eclipse corona ring around the giant when the sun is behind */}
          {coverage > 0.4 && (
            <circle
              cx={POLY.x}
              cy={POLY.y}
              r={POLY_R + 3}
              fill="none"
              style={{ stroke: "var(--amber)", opacity: coverage }}
              filter={glowUrl(uid, "bloom")}
              strokeWidth={2}
            />
          )}
        </g>

        <VizText x={POLY.x} y={POLY.y - POLY_R - 8} size="small" tone="cyan" anchor="middle">
          {t("polyphemus")}
        </VizText>

        {/* dusk/eclipse darkening overlay across the whole sky */}
        <rect
          x={0}
          y={0}
          width={VIEW_W}
          height={HORIZON}
          fill="var(--void)"
          opacity={skyDark * 0.6}
        />

        {/* ground */}
        <rect x={0} y={HORIZON} width={VIEW_W} height={VIEW_H - HORIZON} fill="var(--void)" />
        <line
          x1={0}
          y1={HORIZON}
          x2={VIEW_W}
          y2={HORIZON}
          style={{ stroke: "var(--border-strong)" }}
          strokeWidth={1.5}
        />
      </svg>

      {/* readouts */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <VizReadout label={t("timeLabel")} value={`${hour} h`} tone="var(--teal)" />
        <VizReadout label={t("state")} value={stateText} tone={`var(${stateTone})`} tinted />
      </div>

      {/* scrub control */}
      <div className="mt-3">
        <input
          id={`${uid}-time`}
          type="range"
          min={0}
          max={0.999}
          step={0.001}
          value={frac}
          onChange={(e) => {
            setPlaying(false);
            setFrac(Number(e.target.value));
          }}
          aria-label={t("timeLabel")}
          className="viz-range w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          style={{
            background: `linear-gradient(to right, var(--amber) ${frac * 100}%, var(--border) ${frac * 100}%)`,
            ["--viz-thumb" as string]: "var(--amber)",
          }}
        />
      </div>
    </VizFigure>
  );
}
