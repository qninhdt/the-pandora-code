"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface IsochronPlotProps {
  caption?: string;
  className?: string;
}

// Plot geometry, in SVG user units. A fixed viewBox keeps it crisp at any
// rendered width; the wrapper makes it responsive.
const VIEW_W = 440;
const VIEW_H = 300;
const PAD = { left: 46, right: 18, top: 18, bottom: 38 };
const DOMAIN = { x: 1.35, y: 1.35 }; // data-space extent shown on each axis

// Co-genetic mineral grains: each crystallized from the same melt with the same
// initial daughter ratio (D0) but a different amount of radioactive parent. The
// spread of parent values is what makes the isochron pivot legibly.
const D0 = 0.18; // initial daughter/stable ratio — the y-intercept the method recovers
const PARENTS = [0.16, 0.42, 0.68, 0.94, 1.18]; // initial parent/stable per grain
const MAX_HALF_LIVES = 2.4;
const INITIAL_T = 0.8; // deterministic for SSR; a meaningful tilt for static viewers

// Map data coordinates to SVG pixel coordinates.
function sx(x: number): number {
  return PAD.left + (x / DOMAIN.x) * (VIEW_W - PAD.left - PAD.right);
}
function sy(y: number): number {
  return VIEW_H - PAD.bottom - (y / DOMAIN.y) * (VIEW_H - PAD.top - PAD.bottom);
}

// An animated, interactive isochron diagram. As time runs (in half-lives),
// parent-rich grains climb faster than parent-poor ones, so a flat line of
// points pivots into a sloped isochron whose slope encodes the age and whose
// y-intercept recovers the initial daughter ratio — the whole point of the
// method being that the starting amount need never be assumed. SVG-only, so it
// renders identically on the server; motion is opt-in and reduced-motion-safe.
export function IsochronPlot({ caption, className }: IsochronPlotProps) {
  const reduced = useReducedMotionSafe();
  const [t, setT] = useState(INITIAL_T); // elapsed time, in half-lives
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  // Advance time while playing; loop back to a flat line at the end. Driven by
  // requestAnimationFrame and gated entirely on the playing flag, which can only
  // be set when motion is allowed.
  useEffect(() => {
    if (!playing) {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      last.current = null;
      return;
    }
    const step = (now: number) => {
      if (last.current !== null) {
        const dt = (now - last.current) / 1000;
        setT((prev) => {
          const next = prev + dt * 0.6; // ~4s to sweep the full range
          return next >= MAX_HALF_LIVES ? 0 : next;
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

  const reset = useCallback(() => {
    setPlaying(false);
    setT(0);
  }, []);

  const f = Math.pow(2, -t); // fraction of parent remaining
  const slope = Math.pow(2, t) - 1; // isochron slope = e^(λt) − 1

  // Current position of each grain: parent decays (x shrinks), daughter
  // accumulates (y grows), and all grains stay on the line y = D0 + slope·x.
  const points = PARENTS.map((p0) => {
    const x = p0 * f;
    const y = D0 + p0 * (1 - f);
    return { x, y };
  });

  // The isochron line itself, drawn from the y-axis across the current spread.
  const lineEndX = Math.min(DOMAIN.x, PARENTS[PARENTS.length - 1] * f * 1.04);
  const lineEndY = D0 + slope * lineEndX;

  return (
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full"
          role="img"
          aria-label={`Isochron plot at ${t.toFixed(2)} half-lives elapsed, line slope ${slope.toFixed(2)}`}
        >
          {/* axes */}
          <line
            x1={sx(0)}
            y1={sy(0)}
            x2={sx(DOMAIN.x)}
            y2={sy(0)}
            style={{ stroke: "var(--border)" }}
            strokeWidth={1.5}
          />
          <line
            x1={sx(0)}
            y1={sy(0)}
            x2={sx(0)}
            y2={sy(DOMAIN.y)}
            style={{ stroke: "var(--border)" }}
            strokeWidth={1.5}
          />
          {/* axis labels */}
          <text
            x={sx(DOMAIN.x / 2)}
            y={VIEW_H - 8}
            textAnchor="middle"
            style={{ fill: "var(--subtle)", fontSize: 11 }}
            className="font-sans"
          >
            parent isotope (P / stable) →
          </text>
          <text
            x={14}
            y={sy(DOMAIN.y / 2)}
            textAnchor="middle"
            transform={`rotate(-90 14 ${sy(DOMAIN.y / 2)})`}
            style={{ fill: "var(--subtle)", fontSize: 11 }}
            className="font-sans"
          >
            daughter isotope (D / stable) →
          </text>

          {/* the flat starting line (ghost), to anchor "they all began equal" */}
          <line
            x1={sx(0)}
            y1={sy(D0)}
            x2={sx(DOMAIN.x)}
            y2={sy(D0)}
            style={{ stroke: "var(--border)" }}
            strokeWidth={1}
            strokeDasharray="3 4"
          />

          {/* the isochron line */}
          <line
            x1={sx(0)}
            y1={sy(D0)}
            x2={sx(lineEndX)}
            y2={sy(lineEndY)}
            style={{
              stroke: "var(--cyan)",
              filter: "drop-shadow(0 0 5px var(--cyan))",
            }}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* y-intercept marker: the recovered initial ratio D0 */}
          <circle cx={sx(0)} cy={sy(D0)} r={4.5} style={{ fill: "var(--teal)" }} />
          <text
            x={sx(0) + 8}
            y={sy(D0) - 8}
            style={{ fill: "var(--teal)", fontSize: 10 }}
            className="font-sans"
          >
            initial ratio
          </text>

          {/* mineral grains */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={sx(pt.x)}
              cy={sy(pt.y)}
              r={5}
              style={{
                fill: "var(--amber)",
                filter: "drop-shadow(0 0 4px var(--amber))",
              }}
            />
          ))}
        </svg>

        {/* readouts */}
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Readout label="elapsed" value={`${t.toFixed(2)} ½-lives`} tone="--amber" />
          <Readout label="line slope" value={slope.toFixed(2)} tone="--cyan" />
          <Readout
            label="parent left"
            value={`${Math.round(f * 100)}%`}
            tone="--teal"
          />
        </div>

        {/* controls */}
        <div className="mt-3 flex items-center gap-3">
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-colors hover:bg-void/70"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          <input
            type="range"
            min={0}
            max={MAX_HALF_LIVES}
            step={0.01}
            value={t}
            onChange={(e) => {
              setPlaying(false);
              setT(Number(e.target.value));
            }}
            aria-label="Time elapsed, in half-lives"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, var(--cyan) ${(t / MAX_HALF_LIVES) * 100}%, var(--border) ${(t / MAX_HALF_LIVES) * 100}%)`,
            }}
          />
          <button
            type="button"
            onClick={reset}
            aria-label="Reset to a flat line"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-muted transition-colors hover:bg-void/70"
          >
            <RotateCcw size={15} />
          </button>
        </div>
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
      <p
        className="font-display text-sm font-700 tabular-nums"
        style={{ color: `var(${tone})` }}
      >
        {value}
      </p>
    </div>
  );
}
