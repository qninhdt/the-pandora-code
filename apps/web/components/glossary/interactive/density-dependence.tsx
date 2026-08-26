"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Per-capita growth r(N) = r0 (1 − N/K). Crowding packs dots; the gauge falls.
const K = 64;
const R0 = 1.0;

export default function DensityDependence() {
  const t = useTranslations("viz.density-dependence");
  const [density, setDensity] = useState(18);

  const perCapita = R0 * (1 - density / K);
  const crowd = density / K;

  // deterministic grid positions for N dots inside a circle
  const dots = useMemo(() => {
    const out: { x: number; y: number; i: number }[] = [];
    const n = Math.round(density);
    // sunflower spiral packing
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const r = 22 * Math.sqrt((i + 0.5) / Math.max(n, 1));
      const theta = i * golden;
      out.push({
        x: 38 + r * Math.cos(theta),
        y: 42 + r * Math.sin(theta),
        i,
      });
    }
    return out;
  }, [density]);

  // gauge needle angle: r from +R0 (left/up) to −something (right/down)
  const gaugeAngle = -90 + (1 - perCapita / R0) * 180; // −90 at r=R0, +90 at r=0

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setDensity(18)}
      allowFullscreen={false}
      caption={
        <span>
          {t("growth")} ={" "}
          <span className={perCapita > 0.15 ? "text-teal" : "text-magenta"}>
            {perCapita.toFixed(2)}
          </span>
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
          {/* habitat circle */}
          <circle
            cx="38"
            cy="42"
            r="26"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          <circle cx="38" cy="42" r="26" fill="var(--magenta)" opacity={crowd * 0.18} />

          {dots.map((d) => (
            <circle
              key={d.i}
              cx={d.x}
              cy={d.y}
              r={1.4 + crowd * 0.4}
              fill="var(--cyan)"
              opacity={0.55 + (1 - crowd) * 0.4}
            />
          ))}

          {/* per-capita growth gauge */}
          <g transform="translate(78 40)">
            <path
              d="M-12 0 A12 12 0 0 1 12 0"
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="1.2"
            />
            <path
              d="M-12 0 A12 12 0 0 1 12 0"
              fill="none"
              stroke="var(--teal)"
              strokeWidth="1.2"
              strokeDasharray={`${Math.max(0, perCapita) * 37.7} 40`}
              opacity="0.85"
            />
            <line
              x1="0"
              y1="0"
              x2={Math.cos((gaugeAngle * Math.PI) / 180) * 10}
              y2={Math.sin((gaugeAngle * Math.PI) / 180) * 10}
              stroke={perCapita > 0.15 ? "var(--teal)" : "var(--magenta)"}
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <circle cx="0" cy="0" r="1.4" fill="var(--foreground)" />
            <text
              x="0"
              y="10"
              textAnchor="middle"
              style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
            >
              r
            </text>
          </g>

          <text
            x="38"
            y="76"
            textAnchor="middle"
            style={{ fontSize: 2.5, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("crowd")} {(crowd * 100).toFixed(0)}%
          </text>
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("growth")}
            value={perCapita.toFixed(2)}
            accent={perCapita > 0.15 ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("density")}
            value={density}
            min={2}
            max={K}
            step={1}
            display={String(Math.round(density))}
            onChange={setDensity}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
