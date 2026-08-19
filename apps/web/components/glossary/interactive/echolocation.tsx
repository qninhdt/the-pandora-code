"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Pulse out, echo home. Range from round-trip time.
export default function Echolocation() {
  const t = useTranslations("viz.echolocation");
  const [dist, setDist] = useState(12);
  const c = 343; // m/s air
  const rtt = (2 * dist) / c * 1000; // ms

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setDist(12)}
      allowFullscreen={false}
      caption={<span className="text-cyan">{t("echo")}: {rtt.toFixed(1)} ms</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          <circle cx="22" cy="48" r="5" fill="var(--teal)" />
          <circle cx="22" cy="48" r={10 + dist * 1.8} fill="none" stroke="var(--cyan)" strokeWidth="0.7" opacity="0.5" />
          <circle cx="22" cy="48" r={6 + dist} fill="none" stroke="var(--cyan)" strokeWidth="0.5" opacity="0.35" strokeDasharray="2 2" />
          <rect x={30 + dist * 2.2} y="40" width="8" height="16" fill="var(--amber)" opacity="0.85" />
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("range")} value={`${dist.toFixed(1)} m`} accent="cyan" />
          <Readout label={t("echo")} value={`${rtt.toFixed(1)} ms`} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider label={t("target")} value={dist} min={2} max={30} step={0.5} display={`${dist.toFixed(1)} m`} onChange={setDist} thumb="cyan" />
        </div>
      </div>
    </GlossaryFrame>
  );
}
