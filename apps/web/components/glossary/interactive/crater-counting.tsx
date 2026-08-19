"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

interface Crater {
  x: number;
  y: number;
  r: number;
}

// Deterministic pseudo-random field so SSR and client agree and Reset is stable.
function makeCraters(count: number, seed: number): Crater[] {
  const out: Crater[] = [];
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    out.push({
      x: 6 + rnd() * 88,
      y: 20 + rnd() * 74,
      r: 1.4 + rnd() * rnd() * 5,
    });
  }
  return out;
}

// Three candidate terrains at different crater densities. A fresh lava flow is
// nearly bare; ancient highlands are saturated. Counting the density recovers a
// relative age — the only clock available for a surface you cannot yet touch.
const TERRAINS = [
  { key: "fresh", count: 8, seed: 3 },
  { key: "mare", count: 26, seed: 11 },
  { key: "ancient", count: 64, seed: 29 },
] as const;

type TerrainKey = (typeof TERRAINS)[number]["key"];

export default function CraterCounting() {
  const t = useTranslations("viz.crater-counting");
  const [terrain, setTerrain] = useState<TerrainKey>("mare");
  const [counted, setCounted] = useState<Set<number>>(new Set());

  const cfg = TERRAINS.find((x) => x.key === terrain) ?? TERRAINS[1];
  const craters = useMemo(() => makeCraters(cfg.count, cfg.seed), [cfg]);

  const n = counted.size;
  const density = n / cfg.count; // fraction of the field the user has tallied
  // Density maps to age: each crater ~ a fixed accumulated interval. Calibrated
  // (loosely) so a saturated highland reads ~4 Gyr, a bare flow reads near zero.
  const ageGyr = (n * 0.065).toFixed(2);
  const band = cfg.count < 12 ? t("young") : cfg.count < 40 ? t("intermediate") : t("old");

  const reset = () => setCounted(new Set());
  const pick = (key: TerrainKey) => {
    setTerrain(key);
    setCounted(new Set());
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={reset}
      allowFullscreen={false}
      caption={
        <span>
          {t("counted")}: <span className="text-cyan">{n}</span> / {cfg.count} · {band}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="crc-plain" cx="50%" cy="35%" r="80%">
              <stop offset="0%" stopColor="#141a2c" />
              <stop offset="100%" stopColor="#080b16" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#crc-plain)" />

          {craters.map((c, i) => {
            const on = counted.has(i);
            return (
              <g
                key={i}
                className="cursor-pointer"
                onClick={() =>
                  setCounted((prev) => {
                    const next = new Set(prev);
                    next.has(i) ? next.delete(i) : next.add(i);
                    return next;
                  })
                }
              >
                {/* generous invisible hit target */}
                <circle cx={c.x} cy={c.y} r={c.r + 2} fill="transparent" />
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={c.r}
                  fill={on ? "var(--cyan)" : "#0a0e1a"}
                  fillOpacity={on ? 0.22 : 1}
                  stroke={on ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth={on ? 0.6 : 0.4}
                />
                {/* rim shadow for depth */}
                <circle
                  cx={c.x}
                  cy={c.y + c.r * 0.28}
                  r={c.r * 0.72}
                  fill="#05070f"
                  fillOpacity="0.55"
                />
                {on && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={c.r + 1.4}
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth="0.4"
                    opacity="0.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("density")} value={`${(density * 100).toFixed(0)}%`} accent="cyan" />
          <Readout label={t("age")} value={ageGyr} unit={t("gyr")} accent="amber" />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex flex-wrap items-center justify-center gap-1.5">
          {TERRAINS.map((x) => (
            <button
              key={x.key}
              type="button"
              onClick={() => pick(x.key)}
              className={`rounded-lg border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md transition-colors ${
                x.key === terrain
                  ? "border-cyan bg-cyan/15 text-cyan"
                  : "border-border/40 bg-void/70 text-muted hover:text-foreground"
              }`}
            >
              {t(x.key)}
            </button>
          ))}
        </div>

        <div className="absolute left-3 top-16 max-w-[42%] rounded-lg border border-border/40 bg-void/70 px-2.5 py-1.5 font-mono text-[9px] leading-snug text-muted backdrop-blur-md">
          {t("hint")}
        </div>
      </div>
    </GlossaryFrame>
  );
}
