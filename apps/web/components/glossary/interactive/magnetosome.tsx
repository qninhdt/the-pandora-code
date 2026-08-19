"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Magnetosome chain rotates with the field; keeps orientation when field drops.
export default function Magnetosome() {
  const t = useTranslations("viz.magnetosome");
  const [on, setOn] = useState(true);
  const angle = on ? 55 : 20;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOn(true)}
      allowFullscreen={false}
      caption={<span className={on ? "text-cyan" : "text-muted"}>{on ? t("fieldOn") : t("fieldOff")}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <ellipse cx="50" cy="50" rx="24" ry="14" fill="var(--surface)" stroke="var(--teal)" strokeWidth="0.8"
            transform={`rotate(${angle} 50 50)`} />
          {[-15, -9, -3, 3, 9, 15].map((d) => (
            <circle key={d} cx={50 + d * Math.cos((angle * Math.PI) / 180)} cy={50 + d * Math.sin((angle * Math.PI) / 180)}
              r="2.4" fill="var(--amber)" />
          ))}
          {on && (
            <line x1="20" y1="22" x2="80" y2="22" stroke="var(--cyan)" strokeWidth="0.6" strokeDasharray="2 2" />
          )}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("chain")} value={`${angle}°`} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          <button type="button" onClick={() => setOn(true)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: on ? "var(--cyan)" : "var(--border-strong)", color: on ? "var(--cyan)" : "var(--muted)", background: "var(--void)" }}>{t("fieldOn")}</button>
          <button type="button" onClick={() => setOn(false)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: !on ? "var(--muted)" : "var(--border-strong)", color: !on ? "var(--muted)" : "var(--muted)", background: "var(--void)" }}>{t("fieldOff")}</button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
