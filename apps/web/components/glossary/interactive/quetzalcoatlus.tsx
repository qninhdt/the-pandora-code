"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Quetzalcoatlus vs ikran: span/mass compare. Plausibility drops when mass outruns span.
export default function Quetzalcoatlus() {
  const t = useTranslations("viz.quetzalcoatlus");
  const [span, setSpan] = useState(10); // m, quetz ~10–11
  const [mass, setMass] = useState(70); // kg contested
  // crude loading proxy — high mass/span² is a stretch
  const loading = mass / (span * span * 0.2);
  const plausible = loading < 12;

  const ikranSpan = 12;
  const ikranMass = 250;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setSpan(10);
        setMass(70);
      }}
      allowFullscreen={false}
      caption={
        <span className={plausible ? "text-teal" : "text-magenta"}>
          {plausible ? t("plausible") : t("stretch")}
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
          {/* quetz silhouette */}
          <ellipse cx="32" cy="40" rx={span * 2.2} ry={3 + mass / 40} fill="var(--surface)" stroke={plausible ? "var(--cyan)" : "var(--magenta)"} strokeWidth="1" />
          <text x="32" y="56" textAnchor="middle" style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("quetz")}
          </text>
          {/* ikran ref */}
          <ellipse cx="72" cy="40" rx={ikranSpan * 1.6} ry={4} fill="var(--surface)" stroke="var(--teal)" strokeWidth="0.8" opacity="0.85" />
          <text x="72" y="56" textAnchor="middle" style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--teal)" }}>
            {t("ikran")}
          </text>
          <text x="72" y="62" textAnchor="middle" style={{ fontSize: 2, fontFamily: "monospace", fill: "var(--muted)" }}>
            {ikranSpan}m · {ikranMass}kg
          </text>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("span")} value={`${span.toFixed(1)} m`} accent="cyan" />
          <Readout label={t("mass")} value={`${mass.toFixed(0)} kg`} accent="amber" />
        </div>

        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1.5">
          <ControlSlider label={t("span")} value={span} min={5} max={12} step={0.1} display={`${span.toFixed(1)} m`} onChange={setSpan} thumb="cyan" />
          <ControlSlider label={t("mass")} value={mass} min={40} max={250} step={5} display={`${mass.toFixed(0)} kg`} onChange={setMass} thumb={plausible ? "teal" : "magenta"} />
        </div>
      </div>
    </GlossaryFrame>
  );
}
