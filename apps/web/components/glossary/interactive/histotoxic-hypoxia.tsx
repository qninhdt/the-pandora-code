"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// O₂ arrives but mitochondria are blocked — unused oxygen piles up.
export default function HistotoxicHypoxia() {
  const t = useTranslations("viz.histotoxic-hypoxia");
  const [blocked, setBlocked] = useState(true);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setBlocked(true)}
      allowFullscreen={false}
      caption={
        <span className={blocked ? "text-magenta" : "text-teal"}>
          {blocked ? t("blocked") : t("normal")}
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
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <ellipse
                cx={30 + i * 22}
                cy="48"
                rx="10"
                ry="7"
                fill={blocked ? "var(--void)" : "var(--teal)"}
                stroke="var(--border-strong)"
                strokeWidth="0.7"
                opacity={blocked ? 0.9 : 0.7}
              />
              <text
                x={30 + i * 22}
                y="50"
                textAnchor="middle"
                style={{ fontSize: 2, fontFamily: "monospace", fill: "var(--muted)" }}
              >
                M
              </text>
            </g>
          ))}
          {blocked &&
            Array.from({ length: 10 }, (_, i) => (
              <circle
                key={i}
                cx={20 + (i % 5) * 14}
                cy={28 + Math.floor(i / 5) * 8}
                r="2"
                fill="var(--cyan)"
                opacity="0.7"
              />
            ))}
          <text
            x="50"
            y="78"
            textAnchor="middle"
            style={{
              fontSize: 2.3,
              fontFamily: "monospace",
              fill: blocked ? "var(--magenta)" : "var(--teal)",
            }}
          >
            {blocked ? t("unused") : t("mitochondria")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("mitochondria")}
            value={blocked ? t("blocked") : t("normal")}
            accent={blocked ? "magenta" : "teal"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setBlocked(false)}
            className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{
              borderColor: !blocked ? "var(--teal)" : "var(--border-strong)",
              color: !blocked ? "var(--teal)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("normal")}
          </button>
          <button
            type="button"
            onClick={() => setBlocked(true)}
            className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{
              borderColor: blocked ? "var(--magenta)" : "var(--border-strong)",
              color: blocked ? "var(--magenta)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("blocked")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
