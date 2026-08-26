"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Fungal mantle + Hartig net between cells (never intracellular).
export default function Ectomycorrhiza() {
  const t = useTranslations("viz.ectomycorrhiza");
  const [showContrast, setShowContrast] = useState(false);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setShowContrast(false)}
      allowFullscreen={false}
      caption={
        <span className={showContrast ? "text-amber" : "text-teal"}>
          {showContrast ? t("contrast") : t("mantle")}
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
          {/* root tip */}
          <path
            d="M40 20 L40 62 Q40 78 50 82 Q60 78 60 62 L60 20"
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="1"
          />
          {/* cortical cells */}
          {[0, 1, 2, 3].map((row) =>
            [0, 1].map((col) => {
              const x = 44 + col * 8;
              const y = 28 + row * 10;
              return (
                <rect
                  key={`${row}-${col}`}
                  x={x}
                  y={y}
                  width="6.5"
                  height="8"
                  fill="var(--void)"
                  stroke="var(--border-strong)"
                  strokeWidth="0.4"
                  rx="0.6"
                />
              );
            }),
          )}
          {/* fungal mantle sheath outside */}
          <path
            d="M36 22 L36 64 Q36 84 50 88 Q64 84 64 64 L64 22"
            fill="none"
            stroke="var(--teal)"
            strokeWidth="2.4"
            opacity={0.75}
          />
          <text
            x="72"
            y="40"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            {t("mantle")}
          </text>
          {/* Hartig net between cells */}
          <g stroke="var(--magenta)" strokeWidth="0.7" opacity={0.85}>
            <line x1="47.2" y1="28" x2="47.2" y2="68" />
            <line x1="55.2" y1="28" x2="55.2" y2="68" />
            {[0, 1, 2, 3].map((row) => (
              <line key={row} x1="44" y1={32 + row * 10} x2="58.5" y2={32 + row * 10} />
            ))}
          </g>
          <text
            x="22"
            y="52"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--magenta)" }}
          >
            {t("hartig")}
          </text>
          {/* exchange at sheath */}
          <g>
            <path d="M64 50 L76 44" stroke="var(--amber)" strokeWidth="0.8" />
            <path d="M64 56 L76 62" stroke="var(--cyan)" strokeWidth="0.8" />
            <text
              x="78"
              y="45"
              style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--amber)" }}
            >
              N/P
            </text>
            <text
              x="78"
              y="64"
              style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--cyan)" }}
            >
              C
            </text>
          </g>
          {/* contrast: faint arbuscule ghost */}
          {showContrast && (
            <g opacity={0.55} stroke="var(--amber)" strokeWidth="0.6" fill="none">
              <path d="M50 48 L46 40 L50 36 L54 40 Z" />
              <path d="M50 48 L48 56 L52 56 Z" />
              <text
                x="50"
                y="72"
                textAnchor="middle"
                style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--amber)" }}
              >
                {t("contrast")}
              </text>
            </g>
          )}
        </svg>
        <div className="absolute left-3 top-14">
          <Readout label={t("sheath")} value={t("exchange")} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10 flex justify-center">
          <ControlButton
            variant={showContrast ? "active" : "default"}
            onClick={() => setShowContrast((v) => !v)}
            aria-label={t("contrast")}
          >
            <span className="px-1 text-[11px] uppercase tracking-wider">{t("contrast")}</span>
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
