"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Gill cover as pump, or lock open and swim for ram ventilation.
export default function Operculum() {
  const t = useTranslations("viz.operculum");
  const [ram, setRam] = useState(false);
  const open = ram ? 1 : 0.55;
  const flow = ram ? 0.9 : 0.55;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setRam(false)}
      allowFullscreen={false}
      caption={<span className={ram ? "text-cyan" : "text-teal"}>{ram ? t("ram") : t("pump")}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <ellipse cx="42" cy="50" rx="22" ry="14" fill="var(--surface)" stroke="var(--teal)" strokeWidth="0.8" />
          <path
            d={`M58 40 Q ${58 + open * 16} 50 58 60`}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="2"
          />
          {Array.from({ length: 4 }, (_, i) => (
            <line key={i} x1="60" y1={44 + i * 4} x2={70 + flow * 12} y2={44 + i * 4} stroke="var(--cyan)" strokeWidth="0.6" opacity={0.4 + flow * 0.5} />
          ))}
          <circle cx="30" cy="48" r="3" fill="var(--void)" stroke="var(--border-strong)" strokeWidth="0.5" />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("flow")} value={flow.toFixed(2)} accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          <button type="button" onClick={() => setRam(false)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: !ram ? "var(--teal)" : "var(--border-strong)", color: !ram ? "var(--teal)" : "var(--muted)", background: "var(--void)" }}>{t("pump")}</button>
          <button type="button" onClick={() => setRam(true)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: ram ? "var(--cyan)" : "var(--border-strong)", color: ram ? "var(--cyan)" : "var(--muted)", background: "var(--void)" }}>{t("ram")}</button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
