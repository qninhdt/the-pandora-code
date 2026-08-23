"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";

interface SwarmSteeringFieldProps {
  caption?: string;
  className?: string;
}

const W = 360;
const H = 240;
const N = 90;
const SPEED = 1.15;
const SEP_R = 14;
const NEI_R = 42;

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Deterministic PRNG so the initial swarm is identical on server and client.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function seedBoids(): Boid[] {
  const rnd = mulberry32(20154);
  return Array.from({ length: N }, () => {
    const a = rnd() * Math.PI * 2;
    return {
      x: rnd() * W,
      y: rnd() * H,
      vx: Math.cos(a) * SPEED,
      vy: Math.sin(a) * SPEED,
    };
  });
}

// A school of boids obeying separation/alignment/cohesion. The reader drops a
// single attractor (a "leader bias") into an adjustable FRACTION of the swarm and
// watches the whole school wheel to follow — even a few biased agents drag the
// rest along, because alignment/cohesion propagate the pull. This is "steering an
// emergent collective," not commanding each animal. Motion gates on reduced-motion
// (which lands on a static, already-converged frame); initial state is deterministic.
export function SwarmSteeringField({ caption, className }: SwarmSteeringFieldProps) {
  const uid = useId();
  const t = useTranslations("viz.swarmSteeringField");
  const reduced = useReducedMotionSafe();

  // fraction (%) of the swarm that feels the attractor.
  const [biasPct, setBiasPct] = useState(5);
  const [playing, setPlaying] = useState(!reduced);

  // which boids are "led" — the first k, stable across renders for a given pct.
  const ledCount = Math.max(0, Math.round((biasPct / 100) * N));
  // the attractor point the led boids steer toward (fixed target on the right).
  const target = useMemo(() => ({ x: W * 0.82, y: H * 0.3 }), []);

  const boidsRef = useRef<Boid[]>(seedBoids());
  const [, forceTick] = useState(0);
  const raf = useRef<number | null>(null);

  // alignment/coherence of the swarm heading, 0..1 (order parameter).
  const alignment = useMemo(() => {
    let sx = 0;
    let sy = 0;
    for (const b of boidsRef.current) {
      const m = Math.hypot(b.vx, b.vy) || 1;
      sx += b.vx / m;
      sy += b.vy / m;
    }
    return Math.hypot(sx, sy) / N;
    // recomputed each render tick via forceTick
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!playing || reduced) return;
    const stepBoids = () => {
      const boids = boidsRef.current;
      for (let i = 0; i < boids.length; i++) {
        const b = boids[i];
        let sepX = 0;
        let sepY = 0;
        let aliX = 0;
        let aliY = 0;
        let cohX = 0;
        let cohY = 0;
        let n = 0;
        for (let j = 0; j < boids.length; j++) {
          if (i === j) continue;
          const o = boids[j];
          const dx = o.x - b.x;
          const dy = o.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < NEI_R && d > 0) {
            aliX += o.vx;
            aliY += o.vy;
            cohX += o.x;
            cohY += o.y;
            n++;
            if (d < SEP_R) {
              sepX -= dx / d;
              sepY -= dy / d;
            }
          }
        }
        let ax = 0;
        let ay = 0;
        if (n > 0) {
          ax += (aliX / n) * 0.05 - b.vx * 0.05;
          ay += (aliY / n) * 0.05 - b.vy * 0.05;
          ax += (cohX / n - b.x) * 0.0016;
          ay += (cohY / n - b.y) * 0.0016;
        }
        ax += sepX * 0.09;
        ay += sepY * 0.09;
        // led boids feel the attractor pull
        if (i < ledCount) {
          const tx = target.x - b.x;
          const ty = target.y - b.y;
          const td = Math.hypot(tx, ty) || 1;
          ax += (tx / td) * 0.16;
          ay += (ty / td) * 0.16;
        }
        b.vx += ax;
        b.vy += ay;
        const sp = Math.hypot(b.vx, b.vy) || 1;
        b.vx = (b.vx / sp) * SPEED;
        b.vy = (b.vy / sp) * SPEED;
        b.x = (b.x + b.vx + W) % W;
        b.y = (b.y + b.vy + H) % H;
      }
      forceTick((k) => (k + 1) % 1000000);
      raf.current = requestAnimationFrame(stepBoids);
    };
    raf.current = requestAnimationFrame(stepBoids);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [playing, reduced, ledCount, target]);

  const boids = boidsRef.current;
  // live order parameter (recomputed on render)
  let sx = 0;
  let sy = 0;
  for (const b of boids) {
    const m = Math.hypot(b.vx, b.vy) || 1;
    sx += b.vx / m;
    sy += b.vy / m;
  }
  const order = Math.round((Math.hypot(sx, sy) / N) * 100);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone="cyan"
      hint={ledCount === 0 ? t("noneNote") : biasPct <= 10 ? t("fewNote") : t("manyNote")}
      controls={
        !reduced ? (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? t("pause") : t("play")}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-all hover:border-cyan/60 hover:bg-void/70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full sm:w-2/3" role="img" aria-label={t("aria")}>
          <GlowDefs idBase={uid} tones={["cyan", "magenta"]} />

          {/* the attractor */}
          {ledCount > 0 && (
            <circle
              cx={target.x}
              cy={target.y}
              r={7}
              fill="var(--magenta)"
              filter={glowUrl(uid, "bloom-strong")}
              opacity={0.9}
            />
          )}

          {boids.map((b, i) => {
            const led = i < ledCount;
            const ang = Math.atan2(b.vy, b.vx);
            return (
              <path
                key={i}
                d="M 5 0 L -3 3 L -3 -3 Z"
                transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${(ang * 180) / Math.PI})`}
                fill={led ? "var(--magenta)" : "var(--cyan)"}
                opacity={led ? 1 : 0.75}
                filter={led ? glowUrl(uid, "bloom") : undefined}
              />
            );
          })}
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizSlider
            label={t("biasLabel")}
            display={`${biasPct}%`}
            min={0}
            max={100}
            step={1}
            value={biasPct}
            onChange={setBiasPct}
            tone="var(--magenta)"
          />
          <VizReadout
            label={t("ledLabel")}
            value={`${ledCount} / ${N}`}
            tone="var(--magenta)"
            tinted={ledCount > 0}
            note={t("ledNote")}
          />
          <VizReadout
            label={t("orderLabel")}
            value={`${order}%`}
            tone="var(--cyan)"
            note={t("orderNote")}
          />
        </div>
      </div>
    </VizFigure>
  );
}
