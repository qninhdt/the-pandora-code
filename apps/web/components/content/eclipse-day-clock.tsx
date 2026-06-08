"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface EclipseDayClockProps {
  caption?: string;
  locale?: "vi" | "en";
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
  const theta = Math.PI * (1 - frac);
  return { x: ARC_CX + ARC_R * Math.cos(theta), y: ARC_CY - ARC_R * Math.sin(theta) };
}

const POLY = sunPos(ECLIPSE_FRAC);

const STRINGS = {
  vi: {
    timeLabel: "Giờ trong ngày",
    state: "Trạng thái",
    daylight: "Ban ngày",
    eclipse: "Nhật thực",
    partial: "Chớm che",
    twilight: "Tranh tối tranh sáng",
    polyphemus: "Polyphemus",
    sun: "Mặt trời",
    horizon: "Đường chân trời",
    beHome: "Về nhà trước nhật thực",
    play: "Chạy",
    pause: "Dừng",
    hint: "Kéo thời gian: Polyphemus đứng yên trên trời, mặt trời trượt qua sau nó mỗi buổi xế chiều.",
  },
  en: {
    timeLabel: "Time of day",
    state: "State",
    daylight: "Daylight",
    eclipse: "Eclipse",
    partial: "Partial",
    twilight: "Twilight",
    polyphemus: "Polyphemus",
    sun: "Sun",
    horizon: "Horizon",
    beHome: "Be home by eclipse",
    play: "Play",
    pause: "Pause",
    hint: "Drag time: Polyphemus hangs fixed in the sky while the sun slides behind it each late afternoon.",
  },
} as const;

// An interactive sky-clock for a tidally locked moon. Polyphemus never moves in
// Pandora's sky; the sun rises, arcs over, and on its way down passes behind the
// giant — the daily eclipse the Na'vi set their afternoons by. The reader scrubs
// the time of day and watches the eclipse happen. SVG-only and deterministic for
// SSR; the play loop is gated on reduced-motion.
export function EclipseDayClock({ caption, locale = "en", className }: EclipseDayClockProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const uid = useId();
  const [frac, setFrac] = useState(ECLIPSE_FRAC);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      last.current = null;
      return;
    }
    const step = (now: number) => {
      if (last.current !== null) {
        const dt = (now - last.current) / 1000;
        setFrac((p) => (p + dt * 0.12) % 1); // ~8s per full day
      }
      last.current = now;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

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
      ? t.twilight
      : state === "eclipse"
        ? t.eclipse
        : state === "partial"
          ? t.partial
          : t.daylight;
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

  return (
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full"
          role="img"
          aria-label={`${t.timeLabel} ${hour}h, ${t.state}: ${stateText}`}
        >
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
          <circle
            cx={sun.x}
            cy={sun.y}
            r={SUN_R}
            style={{
              fill: "var(--amber)",
              filter: `drop-shadow(0 0 ${10 + 8 * dayBrightness}px var(--amber))`,
            }}
          />

          {/* Polyphemus — fixed in the sky, with bands */}
          <g>
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
                style={{
                  stroke: "var(--amber)",
                  filter: "drop-shadow(0 0 8px var(--amber))",
                  opacity: coverage,
                }}
                strokeWidth={2}
              />
            )}
          </g>

          <text
            x={POLY.x}
            y={POLY.y - POLY_R - 8}
            textAnchor="middle"
            style={{ fill: "var(--cyan)", fontSize: 10 }}
            className="font-sans"
          >
            {t.polyphemus}
          </text>

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
        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
          <Readout label={t.timeLabel} value={`${hour} h`} tone="--teal" />
          <Readout label={t.state} value={stateText} tone={stateTone} />
        </div>

        {/* controls */}
        <div className="mt-3 flex items-center gap-3">
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t.pause : t.play}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-colors hover:bg-void/70"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
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
            aria-label={t.timeLabel}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, var(--amber) ${frac * 100}%, var(--border) ${frac * 100}%)`,
            }}
          />
        </div>

        {!reduced && <p className="mt-3 font-sans text-xs text-subtle">{t.hint}</p>}
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 font-serif text-sm italic leading-relaxed text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function Readout({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-border bg-void/30 px-2 py-1.5">
      <p className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">{label}</p>
      <p className="font-display text-sm font-700 tabular-nums" style={{ color: `var(${tone})` }}>
        {value}
      </p>
    </div>
  );
}
