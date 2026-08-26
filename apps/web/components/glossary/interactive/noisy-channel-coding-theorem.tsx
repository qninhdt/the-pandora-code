"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Rate-vs-noise plane with Shannon capacity boundary. Below C = reliable.
export default function NoisyChannelCodingTheorem() {
  const t = useTranslations("viz.noisy-channel-coding-theorem");
  const [rate, setRate] = useState(0.45);
  const [noise, setNoise] = useState(0.3);

  const snr = Math.max(0.05, (1 - noise) / Math.max(0.05, noise));
  const capacity = useMemo(() => Math.log2(1 + snr) / 4, [snr]); // normalize ~0-1
  const ok = rate <= capacity + 0.001;
  // error explodes above capacity
  const err = ok
    ? Math.max(0.01, (rate / Math.max(capacity, 0.05)) * 0.08)
    : Math.min(0.95, 0.15 + (rate - capacity) * 2.5);

  const capY = 78 - capacity * 55;
  const rateY = 78 - rate * 55;
  const noiseX = 18 + noise * 64;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setRate(0.45);
        setNoise(0.3);
      }}
      allowFullscreen={false}
      caption={
        <span className={ok ? "text-teal" : "text-magenta"}>
          {ok ? t("ok") : t("fail")} · Pₑ≈{(err * 100).toFixed(0)}%
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
          <line x1="18" y1="78" x2="88" y2="78" stroke="var(--border-strong)" strokeWidth="0.4" />
          <line x1="18" y1="18" x2="18" y2="78" stroke="var(--border-strong)" strokeWidth="0.4" />
          <text
            x="88"
            y="84"
            textAnchor="end"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            noise
          </text>
          <text
            x="12"
            y="20"
            textAnchor="middle"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            R
          </text>

          {/* capacity curve (decreasing with noise) */}
          <path
            d={Array.from({ length: 20 })
              .map((_, i) => {
                const n = i / 19;
                const s = Math.max(0.05, (1 - n) / Math.max(0.05, n));
                const c = Math.log2(1 + s) / 4;
                const x = 18 + n * 64;
                const y = 78 - c * 55;
                return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(" ")}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1"
            strokeDasharray="2 1.5"
          />
          <text
            x="86"
            y={capY}
            style={{ fontSize: 2.5, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            C
          </text>

          {/* operating point */}
          <circle
            cx={noiseX}
            cy={rateY}
            r="3.2"
            fill={ok ? "var(--teal)" : "var(--magenta)"}
            stroke="var(--foreground)"
            strokeWidth="0.4"
            opacity={0.9}
          />

          {/* error cloud size */}
          <circle
            cx={noiseX}
            cy={rateY}
            r={2 + err * 14}
            fill={ok ? "var(--teal)" : "var(--magenta)"}
            opacity={0.12 + err * 0.25}
          />
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("capacity")} value={capacity.toFixed(2)} accent="cyan" />
          <Readout
            label={ok ? t("ok") : t("fail")}
            value={`${(err * 100).toFixed(0)}%`}
            accent={ok ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10 space-y-2">
          <ControlSlider
            label={t("rate")}
            value={rate}
            min={0.05}
            max={1}
            step={0.02}
            display={rate.toFixed(2)}
            onChange={setRate}
            thumb="teal"
          />
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
        </div>
      </div>
    </GlossaryFrame>
  );
}
