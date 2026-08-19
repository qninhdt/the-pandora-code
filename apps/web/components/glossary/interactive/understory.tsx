"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Canopy gaps shift light flecks; shade plants thrive, sun plants stress.
export default function Understory() {
  const t = useTranslations("viz.understory");
  const [gap, setGap] = useState(0.35);

  const flecks = useMemo(() => {
    const n = 3 + Math.round(gap * 5);
    return Array.from({ length: n }).map((_, i) => {
      const seed = i * 17 + gap * 40;
      return {
        x: 18 + ((seed * 13) % 64),
        y: 40 + ((seed * 7) % 28),
        r: 2 + (i % 3) + gap * 2,
      };
    });
  }, [gap]);

  const shadeFit = 1 - gap * 0.7; // shade plant happier with closed canopy
  const sunFit = 0.15 + gap * 0.8;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setGap(0.35)}
      allowFullscreen={false}
      caption={
        <span className="text-teal">
          {t("flecks")} ×{flecks.length}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* canopy lid with gap */}
          <rect x="8" y="12" width="84" height="16" fill="var(--teal)" opacity={0.4} />
          <rect
            x={40 - gap * 20}
            y="12"
            width={8 + gap * 40}
            height="16"
            fill="var(--void)"
            opacity={0.85}
          />
          {/* dim understory field */}
          <rect x="8" y="28" width="84" height="48" fill="#0a0e14" />
          {/* light flecks */}
          {flecks.map((f, i) => (
            <ellipse
              key={i}
              cx={f.x}
              cy={f.y}
              rx={f.r}
              ry={f.r * 0.6}
              fill="var(--amber)"
              opacity={0.2 + gap * 0.45}
            />
          ))}
          {/* shade-tolerant plant */}
          <g>
            <rect x="28" y="58" width="2.5" height="16" fill="var(--cyan)" opacity={0.4 + shadeFit * 0.5} />
            <ellipse cx="29" cy="56" rx={6 + shadeFit * 4} ry={4 + shadeFit * 2} fill="var(--teal)" opacity={0.35 + shadeFit * 0.5} />
            <text x="29" y="80" textAnchor="middle" style={{ fontSize: 2.1, fontFamily: "monospace", fill: shadeFit > 0.5 ? "var(--teal)" : "var(--magenta)" }}>
              {t("shade")}
            </text>
          </g>
          {/* sun plant */}
          <g>
            <rect x="68" y="58" width="2.5" height="16" fill="var(--cyan)" opacity={0.3 + sunFit * 0.5} />
            <ellipse cx="69" cy="56" rx={5 + sunFit * 5} ry={3 + sunFit * 3} fill="var(--amber)" opacity={0.3 + sunFit * 0.55} />
            <text x="69" y="80" textAnchor="middle" style={{ fontSize: 2.1, fontFamily: "monospace", fill: sunFit > 0.5 ? "var(--amber)" : "var(--magenta)" }}>
              {t("sun")}
            </text>
          </g>
        </svg>
        <div className="absolute right-3 top-14 space-y-1">
          <Readout label={t("shade")} value={shadeFit > 0.5 ? t("thrive") : t("stress")} accent={shadeFit > 0.5 ? "teal" : "magenta"} />
          <Readout label={t("sun")} value={sunFit > 0.5 ? t("thrive") : t("stress")} accent={sunFit > 0.5 ? "amber" : "magenta"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("gap")}
            value={gap}
            min={0}
            max={1}
            step={0.01}
            display={`${Math.round(gap * 100)}%`}
            onChange={setGap}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
