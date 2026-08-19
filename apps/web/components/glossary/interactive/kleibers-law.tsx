"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// BMR ~ M^¾. Drag log-mass; point should sit on Kleiber's shallow line.
export default function KleibersLaw() {
  const t = useTranslations("viz.kleibers-law");
  const [logM, setLogM] = useState(2); // 1..4 → 10..10000 kg
  const mass = 10 ** logM;
  // relative metabolic units ~ mass^0.75
  const metab = mass ** 0.75;
  // plot coords
  const x = 16 + ((logM - 1) / 3) * 72;
  const yPt = 78 - ((Math.log10(metab) - 0.75) / 2.25) * 56;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setLogM(2)}
      allowFullscreen={false}
      caption={
        <span className="text-teal">
          {t("exponent")} · {t("onLine")}
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
          <line x1="16" y1="78" x2="88" y2="78" stroke="var(--border-strong)" strokeWidth="0.6" />
          <line x1="16" y1="78" x2="16" y2="18" stroke="var(--border-strong)" strokeWidth="0.6" />
          {/* 3/4 line */}
          <line x1="16" y1="78" x2="88" y2={78 - 56} stroke="var(--teal)" strokeWidth="1" opacity="0.7" />
          <circle cx={x} cy={yPt} r="3.2" fill="var(--cyan)" stroke="var(--border-strong)" strokeWidth="0.4" />
          <text x="52" y="90" textAnchor="middle" style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("mass")} (log)
          </text>
          <text x="10" y="48" textAnchor="middle" transform="rotate(-90 10 48)" style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}>
            {t("metab")}
          </text>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("mass")} value={`${mass.toFixed(0)} kg`} accent="cyan" />
          <Readout label={t("metab")} value={metab.toFixed(0)} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("mass")}
            value={logM}
            min={1}
            max={4}
            step={0.05}
            display={`${mass.toFixed(0)} kg`}
            onChange={setLogM}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
