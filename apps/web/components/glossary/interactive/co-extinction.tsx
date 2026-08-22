"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The shape of the loss depends on how fussy the dependent is. A strict obligate
// tracks its host one-to-one; a generalist hangs on until the network collapses.
export default function CoExtinction() {
  const t = useTranslations("viz.co-extinction");
  const [hostsLost, setHostsLost] = useState(0.5);

  const obligate = 1 - hostsLost; // straight line
  const generalist = Math.max(0, 1 - hostsLost ** 4); // curved, late collapse
  const tone = hostsLost > 0.7 ? "var(--magenta)" : "var(--cyan)";

  const px = (f: number) => 16 + f * 68;
  const py = (f: number) => 54 - f * 34;

  const genPath = Array.from({ length: 41 }, (_, i) => {
    const x = i / 40;
    return `${i === 0 ? "M" : "L"}${px(x).toFixed(1)},${py(Math.max(0, 1 - x ** 4)).toFixed(1)}`;
  }).join(" ");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setHostsLost(0.5)}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{t("verdict", { obligate: Math.round(obligate * 100), generalist: Math.round(generalist * 100) })}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 78" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <line x1="16" y1="54" x2="86" y2="54" stroke="var(--border-strong)" strokeWidth="0.4" opacity={0.6} />
          <line x1="16" y1="18" x2="16" y2="54" stroke="var(--border-strong)" strokeWidth="0.4" opacity={0.6} />

          {/* obligate: one-to-one */}
          <line x1={px(0)} y1={py(1)} x2={px(1)} y2={py(0)} stroke="var(--magenta)" strokeWidth="1.1" opacity={0.9} />
          {/* generalist: curved, persists then falls */}
          <path d={genPath} fill="none" stroke="var(--teal)" strokeWidth="1.1" opacity={0.9} />

          <line x1={px(hostsLost)} y1="16" x2={px(hostsLost)} y2="56" stroke="var(--amber)" strokeWidth="0.5" strokeDasharray="2 1.5" opacity={0.8} />
          <circle cx={px(hostsLost)} cy={py(obligate)} r="1.8" fill="var(--magenta)" style={{ filter: "drop-shadow(0 0 3px var(--magenta))" }} />
          <circle cx={px(hostsLost)} cy={py(generalist)} r="1.8" fill="var(--teal)" style={{ filter: "drop-shadow(0 0 3px var(--teal))" }} />

          <text x="50" y="66" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>{t("axis")}</text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("obligate")} value={`${Math.round(obligate * 100)}%`} accent="magenta" />
          <Readout label={t("generalist")} value={`${Math.round(generalist * 100)}%`} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("hostsLost")}
            value={hostsLost}
            min={0}
            max={1}
            step={0.01}
            onChange={setHostsLost}
            display={`${Math.round(hostsLost * 100)}%`}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
