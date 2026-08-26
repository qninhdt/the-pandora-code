"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Two compasses: cryptochrome eye + magnetite beak. Accuracy stacks.
export default function Magnetoreception() {
  const t = useTranslations("viz.magnetoreception");
  const [crypto, setCrypto] = useState(true);
  const [beak, setBeak] = useState(true);
  const accuracy = (crypto ? 45 : 0) + (beak ? 40 : 0) + (crypto && beak ? 15 : 0);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setCrypto(true);
        setBeak(true);
      }}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("accuracy")}: {accuracy}%
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
          <ellipse
            cx="50"
            cy="50"
            rx="20"
            ry="16"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.8"
          />
          <circle
            cx="42"
            cy="46"
            r="5"
            fill={crypto ? "var(--cyan)" : "var(--void)"}
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            style={crypto ? { filter: "drop-shadow(0 0 5px var(--cyan))" } : undefined}
          />
          <circle
            cx="58"
            cy="46"
            r="5"
            fill={crypto ? "var(--cyan)" : "var(--void)"}
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            style={crypto ? { filter: "drop-shadow(0 0 5px var(--cyan))" } : undefined}
          />
          <ellipse
            cx="72"
            cy="52"
            rx="8"
            ry="4"
            fill={beak ? "var(--amber)" : "var(--void)"}
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          <rect x="20" y="78" width={accuracy * 0.6} height="5" fill="var(--teal)" opacity="0.85" />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("accuracy")} value={`${accuracy}%`} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setCrypto((v) => !v)}
            className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{
              borderColor: crypto ? "var(--cyan)" : "var(--border-strong)",
              color: crypto ? "var(--cyan)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("crypto")}
          </button>
          <button
            type="button"
            onClick={() => setBeak((v) => !v)}
            className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{
              borderColor: beak ? "var(--amber)" : "var(--border-strong)",
              color: beak ? "var(--amber)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("beak")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
