"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Medium = "neuron" | "fiber" | "eywa";

const BASE: Record<Medium, number> = {
  neuron: 1e3,
  fiber: 1e9,
  eywa: 1e12,
};

function formatRate(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}G`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toFixed(0);
}

// Pipe width × medium base rate → live throughput. Three substrates, one idea.
export default function Bandwidth() {
  const t = useTranslations("viz.bandwidth");
  const [width, setWidth] = useState(0.55);
  const [medium, setMedium] = useState<Medium>("neuron");

  const throughput = useMemo(
    () => BASE[medium] * (0.15 + width * 0.85),
    [medium, width],
  );

  const pipeR = 4 + width * 14;
  const packets = Math.max(3, Math.round(4 + width * 10));

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setWidth(0.55);
        setMedium("neuron");
      }}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("throughput")}: {formatRate(throughput)} {t("unit")}
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
          {/* pipe walls */}
          <path
            d={`M8 ${50 - pipeR} L92 ${50 - pipeR}`}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="0.7"
            opacity={0.85}
          />
          <path
            d={`M8 ${50 + pipeR} L92 ${50 + pipeR}`}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="0.7"
            opacity={0.85}
          />
          <ellipse
            cx="8"
            cy="50"
            rx="2.2"
            ry={pipeR}
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="0.6"
          />
          <ellipse
            cx="92"
            cy="50"
            rx="2.2"
            ry={pipeR}
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="0.6"
          />

          {/* flowing packets */}
          {Array.from({ length: packets }).map((_, i) => {
            const x = 14 + ((i * 11 + width * 20) % 72);
            const y = 50 + Math.sin(i * 1.3) * pipeR * 0.45;
            return (
              <rect
                key={i}
                x={x}
                y={y - 1.4}
                width="3.2"
                height="2.8"
                rx="0.6"
                fill="var(--amber)"
                opacity={0.55 + (i % 3) * 0.15}
              />
            );
          })}
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("throughput")}
            value={formatRate(throughput)}
            unit={t("unit")}
            accent="cyan"
          />
        </div>

        <div className="absolute left-3 top-14 flex gap-1">
          {(["neuron", "fiber", "eywa"] as const).map((m) => (
            <ControlButton
              key={m}
              variant={medium === m ? "active" : "default"}
              onClick={() => setMedium(m)}
              aria-label={t(m)}
              className="px-2 py-1"
            >
              {t(m)}
            </ControlButton>
          ))}
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("width")}
            value={width}
            min={0.1}
            max={1}
            step={0.02}
            display={`${Math.round(width * 100)}%`}
            onChange={setWidth}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
