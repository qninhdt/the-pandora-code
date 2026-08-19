"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Opposite flows keep the gradient steep end-to-end — max transfer.
export default function CountercurrentExchange() {
  const t = useTranslations("viz.countercurrent-exchange");
  const [counter, setCounter] = useState(true);
  const transfer = counter ? 0.92 : 0.5;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCounter(true)}
      allowFullscreen={false}
      caption={
        <span className={counter ? "text-teal" : "text-amber"}>
          {counter ? t("counter") : t("concurrent")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <line x1="18" y1="40" x2="82" y2="40" stroke="var(--cyan)" strokeWidth="2" />
          <line
            x1={counter ? 82 : 18}
            y1="56"
            x2={counter ? 18 : 82}
            y2="56"
            stroke="var(--magenta)"
            strokeWidth="2"
          />
          {/* gradient ticks */}
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={i}
              x1={22 + i * 12}
              y1="40"
              x2={22 + i * 12}
              y2="56"
              stroke="var(--amber)"
              strokeWidth="0.5"
              opacity={counter ? 0.35 + i * 0.08 : 0.7 - i * 0.1}
            />
          ))}
          <path d="M18 40 l6 -3 l0 6 z" fill="var(--cyan)" />
          <path d={counter ? "M18 56 l6 -3 l0 6 z" : "M82 56 l-6 -3 l0 6 z"} fill="var(--magenta)" />
          <rect x="20" y="78" width={transfer * 60} height="5" fill="var(--teal)" opacity="0.85" />
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("transfer")} value={`${(transfer * 100).toFixed(0)}%`} accent="teal" />
          <Readout label={t("gradient")} value={counter ? "steep" : "flat"} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          <button type="button" onClick={() => setCounter(true)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: counter ? "var(--teal)" : "var(--border-strong)", color: counter ? "var(--teal)" : "var(--muted)", background: "var(--void)" }}>{t("counter")}</button>
          <button type="button" onClick={() => setCounter(false)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: !counter ? "var(--amber)" : "var(--border-strong)", color: !counter ? "var(--amber)" : "var(--muted)", background: "var(--void)" }}>{t("concurrent")}</button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
