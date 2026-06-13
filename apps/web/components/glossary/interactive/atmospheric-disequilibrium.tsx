"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useRef } from "react";
import { GlossaryFrame } from "./shared/frame";

interface AtmosphericDisequilibriumProps {
  locale: string;
}

interface Molecule {
  id: number;
  type: "O2" | "CH4" | "CO2" | "H2O";
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function AtmosphericDisequilibrium({ locale }: AtmosphericDisequilibriumProps) {
  const t = useTranslations("viz.atmosphericDisequilibrium");

  const [isPlaying, setIsPlaying] = useState(true);
  const [pumpValue, setPumpValue] = useState(40); // Biological pump strength 0 to 100

  // Particle list
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const moleculeIdCounter = useRef(0);

  // Stats
  const [o2Count, setO2Count] = useState(0);
  const [ch4Count, setCh4Count] = useState(0);
  const [co2Count, setCo2Count] = useState(0);

  // Disequilibrium Index calculation: high only when O2 and CH4 both coexist
  const totalGases = o2Count + ch4Count + co2Count + 1;
  const disequilibriumIndex = Math.min(
    100,
    Math.round(((o2Count * ch4Count * 4) / totalGases ** 1.5) * 100),
  );

  // Initialize particles
  useEffect(() => {
    const initialMolecules: Molecule[] = [];

    // Start with a mix of molecules
    const addMolecule = (type: "O2" | "CH4" | "CO2" | "H2O") => {
      const id = moleculeIdCounter.current++;
      initialMolecules.push({
        id,
        type,
        x: 20 + Math.random() * 360,
        y: 20 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      });
    };

    for (let i = 0; i < 12; i++) addMolecule("O2");
    for (let i = 0; i < 8; i++) addMolecule("CH4");
    for (let i = 0; i < 15; i++) addMolecule("CO2");
    for (let i = 0; i < 5; i++) addMolecule("H2O");

    setMolecules(initialMolecules);
  }, []);

  // Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const width = 380;
    const height = 130;

    const interval = setInterval(() => {
      setMolecules((prev) => {
        let updated = prev.map((m) => {
          let nextX = m.x + m.vx;
          let nextY = m.y + m.vy;
          let nextVx = m.vx;
          let nextVy = m.vy;

          // Wall bounces
          if (nextX < 10 || nextX > width - 10) {
            nextVx = -m.vx;
            nextX = nextX < 10 ? 10 : width - 10;
          }
          if (nextY < 10 || nextY > height - 10) {
            nextVy = -m.vy;
            nextY = nextY < 10 ? 10 : height - 10;
          }

          return { ...m, x: nextX, y: nextY, vx: nextVx, vy: nextVy };
        });

        // Resolve reactions: O2 + CH4 -> CO2 + 2 H2O
        // Scan for close O2 and CH4 pairs
        const reactedO2Ids = new Set<number>();
        const reactedCH4Ids = new Set<number>();

        for (let i = 0; i < updated.length; i++) {
          const m1 = updated[i];
          if (m1.type !== "O2" || reactedO2Ids.has(m1.id)) continue;

          for (let j = 0; j < updated.length; j++) {
            const m2 = updated[j];
            if (m2.type !== "CH4" || reactedCH4Ids.has(m2.id)) continue;

            // Compute distance
            const dx = m1.x - m2.x;
            const dy = m1.y - m2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Collide / react threshold
            if (dist < 15) {
              reactedO2Ids.add(m1.id);
              reactedCH4Ids.add(m2.id);
              break; // m1 has reacted, check next
            }
          }
        }

        // If reactions occurred, filter them out and spawn product molecules
        if (reactedO2Ids.size > 0) {
          const newProducts: Molecule[] = [];

          for (const id of reactedO2Ids) {
            const reactant = updated.find((m) => m.id === id);
            if (reactant) {
              // Spawn CO2
              newProducts.push({
                id: moleculeIdCounter.current++,
                type: "CO2",
                x: reactant.x,
                y: reactant.y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
              });
              // Spawn H2O
              newProducts.push({
                id: moleculeIdCounter.current++,
                type: "H2O",
                x: reactant.x + 5,
                y: reactant.y + 5,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
              });
            }
          }

          updated = updated.filter((m) => !reactedO2Ids.has(m.id) && !reactedCH4Ids.has(m.id));
          updated.push(...newProducts);
        }

        // Biological Pump injecting fresh O2 and CH4
        // Higher pump strength = more frequent injections
        if (pumpValue > 0 && Math.random() < (pumpValue / 100) * 0.08) {
          const isO2 = Math.random() > 0.4;
          const type = isO2 ? "O2" : "CH4";

          updated.push({
            id: moleculeIdCounter.current++,
            type,
            x: 20 + Math.random() * (width - 40),
            y: 20 + Math.random() * (height - 40),
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
          });
        }

        // Keep maximum molecule counts capped to prevent CPU lag
        if (updated.length > 50) {
          updated = updated.slice(updated.length - 50);
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, pumpValue]);

  // Keep stats count in sync with molecule list
  useEffect(() => {
    let o2 = 0;
    let ch4 = 0;
    let co2 = 0;

    for (const m of molecules) {
      if (m.type === "O2") o2++;
      else if (m.type === "CH4") ch4++;
      else if (m.type === "CO2") co2++;
    }

    setO2Count(o2);
    setCh4Count(ch4);
    setCo2Count(co2);
  }, [molecules]);

  const handleReset = () => {
    setPumpValue(40);
    const initialMolecules: Molecule[] = [];
    for (let i = 0; i < 12; i++) {
      initialMolecules.push({
        id: moleculeIdCounter.current++,
        type: "O2",
        x: 20 + Math.random() * 360,
        y: 20 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      });
    }
    for (let i = 0; i < 8; i++) {
      initialMolecules.push({
        id: moleculeIdCounter.current++,
        type: "CH4",
        x: 20 + Math.random() * 360,
        y: 20 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      });
    }
    for (let i = 0; i < 15; i++) {
      initialMolecules.push({
        id: moleculeIdCounter.current++,
        type: "CO2",
        x: 20 + Math.random() * 360,
        y: 20 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      });
    }
    setMolecules(initialMolecules);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={pumpValue > 15 ? t("hintAlive") : t("hintDead")}
      onReset={handleReset}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      isPlaying={isPlaying}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Reaction Chamber */}
        <div className="w-full flex-1 flex flex-col justify-start pb-28 pt-2">
          <div className="relative w-full h-full bg-void/50 border border-border/20 rounded-xl overflow-hidden">
            <svg viewBox="0 0 400 130" className="w-full h-full select-none">
              <title>Gas disequilibrium chamber</title>

              {/* Molecule renderings */}
              {molecules.map((m) => (
                <g key={m.id} transform={`translate(${m.x}, ${m.y})`}>
                  {m.type === "O2" && (
                    // O2: double cyan/blue circles
                    <g className="opacity-90">
                      <circle cx="-3" cy="0" r="3.5" fill="var(--cyan)" />
                      <circle cx="3" cy="0" r="3.5" fill="var(--cyan)" />
                      <line
                        x1="-3"
                        y1="0"
                        x2="3"
                        y2="0"
                        stroke="var(--background)"
                        strokeWidth="1"
                      />
                    </g>
                  )}

                  {m.type === "CH4" && (
                    // CH4: Carbon (teal) surrounded by 4 hydrogen dots (white)
                    <g className="opacity-90">
                      <circle cx="0" cy="0" r="4" fill="var(--teal)" />
                      <circle cx="-5" cy="-5" r="1.5" fill="#ffffff" />
                      <circle cx="5" cy="-5" r="1.5" fill="#ffffff" />
                      <circle cx="-5" cy="5" r="1.5" fill="#ffffff" />
                      <circle cx="5" cy="5" r="1.5" fill="#ffffff" />
                    </g>
                  )}

                  {m.type === "CO2" && (
                    // CO2: Red center (carbon) and 2 dark oxygen dots
                    <g className="opacity-40">
                      <circle cx="0" cy="0" r="3.5" fill="var(--border-strong)" />
                      <circle cx="-5" cy="0" r="3.5" fill="var(--border)" />
                      <circle cx="5" cy="0" r="3.5" fill="var(--border)" />
                    </g>
                  )}

                  {m.type === "H2O" && (
                    // H2O: Blue center (oxygen) and 2 small white dots (hydrogen)
                    <g className="opacity-40">
                      <circle cx="0" cy="2" r="3" fill="#143b46" />
                      <circle cx="-3" cy="-2" r="1.2" fill="#ffffff" />
                      <circle cx="3" cy="-2" r="1.2" fill="#ffffff" />
                    </g>
                  )}
                </g>
              ))}
            </svg>

            {/* Readout stats overlay */}
            <div className="absolute top-2 left-2 flex gap-3 text-[8.5px] font-mono pointer-events-none">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan inline-block" />
                <span className="text-cyan font-bold">
                  {t("o2") || "O₂"}: {o2Count}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal inline-block" />
                <span className="text-teal font-bold">
                  {t("ch4") || "CH₄"}: {ch4Count}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-border-strong inline-block" />
                <span className="text-muted">
                  {t("co2") || "CO₂"}: {co2Count}
                </span>
              </div>
            </div>

            {/* Verdict text overlay */}
            <div className="absolute top-2 right-2 text-[8.5px] font-mono text-right pointer-events-none">
              <span className="text-muted mr-1">{t("verdictLabel") || "Verdict"}:</span>
              <span
                className={
                  disequilibriumIndex > 15 ? "text-teal font-bold" : "text-magenta font-bold"
                }
              >
                {disequilibriumIndex > 15
                  ? t("living") || "Living world"
                  : t("dead") || "Dead world"}
              </span>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10">
          {/* Biological Pump Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
              {t("pumpSlider") || "Biological Pump"}:
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={pumpValue}
              onChange={(e) => setPumpValue(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-[9px] font-mono text-foreground w-8 text-right">
              {pumpValue > 0 ? `${pumpValue}%` : t("noLife") || "OFF"}
            </span>
          </div>

          {/* Disequilibrium Index progress meter */}
          <div className="flex justify-between items-center border-t border-border/15 pt-2 text-[9px] font-mono">
            <div className="flex items-center gap-2 flex-1 max-w-[220px]">
              <span className="text-muted text-[8.5px] uppercase">
                {t("disequilibriumLabel") || "Disequilibrium Index"}:
              </span>
              <div className="flex-1 h-2 rounded bg-surface border border-border/20 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    disequilibriumIndex > 15
                      ? "bg-teal shadow-[0_0_5px_rgba(43,212,168,0.5)]"
                      : "bg-magenta"
                  }`}
                  style={{ width: `${disequilibriumIndex}%` }}
                />
              </div>
            </div>

            <div className="text-[10px] font-bold text-foreground">{disequilibriumIndex} / 100</div>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
