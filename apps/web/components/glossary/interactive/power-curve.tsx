"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Power-required U-curve. Min-power and max-range markers shift with loading & mass.
export default function PowerCurve() {
  const t = useTranslations("viz.power-curve");
  const [loading, setLoading] = useState(1.2);
  const [mass, setMass] = useState(1);

  const { pts, vmin, vrange } = useMemo(() => {
    const points: { v: number; p: number }[] = [];
    for (let v = 0.4; v <= 4; v += 0.15) {
      // induced ~ 1/v, parasite ~ v³, scaled by loading & mass
      const p = (mass * (loading * 1.2)) / v + 0.15 * mass * v ** 3;
      points.push({ v, p });
    }
    let minP = Number.POSITIVE_INFINITY;
    let vminLocal = 1;
    for (const pt of points) {
      if (pt.p < minP) {
        minP = pt.p;
        vminLocal = pt.v;
      }
    }
    // max range ~ min of P/v
    let best = Number.POSITIVE_INFINITY;
    let vrangeLocal = 1;
    for (const pt of points) {
      const pv = pt.p / pt.v;
      if (pv < best) {
        best = pv;
        vrangeLocal = pt.v;
      }
    }
    return { pts: points, vmin: vminLocal, vrange: vrangeLocal };
  }, [loading, mass]);

  const maxP = Math.max(...pts.map((p) => p.p));

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setLoading(1.2);
        setMass(1);
      }}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("minPower")} {vmin.toFixed(1)} · {t("maxRange")} {vrange.toFixed(1)}
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
          <line x1="14" y1="70" x2="90" y2="70" stroke="var(--border-strong)" strokeWidth="0.5" />
          <line x1="14" y1="70" x2="14" y2="18" stroke="var(--border-strong)" strokeWidth="0.5" />
          <polyline
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.2"
            points={pts
              .map((pt) => {
                const x = 14 + ((pt.v - 0.4) / 3.6) * 76;
                const y = 70 - (pt.p / maxP) * 48;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {/* markers */}
          <line
            x1={14 + ((vmin - 0.4) / 3.6) * 76}
            y1="18"
            x2={14 + ((vmin - 0.4) / 3.6) * 76}
            y2="70"
            stroke="var(--teal)"
            strokeWidth="0.6"
            strokeDasharray="2 1"
          />
          <line
            x1={14 + ((vrange - 0.4) / 3.6) * 76}
            y1="18"
            x2={14 + ((vrange - 0.4) / 3.6) * 76}
            y2="70"
            stroke="var(--amber)"
            strokeWidth="0.6"
            strokeDasharray="2 1"
          />
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("minPower")} value={vmin.toFixed(2)} accent="teal" />
          <Readout label={t("maxRange")} value={vrange.toFixed(2)} accent="amber" />
        </div>

        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1.5">
          <ControlSlider
            label={t("loading")}
            value={loading}
            min={0.5}
            max={2.5}
            step={0.05}
            display={loading.toFixed(2)}
            onChange={setLoading}
            thumb="cyan"
          />
          <ControlSlider
            label={t("mass")}
            value={mass}
            min={0.5}
            max={2.5}
            step={0.05}
            display={mass.toFixed(2)}
            onChange={setMass}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
