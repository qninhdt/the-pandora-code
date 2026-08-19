"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Root-cell cross-section: arbuscules branch inside when symbiosis is on.
export default function ArbuscularMycorrhiza() {
  const t = useTranslations("viz.arbuscular-mycorrhiza");
  const [linked, setLinked] = useState(true);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setLinked(true)}
      allowFullscreen={false}
      caption={
        <span className={linked ? "text-teal" : "text-magenta"}>
          {linked ? t("on") : t("off")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* root cell wall */}
          <ellipse cx="50" cy="48" rx="28" ry="22" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="1.2" opacity={0.85} />
          <ellipse cx="50" cy="48" rx="22" ry="16" fill="none" stroke="var(--border-strong)" strokeWidth="0.5" strokeDasharray="2 1.5" />
          {/* nucleus */}
          <circle cx="58" cy="44" r="4" fill="var(--amber)" opacity={0.55} />
          {/* fungal entry hypha */}
          <path d="M8 70 C 22 66, 30 60, 36 54" fill="none" stroke="var(--teal)" strokeWidth="1.4" opacity={linked ? 0.9 : 0.25} />
          {/* arbuscule tree inside cell */}
          {linked && (
            <g stroke="var(--teal)" strokeWidth="0.9" fill="none" opacity={0.95}>
              <path d="M36 54 L48 50" />
              <path d="M48 50 L44 40" />
              <path d="M48 50 L56 42" />
              <path d="M48 50 L52 58" />
              <path d="M44 40 L40 34" />
              <path d="M44 40 L48 34" />
              <path d="M56 42 L60 36" />
              <path d="M56 42 L62 44" />
              <path d="M52 58 L48 64" />
              <path d="M52 58 L58 62" />
              {[
                [40, 34],
                [48, 34],
                [60, 36],
                [62, 44],
                [48, 64],
                [58, 62],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.4" fill="var(--teal)" stroke="none" />
              ))}
            </g>
          )}
          {/* exchange arrows */}
          {linked && (
            <g style={{ fontSize: 2.4, fontFamily: "monospace" }}>
              <path d="M70 38 L82 30" stroke="var(--amber)" strokeWidth="0.8" markerEnd="url(#am-p)" />
              <text x="84" y="30" fill="var(--amber)">
                {t("phosphorus")}
              </text>
              <path d="M70 58 L82 66" stroke="var(--cyan)" strokeWidth="0.8" />
              <text x="84" y="68" fill="var(--cyan)">
                {t("carbon")}
              </text>
            </g>
          )}
          <defs>
            <marker id="am-p" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
              <path d="M0 0 L4 2 L0 4 Z" fill="var(--amber)" />
            </marker>
          </defs>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("exchange")} value={linked ? t("on") : t("off")} accent={linked ? "teal" : "magenta"} />
        </div>
        <div className="absolute inset-x-3 bottom-10 flex justify-center">
          <ControlButton variant={linked ? "active" : "default"} onClick={() => setLinked((v) => !v)} aria-label={t("symbiosis")}>
            <span className="px-1 text-[11px] uppercase tracking-wider">{t("symbiosis")}</span>
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
