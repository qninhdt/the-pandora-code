"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const GRID = 10; // 10×10 = 100 atoms
const N0 = GRID * GRID;

// Each atom carries an independent decay time drawn from the exponential law, so
// the population halves every half-life with the right statistical jitter — the
// randomness is the point: decay is per-atom chance, the smooth curve is emergent.
function makeDecayTimes(seed: number): number[] {
  let s = seed * 16807;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  // mean lifetime tau = halfLife / ln2; we work in units of half-lives (HL=1).
  const tau = 1 / Math.LN2;
  return Array.from({ length: N0 }, () => -Math.log(1 - rnd()) * tau);
}

export default function HalfLife() {
  const t = useTranslations("viz.half-life");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [speed, setSpeed] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [seed, setSeed] = useState(7);

  const decayTimes = useMemo(() => makeDecayTimes(seed), [seed]);
  const clockRef = useRef(0); // elapsed time in half-lives
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      clockRef.current = Math.min(6, clockRef.current + dt * speed);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const clock = clockRef.current;
  const remaining = decayTimes.filter((d) => d > clock).length;
  const predicted = N0 * 0.5 ** clock;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        clockRef.current = 0;
        setSeed((s) => s + 1);
        setIsPlaying(true);
      }}
      caption={
        <span>
          {t("elapsed")}: <span className="text-cyan">{clock.toFixed(2)}</span> {t("halfLives")} · N
          = {remaining}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0 flex items-center gap-4 px-4 pt-14 pb-14">
        {/* the atom lattice */}
        <div className="grid aspect-square h-full max-h-full shrink-0 grid-cols-10 gap-[3px]">
          {decayTimes.map((d, i) => {
            const decayed = d <= clock;
            return (
              <span
                key={i}
                className="rounded-[2px] transition-colors duration-300"
                style={{
                  background: decayed ? "var(--border-strong)" : "var(--cyan)",
                  boxShadow: decayed ? "none" : "0 0 4px var(--cyan)",
                  opacity: decayed ? 0.35 : 1,
                }}
              />
            );
          })}
        </div>

        {/* the N(t) decay curve, drawn live */}
        <div className="flex flex-1 flex-col gap-2">
          <svg viewBox="0 0 100 60" className="w-full" role="img" aria-label={t("curveAria")}>
            {[0, 1, 2, 3, 4, 5, 6].map((hl) => (
              <line
                key={hl}
                x1={(hl / 6) * 100}
                y1="0"
                x2={(hl / 6) * 100}
                y2="60"
                stroke="var(--border-strong)"
                strokeWidth="0.3"
                opacity="0.4"
              />
            ))}
            {/* theoretical N0 (1/2)^n */}
            <path
              d={Array.from({ length: 61 }, (_, k) => {
                const hl = (k / 60) * 6;
                const x = (hl / 6) * 100;
                const y = 58 - 0.5 ** hl * 54;
                return `${k === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
              }).join(" ")}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="1"
              opacity="0.6"
              strokeDasharray="2 2"
            />
            {/* current position */}
            <circle
              cx={(clock / 6) * 100}
              cy={58 - (remaining / N0) * 54}
              r="1.8"
              fill="var(--amber)"
            />
            <line
              x1={(clock / 6) * 100}
              y1="0"
              x2={(clock / 6) * 100}
              y2="60"
              stroke="var(--amber)"
              strokeWidth="0.4"
              opacity="0.7"
            />
          </svg>
          <div className="flex flex-wrap gap-1.5">
            <Readout label={t("observed")} value={remaining} accent="cyan" />
            <Readout label={t("predicted")} value={predicted.toFixed(1)} accent="teal" />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-12">
        <ControlSlider
          label={t("speed")}
          value={speed}
          min={0.1}
          max={1.4}
          step={0.01}
          onChange={setSpeed}
          display={`${(speed * 100).toFixed(0)}%`}
          thumb="cyan"
        />
      </div>
    </GlossaryFrame>
  );
}
