"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// C = B log2(1 + S/N). Raise noise; the Shannon ceiling drops and packets spill.
export default function ChannelCapacity() {
  const t = useTranslations("viz.channel-capacity");
  const [noise, setNoise] = useState(0.35);
  const [bandwidth, setBandwidth] = useState(0.6);

  const snr = useMemo(() => Math.max(0.05, (1 - noise) / Math.max(noise, 0.05)), [noise]);
  const B = 1 + bandwidth * 9; // 1–10 arbitrary units
  const capacity = useMemo(() => B * Math.log2(1 + snr), [B, snr]);
  const attemptRate = B * 1.15; // slightly aggressive send rate
  const reliable = attemptRate <= capacity;

  const ceilingY = 78 - Math.min(58, capacity * 5.5);
  const attemptY = 78 - Math.min(58, attemptRate * 5.5);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setNoise(0.35);
        setBandwidth(0.6);
      }}
      allowFullscreen={false}
      caption={
        <span className={reliable ? "text-teal" : "text-magenta"}>
          {reliable ? t("reliable") : t("lossy")} · C={capacity.toFixed(2)}
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
          {/* axes */}
          <line x1="14" y1="78" x2="90" y2="78" stroke="var(--border-strong)" strokeWidth="0.4" />
          <line x1="14" y1="18" x2="14" y2="78" stroke="var(--border-strong)" strokeWidth="0.4" />

          {/* capacity ceiling */}
          <line
            x1="14"
            y1={ceilingY}
            x2="90"
            y2={ceilingY}
            stroke="var(--cyan)"
            strokeWidth="0.8"
            strokeDasharray="2 1.5"
          />
          <text
            x="88"
            y={ceilingY - 2}
            textAnchor="end"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            C
          </text>

          {/* attempt rate bar */}
          <rect
            x="40"
            y={attemptY}
            width="20"
            height={78 - attemptY}
            fill={reliable ? "var(--teal)" : "var(--magenta)"}
            opacity={0.55}
          />

          {/* noise speckles in channel */}
          {Array.from({ length: Math.round(6 + noise * 28) }).map((_, i) => (
            <circle
              key={i}
              cx={18 + ((i * 17) % 70)}
              cy={22 + ((i * 13) % 50)}
              r={0.6 + (i % 3) * 0.3}
              fill="var(--amber)"
              opacity={0.25 + noise * 0.5}
            />
          ))}

          {/* packets */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = attemptY + 4 + i * 6;
            if (y > 76) return null;
            return (
              <rect
                key={`p${i}`}
                x={44 + (i % 2) * 6}
                y={y}
                width="4"
                height="3"
                rx="0.5"
                fill="var(--amber)"
                opacity={reliable ? 0.85 : 0.35}
              />
            );
          })}
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("capacity")} value={capacity.toFixed(2)} accent="cyan" />
          <Readout
            label={reliable ? t("reliable") : t("lossy")}
            value={snr.toFixed(1)}
            unit="S/N"
            accent={reliable ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10 space-y-2">
          <ControlSlider
            label={t("noise")}
            value={noise}
            min={0.05}
            max={0.95}
            step={0.02}
            display={`${Math.round(noise * 100)}%`}
            onChange={setNoise}
            thumb="magenta"
          />
          <ControlSlider
            label={t("bandwidth")}
            value={bandwidth}
            min={0.1}
            max={1}
            step={0.02}
            display={B.toFixed(1)}
            onChange={setBandwidth}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
