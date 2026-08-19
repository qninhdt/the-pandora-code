"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A planet balances energy: sunlight in vs thermal glow out. Two facing bars
// show the budget. Raise albedo and less is absorbed (incoming shrinks); raise
// greenhouse strength and the surface must run hotter to shove the same energy
// out through a trapping blanket. The world settles where in = out; the readout
// is that equilibrium temperature. Pandora's dense air lifts it far above the
// bare baseline.
const SOLAR = 340; // W/m^2 baseline incoming (Earth-like)
const SIGMA = 5.67e-8;

export default function RadiativeEquilibrium() {
  const t = useTranslations("viz.radiative-equilibrium");
  const [albedo, setAlbedo] = useState(0.3);
  const [greenhouse, setGreenhouse] = useState(0.4); // 0 = none, 1 = thick

  const absorbed = SOLAR * (1 - albedo);
  // effective emission temperature from absorbed flux
  const teEff = (absorbed / SIGMA) ** 0.25; // K, no atmosphere
  // greenhouse lifts surface temp above the bare baseline
  const tSurface = teEff * (1 + greenhouse * 0.35);
  const celsius = tSurface - 273;

  // outgoing equals absorbed at equilibrium (that's the whole point)
  const inPct = (absorbed / SOLAR) * 100;

  const tone = celsius > 40 ? "amber" : celsius < -20 ? "cyan" : "teal";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setAlbedo(0.3);
        setGreenhouse(0.4);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("balance")}: <span className="text-teal">{t("inEqualsOut")}</span> ·{" "}
          {Math.round(absorbed)} W/m²
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
          {/* the planet */}
          <defs>
            <radialGradient id="re-planet" cx="42%" cy="38%" r="70%">
              <stop offset="0%" stopColor={tone === "amber" ? "#5a3a1a" : "#12403a"} />
              <stop offset="100%" stopColor="#06121a" />
            </radialGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="18"
            fill="url(#re-planet)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          {/* greenhouse blanket ring */}
          {greenhouse > 0.05 && (
            <circle
              cx="50"
              cy="50"
              r={20 + greenhouse * 4}
              fill="none"
              stroke="var(--amber)"
              strokeWidth={greenhouse * 2.5}
              opacity={0.15 + greenhouse * 0.3}
            />
          )}

          {/* incoming solar (left) — arrows toward planet, count ~ absorbed */}
          {Array.from({ length: 6 }, (_, i) => {
            const y = 26 + i * 8;
            const reflected = i / 6 < albedo;
            return (
              <g key={i}>
                <line
                  x1="4"
                  y1={y}
                  x2="30"
                  y2={50 + (y - 50) * 0.4}
                  stroke="var(--cyan)"
                  strokeWidth="0.7"
                  opacity={reflected ? 0.2 : 0.85}
                />
                {reflected && (
                  <line
                    x1="30"
                    y1={50 + (y - 50) * 0.4}
                    x2="8"
                    y2={y - 6}
                    stroke="var(--foreground)"
                    strokeWidth="0.5"
                    opacity="0.4"
                  />
                )}
              </g>
            );
          })}
          {/* outgoing thermal (right) — glow arrows, brightness ~ temp */}
          {Array.from({ length: 6 }, (_, i) => {
            const y = 26 + i * 8;
            return (
              <line
                key={i}
                x1="70"
                y1={50 + (y - 50) * 0.4}
                x2="96"
                y2={y}
                stroke="var(--amber)"
                strokeWidth="0.7"
                opacity={0.35 + (celsius + 40) / 120}
              />
            );
          })}

          {/* budget bars */}
          <text
            x="17"
            y="94"
            textAnchor="middle"
            className="fill-cyan"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("solarIn")}
          </text>
          <text
            x="83"
            y="94"
            textAnchor="middle"
            className="fill-amber"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("thermalOut")}
          </text>
        </svg>

        <div className="absolute left-3 top-16">
          <Readout label={t("absorbed")} value={`${Math.round(inPct)}%`} accent="cyan" />
        </div>
        <div className="absolute right-3 top-16">
          <Readout label={t("surfaceTemp")} value={`${Math.round(celsius)}°C`} accent={tone} />
        </div>

        <div className="absolute inset-x-3 bottom-11 flex flex-col gap-2">
          <ControlSlider
            label={t("albedo")}
            value={albedo}
            min={0.05}
            max={0.8}
            step={0.01}
            onChange={setAlbedo}
            display={albedo.toFixed(2)}
            thumb="cyan"
          />
          <ControlSlider
            label={t("greenhouse")}
            value={greenhouse}
            min={0}
            max={1}
            step={0.01}
            onChange={setGreenhouse}
            display={greenhouse < 0.15 ? t("thin") : greenhouse > 0.7 ? t("thick") : t("moderate")}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
