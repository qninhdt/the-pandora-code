"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Water-touch sense: flow deflects hair cells along the flank canal.
export default function LateralLine() {
  const t = useTranslations("viz.lateral-line");
  const [flow, setFlow] = useState(0.5);
  const cells = Math.round(3 + flow * 8);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setFlow(0.5)}
      allowFullscreen={false}
      caption={<span className="text-cyan">{t("cells")}: {cells}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <ellipse cx="50" cy="48" rx="36" ry="14" fill="var(--surface)" stroke="var(--teal)" strokeWidth="0.8" />
          <line x1="22" y1="48" x2="78" y2="48" stroke="var(--cyan)" strokeWidth="1.2" />
          {Array.from({ length: 9 }, (_, i) => {
            const lit = i < cells;
            const defl = lit ? flow * 6 : 0;
            return (
              <g key={i}>
                <line x1={26 + i * 6} y1="48" x2={26 + i * 6 + defl} y2={42 - defl * 0.3} stroke={lit ? "var(--amber)" : "var(--muted)"} strokeWidth="0.9" />
                <circle cx={26 + i * 6} cy="48" r="1.4" fill={lit ? "var(--cyan)" : "var(--surface)"} />
              </g>
            );
          })}
          <text x="50" y="72" textAnchor="middle" style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}>{t("canal")}</text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("flow")} value={flow.toFixed(2)} accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("flow")} value={flow} min={0} max={1} step={0.02} display={flow.toFixed(2)} onChange={setFlow} thumb="cyan" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
