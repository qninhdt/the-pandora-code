"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Re = vL / ν. Low = laminar streaks; high = turbulent chaos. Pandora denser air → higher Re.
export default function ReynoldsNumber() {
  const t = useTranslations("viz.reynolds-number");
  const [size, setSize] = useState(0.5); // m
  const [speed, setSpeed] = useState(5); // m/s
  const [pandora, setPandora] = useState(false);
  const nu = pandora ? 1.0e-5 : 1.5e-5; // denser → lower kinematic viscosity proxy
  const re = (speed * size) / nu;
  const turbulent = re > 2e5;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setSize(0.5);
        setSpeed(5);
        setPandora(false);
      }}
      allowFullscreen={false}
      caption={
        <span className={turbulent ? "text-amber" : "text-cyan"}>
          {turbulent ? t("turbulent") : t("laminar")} · Re {re.toExponential(1)}
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
          <circle
            cx="30"
            cy="42"
            r={6 + size * 10}
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="0.8"
          />
          {Array.from({ length: turbulent ? 9 : 5 }, (_, i) => {
            const y = 24 + i * 6;
            if (!turbulent) {
              return (
                <line
                  key={i}
                  x1="45"
                  y1={y}
                  x2="88"
                  y2={y}
                  stroke="var(--teal)"
                  strokeWidth="0.5"
                  opacity="0.55"
                />
              );
            }
            return (
              <path
                key={i}
                d={`M45 ${y} q 8 ${((i % 3) - 1) * 4} 16 0 t 16 0 t 12 0`}
                fill="none"
                stroke="var(--amber)"
                strokeWidth="0.55"
                opacity="0.7"
              />
            );
          })}
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout
            label={t("re")}
            value={re.toExponential(1)}
            accent={turbulent ? "amber" : "cyan"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1.5">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setPandora((p) => !p)}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
              style={{
                borderColor: pandora ? "var(--teal)" : "var(--border-strong)",
                color: pandora ? "var(--teal)" : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {t("pandora")}
            </button>
          </div>
          <ControlSlider
            label={t("size")}
            value={size}
            min={0.05}
            max={2}
            step={0.05}
            display={`${size.toFixed(2)} m`}
            onChange={setSize}
            thumb="cyan"
          />
          <ControlSlider
            label={t("speed")}
            value={speed}
            min={0.5}
            max={30}
            step={0.5}
            display={`${speed.toFixed(1)} m/s`}
            onChange={setSpeed}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
