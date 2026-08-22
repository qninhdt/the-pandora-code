"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A fallen giant's second career. Seedlings root along its length in a line, and
// a century later that line is still legible as a colonnade of mature trunks.
export default function NurseLog() {
  const t = useTranslations("viz.nurse-log");
  const [years, setYears] = useState(120);

  const rotted = Math.min(1, years / 140);
  const height = years < 10 ? 0 : Math.min(1, (years - 10) / 130);
  const tone = years > 90 ? "var(--cyan)" : years > 25 ? "var(--teal)" : "var(--muted)";

  const xs = [26, 38, 50, 62, 74];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setYears(120)}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{years > 90 ? t("verdictColonnade") : years > 25 ? t("verdictRooting") : t("verdictLog")}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 78" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <line x1="8" y1="52" x2="92" y2="52" stroke="var(--border-strong)" strokeWidth="0.5" opacity={0.6} />

          {/* the log, softening and shrinking as it rots away beneath them */}
          <rect x="20" y={46 - (1 - rotted) * 1.5} width="60" height={4.5 * (1 - rotted * 0.85)} rx="2"
            fill="var(--muted)" opacity={0.55 * (1 - rotted * 0.6)} />
          {/* fungal threads working it */}
          {rotted > 0.15 &&
            [28, 44, 60, 72].map((x, i) => (
              <line key={i} x1={x} y1="50" x2={x + 2} y2="52" stroke="var(--teal)" strokeWidth="0.35" opacity={0.5} />
            ))}

          {/* seedlings in a straight line — the shape of the parent, still legible */}
          {xs.map((x, i) => {
            const h = height * (24 + (i % 2) * 4);
            if (h <= 0) return null;
            return (
              <g key={i}>
                <line x1={x} y1="46" x2={x} y2={46 - h} stroke={tone} strokeWidth={0.7 + height * 1.6} strokeLinecap="round" opacity={0.9}
                  style={{ filter: height > 0.5 ? `drop-shadow(0 0 3px ${tone})` : undefined }} />
                {height > 0.55 && <ellipse cx={x} cy={46 - h} rx={3 + height * 3} ry={2 + height * 2} fill={tone} opacity={0.28} />}
              </g>
            );
          })}

          <text x="50" y="70" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>{t("axis")}</text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("logRemaining")} value={`${Math.round((1 - rotted) * 100)}%`} accent="teal" />
          <Readout label={t("seedlings")} value={height > 0 ? xs.length : 0} accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("time")}
            value={years}
            min={0}
            max={200}
            step={5}
            onChange={setYears}
            display={t("yearsValue", { n: Math.round(years) })}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
