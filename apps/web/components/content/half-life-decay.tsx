"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HalfLifeDecayProps {
  caption?: string;
  locale?: "vi" | "en";
  /** Half-life of the chosen system, in billions of years. Defaults to U-238. */
  halfLifeGyr?: number;
  className?: string;
}

const GRID = 10; // 10 × 10 = 100 atoms
const N = GRID * GRID;
const MAX_T = 6; // half-lives shown on the slider
const DEFAULT_T = 1; // one half-life → 50% remaining, the cleanest illustration
const DEFAULT_HALF_LIFE = 4.47; // U-238 → Pb-206, in billions of years

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

const STRINGS = {
  vi: {
    elapsed: "Đã trôi qua",
    halfLives: "chu kỳ bán rã",
    parentLeft: "Nguyên tử cha còn lại",
    age: "Tuổi suy ra",
    parent: "Cha (phóng xạ)",
    daughter: "Con (đã phân rã)",
    gyr: "tỉ năm",
    play: "Chạy",
    pause: "Dừng",
    reset: "Đặt lại",
    timeLabel: "Thời gian (số chu kỳ bán rã)",
    hint: "Mỗi chu kỳ bán rã, một nửa số nguyên tử cha còn lại biến thành con. Đếm tỉ lệ còn lại là đọc được tuổi.",
  },
  en: {
    elapsed: "Elapsed",
    halfLives: "half-lives",
    parentLeft: "Parent atoms left",
    age: "Inferred age",
    parent: "Parent (radioactive)",
    daughter: "Daughter (decayed)",
    gyr: "Gyr",
    play: "Play",
    pause: "Pause",
    reset: "Reset",
    timeLabel: "Time (half-lives)",
    hint: "Each half-life, half of the remaining parent atoms turn into daughters. Counting the fraction left reads off the age.",
  },
} as const;

// An interactive half-life demonstration: 100 atoms, of which a fraction 2^(−t)
// remain "parent" after t half-lives while the rest have decayed to "daughter".
// The reader scrubs time and watches the grid flip and the inferred age climb —
// the elementary clock that the chapter's isochron method is built on. SVG-only,
// deterministic for SSR, with a reduced-motion-gated play loop.
export function HalfLifeDecay({
  caption,
  locale = "en",
  halfLifeGyr = DEFAULT_HALF_LIFE,
  className,
}: HalfLifeDecayProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const [time, setTime] = useState(DEFAULT_T);
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
        setTime((p) => {
          const next = p + dt * 0.6;
          return next >= MAX_T ? 0 : next;
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

  const fraction = 2 ** -time; // parent fraction remaining
  const remaining = Math.round(N * fraction); // parent atoms still un-decayed
  const decayed = N - remaining;

  return (
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="w-full sm:w-1/2"
            role="img"
            aria-label={`${t.elapsed} ${time.toFixed(2)} ${t.halfLives}, ${remaining}% ${t.parentLeft}`}
          >
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
                  style={{
                    fill: isParent ? "var(--amber)" : "var(--teal)",
                    filter: isParent ? "drop-shadow(0 0 3px var(--amber))" : undefined,
                    opacity: isParent ? 1 : 0.45,
                    transition: reduced ? undefined : "fill 0.25s, opacity 0.25s, r 0.25s",
                  }}
                />
              );
            })}
          </svg>

          <div className="grid grid-cols-3 gap-2 sm:w-1/2 sm:grid-cols-1">
            <Readout label={t.elapsed} value={`${time.toFixed(2)} ${t.halfLives}`} tone="--cyan" />
            <Readout label={t.parentLeft} value={`${remaining}%`} tone="--amber" />
            <Readout
              label={t.age}
              value={`${(time * halfLifeGyr).toFixed(2)} ${t.gyr}`}
              tone="--teal"
            />
            <div className="col-span-3 mt-1 flex flex-wrap gap-x-4 gap-y-1 sm:col-span-1">
              <Legend tone="--amber" label={t.parent} />
              <Legend tone="--teal" label={t.daughter} />
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="mt-4 flex items-center gap-3">
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
            type="range"
            min={0}
            max={MAX_T}
            step={0.01}
            value={time}
            onChange={(e) => {
              setPlaying(false);
              setTime(Number(e.target.value));
            }}
            aria-label={t.timeLabel}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, var(--cyan) ${(time / MAX_T) * 100}%, var(--border) ${(time / MAX_T) * 100}%)`,
            }}
          />
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setTime(0);
            }}
            aria-label={t.reset}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-muted transition-colors hover:bg-void/70"
          >
            <RotateCcw size={15} />
          </button>
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

function Legend({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-sans text-[0.7rem]">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: `var(${tone})` }}
      />
      <span className="text-muted">{label}</span>
    </span>
  );
}
