"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const GRID = 8;
const N = GRID * GRID;

function schedule(seed: number): number[] {
  let s = seed * 16807;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const tau = 1 / Math.LN2;
  return Array.from({ length: N }, () => -Math.log(1 - rnd()) * tau);
}

export default function RadiometricDating() {
  const t = useTranslations("viz.radiometric-dating");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [seed, setSeed] = useState(5);

  const times = useMemo(() => schedule(seed), [seed]);
  const clockRef = useRef(0);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      clockRef.current = Math.min(5, clockRef.current + dt * 0.28);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const clock = clockRef.current;
  const daughters = times.filter((d) => d <= clock).length;
  const parents = N - daughters;
  const ratio = parents > 0 ? daughters / parents : Number.POSITIVE_INFINITY;
  // Age from the D/P ratio: t = HL · log2(1 + D/P).
  const ageHL = Math.log2(1 + ratio);

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
          {t("ratio")} D/P:{" "}
          <span className="text-amber">{Number.isFinite(ratio) ? ratio.toFixed(2) : "∞"}</span> ·{" "}
          {t("age")}: {ageHL.toFixed(2)} {t("halfLives")}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0 flex items-center gap-4 px-4 pt-14 pb-4">
        {/* the transforming atoms */}
        <div className="grid aspect-square h-full max-h-full shrink-0 grid-cols-8 gap-1">
          {times.map((d, i) => {
            const decayed = d <= clock;
            // "just decayed" pulse if within a small window of the clock
            const fresh = decayed && clock - d < 0.12;
            return (
              <div
                key={i}
                className="relative flex items-center justify-center rounded-full transition-colors duration-500"
                style={{
                  background: decayed ? "var(--magenta)" : "var(--cyan)",
                  boxShadow: fresh
                    ? "0 0 8px var(--magenta)"
                    : decayed
                      ? "none"
                      : "0 0 4px var(--cyan)",
                  opacity: decayed ? 0.85 : 1,
                }}
              >
                {fresh && (
                  <span
                    className="absolute size-full animate-ping rounded-full"
                    style={{ background: "var(--magenta)", opacity: 0.4 }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* calibration + counts */}
        <div className="flex flex-1 flex-col gap-2">
          <svg viewBox="0 0 100 60" className="w-full" role="img" aria-label={t("calAria")}>
            {/* calibration curve: D/P vs age */}
            <path
              d={Array.from({ length: 61 }, (_, k) => {
                const hl = (k / 60) * 5;
                const dp = 2 ** hl - 1;
                const x = (hl / 5) * 100;
                const y = 58 - Math.min(dp / 31, 1) * 54;
                return `${k === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
              }).join(" ")}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="1"
              opacity="0.6"
            />
            <circle
              cx={(ageHL / 5) * 100}
              cy={58 - Math.min(ratio / 31, 1) * 54}
              r="1.8"
              fill="var(--amber)"
            />
          </svg>
          <div className="flex flex-wrap gap-1.5">
            <Readout label={t("parent")} value={parents} accent="cyan" />
            <Readout label={t("daughter")} value={daughters} accent="magenta" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
            {t("hint")}
          </span>
        </div>
      </div>
    </GlossaryFrame>
  );
}
