"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Wood-wide web: inject C at hub, flow reaches seedlings via fungal links.
export default function CommonMycorrhizalNetwork() {
  const t = useTranslations("viz.common-mycorrhizal-network");
  const [inject, setInject] = useState(0.55);
  const [pulse, setPulse] = useState(0);

  const flow = useMemo(() => Math.min(1, inject * 1.1 + pulse * 0.15), [inject, pulse]);

  const seedlings = [
    { x: 22, y: 42, share: 0.7 },
    { x: 38, y: 36, share: 0.45 },
    { x: 70, y: 40, share: 0.85 },
    { x: 84, y: 48, share: 0.35 },
  ];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setInject(0.55);
        setPulse(0);
      }}
      allowFullscreen={false}
      caption={
        <span className="text-teal">
          {t("flow")} {Math.round(flow * 100)}%
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* soil band */}
          <rect x="4" y="58" width="92" height="30" fill="var(--surface)" opacity={0.55} />
          {/* hub tree */}
          <rect x="48" y="28" width="4" height="32" fill="var(--cyan)" opacity={0.55} />
          <ellipse cx="50" cy="26" rx="12" ry="8" fill="var(--teal)" opacity={0.5 + inject * 0.4} style={{ filter: "drop-shadow(0 0 6px var(--teal))" }} />
          <text x="50" y="22" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--teal)" }}>
            {t("hub")}
          </text>
          {/* fungal web underground */}
          <g stroke="var(--magenta)" strokeWidth="0.7" fill="none" opacity={0.35 + flow * 0.55}>
            <path d="M50 62 C 40 68, 30 70, 22 66" />
            <path d="M50 62 C 44 72, 38 74, 38 70" />
            <path d="M50 62 C 60 70, 72 68, 70 64" />
            <path d="M50 62 C 66 74, 80 76, 84 70" />
            <path d="M22 66 C 30 78, 50 80, 70 64" />
            <path d="M38 70 C 50 78, 70 76, 84 70" />
          </g>
          {/* carbon packets along links */}
          {flow > 0.15 &&
            seedlings.map((s, i) => {
              const tPos = (0.25 + i * 0.12 + pulse * 0.08) % 1;
              const x = 50 + (s.x - 50) * tPos;
              const y = 62 + (68 - 62) * tPos + Math.sin(i + pulse) * 2;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={1.2 + flow}
                  fill="var(--amber)"
                  opacity={0.5 + flow * 0.5}
                />
              );
            })}
          {/* seedlings */}
          {seedlings.map((s, i) => {
            const fed = flow * s.share;
            return (
              <g key={i}>
                <rect x={s.x - 0.8} y={s.y} width="1.6" height={16} fill="var(--cyan)" opacity={0.35 + fed * 0.5} />
                <ellipse
                  cx={s.x}
                  cy={s.y}
                  rx={3 + fed * 3}
                  ry={2.2 + fed * 2}
                  fill="var(--teal)"
                  opacity={0.3 + fed * 0.6}
                />
                <circle cx={s.x} cy="68" r="1.5" fill="var(--magenta)" opacity={0.4 + fed * 0.5} />
              </g>
            );
          })}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("network")} value={`${Math.round(flow * 100)}%`} accent="magenta" />
        </div>
        <div className="absolute inset-x-3 bottom-10 space-y-2">
          <ControlSlider label={t("inject")} value={inject} min={0} max={1} step={0.01} display={`${Math.round(inject * 100)}%`} onChange={setInject} thumb="amber" />
          <div className="flex justify-center">
            <ControlButton
              variant="accent"
              onClick={() => setPulse((p) => p + 1)}
              aria-label={t("inject")}
            >
              <span className="px-1 text-[11px] uppercase tracking-wider">{t("inject")}</span>
            </ControlButton>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}
