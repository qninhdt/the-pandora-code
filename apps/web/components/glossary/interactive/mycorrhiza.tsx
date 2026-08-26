"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Trade-balance scale: plant C vs fungus P/N; soil P tips the deal.
export default function Mycorrhiza() {
  const t = useTranslations("viz.mycorrhiza");
  const [soilP, setSoilP] = useState(0.35);
  // Low soil P → plant pays more C for fungal nutrients; high P → plant skimps
  const fungusOffer = 0.85 - soilP * 0.6;
  const plantC = 0.3 + (1 - soilP) * 0.55;
  const balance = plantC - fungusOffer; // ~0 fair
  const fair = Math.abs(balance) < 0.12;
  // scale tilt in degrees
  const tilt = Math.max(-18, Math.min(18, balance * 40));

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSoilP(0.35)}
      allowFullscreen={false}
      caption={
        <span className={fair ? "text-teal" : "text-amber"}>{fair ? t("fair") : t("skew")}</span>
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
          {/* plant root left */}
          <rect x="14" y="20" width="4" height="36" fill="var(--cyan)" opacity={0.45} />
          <ellipse cx="16" cy="18" rx="10" ry="7" fill="var(--teal)" opacity={0.45} />
          <path d="M16 56 C 20 64, 28 68, 36 66" fill="none" stroke="var(--cyan)" strokeWidth="1" />
          {/* fungus right */}
          <g stroke="var(--magenta)" strokeWidth="0.8" fill="none" opacity={0.8}>
            <path d="M84 70 C 76 60, 70 50, 64 48" />
            <path d="M84 70 C 78 72, 70 74, 62 70" />
            <path d="M84 70 C 80 56, 74 44, 68 40" />
          </g>
          <circle cx="84" cy="72" r="4" fill="var(--magenta)" opacity={0.55} />
          {/* balance fulcrum */}
          <polygon points="50,70 46,78 54,78" fill="var(--border-strong)" />
          <g transform={`rotate(${tilt} 50 68)`}>
            <line x1="28" y1="68" x2="72" y2="68" stroke="var(--amber)" strokeWidth="1.4" />
            {/* left pan — plant C */}
            <rect
              x="24"
              y="58"
              width="14"
              height="8"
              fill="var(--cyan)"
              opacity={0.35 + plantC * 0.5}
              rx="1"
            />
            <text
              x="31"
              y="64"
              textAnchor="middle"
              style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--cyan)" }}
            >
              C
            </text>
            {/* right pan — fungus nutrients */}
            <rect
              x="62"
              y="58"
              width="14"
              height="8"
              fill="var(--magenta)"
              opacity={0.35 + fungusOffer * 0.5}
              rx="1"
            />
            <text
              x="69"
              y="64"
              textAnchor="middle"
              style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--magenta)" }}
            >
              P/N
            </text>
          </g>
          <text
            x="31"
            y="88"
            textAnchor="middle"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("carbon")}
          </text>
          <text
            x="69"
            y="88"
            textAnchor="middle"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("fungus")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("balance")}
            value={fair ? t("fair") : t("skew")}
            accent={fair ? "teal" : "amber"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("soilP")}
            value={soilP}
            min={0}
            max={1}
            step={0.01}
            display={`${Math.round(soilP * 100)}%`}
            onChange={setSoilP}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
