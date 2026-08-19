"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Life at the edge of the possible. An extremophile — nearly always a microbe —
// thrives where most life dies: boiling water, deep cold, savage acid, brine,
// metal-soaked mud. It charts the outer bound of habitability, the first place
// astrobiologists look. Push the four dials past Earth-normal and the ordinary
// microbe fades while the extremophile lights up: its comfort zone begins exactly
// where the mundane one ends.
const DIALS = [
  { key: "temperature", normal: [0.35, 0.6] as [number, number] },
  { key: "ph", normal: [0.4, 0.6] as [number, number] },
  { key: "salinity", normal: [0.0, 0.35] as [number, number] },
  { key: "radiation", normal: [0.0, 0.25] as [number, number] },
];

export default function Extremophile() {
  const t = useTranslations("viz.extremophile");
  const [vals, setVals] = useState<number[]>([0.5, 0.5, 0.2, 0.1]);
  const [active, setActive] = useState(0);

  // how far outside the "normal life" comfort band, averaged over dials
  const extremity =
    DIALS.reduce((acc, d, i) => {
      const v = vals[i];
      const [lo, hi] = d.normal;
      const out = v < lo ? lo - v : v > hi ? v - hi : 0;
      return acc + out;
    }, 0) / DIALS.length;

  const normalLife = Math.max(0, 1 - extremity * 5);
  const extremophile = Math.min(1, 0.25 + extremity * 4);
  const extreme = extremity > 0.08;

  const setVal = (i: number, v: number) => setVals((p) => p.map((x, j) => (j === i ? v : x)));

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setVals([0.5, 0.5, 0.2, 0.1]);
        setActive(0);
      }}
      allowFullscreen={false}
      caption={
        extreme ? (
          <span className="text-teal">{t("extremophileThrives")}</span>
        ) : (
          <span className="text-muted">{t("earthNormal")}</span>
        )
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
          {/* petri background tinting with extremity */}
          <circle
            cx="50"
            cy="46"
            r="34"
            fill={extreme ? "var(--teal)" : "var(--surface)"}
            opacity={extreme ? extremity * 0.18 : 0.1}
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />

          {/* ordinary microbe colony (fades as conditions worsen) */}
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2 * 3.1;
            const r = 6 + ((i * 7) % 22);
            return (
              <circle
                key={i}
                cx={40 + Math.cos(a) * r}
                cy={46 + Math.sin(a) * r}
                r="1.3"
                fill="var(--muted)"
                opacity={normalLife * 0.6}
              />
            );
          })}
          <text
            x="30"
            y="84"
            textAnchor="middle"
            style={{
              fontSize: 2.8,
              fontFamily: "monospace",
              fill: "var(--muted)",
              opacity: 0.4 + normalLife * 0.5,
            }}
          >
            {t("ordinaryMicrobe")}
          </text>

          {/* extremophile colony (glows as conditions extremify) */}
          {Array.from({ length: 20 }, (_, i) => {
            const a = (i / 20) * Math.PI * 2 * 2.3;
            const r = 4 + ((i * 9) % 18);
            return (
              <circle
                key={i}
                cx={64 + Math.cos(a) * r}
                cy={46 + Math.sin(a) * r}
                r="1.4"
                fill="var(--teal)"
                opacity={extremophile * 0.75}
              />
            );
          })}
          <text
            x="70"
            y="84"
            textAnchor="middle"
            style={{
              fontSize: 2.8,
              fontFamily: "monospace",
              fill: "var(--teal)",
              opacity: 0.4 + extremophile * 0.5,
            }}
          >
            {t("extremophileLabel")}
          </text>
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout
            label={t("extremophileLabel")}
            value={`${Math.round(extremophile * 100)}%`}
            accent="teal"
          />
          <Readout
            label={t("ordinaryMicrobe")}
            value={`${Math.round(normalLife * 100)}%`}
            accent="foreground"
          />
        </div>

        {/* dial selector */}
        <div className="absolute inset-x-3 top-14 flex justify-center gap-1">
          {DIALS.map((d, i) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setActive(i)}
              className="rounded-lg border px-2 py-1 font-mono text-[9px] uppercase tracking-wide backdrop-blur-md transition-colors"
              style={{
                borderColor: active === i ? "var(--cyan)" : "var(--border-strong)",
                color: active === i ? "var(--cyan)" : "var(--muted)",
                background:
                  active === i
                    ? "color-mix(in oklab, var(--cyan) 12%, transparent)"
                    : "var(--void)",
              }}
            >
              {t(d.key)}
            </button>
          ))}
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t(DIALS[active].key)}
            value={vals[active]}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => setVal(active, v)}
            display={`${Math.round(vals[active] * 100)}%`}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
