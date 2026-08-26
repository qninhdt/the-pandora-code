"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Rosenzweig–MacArthur: enriching K enlarges limit cycles until crash.
// dN/dt = r N (1−N/K) − a N P/(1+a h N)
// dP/dt = e a N P/(1+a h N) − m P
const HISTORY = 140;

export default function ParadoxOfEnrichment() {
  const t = useTranslations("viz.paradox-of-enrichment");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [k, setK] = useState(40);
  const [isPlaying, setIsPlaying] = useState(true);

  const nRef = useRef(20);
  const pRef = useRef(5);
  const histN = useRef<number[]>([20]);
  const histP = useRef<number[]>([5]);
  const peakRef = useRef(20);
  const troughRef = useRef(20);
  const [, force] = useState(0);

  const r = 1.2;
  const a = 0.6;
  const h = 0.4;
  const e = 0.5;
  const m = 0.35;

  useRafLoop(
    (dt) => {
      const hdt = dt * 0.7;
      const step = (N: number, P: number) => {
        const func = (a * N) / (1 + a * h * N);
        const dN = r * N * (1 - N / k) - func * P;
        const dP = e * func * P - m * P;
        return { dN, dP };
      };
      let N = nRef.current;
      let P = pRef.current;
      const k1 = step(N, P);
      const k2 = step(N + k1.dN * hdt * 0.5, P + k1.dP * hdt * 0.5);
      N = Math.max(0.02, N + k2.dN * hdt);
      P = Math.max(0.02, P + k2.dP * hdt);
      // hard crash floor
      if (N < 0.05 && P > 0.5) N = 0.02;
      nRef.current = N;
      pRef.current = P;
      histN.current.push(N);
      histP.current.push(P);
      if (histN.current.length > HISTORY) histN.current.shift();
      if (histP.current.length > HISTORY) histP.current.shift();
      peakRef.current = Math.max(peakRef.current * 0.995, N);
      troughRef.current = Math.min(troughRef.current * 1.005 + 0.01, N);
      // refresh extrema slowly from window
      const window = histN.current;
      peakRef.current = Math.max(...window);
      troughRef.current = Math.min(...window);
      force((x) => (x + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const N = nRef.current;
  const P = pRef.current;
  const amp = peakRef.current - troughRef.current;
  const crash = troughRef.current < 1.5 && amp > k * 0.35;
  const maxY = Math.max(k * 1.1, peakRef.current, 10);

  const toX = (i: number, len: number) => 8 + (i / Math.max(1, len - 1)) * 84;
  const toY = (v: number) => 64 - (v / maxY) * 42;
  const mk = (h: number[]) =>
    h
      .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i, h.length).toFixed(2)} ${toY(v).toFixed(2)}`)
      .join(" ");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        nRef.current = 20;
        pRef.current = 5;
        histN.current = [20];
        histP.current = [5];
        setK(40);
        setIsPlaying(true);
      }}
      allowFullscreen={false}
      caption={
        <span className={crash ? "text-magenta" : "text-teal"}>
          {crash ? t("crash") : t("stable")} · {t("amplitude")} {amp.toFixed(1)}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <line x1="8" y1="64" x2="92" y2="64" stroke="var(--border-strong)" strokeWidth="0.4" />
          <line
            x1="8"
            y1={toY(k)}
            x2="92"
            y2={toY(k)}
            stroke="var(--amber)"
            strokeWidth="0.5"
            strokeDasharray="2 1.5"
          />
          <path d={mk(histN.current)} fill="none" stroke="var(--teal)" strokeWidth="1.1" />
          <path d={mk(histP.current)} fill="none" stroke="var(--magenta)" strokeWidth="1" />
          <circle
            cx={toX(histN.current.length - 1, histN.current.length)}
            cy={toY(N)}
            r="1.4"
            fill="var(--teal)"
          />
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout
            label={t("amplitude")}
            value={amp.toFixed(1)}
            accent={crash ? "magenta" : "cyan"}
          />
          <Readout
            label={crash ? t("crash") : t("stable")}
            value={crash ? "!" : "ok"}
            accent={crash ? "magenta" : "teal"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("k")}
            value={k}
            min={15}
            max={100}
            step={1}
            display={String(Math.round(k))}
            onChange={setK}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
