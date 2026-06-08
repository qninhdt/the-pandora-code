"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface SuperconductorCooldownProps {
  caption?: string;
  locale?: "vi" | "en";
  /** Critical temperature in kelvin. Defaults to a YBCO-like 92 K. */
  tcKelvin?: number;
  className?: string;
}

const VIEW_W = 460;
const VIEW_H = 220;
// Graph occupies the left half; the levitation scene the right half.
const G = { left: 44, top: 16, w: 200, h: 150 };
const T_MAX = 160; // kelvin shown on the slider/axis
const DEFAULT_TC = 92;
const DEFAULT_T = 60; // below Tc → starts levitating, the signature image

const STRINGS = {
  vi: {
    temp: "Nhiệt độ",
    resistance: "Điện trở",
    state: "Trạng thái",
    normal: "Kim loại thường",
    superconducting: "Siêu dẫn",
    tc: "Nhiệt độ tới hạn Tc",
    tempAxis: "Nhiệt độ (K) →",
    resAxis: "Điện trở →",
    play: "Làm lạnh / làm nóng",
    pause: "Dừng",
    hint: "Hạ nhiệt độ xuống dưới Tc: điện trở rơi thẳng về 0 và nam châm bị khóa lơ lửng trong không trung.",
    levitating: "Khóa từ thông — lơ lửng",
    resting: "Nằm yên trên mặt",
  },
  en: {
    temp: "Temperature",
    resistance: "Resistance",
    state: "State",
    normal: "Normal metal",
    superconducting: "Superconducting",
    tc: "Critical temperature Tc",
    tempAxis: "Temperature (K) →",
    resAxis: "Resistance →",
    play: "Cool / warm",
    pause: "Pause",
    hint: "Drop the temperature below Tc: resistance falls straight to zero and the magnet locks, hanging in mid-air.",
    levitating: "Flux-locked — levitating",
    resting: "Resting on the surface",
  },
} as const;

// Resistance as a fraction of its room-temperature value: a normal metal's
// resistance rises with temperature, but at Tc it collapses abruptly to exactly
// zero — the superconducting transition.
function resistanceFrac(temp: number, tc: number): number {
  if (temp <= tc) return 0;
  return (temp - tc) / (T_MAX - tc);
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
  locale = "en",
  tcKelvin = DEFAULT_TC,
  className,
}: SuperconductorCooldownProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const uid = useId();
  const [temp, setTemp] = useState(DEFAULT_T);
  const [playing, setPlaying] = useState(false);
  const dir = useRef(-1); // -1 cooling, +1 warming
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
        setTemp((p) => {
          let next = p + dir.current * dt * 40;
          if (next <= 5) {
            next = 5;
            dir.current = 1;
          } else if (next >= T_MAX) {
            next = T_MAX;
            dir.current = -1;
          }
          return next;
        });
      }
      last.current = now;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  const frac = resistanceFrac(temp, tcKelvin);
  const isSuper = temp <= tcKelvin;
  // Levitation height: 0 (resting) just above Tc, rising as it cools below.
  const lift = Math.max(0, Math.min(1, (tcKelvin - temp) / 45));

  // Resistance curve: flat zero up to Tc, a jump, then linear to T_MAX.
  const curve: string[] = [];
  curve.push(`${gx(0)},${gy(0)}`);
  curve.push(`${gx(tcKelvin)},${gy(0)}`);
  curve.push(`${gx(tcKelvin)},${gy(resistanceFrac(tcKelvin + 0.001, tcKelvin))}`);
  curve.push(`${gx(T_MAX)},${gy(1)}`);

  // Right-hand levitation scene geometry.
  const sceneCx = 350;
  const discY = 150;
  const magnetY = discY - 30 - lift * 36;

  return (
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full"
          role="img"
          aria-label={`${t.temp} ${temp.toFixed(0)} K, ${t.state}: ${isSuper ? t.superconducting : t.normal}`}
        >
          {/* ---- resistance graph ---- */}
          <line
            x1={G.left}
            y1={G.top}
            x2={G.left}
            y2={G.top + G.h}
            style={{ stroke: "var(--border-strong)" }}
            strokeWidth={1.5}
          />
          <line
            x1={G.left}
            y1={G.top + G.h}
            x2={G.left + G.w}
            y2={G.top + G.h}
            style={{ stroke: "var(--border-strong)" }}
            strokeWidth={1.5}
          />
          <text
            x={G.left + G.w / 2}
            y={G.top + G.h + 22}
            textAnchor="middle"
            style={{ fill: "var(--subtle)", fontSize: 9 }}
            className="font-sans"
          >
            {t.tempAxis}
          </text>
          <text
            x={14}
            y={G.top + G.h / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${G.top + G.h / 2})`}
            style={{ fill: "var(--subtle)", fontSize: 9 }}
            className="font-sans"
          >
            {t.resAxis}
          </text>

          {/* Tc marker */}
          <line
            x1={gx(tcKelvin)}
            y1={G.top}
            x2={gx(tcKelvin)}
            y2={G.top + G.h}
            style={{ stroke: "var(--magenta)" }}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text
            x={gx(tcKelvin)}
            y={G.top - 4}
            textAnchor="middle"
            style={{ fill: "var(--magenta)", fontSize: 9 }}
            className="font-sans"
          >
            Tc
          </text>

          {/* resistance curve */}
          <polyline
            points={curve.join(" ")}
            fill="none"
            style={{ stroke: "var(--cyan)", filter: "drop-shadow(0 0 4px var(--cyan))" }}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {/* current-temperature marker on the curve */}
          <circle
            cx={gx(temp)}
            cy={gy(frac)}
            r={5}
            style={{ fill: "var(--amber)", filter: "drop-shadow(0 0 5px var(--amber))" }}
          />

          {/* ---- levitation scene ---- */}
          {/* flux-pinning lock lines when superconducting */}
          {isSuper &&
            [-18, -9, 0, 9, 18].map((dx) => (
              <line
                key={dx}
                x1={sceneCx + dx}
                y1={magnetY + 10}
                x2={sceneCx + dx}
                y2={discY - 8}
                style={{ stroke: "var(--cyan)", opacity: 0.35 * lift + 0.15 }}
                strokeWidth={1}
                strokeDasharray="2 3"
              />
            ))}

          {/* the magnet */}
          <g
            transform={`translate(${sceneCx} ${magnetY})`}
            style={{ transition: reduced ? undefined : "transform 0.2s" }}
          >
            <rect
              x={-24}
              y={-10}
              width={48}
              height={20}
              rx={4}
              style={{
                fill: "var(--magenta)",
                filter: isSuper ? "drop-shadow(0 0 8px var(--magenta))" : undefined,
              }}
            />
          </g>

          {/* the superconductor disc */}
          <ellipse
            cx={sceneCx}
            cy={discY}
            rx={40}
            ry={11}
            style={{
              fill: isSuper
                ? "color-mix(in oklab, var(--cyan) 35%, var(--void))"
                : "var(--surface-overlay)",
              stroke: "var(--border-strong)",
            }}
            strokeWidth={1}
          />
          {/* vapor when cold */}
          {isSuper &&
            [-26, 0, 26].map((dx, i) => (
              <ellipse
                key={i}
                cx={sceneCx + dx}
                cy={discY + 12 + (i % 2) * 4}
                rx={9}
                ry={3}
                style={{ fill: "var(--cyan)", opacity: 0.12 }}
              />
            ))}
          <text
            x={sceneCx}
            y={discY + 30}
            textAnchor="middle"
            style={{ fill: isSuper ? "var(--cyan)" : "var(--subtle)", fontSize: 9 }}
            className="font-sans"
          >
            {isSuper ? t.levitating : t.resting}
          </text>
        </svg>

        {/* readouts */}
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Readout label={t.temp} value={`${temp.toFixed(0)} K`} tone="--amber" />
          <Readout label={t.resistance} value={`${Math.round(frac * 100)}%`} tone="--cyan" />
          <Readout
            label={t.state}
            value={isSuper ? t.superconducting : t.normal}
            tone={isSuper ? "--teal" : "--subtle"}
          />
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
            id={`${uid}-temp`}
            type="range"
            min={5}
            max={T_MAX}
            step={1}
            value={temp}
            onChange={(e) => {
              setPlaying(false);
              setTemp(Number(e.target.value));
            }}
            aria-label={t.temp}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, var(--cyan) ${(temp / T_MAX) * 100}%, var(--border) ${(temp / T_MAX) * 100}%)`,
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
