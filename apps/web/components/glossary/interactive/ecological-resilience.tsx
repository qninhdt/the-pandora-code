"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Ball-in-basin: potential V(x) = depth * (x^2/2 − x^4/12) style double-well
// simplified to single basin with escape threshold. Depth = resilience.
export default function EcologicalResilience() {
  const t = useTranslations("viz.ecological-resilience");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [depth, setDepth] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(true);

  const xRef = useRef(0); // position −1..1, basin center 0, rim ±1
  const vRef = useRef(0);
  const escapedRef = useRef(false);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      if (escapedRef.current) {
        // drift outward slowly once flipped
        xRef.current += Math.sign(xRef.current || 1) * dt * 0.15;
        xRef.current = Math.max(-1.6, Math.min(1.6, xRef.current));
        force((n) => (n + 1) % 1_000_000);
        return;
      }
      const x = xRef.current;
      // restoring force ∝ −depth * x, weakens near rim; damping
      const forceRest = -depth * 6 * x;
      const damp = -1.8 * vRef.current;
      vRef.current += (forceRest + damp) * dt;
      xRef.current = x + vRef.current * dt;
      // escape if |x| exceeds rim scaled by inverse depth
      const rim = 0.55 + depth * 0.4;
      if (Math.abs(xRef.current) > rim) {
        escapedRef.current = true;
        vRef.current = Math.sign(xRef.current) * 0.8;
      }
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const x = xRef.current;
  const escaped = escapedRef.current;
  // basin path: deeper = lower center
  const basinY = (px: number) => {
    const n = px / 40; // −1..1
    const wall = n * n * n * n * 28;
    const well = depth * 22 * (1 - n * n);
    return 38 + wall - well;
  };

  const ballX = 50 + x * 38;
  const ballY = basinY(x * 40) - 3.2;

  const perturb = () => {
    escapedRef.current = false;
    vRef.current = (Math.random() > 0.5 ? 1 : -1) * (1.2 + (1 - depth) * 2.5);
    setIsPlaying(true);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        xRef.current = 0;
        vRef.current = 0;
        escapedRef.current = false;
        setDepth(0.7);
        setIsPlaying(true);
      }}
      allowFullscreen={false}
      caption={
        <span className={escaped ? "text-magenta" : "text-teal"}>
          {escaped ? t("flip") : t("stable")}
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
          {/* basin curve */}
          <path
            d={Array.from({ length: 61 }, (_, i) => {
              const px = -40 + i * (80 / 60);
              const y = basinY(px);
              return `${i === 0 ? "M" : "L"}${(50 + px).toFixed(2)} ${y.toFixed(2)}`;
            }).join(" ")}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.1"
          />
          <path
            d={`${Array.from({ length: 61 }, (_, i) => {
              const px = -40 + i * (80 / 60);
              const y = basinY(px);
              return `${i === 0 ? "M" : "L"}${(50 + px).toFixed(2)} ${y.toFixed(2)}`;
            }).join(" ")} L90 78 L10 78 Z`}
            fill="var(--cyan)"
            opacity="0.08"
          />

          {/* ball */}
          <circle
            cx={ballX}
            cy={ballY}
            r="3.2"
            fill={escaped ? "var(--magenta)" : "var(--amber)"}
            stroke="var(--foreground)"
            strokeWidth="0.35"
          />

          {/* alt state plateau when escaped */}
          {escaped && (
            <text
              x="50"
              y="18"
              textAnchor="middle"
              style={{ fontSize: 3, fontFamily: "monospace", fill: "var(--magenta)" }}
            >
              {t("flip")}
            </text>
          )}
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout
            label={t("depth")}
            value={depth.toFixed(2)}
            accent={depth > 0.45 ? "teal" : "magenta"}
          />
          <ControlButton onClick={perturb} className="px-2.5 py-1.5" variant="accent">
            {t("perturb")}
          </ControlButton>
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("depth")}
            value={depth}
            min={0.15}
            max={1}
            step={0.02}
            display={depth.toFixed(2)}
            onChange={(v) => {
              setDepth(v);
              escapedRef.current = false;
            }}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
