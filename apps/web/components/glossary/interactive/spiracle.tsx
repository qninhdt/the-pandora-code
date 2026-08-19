"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Insect side doors — open for O₂ in / CO₂ out along tracheae.
export default function Spiracle() {
  const t = useTranslations("viz.spiracle");
  const [open, setOpen] = useState(true);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOpen(true)}
      allowFullscreen={false}
      caption={<span className={open ? "text-cyan" : "text-muted"}>{open ? t("open") : t("closed")}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <ellipse cx="50" cy="50" rx="28" ry="18" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.8" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <ellipse cx="78" cy={38 + i * 8} rx={open ? 3 : 1} ry="2.5" fill={open ? "var(--cyan)" : "var(--void)"} stroke="var(--teal)" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="75" y2={38 + i * 8} stroke="var(--teal)" strokeWidth="0.6" opacity={open ? 0.7 : 0.25} />
            </g>
          ))}
          {open && (
            <>
              <text x="20" y="40" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--cyan)" }}>{t("o2")}</text>
              <text x="20" y="62" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--amber)" }}>{t("co2")}</text>
            </>
          )}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("o2")} value={open ? "on" : "off"} accent={open ? "cyan" : "foreground"} />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: open ? "var(--cyan)" : "var(--border-strong)", color: open ? "var(--cyan)" : "var(--muted)", background: "var(--void)" }}>{t("open")}</button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: !open ? "var(--muted)" : "var(--border-strong)", color: !open ? "var(--muted)" : "var(--muted)", background: "var(--void)" }}>{t("closed")}</button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
