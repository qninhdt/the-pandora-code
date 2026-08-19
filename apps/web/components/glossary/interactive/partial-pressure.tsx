"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Dalton's law made tangible. Assign fractions to each gas; the total pressure
// is fixed by the "world" you pick, and each gas's partial pressure is its
// fraction × total — the push that actually drives it across a membrane. The O₂
// gauge is what your lungs really read: the same 21% is breathable at Earth
// pressure yet suffocating atop Everest, because the *push* is halved.
const GASES = [
  { key: "n2", color: "#5a6270" },
  { key: "o2", color: "var(--cyan)" },
  { key: "co2", color: "var(--amber)" },
  { key: "ch4", color: "var(--magenta)" },
];
// preset total pressures (kPa)
const WORLDS = [
  { key: "earth", kpa: 101 },
  { key: "everest", kpa: 34 },
  { key: "pandora", kpa: 90 },
];

export default function PartialPressure() {
  const t = useTranslations("viz.partial-pressure");
  const [frac, setFrac] = useState<number[]>([0.55, 0.21, 0.17, 0.07]);
  const [worldIdx, setWorldIdx] = useState(0);

  const total = frac.reduce((a, b) => a + b, 0);
  const norm = frac.map((f) => f / total); // always sums to 1
  const kpa = WORLDS[worldIdx].kpa;
  const partials = norm.map((f) => f * kpa);

  // O2 partial pressure verdict (~21 kPa is the breathable target)
  const o2pp = partials[1];
  const breathable = o2pp >= 16;

  const setGas = (i: number, v: number) => {
    setFrac((prev) => prev.map((p, j) => (j === i ? v : p)));
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setFrac([0.55, 0.21, 0.17, 0.07]);
        setWorldIdx(0);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("o2Push")}:{" "}
          <span className={breathable ? "text-teal" : "text-magenta"}>{o2pp.toFixed(0)} kPa</span> ·{" "}
          <span className={breathable ? "text-teal" : "text-magenta"}>
            {breathable ? t("breathable") : t("suffocating")}
          </span>
        </span>
      }
    >
      <div className="absolute inset-0 flex flex-col px-4 pt-14 pb-14">
        {/* stacked composition bar */}
        <div className="mb-3 flex h-8 overflow-hidden rounded-lg border border-border/40">
          {GASES.map((g, i) => (
            <div
              key={g.key}
              className="flex items-center justify-center font-mono text-[9px] text-void transition-all"
              style={{ width: `${norm[i] * 100}%`, background: g.color }}
            >
              {norm[i] > 0.08 ? `${Math.round(norm[i] * 100)}%` : ""}
            </div>
          ))}
        </div>

        {/* per-gas partial-pressure gauges */}
        <div className="flex flex-1 flex-col justify-center gap-2">
          {GASES.map((g, i) => (
            <div key={g.key} className="flex items-center gap-2">
              <span
                className="w-8 font-mono text-[10px] uppercase tracking-wider"
                style={{ color: g.color }}
              >
                {t(g.key)}
              </span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-void/70">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (partials[i] / 110) * 100)}%`,
                    background: g.color,
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="w-12 text-right font-mono text-[10px] tabular-nums text-foreground">
                {partials[i].toFixed(0)} kPa
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* world preset chips */}
      <div className="absolute inset-x-3 top-16 flex justify-center gap-1.5">
        {WORLDS.map((w, i) => (
          <button
            key={w.key}
            type="button"
            onClick={() => setWorldIdx(i)}
            className="rounded-lg border px-2 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md transition-colors"
            style={{
              borderColor: worldIdx === i ? "var(--cyan)" : "var(--border-strong)",
              color: worldIdx === i ? "var(--cyan)" : "var(--muted)",
              background:
                worldIdx === i
                  ? "color-mix(in oklab, var(--cyan) 12%, transparent)"
                  : "var(--void)",
            }}
          >
            {t(w.key)} {w.kpa}
          </button>
        ))}
      </div>

      <div className="absolute right-3 bottom-24">
        <Readout label={t("total")} value={kpa} unit="kPa" accent="foreground" />
      </div>

      {/* adjust the O2 fraction (the pedagogically key dial) */}
      <div className="absolute inset-x-3 bottom-12">
        <ControlSlider
          label={t("o2Fraction")}
          value={frac[1]}
          min={0.05}
          max={0.5}
          step={0.01}
          onChange={(v) => setGas(1, v)}
          display={`${Math.round(norm[1] * 100)}%`}
          thumb="cyan"
        />
      </div>
    </GlossaryFrame>
  );
}
