"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const N = 14;
const TC = 0.5;

function isingLike(T: number, seed: number) {
  // toy: below Tc spins align; above, random. Smooth order via tanh
  const order = Math.max(0, Math.tanh((TC - T) * 8));
  let s = seed * 13 + Math.floor(T * 1000);
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };
  const spins: number[][] = [];
  for (let r = 0; r < N; r++) {
    const row: number[] = [];
    for (let c = 0; c < N; c++) {
      // correlated field + noise
      const base = order > 0.05 ? (rng() < 0.5 + order * 0.5 ? 1 : -1) : rng() < 0.5 ? 1 : -1;
      // majority pull when ordered
      row.push(base);
    }
    spins.push(row);
  }
  if (order > 0.3) {
    // flip minority toward majority
    const flat = spins.flat();
    const maj = flat.reduce((a, b) => a + b, 0) >= 0 ? 1 : -1;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (rng() < order) spins[r][c] = maj;
      }
    }
  }
  const m = Math.abs(spins.flat().reduce((a, b) => a + b, 0)) / (N * N);
  return { spins, m };
}

export default function PhaseTransition() {
  const t = useTranslations("viz.phase-transition");
  const [T, setT] = useState(0.35);
  const [seed, setSeed] = useState(1);
  const { spins, m } = useMemo(() => isingLike(T, seed), [T, seed]);
  const ordered = T < TC;
  const cell = 56 / N;
  const ox = 8;
  const oy = 20;

  // order curve
  const curve = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const tVal = i / 24;
      return { t: tVal, o: Math.max(0, Math.tanh((TC - tVal) * 8)) };
    });
  }, []);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setT(0.35);
        setSeed((s) => s + 1);
      }}
      allowFullscreen={false}
      caption={
        <span className={ordered ? "text-cyan" : "text-magenta"}>
          {ordered ? t("ordered") : t("disordered")} · M={m.toFixed(2)}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {spins.map((row, r) =>
            row.map((s, c) => (
              <rect
                key={`${r}-${c}`}
                x={ox + c * cell}
                y={oy + r * cell}
                width={cell - 0.3}
                height={cell - 0.3}
                fill={s > 0 ? "var(--cyan)" : "var(--magenta)"}
                opacity={0.35 + m * 0.55}
              />
            )),
          )}
          {/* M(T) plot */}
          <rect x="68" y="20" width="28" height="50" rx="1" fill="var(--void)" opacity={0.5} stroke="var(--border-strong)" strokeWidth={0.4} />
          <line
            x1={68 + TC * 28}
            y1={22}
            x2={68 + TC * 28}
            y2={68}
            stroke="var(--amber)"
            strokeWidth={0.5}
            strokeDasharray="1 1"
          />
          <polyline
            fill="none"
            stroke="var(--teal)"
            strokeWidth={0.8}
            points={curve.map((pt) => `${68 + pt.t * 28},${68 - pt.o * 44}`).join(" ")}
          />
          <circle cx={68 + T * 28} cy={68 - m * 44} r={1.5} fill="var(--amber)" />
          <text x="82" y="76" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("critical")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("order")} value={m.toFixed(2)} accent={ordered ? "cyan" : "magenta"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("control")}
            value={T}
            min={0}
            max={1}
            step={0.01}
            display={T.toFixed(2)}
            onChange={(v) => {
              setT(v);
              setSeed((s) => s + 1);
            }}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
