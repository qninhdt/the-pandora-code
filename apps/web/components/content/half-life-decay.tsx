"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface HalfLifeDecayProps {
  caption?: string;
  /** Half-life of the chosen system, in billions of years. Defaults to U-238. */
  halfLifeGyr?: number;
  className?: string;
}

const GRID = 10; // 10 × 10 = 100 atoms
const N = GRID * GRID;
const MAX_T = 6; // half-lives shown on the slider
const DEFAULT_T = 1; // one half-life → 50% remaining, the cleanest illustration
const DEFAULT_HALF_LIFE = 4.47; // U-238 → Pb-206, in billions of years
const SWEEP_PERIOD = MAX_T / 0.6; // seconds for a full 0→MAX_T sweep

const VIEW = 240;
const PAD = 12;
const STEP = (VIEW - PAD * 2) / GRID;
const R = STEP * 0.34;

// A fixed, seed-shuffled decay order so atoms flip in an organic-looking but
// fully deterministic sequence — identical on server and client, no Math.random
// at render time. atom with order[i] is the i-th to decay.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let tt = Math.imul(a ^ (a >>> 15), 1 | a);
    tt = (tt + Math.imul(tt ^ (tt >>> 7), 61 | tt)) ^ tt;
    return ((tt ^ (tt >>> 14)) >>> 0) / 4294967296;
  };
}
const DECAY_ORDER: number[] = (() => {
  const idx = Array.from({ length: N }, (_, i) => i);
  const rnd = mulberry32(20240609);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  // rank[atom] = position in the decay sequence
  const rank = new Array<number>(N);
  idx.forEach((atom, pos) => {
    rank[atom] = pos;
  });
  return rank;
})();

// An interactive half-life demonstration: 100 atoms, of which a fraction 2^(−t)
// remain "parent" after t half-lives while the rest have decayed to "daughter".
// The reader scrubs time and watches the grid flip and the inferred age climb —
// the elementary clock that the chapter's isochron method is built on. SVG-only,
// deterministic for SSR, with a reduced-motion-gated play loop.
export function HalfLifeDecay({
  caption,
  halfLifeGyr = DEFAULT_HALF_LIFE,
  className,
}: HalfLifeDecayProps) {
  const t = useTranslations("viz.halfLife");
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [playing, setPlaying] = useState(false);
  // Phase loop drives the sweep; reduced-motion freezes advancement.
  const { phase, setPhase } = usePhaseLoop({
    period: SWEEP_PERIOD,
    playing,
    initial: DEFAULT_T / MAX_T,
  });
  // Manual time override when the reader scrubs the slider.
  const [manualTime, setManualTime] = useState<number | null>(null);

  const time = manualTime ?? phase * MAX_T;

  const fraction = 2 ** -time; // parent fraction remaining
  const remaining = Math.round(N * fraction); // parent atoms still un-decayed
  const decayed = N - remaining;

  function scrub(next: number) {
    setPlaying(false);
    setManualTime(next);
    setPhase(next / MAX_T);
  }

  function reset() {
    setPlaying(false);
    setManualTime(0);
    setPhase(0);
  }

  function togglePlay() {
    setManualTime(null); // hand control back to the loop
    setPlaying((p) => !p);
  }

  return (
    <VizFigure
      title={t("title")}
      hint={reduced ? undefined : t("hint")}
      caption={caption}
      tone="amber"
      className={className}
      controls={
        <>
          {!reduced && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? t("pause") : t("play")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-all hover:border-cyan/60 hover:bg-void/70 hover:shadow-[0_0_0_1px_var(--cyan),0_0_16px_-3px_var(--cyan)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            aria-label={t("reset")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-muted transition-all hover:border-cyan/40 hover:bg-void/70 hover:text-cyan hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--cyan)_45%,transparent),0_0_14px_-3px_var(--cyan)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <RotateCcw size={15} />
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="w-full sm:w-1/2"
          role="img"
          aria-label={t("aria", { time: time.toFixed(2), remaining })}
        >
          <GlowDefs idBase={uid} tones={["amber"]} />
          {Array.from({ length: N }, (_, atom) => {
            const row = Math.floor(atom / GRID);
            const col = atom % GRID;
            const cx = PAD + STEP * (col + 0.5);
            const cy = PAD + STEP * (row + 0.5);
            const isParent = DECAY_ORDER[atom] >= decayed;
            return (
              <circle
                key={atom}
                cx={cx}
                cy={cy}
                r={isParent ? R : R * 0.78}
                fill={isParent ? "var(--amber)" : "var(--teal)"}
                filter={isParent ? glowUrl(uid, "bloom") : glowUrl(uid, "soft-shadow")}
                style={{
                  opacity: isParent ? 1 : 0.45,
                  transition: reduced ? undefined : "fill 0.25s, opacity 0.25s, r 0.25s",
                }}
              />
            );
          })}
        </svg>

        <div className="grid grid-cols-3 gap-2 sm:w-1/2 sm:grid-cols-1">
          <VizReadout
            label={t("elapsed")}
            value={`${time.toFixed(2)} ${t("halfLives")}`}
            tone="var(--cyan)"
          />
          <VizReadout label={t("parentLeft")} value={`${remaining}%`} tone="var(--amber)" />
          <VizReadout
            label={t("age")}
            value={`${(time * halfLifeGyr).toFixed(2)} ${t("gyr")}`}
            tone="var(--teal)"
            tinted
          />
          <div className="col-span-3 mt-1 flex flex-wrap gap-x-4 gap-y-1 sm:col-span-1">
            <Legend tone="--amber" label={t("parent")} />
            <Legend tone="--teal" label={t("daughter")} />
          </div>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={MAX_T}
        step={0.01}
        value={time}
        onChange={(e) => scrub(Number(e.target.value))}
        aria-label={t("timeLabel")}
        className="viz-range mt-4 w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        style={{
          background: `linear-gradient(to right, var(--cyan) ${(time / MAX_T) * 100}%, var(--border) ${(time / MAX_T) * 100}%)`,
          ["--viz-thumb" as string]: "var(--cyan)",
        }}
      />
    </VizFigure>
  );
}

function Legend({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-sans text-xs">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: `var(${tone})` }}
      />
      <span className="text-muted">{label}</span>
    </span>
  );
}
