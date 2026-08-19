"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Each cell emits autoinducer; bulk signal ∝ density. Cross threshold → colony
// synchronizes (bioluminescent flip). Additive cells tip the quorum.
const THRESHOLD = 0.55;

export default function QuorumSensing() {
  const t = useTranslations("viz.quorum-sensing");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [cells, setCells] = useState(18);
  const pulseRef = useRef(0);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      pulseRef.current = (pulseRef.current + dt) % 1000;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  // signal concentration scales with density (toy well-mixed)
  const signal = Math.min(1.2, cells / 40);
  const lit = signal >= THRESHOLD;
  const pulse = pulseRef.current;

  const dots = useMemo(() => {
    const out: { x: number; y: number; phase: number }[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    const n = Math.round(cells);
    for (let i = 0; i < n; i++) {
      const r = 3 + 20 * Math.sqrt((i + 0.5) / Math.max(n, 1));
      const theta = i * golden;
      out.push({
        x: 50 + r * Math.cos(theta),
        y: 42 + r * Math.sin(theta),
        phase: (i * 0.37) % 1,
      });
    }
    return out;
  }, [cells]);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCells(18)}
      allowFullscreen={false}
      caption={
        <span className={lit ? "text-cyan" : "text-muted"}>
          {lit ? t("lit") : t("signal")} {(signal * 100).toFixed(0)}%
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
          {/* colony dish */}
          <circle
            cx="50"
            cy="42"
            r="28"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          {/* ambient signal field */}
          <circle
            cx="50"
            cy="42"
            r={12 + signal * 16}
            fill="var(--cyan)"
            opacity={lit ? 0.12 + 0.08 * Math.sin(pulse * 4) : signal * 0.1}
          />

          {dots.map((d, i) => {
            const glow = lit
              ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(pulse * 5 + d.phase * Math.PI * 2))
              : 0.25 + signal * 0.3;
            return (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={lit ? 1.8 : 1.3}
                fill="var(--cyan)"
                opacity={glow}
              />
            );
          })}

          {/* threshold tick on meter */}
          <rect
            x="18"
            y="78"
            width="64"
            height="5"
            rx="1"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
          />
          <rect
            x="18"
            y="78"
            width={64 * Math.min(1, signal)}
            height="5"
            rx="1"
            fill={lit ? "var(--cyan)" : "var(--teal)"}
            opacity="0.85"
          />
          <line
            x1={18 + 64 * THRESHOLD}
            y1="76"
            x2={18 + 64 * THRESHOLD}
            y2="85"
            stroke="var(--amber)"
            strokeWidth="0.6"
          />
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("cells")} value={Math.round(cells)} accent="teal" />
          <Readout
            label={t("threshold")}
            value={lit ? t("lit") : `${(signal * 100).toFixed(0)}%`}
            accent={lit ? "cyan" : "amber"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("cells")}
            value={cells}
            min={4}
            max={48}
            step={1}
            display={String(Math.round(cells))}
            onChange={setCells}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
