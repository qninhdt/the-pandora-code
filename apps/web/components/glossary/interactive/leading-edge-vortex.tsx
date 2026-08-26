"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// LEV glued to the leading edge boosts lift at high AoA — insect/banshee trick.
export default function LeadingEdgeVortex() {
  const t = useTranslations("viz.leading-edge-vortex");
  const [lev, setLev] = useState(true);
  const [aoa, setAoa] = useState(28);
  const boost = lev ? 1 + aoa / 50 : 1;
  const cl = Math.max(0.2, Math.sin((aoa * Math.PI) / 180) * 1.4) * boost;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setLev(true);
        setAoa(28);
      }}
      allowFullscreen={false}
      caption={
        <span className={lev ? "text-cyan" : "text-muted"}>
          {lev ? t("lev") : t("attached")} · Cl {cl.toFixed(2)}
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
          {/* wing section tilted by aoa */}
          <g transform={`translate(50 50) rotate(${-aoa * 0.4})`}>
            <path
              d="M-28 2 Q -10 -6 10 -2 Q 24 0 28 2 Q 10 6 -10 4 Q -28 4 -28 2 Z"
              fill="var(--surface)"
              stroke="var(--cyan)"
              strokeWidth="0.9"
            />
            {lev && (
              <g>
                <circle
                  cx="-18"
                  cy="-8"
                  r="6"
                  fill="none"
                  stroke="var(--magenta)"
                  strokeWidth="1"
                  opacity="0.85"
                />
                <circle cx="-18" cy="-8" r="3" fill="var(--magenta)" opacity="0.35" />
                <path
                  d="M-24 -8 Q -18 -14 -12 -8 Q -18 -2 -24 -8"
                  fill="none"
                  stroke="var(--magenta)"
                  strokeWidth="0.5"
                  opacity="0.7"
                />
              </g>
            )}
          </g>
          {/* flow lines */}
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              x1="8"
              y1={36 + i * 10}
              x2="36"
              y2={34 + i * 10 - aoa * 0.15}
              stroke="var(--teal)"
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("liftBoost")} value={boost.toFixed(2)} accent="magenta" />
          <Readout label="Cl" value={cl.toFixed(2)} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1.5">
          <div className="flex justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setLev(false)}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
              style={{
                borderColor: !lev ? "var(--muted)" : "var(--border-strong)",
                color: !lev ? "var(--muted)" : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {t("attached")}
            </button>
            <button
              type="button"
              onClick={() => setLev(true)}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
              style={{
                borderColor: lev ? "var(--magenta)" : "var(--border-strong)",
                color: lev ? "var(--magenta)" : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {t("lev")}
            </button>
          </div>
          <ControlSlider
            label={t("aoa")}
            value={aoa}
            min={5}
            max={45}
            step={1}
            display={`${aoa}°`}
            onChange={setAoa}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
