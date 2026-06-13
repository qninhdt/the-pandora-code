"use client";

import {
  L_MAX,
  L_MIN,
  T_OPT,
  bareTempC,
  solveDaisyworld,
  temperatureCurves,
} from "@/components/content/daisyworld-model";
import { useTranslations } from "next-intl";
import React, { useState, useMemo } from "react";
import { GlossaryFrame } from "./shared/frame";

interface DaisyworldProps {
  locale: string;
}

// Fixed dimensions for the chart view
const VIEW_W = 320;
const VIEW_H = 120;
const PAD_L = 25;
const PAD_R = 10;
const PAD_T = 10;
const PAD_B = 18;
const PLOT_W = VIEW_W - PAD_L - PAD_R;
const PLOT_H = VIEW_H - PAD_T - PAD_B;

// Temperature scale: -15C to 80C
const T_MIN = -15;
const T_MAX = 80;

// Math conversions for SVG coordinates
const lx = (l: number) => PAD_L + ((l - L_MIN) / (L_MAX - L_MIN)) * PLOT_W;
const ty = (tempC: number) => {
  const clamped = Math.max(T_MIN, Math.min(T_MAX, tempC));
  return PAD_T + (1 - (clamped - T_MIN) / (T_MAX - T_MIN)) * PLOT_H;
};

export default function Daisyworld({ locale }: DaisyworldProps) {
  const t = useTranslations("viz.daisyworld");

  const [luminosity, setLuminosity] = useState(1.0);

  const curves = useMemo(() => temperatureCurves(32), []);

  const regulatedPath = useMemo(() => {
    return curves
      .map((c, i) => `${i === 0 ? "M" : "L"}${lx(c.l).toFixed(1)} ${ty(c.regulated).toFixed(1)}`)
      .join(" ");
  }, [curves]);

  const barePath = useMemo(() => {
    return curves
      .map((c, i) => `${i === 0 ? "M" : "L"}${lx(c.l).toFixed(1)} ${ty(c.bare).toFixed(1)}`)
      .join(" ");
  }, [curves]);

  const state = solveDaisyworld(luminosity);
  const bare = bareTempC(luminosity);
  const alive = state.black + state.white > 0.05;

  const verdict = !alive
    ? t("dead")
    : Math.abs(state.tempC - T_OPT) < 8
      ? t("regulated")
      : t("struggling");

  const verdictColor = !alive
    ? "text-amber"
    : Math.abs(state.tempC - T_OPT) < 8
      ? "text-teal"
      : "text-cyan";

  const cx = lx(luminosity);

  const handleReset = () => {
    setLuminosity(1.0);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={alive ? t("hintAlive") : t("hintDead")}
      onReset={handleReset}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Daisyworld simulation plot */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-2">
          <div className="relative w-full h-full bg-void/50 border border-border/20 rounded-xl overflow-hidden flex flex-row p-3 gap-3">
            {/* Chart Area */}
            <div className="flex-1 h-full relative">
              <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-full select-none">
                <title>Daisyworld temperature regulation graph</title>

                {/* Comfort Band Area */}
                <rect
                  x={PAD_L}
                  y={ty(T_OPT + 10)}
                  width={PLOT_W}
                  height={ty(T_OPT - 10) - ty(T_OPT + 10)}
                  className="fill-teal/10"
                />

                {/* Axes */}
                <line
                  x1={PAD_L}
                  y1={PAD_T}
                  x2={PAD_L}
                  y2={PAD_T + PLOT_H}
                  className="stroke-border/30 stroke-1"
                />
                <line
                  x1={PAD_L}
                  y1={PAD_T + PLOT_H}
                  x2={PAD_L + PLOT_W}
                  y2={PAD_T + PLOT_H}
                  className="stroke-border/30 stroke-1"
                />

                {/* Y Tick Marks */}
                {[0, 25, 50, 75].map((val) => (
                  <g key={val}>
                    <line
                      x1={PAD_L - 3}
                      y1={ty(val)}
                      x2={PAD_L}
                      y2={ty(val)}
                      className="stroke-border/30 stroke-[0.5]"
                    />
                    <text
                      x={PAD_L - 6}
                      y={ty(val) + 2.5}
                      textAnchor="end"
                      className="fill-muted font-mono text-[6px]"
                    >
                      {val}
                    </text>
                  </g>
                ))}

                {/* Bare-rock curve */}
                <path
                  d={barePath}
                  fill="none"
                  className="stroke-border/30 stroke-[0.8] stroke-dashed"
                  strokeDasharray="2,2"
                />

                {/* Regulated curve */}
                <path
                  d={regulatedPath}
                  fill="none"
                  className="stroke-teal/70 stroke-[1.8]"
                  style={{ filter: "drop-shadow(0 0 3px rgba(43, 212, 168, 0.4))" }}
                />

                {/* Solar slider indicator line */}
                <line
                  x1={cx}
                  y1={PAD_T}
                  x2={cx}
                  y2={PAD_T + PLOT_H}
                  className="stroke-amber/40 stroke-[0.8]"
                />

                {/* Intersection dots */}
                <circle cx={cx} cy={ty(bare)} r="2.5" className="fill-border/40" />
                <circle
                  cx={cx}
                  cy={ty(state.tempC)}
                  r="3.5"
                  className={
                    !alive
                      ? "fill-amber"
                      : Math.abs(state.tempC - T_OPT) < 8
                        ? "fill-teal"
                        : "fill-cyan"
                  }
                  style={{
                    filter: `drop-shadow(0 0 3px ${
                      !alive
                        ? "var(--amber)"
                        : Math.abs(state.tempC - T_OPT) < 8
                          ? "var(--teal)"
                          : "var(--cyan)"
                    })`,
                  }}
                />
              </svg>
              {/* Comfort Band label */}
              <div className="absolute top-[38%] left-[28%] text-[6.5px] font-mono text-teal/50 uppercase pointer-events-none">
                {t("comfortBand") || "comfort band"}
              </div>
            </div>

            {/* Readouts side panel */}
            <div className="w-1/3 border-l border-border/15 pl-3 flex flex-col justify-between h-full">
              {/* Temp and state */}
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-mono text-muted uppercase">
                    {t("planetTemp") || "Temp"}
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {state.tempC.toFixed(1)}°C
                  </span>
                  {alive && (
                    <span className="text-[6.5px] font-mono text-muted">
                      ({t("bareWould") || "Bare"}: {bare.toFixed(0)}°C)
                    </span>
                  )}
                </div>

                <div className="flex flex-col border-t border-border/10 pt-1.5">
                  <span className="text-[7.5px] font-mono text-muted uppercase">
                    {t("verdictLabel") || "State"}
                  </span>
                  <span className={`font-mono text-[10px] font-bold ${verdictColor}`}>
                    {verdict}
                  </span>
                </div>
              </div>

              {/* Daisy population percentages */}
              <div className="flex flex-col gap-1 border-t border-border/10 pt-1.5 text-[7px] font-mono">
                <div className="flex justify-between">
                  <span className="text-muted">✿ Black:</span>
                  <span className="text-foreground font-bold">
                    {Math.round(state.black * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan">✿ White:</span>
                  <span className="text-cyan font-bold">{Math.round(state.white * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono">
          {/* Luminosity Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
              {t("lumSlider") || "Solar Brightness"}:
            </span>
            <input
              type="range"
              min={L_MIN}
              max={L_MAX}
              step="0.01"
              value={luminosity}
              onChange={(e) => setLuminosity(Number.parseFloat(e.target.value))}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-teal"
            />
            <span className="text-foreground w-12 text-right font-bold">
              {luminosity.toFixed(2)} L☉
            </span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
