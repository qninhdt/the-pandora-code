"use client";

import { useTranslations } from "next-intl";
import React, { useState, useMemo } from "react";
import { GlossaryFrame } from "./shared/frame";

interface TransmissionSpectroscopyProps {
  locale: string;
}

type AtmosphereType = "earth" | "pandora" | "giant" | "lifeless";

interface GasSpec {
  name: string;
  key: string;
  color: string;
  dips: { center: number; width: number; depth: number }[];
}

export default function TransmissionSpectroscopy({ locale }: TransmissionSpectroscopyProps) {
  const t = useTranslations("viz.transmissionSpectroscopy");

  const [atmoType, setAtmoType] = useState<AtmosphereType>("pandora");
  const [thickness, setThickness] = useState(60); // 0% to 100%
  const [selectedGas, setSelectedGas] = useState<string | null>(null);

  // Gas specifications and their absorption centers (wavelength in nm)
  const GASES: Record<AtmosphereType, GasSpec[]> = useMemo(() => {
    return {
      earth: [
        {
          name: t("ozone") || "Ozone / Oxygen (O₃/O₂)",
          key: "ozone",
          color: "#ff5da8", // magenta
          dips: [{ center: 760, width: 25, depth: 0.25 }],
        },
        {
          name: t("water") || "Water Vapour (H₂O)",
          key: "water",
          color: "#36c5d9", // cyan
          dips: [
            { center: 940, width: 35, depth: 0.3 },
            { center: 1130, width: 40, depth: 0.25 },
            { center: 1400, width: 50, depth: 0.35 },
          ],
        },
        {
          name: t("co2") || "Carbon Dioxide (CO₂)",
          key: "co2",
          color: "#ffb454", // amber
          dips: [{ center: 1600, width: 45, depth: 0.15 }],
        },
      ],
      pandora: [
        {
          name: t("water") || "Water Vapour (H₂O)",
          key: "water",
          color: "#36c5d9",
          dips: [
            { center: 940, width: 35, depth: 0.2 },
            { center: 1400, width: 50, depth: 0.3 },
          ],
        },
        {
          name: t("co2") || "Carbon Dioxide (CO₂)",
          key: "co2",
          color: "#ffb454",
          dips: [
            { center: 1430, width: 40, depth: 0.4 },
            { center: 1600, width: 45, depth: 0.45 },
            { center: 2000, width: 60, depth: 0.3 },
          ],
        },
        {
          name: t("xenon") || "Xenon (Xe)",
          key: "xenon",
          color: "#a78bfa", // violet
          dips: [{ center: 460, width: 20, depth: 0.25 }],
        },
        {
          name: t("h2s") || "Hydrogen Sulfide (H₂S)",
          key: "h2s",
          color: "#f43f5e", // rose
          dips: [{ center: 1350, width: 30, depth: 0.35 }],
        },
      ],
      giant: [
        {
          name: t("methane") || "Methane (CH₄)",
          key: "methane",
          color: "#2bd4a8", // teal
          dips: [
            { center: 1150, width: 45, depth: 0.45 },
            { center: 1660, width: 55, depth: 0.6 },
          ],
        },
        {
          name: t("ammonia") || "Ammonia (NH₃)",
          key: "ammonia",
          color: "#fb923c", // orange
          dips: [{ center: 1500, width: 35, depth: 0.35 }],
        },
      ],
      lifeless: [
        {
          name: t("co2") || "Carbon Dioxide (CO₂)",
          key: "co2",
          color: "#ffb454",
          dips: [
            { center: 1430, width: 40, depth: 0.55 },
            { center: 1600, width: 50, depth: 0.65 },
            { center: 2000, width: 60, depth: 0.5 },
          ],
        },
      ],
    };
  }, [t]);

  // Compute graph path points
  const graphData = useMemo(() => {
    const points: { x: number; y: number; wl: number }[] = [];
    const minWl = 300;
    const maxWl = 2100;
    const steps = 120;
    const factor = thickness / 100;
    const activeGases = GASES[atmoType];

    for (let i = 0; i <= steps; i++) {
      const wl = minWl + (i / steps) * (maxWl - minWl);
      let intensity = 100; // baseline %

      // Apply absorption dips
      for (const gas of activeGases) {
        for (const dip of gas.dips) {
          const dist = Math.abs(wl - dip.center);
          const absorption = dip.depth * Math.exp(-((dist / dip.width) ** 2));
          intensity -= absorption * 45 * factor; // scale dip depth
        }
      }

      // Map to graph coordinates:
      // X goes 15 to 165
      // Y goes 10 (100% intensity) to 75 (0% intensity)
      const gx = 15 + (i / steps) * 150;
      const gy = 10 + ((100 - intensity) / 100) * 105; // Y scale mapped downwards
      points.push({ x: gx, y: gy, wl: Math.round(wl) });
    }

    // Generate SVG path string
    const d = points
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    return { points, d };
  }, [thickness, atmoType, GASES]);

  const handleReset = () => {
    setAtmoType("pandora");
    setThickness(60);
    setSelectedGas(null);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={handleReset}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Transit Spectrogram View */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-2">
          <div className="relative w-full h-full bg-void/50 border border-border/20 rounded-xl overflow-hidden flex flex-col p-3">
            {/* Top: Transit Visualizer */}
            <div className="h-[55px] w-full border border-border/10 rounded-lg bg-void/30 relative overflow-hidden flex items-center justify-center mb-2.5">
              <svg viewBox="0 0 160 50" className="w-full h-full select-none">
                <title>Planet Transit and Spectroscope</title>

                {/* Star (left side glowing orb) */}
                <circle
                  cx="10"
                  cy="25"
                  r="28"
                  fill="rgba(255, 180, 84, 0.25)"
                  style={{ filter: "blur(4px)" }}
                />
                <circle cx="10" cy="25" r="22" fill="#ffffff" />

                {/* Light beam propagating rightward */}
                <g className="opacity-30">
                  <line x1="32" y1="13" x2="115" y2="13" className="stroke-amber stroke-[0.8]" />
                  <line
                    x1="32"
                    y1="21"
                    x2="115"
                    y2="21"
                    className="stroke-amber stroke-[0.8]"
                    strokeDasharray="3,1"
                  />
                  <line
                    x1="32"
                    y1="29"
                    x2="115"
                    y2="29"
                    className="stroke-amber stroke-[0.8]"
                    strokeDasharray="3,1"
                  />
                  <line x1="32" y1="37" x2="115" y2="37" className="stroke-amber stroke-[0.8]" />
                </g>

                {/* Transiting Planet */}
                <g transform="translate(68, 25)">
                  {/* Planet body */}
                  <circle cx="0" cy="0" r="5" fill="#000000" />

                  {/* Atmospheric ring (glow matches type) */}
                  {thickness > 0 && (
                    <circle
                      cx="0"
                      cy="0"
                      r={5 + (thickness / 100) * 2.2}
                      fill="none"
                      className="transition-all duration-300"
                      stroke={
                        atmoType === "lifeless"
                          ? "var(--amber)"
                          : atmoType === "giant"
                            ? "var(--teal)"
                            : "var(--cyan)"
                      }
                      strokeWidth={(thickness / 100) * 1.5}
                      style={{
                        opacity: 0.4 + (thickness / 100) * 0.4,
                        filter: `drop-shadow(0 0 3px ${atmoType === "lifeless" ? "var(--amber)" : atmoType === "giant" ? "var(--teal)" : "var(--cyan)"})`,
                      }}
                    />
                  )}
                </g>

                {/* Spectrogram dispersion prism/detector */}
                <g transform="translate(125, 25)">
                  {/* Prism body */}
                  <polygon
                    points="0,-12 12,0 0,12"
                    className="fill-surface stroke-border/40 stroke-0.5"
                  />

                  {/* Refracted rainbow spectrum */}
                  {thickness > 0 && (
                    <path
                      d="M 10 -4 L 25 -10 L 25 10 L 10 4 Z"
                      fill="url(#rainbow)"
                      className="opacity-70"
                    />
                  )}
                </g>

                {/* Rainbow Gradient Definition */}
                <defs>
                  <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" /> {/* Red */}
                    <stop offset="33%" stopColor="#ffb454" /> {/* Orange/Yellow */}
                    <stop offset="66%" stopColor="#2bd4a8" /> {/* Green/Teal */}
                    <stop offset="100%" stopColor="#36c5d9" /> {/* Blue/Cyan */}
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Bottom: Spectroscopy Graph */}
            <div className="flex-1 w-full relative">
              <svg viewBox="0 0 180 85" className="w-full h-full select-none">
                <title>Absorption Spectrum Chart</title>

                {/* Grid guidelines */}
                <line x1="15" y1="10" x2="165" y2="10" className="stroke-border/10 stroke-0.5" />
                <line
                  x1="15"
                  y1="36"
                  x2="165"
                  y2="36"
                  className="stroke-border/10 stroke-[0.3]"
                  strokeDasharray="2,2"
                />
                <line
                  x1="15"
                  y1="62"
                  x2="165"
                  y2="62"
                  className="stroke-border/10 stroke-[0.3]"
                  strokeDasharray="2,2"
                />

                {/* Axes */}
                <line x1="15" y1="10" x2="15" y2="72" className="stroke-border/30 stroke-0.5" />
                <line x1="15" y1="72" x2="165" y2="72" className="stroke-border/30 stroke-0.5" />

                {/* Y-axis labels */}
                <text
                  x="11"
                  y="13"
                  className="fill-muted font-mono text-[4.5px] text-right"
                  textAnchor="end"
                >
                  100%
                </text>
                <text
                  x="11"
                  y="39"
                  className="fill-muted font-mono text-[4.5px] text-right"
                  textAnchor="end"
                >
                  75%
                </text>
                <text
                  x="11"
                  y="65"
                  className="fill-muted font-mono text-[4.5px] text-right"
                  textAnchor="end"
                >
                  50%
                </text>

                <text
                  x="8"
                  y="42"
                  className="fill-muted font-mono text-[5px] uppercase tracking-wider origin-center -rotate-90"
                  textAnchor="middle"
                >
                  Light Transmitted
                </text>

                {/* X-axis labels (Wavelength in nm) */}
                <text
                  x="15"
                  y="78"
                  className="fill-muted font-mono text-[4.5px]"
                  textAnchor="middle"
                >
                  300
                </text>
                <text
                  x="52.5"
                  y="78"
                  className="fill-muted font-mono text-[4.5px]"
                  textAnchor="middle"
                >
                  750
                </text>
                <text
                  x="90"
                  y="78"
                  className="fill-muted font-mono text-[4.5px]"
                  textAnchor="middle"
                >
                  1200
                </text>
                <text
                  x="127.5"
                  y="78"
                  className="fill-muted font-mono text-[4.5px]"
                  textAnchor="middle"
                >
                  1650
                </text>
                <text
                  x="165"
                  y="78"
                  className="fill-muted font-mono text-[4.5px]"
                  textAnchor="middle"
                >
                  2100
                </text>

                <text
                  x="90"
                  y="83"
                  className="fill-muted font-mono text-[5px] uppercase tracking-wider"
                  textAnchor="middle"
                >
                  Wavelength (nm) →
                </text>

                {/* Shade region under the spectrum curve */}
                {thickness > 0 && (
                  <path
                    d={`${graphData.d} L 165 72 L 15 72 Z`}
                    fill="url(#shade-gradient)"
                    className="opacity-15"
                  />
                )}

                {/* The main absorption curve */}
                <path
                  d={graphData.d}
                  fill="none"
                  className="stroke-cyan transition-all duration-350"
                  strokeWidth="1.2"
                  style={{
                    filter: "drop-shadow(0 0 2px rgba(54, 197, 217, 0.4))",
                  }}
                />

                {/* Clickable indicator zones for absorption peaks */}
                {thickness > 0 &&
                  GASES[atmoType].map((gas) => {
                    return gas.dips.map((dip, idx) => {
                      const gx = 15 + ((dip.center - 300) / 1800) * 150;
                      // Find intensity at this center
                      const factor = thickness / 100;
                      let intensity = 100;
                      for (const activeGas of GASES[atmoType]) {
                        for (const activeDip of activeGas.dips) {
                          const dist = Math.abs(dip.center - activeDip.center);
                          const absorption =
                            activeDip.depth * Math.exp(-((dist / activeDip.width) ** 2));
                          intensity -= absorption * 45 * factor;
                        }
                      }
                      const gy = 10 + ((100 - intensity) / 100) * 105;

                      return (
                        <g
                          key={`${gas.key}-${idx}`}
                          className="cursor-pointer group/node"
                          onClick={() => setSelectedGas(gas.name)}
                        >
                          {/* Target ring */}
                          <circle
                            cx={gx}
                            cy={gy}
                            r="3"
                            fill="none"
                            stroke={gas.color}
                            strokeWidth="0.8"
                            className="animate-pulse"
                          />
                          {/* Core point */}
                          <circle cx={gx} cy={gy} r="1.2" fill={gas.color} />

                          {/* Hover line label */}
                          <line
                            x1={gx}
                            y1={gy}
                            x2={gx}
                            y2="72"
                            className="stroke-dashed stroke-0.5 opacity-0 group-hover/node:opacity-50"
                            style={{ stroke: gas.color }}
                            strokeDasharray="1,1"
                          />
                        </g>
                      );
                    });
                  })}

                {/* Shade Gradient Def */}
                <defs>
                  <linearGradient id="shade-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--cyan)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Dynamic Overlay Box for Selected Peak */}
              {selectedGas && (
                <div
                  className="absolute top-1 right-1 bg-void/90 border border-border/40 px-2 py-1 rounded text-[7.5px] font-mono text-cyan flex items-center gap-1.5 cursor-pointer"
                  onClick={() => setSelectedGas(null)}
                >
                  <span>
                    Fingerprint: <strong>{selectedGas}</strong>
                  </span>
                  <span className="text-[6px] text-muted">(Click to close)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User HUD controls */}
        <div className="bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono mt-2">
          {/* Atmosphere profile selection */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-muted w-28 truncate uppercase">
              {t("selectAtmosphere") || "Atmosphere"}:
            </span>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => {
                  setAtmoType("earth");
                  setSelectedGas(null);
                }}
                className={`py-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer ${
                  atmoType === "earth"
                    ? "bg-cyan/20 border-cyan text-cyan"
                    : "bg-surface border-border/30 text-muted hover:text-foreground"
                }`}
              >
                Earth
              </button>
              <button
                type="button"
                onClick={() => {
                  setAtmoType("pandora");
                  setSelectedGas(null);
                }}
                className={`py-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer ${
                  atmoType === "pandora"
                    ? "bg-cyan/20 border-cyan text-cyan"
                    : "bg-surface border-border/30 text-muted hover:text-foreground"
                }`}
              >
                Pandora
              </button>
              <button
                type="button"
                onClick={() => {
                  setAtmoType("giant");
                  setSelectedGas(null);
                }}
                className={`py-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer ${
                  atmoType === "giant"
                    ? "bg-cyan/20 border-cyan text-cyan"
                    : "bg-surface border-border/30 text-muted hover:text-foreground"
                }`}
              >
                Gas Giant
              </button>
              <button
                type="button"
                onClick={() => {
                  setAtmoType("lifeless");
                  setSelectedGas(null);
                }}
                className={`py-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer ${
                  atmoType === "lifeless"
                    ? "bg-cyan/20 border-cyan text-cyan"
                    : "bg-surface border-border/30 text-muted hover:text-foreground"
                }`}
              >
                Lifeless
              </button>
            </div>
          </div>

          {/* Atmosphere Thickness slider */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-muted w-28 truncate uppercase">
              {t("atmoThickness") || "Atmo Thickness"}:
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={thickness}
              onChange={(e) => setThickness(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-foreground w-12 text-right font-bold">{thickness}%</span>
          </div>

          {/* Dynamic color-coded gas legends */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 items-center border-t border-border/20 pt-2 text-[8px] text-muted">
            <span className="font-bold">{t("gasLegend") || "Fingerprints"}:</span>
            {GASES[atmoType].map((gas) => (
              <span key={gas.key} className="flex items-center gap-1">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: gas.color }} />
                <span>{gas.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
