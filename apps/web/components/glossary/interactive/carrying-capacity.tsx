"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Logistic: dN/dt = r N (1 − N/K). With overshoot, add inertia so N crosses K
// and oscillates (discrete delayed density dependence).
const R = 1.4;
const N0 = 4;
const HISTORY = 120;

export default function CarryingCapacity() {
  const t = useTranslations("viz.carrying-capacity");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [k, setK] = useState(60);
  const [overshoot, setOvershoot] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const nRef = useRef(N0);
  const vRef = useRef(0); // velocity for overshoot mode
  const histRef = useRef<number[]>([N0]);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      const N = nRef.current;
      const speed = 0.9;
      if (overshoot) {
        // second-order: spring toward logistic equilibrium + light damping
        const targetRate = R * N * (1 - N / k);
        vRef.current += (targetRate - vRef.current * 0.35) * dt * 4;
        nRef.current = Math.max(0.2, N + vRef.current * dt * speed * 8);
      } else {
        const dN = R * N * (1 - N / k);
        nRef.current = Math.max(0.2, Math.min(k * 1.05, N + dN * dt * speed * 6));
        vRef.current = 0;
      }
      const h = histRef.current;
      h.push(nRef.current);
      if (h.length > HISTORY) h.shift();
      force((x) => (x + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const hist = histRef.current;
  const N = nRef.current;
  const maxY = Math.max(k * 1.25, ...hist, 10);

  const toX = (i: number) => 8 + (i / (HISTORY - 1)) * 84;
  const toY = (v: number) => 72 - (v / maxY) * 52;
  const path = hist
    .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(2)} ${toY(v).toFixed(2)}`)
    .join(" ");

  const kY = toY(k);
  const nearK = Math.abs(N - k) / k < 0.08 && !overshoot;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        nRef.current = N0;
        vRef.current = 0;
        histRef.current = [N0];
        setK(60);
        setOvershoot(false);
        setIsPlaying(true);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("population")} ≈ <span className="text-cyan">{N.toFixed(1)}</span> · {t("k")}={" "}
          <span className="text-amber">{k}</span>
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
          {/* axes */}
          <line x1="8" y1="72" x2="92" y2="72" stroke="var(--border-strong)" strokeWidth="0.4" />
          <line x1="8" y1="20" x2="8" y2="72" stroke="var(--border-strong)" strokeWidth="0.4" />

          {/* K ceiling */}
          <line
            x1="8"
            y1={kY}
            x2="92"
            y2={kY}
            stroke="var(--amber)"
            strokeWidth="0.55"
            strokeDasharray="2 1.5"
            opacity="0.85"
          />
          <text
            x="93"
            y={kY + 1}
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--amber)" }}
          >
            K
          </text>

          {/* logistic / boom-bust trail */}
          <path d={path} fill="none" stroke="var(--cyan)" strokeWidth="1.1" strokeLinejoin="round" />
          <circle cx={toX(hist.length - 1)} cy={toY(N)} r="1.6" fill="var(--cyan)" />

          {/* fill under curve */}
          <path
            d={`${path} L${toX(hist.length - 1).toFixed(2)} 72 L8 72 Z`}
            fill="var(--cyan)"
            opacity="0.08"
          />
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("population")} value={N.toFixed(1)} accent="cyan" />
          <Readout
            label={overshoot ? t("overshoot") : t("stable")}
            value={nearK ? "→K" : N > k ? "↑" : "↗"}
            accent={overshoot ? "magenta" : "teal"}
          />
        </div>

        <div className="absolute right-3 top-14">
          <ControlButton
            variant={overshoot ? "active" : "default"}
            onClick={() => setOvershoot((o) => !o)}
            className="px-2.5 py-1.5"
          >
            {t("overshoot")}
          </ControlButton>
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("k")}
            value={k}
            min={20}
            max={90}
            step={1}
            display={String(k)}
            onChange={(v) => setK(v)}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
