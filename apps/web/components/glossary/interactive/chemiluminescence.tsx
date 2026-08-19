"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Same electronic jump; enzyme path runs cooler than naked chemistry.
export default function Chemiluminescence() {
  const t = useTranslations("viz.chemiluminescence");
  const [mode, setMode] = useState<"bio" | "chem">("bio");
  const heat = mode === "bio" ? 12 : 64;
  const light = mode === "bio" ? 88 : 70;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("bio")}
      allowFullscreen={false}
      caption={<span className={mode === "bio" ? "text-teal" : "text-amber"}>{mode === "bio" ? t("bio") : t("chem")}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <circle cx="35" cy="45" r="16" fill="var(--teal)" opacity={mode === "bio" ? 0.55 : 0.2} style={mode === "bio" ? { filter: "drop-shadow(0 0 8px var(--teal))" } : undefined} />
          <circle cx="65" cy="45" r="16" fill="var(--amber)" opacity={mode === "chem" ? 0.55 : 0.2} />
          <text x="35" y="72" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--teal)" }}>{t("bio")}</text>
          <text x="65" y="72" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--amber)" }}>{t("chem")}</text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("light")} value={`${light}%`} accent="teal" />
          <Readout label={t("heat")} value={`${heat}%`} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {(["bio", "chem"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
              style={{ borderColor: mode === m ? (m === "bio" ? "var(--teal)" : "var(--amber)") : "var(--border-strong)", color: mode === m ? (m === "bio" ? "var(--teal)" : "var(--amber)") : "var(--muted)", background: "var(--void)" }}>
              {t(m)}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
