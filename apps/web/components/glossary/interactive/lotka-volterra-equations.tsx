"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Classic LV: dN/dt = αN − βNP ; dP/dt = δNP − γP
// RK2 integration; time series + phase spiral.
const HISTORY = 160;
const PHASE = 200;

export default function LotkaVolterraEquations() {
  const t = useTranslations("viz.lotka-volterra-equations");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [alpha, setAlpha] = useState(1.1); // prey growth
  const [beta, setBeta] = useState(0.4); // attack
  const [delta, setDelta] = useState(0.3); // conversion
  const [gamma, setGamma] = useState(0.7); // pred death
  const [isPlaying, setIsPlaying] = useState(true);

  const nRef = useRef(10);
  const pRef = useRef(5);
  const histN = useRef<number[]>([10]);
  const histP = useRef<number[]>([5]);
  const phase = useRef<{ n: number; p: number }[]>([{ n: 10, p: 5 }]);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      const h = dt * 0.55;
      const step = (N: number, P: number) => {
        const dN = alpha * N - beta * N * P;
        const dP = delta * N * P - gamma * P;
        return { dN, dP };
      };
      // RK2 midpoint
      let N = nRef.current;
      let P = pRef.current;
      const k1 = step(N, P);
      const k2 = step(N + k1.dN * h * 0.5, P + k1.dP * h * 0.5);
      N = Math.max(0.05, N + k2.dN * h);
      P = Math.max(0.05, P + k2.dP * h);
      nRef.current = N;
      pRef.current = P;
      histN.current.push(N);
      histP.current.push(P);
      if (histN.current.length > HISTORY) histN.current.shift();
      if (histP.current.length > HISTORY) histP.current.shift();
      phase.current.push({ n: N, p: P });
      if (phase.current.length > PHASE) phase.current.shift();
      force((x) => (x + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const N = nRef.current;
  const P = pRef.current;
  const maxT = Math.max(2, ...histN.current, ...histP.current);
  const maxPN = Math.max(
    2,
    ...phase.current.map((q) => q.n),
    ...phase.current.map((q) => q.p),
  );

  const tx = (i: number, len: number) => 6 + (i / Math.max(1, len - 1)) * 50;
  const ty = (v: number) => 62 - (v / maxT) * 40;
  const mk = (h: number[]) =>
    h
      .map((v, i) => `${i === 0 ? "M" : "L"}${tx(i, h.length).toFixed(2)} ${ty(v).toFixed(2)}`)
      .join(" ");

  const px = (n: number) => 62 + (n / maxPN) * 32;
  const py = (p: number) => 62 - (p / maxPN) * 40;
  const phasePath = phase.current
    .map((q, i) => `${i === 0 ? "M" : "L"}${px(q.n).toFixed(2)} ${py(q.p).toFixed(2)}`)
    .join(" ");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        nRef.current = 10;
        pRef.current = 5;
        histN.current = [10];
        histP.current = [5];
        phase.current = [{ n: 10, p: 5 }];
        setAlpha(1.1);
        setBeta(0.4);
        setDelta(0.3);
        setGamma(0.7);
        setIsPlaying(true);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("prey")} <span className="text-teal">{N.toFixed(1)}</span> · {t("pred")}{" "}
          <span className="text-magenta">{P.toFixed(1)}</span>
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
          {/* time series */}
          <line x1="6" y1="62" x2="56" y2="62" stroke="var(--border-strong)" strokeWidth="0.35" />
          <line x1="6" y1="22" x2="6" y2="62" stroke="var(--border-strong)" strokeWidth="0.35" />
          <path d={mk(histN.current)} fill="none" stroke="var(--teal)" strokeWidth="1" />
          <path d={mk(histP.current)} fill="none" stroke="var(--magenta)" strokeWidth="1" />
          <text
            x="30"
            y="18"
            textAnchor="middle"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            t
          </text>

          {/* phase plane */}
          <line x1="62" y1="62" x2="96" y2="62" stroke="var(--border-strong)" strokeWidth="0.35" />
          <line x1="62" y1="22" x2="62" y2="62" stroke="var(--border-strong)" strokeWidth="0.35" />
          <path d={phasePath} fill="none" stroke="var(--cyan)" strokeWidth="0.8" opacity="0.85" />
          <circle cx={px(N)} cy={py(P)} r="1.5" fill="var(--amber)" />
          <text
            x="79"
            y="18"
            textAnchor="middle"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            N–P
          </text>
        </svg>

        <div className="absolute left-3 top-12 flex gap-1.5">
          <Readout label={t("prey")} value={N.toFixed(1)} accent="teal" />
          <Readout label={t("pred")} value={P.toFixed(1)} accent="magenta" />
        </div>

        <div className="absolute inset-x-3 bottom-8 grid grid-cols-2 gap-x-3 gap-y-1">
          <ControlSlider label={t("a")} value={alpha} min={0.3} max={2} step={0.05} display={alpha.toFixed(2)} onChange={setAlpha} thumb="teal" />
          <ControlSlider label={t("b")} value={beta} min={0.1} max={1.2} step={0.05} display={beta.toFixed(2)} onChange={setBeta} thumb="cyan" />
          <ControlSlider label={t("c")} value={delta} min={0.1} max={1} step={0.05} display={delta.toFixed(2)} onChange={setDelta} thumb="amber" />
          <ControlSlider label={t("d")} value={gamma} min={0.2} max={1.5} step={0.05} display={gamma.toFixed(2)} onChange={setGamma} thumb="magenta" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
