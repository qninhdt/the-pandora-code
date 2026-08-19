"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Marginal value theorem: gain g(t) = V (1 − e^{−kt}). Leave when g'(t) = R*,
// where R* is the long-term rate including travel τ: R* = g(t*)/(t*+τ).
// Closed form for exponential: t* = (1/k) ln(V / (R*/k)) solved iteratively.
export default function OptimalForagingTheory() {
  const t = useTranslations("viz.optimal-foraging-theory");
  const [patchV, setPatchV] = useState(1.0); // patch richness
  const [travel, setTravel] = useState(0.8); // travel time τ
  const k = 0.9; // depletion rate

  const { tStar, Rstar, curve } = useMemo(() => {
    // R* from solving t* = τ / ( (V k / R*) − 1 ) wait — for g=V(1-e^{-kt}):
    // g' = V k e^{-kt}; set = R* ⇒ t* = (1/k) ln(V k / R*)
    // also R* = g(t*)/(t*+τ). Iterate R*.
    let R = 0.3;
    let ts = 1;
    for (let i = 0; i < 24; i++) {
      const arg = (patchV * k) / Math.max(R, 0.02);
      ts = arg > 1 ? Math.log(arg) / k : 0.05;
      const g = patchV * (1 - Math.exp(-k * ts));
      R = g / (ts + travel);
    }
    const pts = Array.from({ length: 40 }, (_, i) => {
      const tm = (i / 39) * 6;
      const g = patchV * (1 - Math.exp(-k * tm));
      return { tm, g };
    });
    return { tStar: ts, Rstar: R, curve: pts };
  }, [patchV, travel]);

  const maxG = Math.max(patchV, 0.1);
  const maxT = 6;
  const toX = (tm: number) => 10 + (tm / maxT) * 78;
  const toY = (g: number) => 64 - (g / maxG) * 42;
  const path = curve
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.tm).toFixed(2)} ${toY(p.g).toFixed(2)}`)
    .join(" ");

  // tangent line through (t*, g(t*)) with slope R*
  const gStar = patchV * (1 - Math.exp(-k * tStar));
  const tang = (tm: number) => gStar + Rstar * (tm - tStar);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setPatchV(1.0);
        setTravel(0.8);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("leave")} t* = <span className="text-amber">{tStar.toFixed(2)}</span>
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
          <line x1="10" y1="64" x2="90" y2="64" stroke="var(--border-strong)" strokeWidth="0.4" />
          <line x1="10" y1="22" x2="10" y2="64" stroke="var(--border-strong)" strokeWidth="0.4" />

          {/* gain curve */}
          <path d={path} fill="none" stroke="var(--cyan)" strokeWidth="1.2" />

          {/* MVT tangent */}
          <line
            x1={toX(0)}
            y1={toY(Math.max(0, Math.min(maxG, tang(0))))}
            x2={toX(maxT)}
            y2={toY(Math.max(0, Math.min(maxG, tang(maxT))))}
            stroke="var(--amber)"
            strokeWidth="0.7"
            strokeDasharray="2 1.5"
            opacity="0.85"
          />

          {/* leave marker */}
          <line
            x1={toX(tStar)}
            y1={toY(gStar)}
            x2={toX(tStar)}
            y2="64"
            stroke="var(--amber)"
            strokeWidth="0.5"
            opacity="0.7"
          />
          <circle cx={toX(tStar)} cy={toY(gStar)} r="1.8" fill="var(--amber)" />

          <text
            x="50"
            y="72"
            textAnchor="middle"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            time in patch
          </text>
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("leave")} value={tStar.toFixed(2)} accent="amber" />
          <Readout label={t("gain")} value={Rstar.toFixed(2)} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-10 space-y-1.5">
          <ControlSlider
            label={t("patch")}
            value={patchV}
            min={0.3}
            max={1.8}
            step={0.05}
            display={patchV.toFixed(2)}
            onChange={setPatchV}
            thumb="cyan"
          />
          <ControlSlider
            label={t("travel")}
            value={travel}
            min={0.15}
            max={2.5}
            step={0.05}
            display={travel.toFixed(2)}
            onChange={setTravel}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
