"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// n-dimensional niche as three tolerance bars. Volume ≈ product of widths
// (Hutchinson hypervolume, toy 3-axis slice).
export default function EcologicalNiche() {
  const t = useTranslations("viz.ecological-niche");
  // each axis: center 0–1, width 0.1–0.9 via a single "tolerance" slider
  const [temp, setTemp] = useState(0.55);
  const [food, setFood] = useState(0.45);
  const [time, setTime] = useState(0.5);

  const volume = useMemo(() => temp * food * time, [temp, food, time]);

  const axes = [
    { key: "temp", label: t("temp"), v: temp, color: "var(--cyan)", y: 28 },
    { key: "food", label: t("food"), v: food, color: "var(--teal)", y: 44 },
    { key: "time", label: t("time"), v: time, color: "var(--amber)", y: 60 },
  ] as const;

  // blob radii from axes for a soft hypervolume glyph
  const rx = 8 + temp * 18;
  const ry = 6 + food * 14;
  const skew = (time - 0.5) * 12;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setTemp(0.55);
        setFood(0.45);
        setTime(0.5);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("volume")} ≈ <span className="text-cyan">{(volume * 100).toFixed(0)}%</span>
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
          {/* hypervolume glyph */}
          <ellipse
            cx={72 + skew * 0.3}
            cy="42"
            rx={rx}
            ry={ry}
            fill="var(--cyan)"
            opacity={0.12 + volume * 0.35}
            stroke="var(--cyan)"
            strokeWidth="0.6"
          />
          <ellipse
            cx={72 - skew * 0.2}
            cy="42"
            rx={rx * 0.7}
            ry={ry * 0.75}
            fill="none"
            stroke="var(--teal)"
            strokeWidth="0.4"
            opacity="0.6"
          />

          {/* axis bars */}
          {axes.map((ax) => {
            const fullW = 48;
            const w = ax.v * fullW;
            const x0 = 10 + (fullW - w) / 2;
            return (
              <g key={ax.key}>
                <text
                  x="8"
                  y={ax.y + 1.2}
                  textAnchor="end"
                  style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
                >
                  {ax.label.slice(0, 4)}
                </text>
                <rect
                  x="10"
                  y={ax.y - 2.2}
                  width={fullW}
                  height="4.4"
                  rx="1"
                  fill="var(--surface)"
                  stroke="var(--border-strong)"
                  strokeWidth="0.3"
                />
                <rect
                  x={x0}
                  y={ax.y - 2.2}
                  width={w}
                  height="4.4"
                  rx="1"
                  fill={ax.color}
                  opacity="0.75"
                />
              </g>
            );
          })}

          {/* volume readout ring */}
          <circle
            cx="72"
            cy="42"
            r="20"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.35"
            strokeDasharray="1.5 1.5"
          />
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("volume")}
            value={`${(volume * 100).toFixed(0)}%`}
            accent={volume > 0.2 ? "cyan" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10 space-y-1.5">
          <ControlSlider
            label={t("temp")}
            value={temp}
            min={0.12}
            max={1}
            step={0.02}
            display={`${Math.round(temp * 100)}%`}
            onChange={setTemp}
            thumb="cyan"
          />
          <ControlSlider
            label={t("food")}
            value={food}
            min={0.12}
            max={1}
            step={0.02}
            display={`${Math.round(food * 100)}%`}
            onChange={setFood}
            thumb="teal"
          />
          <ControlSlider
            label={t("time")}
            value={time}
            min={0.12}
            max={1}
            step={0.02}
            display={`${Math.round(time * 100)}%`}
            onChange={setTime}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
