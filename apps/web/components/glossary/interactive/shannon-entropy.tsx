"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const SYMS = ["A", "B", "C", "D"] as const;

// Skew a 4-symbol source; H peaks at uniform, collapses toward certainty.
export default function ShannonEntropy() {
  const t = useTranslations("viz.shannon-entropy");
  // skew 0 = uniform, 1 = all mass on A
  const [skew, setSkew] = useState(0.15);

  const probs = useMemo(() => {
    const rest = (1 - (0.25 + skew * 0.75)) / 3;
    const pA = 0.25 + skew * 0.75;
    return [pA, rest, rest, rest];
  }, [skew]);

  const H = useMemo(() => {
    let h = 0;
    for (const p of probs) {
      if (p > 1e-12) h -= p * Math.log2(p);
    }
    return h;
  }, [probs]);

  const maxH = 2; // log2(4)
  const certain = H < 0.35;
  const uniform = H > 1.85;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSkew(0.15)}
      allowFullscreen={false}
      caption={
        <span className={uniform ? "text-teal" : certain ? "text-magenta" : "text-cyan"}>
          H={H.toFixed(2)} {t("unit")} · {uniform ? t("uniform") : certain ? t("certain") : "—"}
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
          {/* histogram */}
          {probs.map((p, i) => {
            const h = p * 48;
            const x = 16 + i * 18;
            return (
              <g key={SYMS[i]}>
                <rect
                  x={x}
                  y={70 - h}
                  width="12"
                  height={h}
                  rx="1"
                  fill={i === 0 ? "var(--amber)" : "var(--cyan)"}
                  opacity={0.55 + p * 0.45}
                />
                <text
                  x={x + 6}
                  y="76"
                  textAnchor="middle"
                  style={{ fontSize: 3, fontFamily: "monospace", fill: "var(--muted)" }}
                >
                  {SYMS[i]}
                </text>
                <text
                  x={x + 6}
                  y={68 - h}
                  textAnchor="middle"
                  style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--foreground)" }}
                >
                  {p.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* entropy meter */}
          <rect
            x="14"
            y="84"
            width="72"
            height="4"
            rx="1"
            fill="var(--void)"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
          />
          <rect
            x="14"
            y="84"
            width={(H / maxH) * 72}
            height="4"
            rx="1"
            fill="var(--teal)"
            opacity={0.85}
          />
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("entropy")}
            value={H.toFixed(2)}
            unit={t("unit")}
            accent={uniform ? "teal" : certain ? "magenta" : "cyan"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("skew")}
            value={skew}
            min={0}
            max={1}
            step={0.02}
            display={`${Math.round(skew * 100)}%`}
            onChange={setSkew}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
