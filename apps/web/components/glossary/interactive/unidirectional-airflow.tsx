"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// One-way exchange tissue beats tidal back-and-forth on extraction efficiency.
export default function UnidirectionalAirflow() {
  const t = useTranslations("viz.unidirectional-airflow");
  const [uni, setUni] = useState(true);
  const efficiency = uni ? 0.9 : 0.55;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setUni(true)}
      allowFullscreen={false}
      caption={<span className={uni ? "text-teal" : "text-amber"}>{uni ? t("uni") : t("tidal")}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <rect x="18" y="34" width="64" height="24" rx="3" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.6" />
          {uni ? (
            Array.from({ length: 5 }, (_, i) => (
              <path key={i} d={`M24 ${40 + i * 3} h52`} stroke="var(--teal)" strokeWidth="0.8" opacity="0.7" markerEnd="url(#arrow)" />
            ))
          ) : (
            Array.from({ length: 5 }, (_, i) => (
              <path key={i} d={`M24 ${40 + i * 3} h52 M76 ${40 + i * 3} h-52`} stroke="var(--amber)" strokeWidth="0.6" opacity="0.55" />
            ))
          )}
          <rect x="20" y="78" width={efficiency * 60} height="5" fill={uni ? "var(--teal)" : "var(--amber)"} opacity="0.85" />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("efficiency")} value={`${(efficiency * 100).toFixed(0)}%`} accent={uni ? "teal" : "amber"} />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          <button type="button" onClick={() => setUni(true)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: uni ? "var(--teal)" : "var(--border-strong)", color: uni ? "var(--teal)" : "var(--muted)", background: "var(--void)" }}>{t("uni")}</button>
          <button type="button" onClick={() => setUni(false)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: !uni ? "var(--amber)" : "var(--border-strong)", color: !uni ? "var(--amber)" : "var(--muted)", background: "var(--void)" }}>{t("tidal")}</button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
