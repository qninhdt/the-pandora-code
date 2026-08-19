"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Radical-pair compass: field angle tips singlet/triplet and the needle.
export default function Cryptochrome() {
  const t = useTranslations("viz.cryptochrome");
  const [angle, setAngle] = useState(30);
  const singlet = 50 + Math.sin((angle * Math.PI) / 180) * 28;
  const triplet = 100 - singlet;
  const needle = angle * 0.8;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setAngle(30)}
      allowFullscreen={false}
      caption={<span className="text-cyan">{t("needle")}: {needle.toFixed(0)}°</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <circle cx="50" cy="42" r="18" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.6" />
          <line
            x1="50"
            y1="42"
            x2={50 + Math.sin((needle * Math.PI) / 180) * 14}
            y2={42 - Math.cos((needle * Math.PI) / 180) * 14}
            stroke="var(--cyan)"
            strokeWidth="1.4"
          />
          <circle cx="50" cy="42" r="2" fill="var(--teal)" />
          <rect x="14" y="72" width={singlet * 0.35} height="5" fill="var(--cyan)" opacity="0.85" />
          <rect x="14" y="82" width={triplet * 0.35} height="5" fill="var(--magenta)" opacity="0.85" />
          <text x="52" y="76" style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}>{t("singlet")}</text>
          <text x="52" y="86" style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}>{t("triplet")}</text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("field")} value={`${angle}°`} accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("field")} value={angle} min={0} max={180} step={2} display={`${angle}°`} onChange={setAngle} thumb="cyan" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
