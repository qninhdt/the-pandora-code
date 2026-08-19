"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Three geometries ranked: concurrent < cross < countercurrent.
const MODES = [
  { key: "concurrent" as const, eff: 0.5 },
  { key: "cross" as const, eff: 0.72 },
  { key: "counter" as const, eff: 0.9 },
];

export default function CrossCurrentExchange() {
  const t = useTranslations("viz.cross-current-exchange");
  const [idx, setIdx] = useState(1);
  const m = MODES[idx];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setIdx(1)}
      allowFullscreen={false}
      caption={<span className="text-cyan">{t(m.key)} · {(m.eff * 100).toFixed(0)}%</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {[0, 1, 2].map((i) => (
            <line key={`a-${i}`} x1="20" y1={34 + i * 10} x2="80" y2={34 + i * 10} stroke="var(--cyan)" strokeWidth="1.1" />
          ))}
          {idx === 0 &&
            [0, 1, 2].map((i) => (
              <line key={`b-${i}`} x1="20" y1={38 + i * 10} x2="80" y2={38 + i * 10} stroke="var(--magenta)" strokeWidth="0.9" />
            ))}
          {idx === 1 &&
            [0, 1, 2, 3].map((i) => (
              <line key={`c-${i}`} x1={30 + i * 12} y1="30" x2={30 + i * 12} y2="64" stroke="var(--magenta)" strokeWidth="0.9" />
            ))}
          {idx === 2 &&
            [0, 1, 2].map((i) => (
              <line key={`d-${i}`} x1="80" y1={38 + i * 10} x2="20" y2={38 + i * 10} stroke="var(--magenta)" strokeWidth="0.9" />
            ))}
          <rect x="20" y="78" width={m.eff * 60} height="5" fill="var(--teal)" opacity="0.85" />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("efficiency")} value={`${(m.eff * 100).toFixed(0)}%`} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {MODES.map((mode, i) => (
            <button key={mode.key} type="button" onClick={() => setIdx(i)} className="rounded-lg border px-2.5 py-1 font-mono text-[10px] uppercase"
              style={{ borderColor: idx === i ? "var(--cyan)" : "var(--border-strong)", color: idx === i ? "var(--cyan)" : "var(--muted)", background: "var(--void)" }}>
              {t(mode.key)}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
