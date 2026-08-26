"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Three Gaussian usage curves on a prey-size axis. Spread centers → low overlap
// → coexistence; drag together → competition spikes.
function gauss(x: number, mu: number, sigma: number) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z);
}

export default function NichePartitioning() {
  const t = useTranslations("viz.niche-partitioning");
  // center positions 0–1; spread slider pulls them apart from midpoint
  const [spread, setSpread] = useState(0.55);

  const mus = useMemo(() => {
    const mid = 0.5;
    const d = 0.08 + spread * 0.32;
    return [mid - d, mid, mid + d];
  }, [spread]);

  const sigma = 0.12;
  const colors = ["var(--cyan)", "var(--teal)", "var(--amber)"] as const;

  const samples = 50;
  const curves = mus.map((mu) =>
    Array.from({ length: samples }, (_, i) => {
      const x = i / (samples - 1);
      return { x, y: gauss(x, mu, sigma) };
    }),
  );

  // pairwise overlap ≈ integral min(f,g) approx
  let overlap = 0;
  for (let i = 0; i < samples; i++) {
    const ys = curves.map((c) => c[i].y);
    overlap += Math.min(ys[0], ys[1]) + Math.min(ys[1], ys[2]) + Math.min(ys[0], ys[2]);
  }
  overlap /= samples * 3;
  const competition = Math.min(1, overlap * 2.8);

  const toX = (x: number) => 10 + x * 80;
  const toY = (y: number) => 62 - y * 40;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSpread(0.55)}
      allowFullscreen={false}
      caption={
        <span>
          {t("competition")}{" "}
          <span className={competition > 0.45 ? "text-magenta" : "text-teal"}>
            {(competition * 100).toFixed(0)}%
          </span>
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <line x1="10" y1="62" x2="90" y2="62" stroke="var(--border-strong)" strokeWidth="0.4" />
          <text
            x="50"
            y="70"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            resource axis
          </text>

          {curves.map((curve, ci) => {
            const d = curve
              .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.x).toFixed(2)} ${toY(p.y).toFixed(2)}`)
              .join(" ");
            const fill = `${d} L${toX(1).toFixed(2)} 62 L${toX(0).toFixed(2)} 62 Z`;
            return (
              <g key={ci}>
                <path d={fill} fill={colors[ci]} opacity="0.15" />
                <path d={d} fill="none" stroke={colors[ci]} strokeWidth="1.1" />
              </g>
            );
          })}

          {/* competition gauge */}
          <rect
            x="20"
            y="78"
            width="60"
            height="5"
            rx="1"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
          />
          <rect
            x="20"
            y="78"
            width={60 * competition}
            height="5"
            rx="1"
            fill={competition > 0.45 ? "var(--magenta)" : "var(--teal)"}
            opacity="0.85"
          />
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout
            label={t("overlap")}
            value={`${(overlap * 100).toFixed(0)}%`}
            accent={competition > 0.45 ? "magenta" : "cyan"}
          />
          <Readout
            label={t("competition")}
            value={`${(competition * 100).toFixed(0)}%`}
            accent={competition > 0.45 ? "magenta" : "teal"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("spread")}
            value={spread}
            min={0}
            max={1}
            step={0.02}
            display={spread.toFixed(2)}
            onChange={setSpread}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
