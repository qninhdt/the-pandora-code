"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const LABELS = ["cell", "animal", "human", "eywa"] as const;

// Reachable goals cone expands with agent sophistication (Levin-style).
export default function CognitiveLightCone() {
  const t = useTranslations("viz.cognitive-light-cone");
  const [scale, setScale] = useState(0.35);

  const tier = useMemo(() => {
    if (scale < 0.25) return 0;
    if (scale < 0.5) return 1;
    if (scale < 0.75) return 2;
    return 3;
  }, [scale]);

  const reach = 8 + scale * 42;
  const half = 6 + scale * 28;
  const label = LABELS[tier];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setScale(0.35)}
      allowFullscreen={false}
      caption={
        <span className="text-teal">
          {t(label)} · {t("reach")} {reach.toFixed(0)}
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
          {/* time axis */}
          <line x1="18" y1="78" x2="18" y2="16" stroke="var(--border-strong)" strokeWidth="0.4" />
          <line x1="18" y1="78" x2="92" y2="78" stroke="var(--border-strong)" strokeWidth="0.4" />
          <text
            x="92"
            y="84"
            textAnchor="end"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            space
          </text>
          <text
            x="12"
            y="18"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            t
          </text>

          {/* cone */}
          <polygon
            points={`18,78 ${18 + half},${78 - reach} ${18 - half * 0.15},${78 - reach}`}
            fill="var(--cyan)"
            opacity={0.18}
            stroke="var(--cyan)"
            strokeWidth="0.7"
            transform={`translate(${half * 0.08} 0)`}
          />
          <path
            d={`M18 78 L${18 + half} ${78 - reach} L${18 + half * 0.35} ${78 - reach * 0.55} Z`}
            fill="var(--teal)"
            opacity={0.35}
          />

          {/* agent at origin */}
          <circle cx="18" cy="78" r={2.2 + scale} fill="var(--amber)" />

          {/* goal dots inside / outside */}
          {[0.3, 0.55, 0.8, 0.95].map((f, i) => {
            const gy = 78 - reach * f;
            const gx = 18 + half * f * 0.85;
            const inside = f <= 1;
            return (
              <circle
                key={i}
                cx={gx}
                cy={gy}
                r="1.6"
                fill={inside ? "var(--cyan)" : "var(--magenta)"}
                opacity={0.5 + f * 0.4}
              />
            );
          })}

          {/* tier label */}
          <text
            x={18 + half * 0.55}
            y={78 - reach - 3}
            textAnchor="middle"
            style={{ fontSize: 3, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            {t(label)}
          </text>
        </svg>

        <div className="absolute right-3 top-14">
          <Readout label={t("reach")} value={reach.toFixed(0)} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("scale")}
            value={scale}
            min={0.05}
            max={1}
            step={0.02}
            display={t(label)}
            onChange={setScale}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
