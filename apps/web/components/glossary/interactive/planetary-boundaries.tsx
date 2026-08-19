"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Nine Stockholm Resilience Centre wedges. Each has a safe limit at 1.0;
// user pushes selected boundary; breached wedges flare magenta/red-amber.
const BOUNDARIES = [
  "climate",
  "biosphere",
  "land",
  "freshwater",
  "biogeochem",
  "ocean",
  "aerosol",
  "ozone",
  "novel",
] as const;

const DEFAULTS = [1.2, 0.7, 0.9, 0.6, 1.4, 0.8, 0.5, 0.4, 0.75];

export default function PlanetaryBoundaries() {
  const t = useTranslations("viz.planetary-boundaries");
  const [levels, setLevels] = useState<number[]>(() => [...DEFAULTS]);
  const [active, setActive] = useState(0);

  const breached = levels.filter((v) => v > 1).length;
  const n = BOUNDARIES.length;
  const cx = 50;
  const cy = 44;
  const rOut = 28;
  const rIn = 8;

  const wedgePath = (i: number, level: number) => {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    const r = rIn + Math.min(level, 1.6) * (rOut - rIn);
    const x0 = cx + rIn * Math.cos(a0);
    const y0 = cy + rIn * Math.sin(a0);
    const x1 = cx + r * Math.cos(a0);
    const y1 = cy + r * Math.sin(a0);
    const x2 = cx + r * Math.cos(a1);
    const y2 = cy + r * Math.sin(a1);
    const x3 = cx + rIn * Math.cos(a1);
    const y3 = cy + rIn * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${x0.toFixed(2)} ${y0.toFixed(2)} L${x1.toFixed(2)} ${y1.toFixed(2)} A${r.toFixed(2)} ${r.toFixed(2)} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L${x3.toFixed(2)} ${y3.toFixed(2)} A${rIn} ${rIn} 0 ${large} 0 ${x0.toFixed(2)} ${y0.toFixed(2)} Z`;
  };

  // safe-limit ring at level=1
  const safeR = rIn + 1.0 * (rOut - rIn);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setLevels([...DEFAULTS]);
        setActive(0);
      }}
      allowFullscreen={false}
      caption={
        <span className={breached > 0 ? "text-magenta" : "text-teal"}>
          {breached > 0 ? `${breached} ${t("breach")}` : t("safe")}
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
          {/* safe operating ring */}
          <circle
            cx={cx}
            cy={cy}
            r={safeR}
            fill="none"
            stroke="var(--teal)"
            strokeWidth="0.5"
            strokeDasharray="1.5 1.2"
            opacity="0.7"
          />

          {levels.map((lv, i) => {
            const over = lv > 1;
            const selected = i === active;
            return (
              <path
                key={BOUNDARIES[i]}
                d={wedgePath(i, lv)}
                fill={over ? "var(--magenta)" : "var(--cyan)"}
                opacity={selected ? 0.85 : over ? 0.55 : 0.35}
                stroke={selected ? "var(--amber)" : "var(--border-strong)"}
                strokeWidth={selected ? 0.7 : 0.3}
                style={{ cursor: "pointer" }}
                onClick={() => setActive(i)}
              />
            );
          })}

          <circle cx={cx} cy={cy} r={rIn - 1} fill="var(--void)" stroke="var(--border-strong)" strokeWidth="0.4" />
          <text
            x={cx}
            y={cy + 1.2}
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            Earth
          </text>
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout
            label={levels[active] > 1 ? t("breach") : t("safe")}
            value={levels[active].toFixed(2)}
            accent={levels[active] > 1 ? "magenta" : "teal"}
          />
          <ControlButton
            className="px-2 py-1"
            onClick={() => setActive((a) => (a + 1) % n)}
          >
            {t("push")} #{active + 1}
          </ControlButton>
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={`${t("push")} ${active + 1}/${n}`}
            value={levels[active]}
            min={0.1}
            max={1.8}
            step={0.05}
            display={levels[active].toFixed(2)}
            onChange={(v) =>
              setLevels((prev) => {
                const next = [...prev];
                next[active] = v;
                return next;
              })
            }
            thumb={levels[active] > 1 ? "magenta" : "cyan"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
