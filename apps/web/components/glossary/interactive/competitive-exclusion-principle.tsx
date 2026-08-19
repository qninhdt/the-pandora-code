"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Two species, one resource niche. Lotka–Volterra competition with identical
// carrying capacity; relative fitness (growth rate) decides who wins. Only near
// equal fitness does coexistence linger — Gause's principle.
const K = 80;
const ALPHA = 1.05; // interspecific ≈ intraspecific → exclusion
const HISTORY = 100;

export default function CompetitiveExclusionPrinciple() {
  const t = useTranslations("viz.competitive-exclusion-principle");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [fitA, setFitA] = useState(1.0);
  const [fitB, setFitB] = useState(0.95);
  const [isPlaying, setIsPlaying] = useState(true);

  const aRef = useRef(30);
  const bRef = useRef(30);
  const histA = useRef<number[]>([30]);
  const histB = useRef<number[]>([30]);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      let A = aRef.current;
      let B = bRef.current;
      // dN_i/dt = r_i N_i (1 − (N_i + α N_j)/K)
      const dA = fitA * A * (1 - (A + ALPHA * B) / K);
      const dB = fitB * B * (1 - (B + ALPHA * A) / K);
      A = Math.max(0.05, A + dA * dt * 2.2);
      B = Math.max(0.05, B + dB * dt * 2.2);
      aRef.current = A;
      bRef.current = B;
      histA.current.push(A);
      histB.current.push(B);
      if (histA.current.length > HISTORY) histA.current.shift();
      if (histB.current.length > HISTORY) histB.current.shift();
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const A = aRef.current;
  const B = bRef.current;
  const coexist = A > 3 && B > 3;
  const maxY = Math.max(K, ...histA.current, ...histB.current, 10);

  const toX = (i: number, len: number) => 8 + (i / Math.max(1, len - 1)) * 84;
  const toY = (v: number) => 68 - (v / maxY) * 48;
  const mkPath = (h: number[]) =>
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
        aRef.current = 30;
        bRef.current = 30;
        histA.current = [30];
        histB.current = [30];
        setFitA(1.0);
        setFitB(0.95);
        setIsPlaying(true);
      }}
      allowFullscreen={false}
      caption={
        <span className={coexist ? "text-teal" : "text-magenta"}>
          {coexist ? t("coexist") : t("exclude")}
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
          <line x1="8" y1="68" x2="92" y2="68" stroke="var(--border-strong)" strokeWidth="0.4" />
          <line x1="8" y1="20" x2="8" y2="68" stroke="var(--border-strong)" strokeWidth="0.4" />

          <path d={mkPath(histA.current)} fill="none" stroke="var(--cyan)" strokeWidth="1.1" />
          <path d={mkPath(histB.current)} fill="none" stroke="var(--magenta)" strokeWidth="1.1" />

          <circle
            cx={toX(histA.current.length - 1, histA.current.length)}
            cy={toY(A)}
            r="1.5"
            fill="var(--cyan)"
          />
          <circle
            cx={toX(histB.current.length - 1, histB.current.length)}
            cy={toY(B)}
            r="1.5"
            fill="var(--magenta)"
          />

          {/* resource niche bar — identical for both */}
          <rect
            x="20"
            y="74"
            width="60"
            height="4"
            rx="1"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
          />
          <rect x="20" y="74" width="60" height="4" rx="1" fill="var(--amber)" opacity="0.25" />
          <text
            x="50"
            y="84"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            1 niche
          </text>
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout label="A" value={A.toFixed(1)} accent="cyan" />
          <Readout label="B" value={B.toFixed(1)} accent="magenta" />
        </div>

        <div className="absolute inset-x-3 bottom-10 space-y-1.5">
          <ControlSlider
            label={t("fitnessA")}
            value={fitA}
            min={0.5}
            max={1.5}
            step={0.01}
            display={fitA.toFixed(2)}
            onChange={setFitA}
            thumb="cyan"
          />
          <ControlSlider
            label={t("fitnessB")}
            value={fitB}
            min={0.5}
            max={1.5}
            step={0.01}
            display={fitB.toFixed(2)}
            onChange={setFitB}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
