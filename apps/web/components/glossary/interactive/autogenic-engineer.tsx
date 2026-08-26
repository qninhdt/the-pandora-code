"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Its own body is the change. Grow the organism and the habitat appears with it —
// nothing was assembled, nothing was carried, the tissue simply accumulated.
export default function AutogenicEngineer() {
  const t = useTranslations("viz.autogenic-engineer");
  const [stage, setStage] = useState<"young" | "mature" | "old">("old");

  const size = stage === "young" ? 0.25 : stage === "mature" ? 0.6 : 1;
  const tenants = stage === "young" ? 0 : stage === "mature" ? 3 : 9;
  const tone =
    stage === "old" ? "var(--cyan)" : stage === "mature" ? "var(--teal)" : "var(--muted)";

  const h = 8 + size * 30;
  const spread = 6 + size * 16;

  const spots = [
    [-0.7, 0.25],
    [0.75, 0.4],
    [0.4, 0.1],
    [-0.4, 0.55],
    [0.6, 0.7],
    [-0.85, 0.6],
    [0.15, 0.3],
    [-0.2, 0.75],
    [0.9, 0.2],
  ];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setStage("old")}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{t(`verdict.${stage}`)}</span>}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 78"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <line
            x1="10"
            y1="56"
            x2="90"
            y2="56"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            opacity={0.6}
          />
          <ellipse cx="50" cy="56" rx={spread * 0.8} ry="2.4" fill={tone} opacity={0.18} />
          <line
            x1="50"
            y1="56"
            x2="50"
            y2={56 - h}
            stroke={tone}
            strokeWidth={1 + size * 2.4}
            strokeLinecap="round"
            opacity={0.9}
            style={{ filter: `drop-shadow(0 0 ${2 + size * 4}px ${tone})` }}
          />
          {/* crown widens with age, so the habitat it constitutes widens too */}
          <path
            d={`M${50 - spread} ${56 - h + 6} Q50 ${56 - h - 6} ${50 + spread} ${56 - h + 6}`}
            fill="none"
            stroke={tone}
            strokeWidth={0.8 + size}
            opacity={0.7}
          />
          {spots.slice(0, tenants).map(([fx, fy], i) => (
            <circle
              key={i}
              cx={50 + fx * spread}
              cy={56 - h * (0.3 + fy * 0.6)}
              r="1.6"
              fill="var(--amber)"
              opacity={0.85}
              style={{ filter: "drop-shadow(0 0 2px var(--amber))" }}
            />
          ))}
          <text
            x="50"
            y="70"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("tenants")}
            value={tenants}
            accent={stage === "old" ? "cyan" : stage === "mature" ? "teal" : "cyan"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlTabs
            options={[
              { value: "young", label: t("stages.young") },
              { value: "mature", label: t("stages.mature") },
              { value: "old", label: t("stages.old") },
            ]}
            value={stage}
            onChange={setStage}
            ariaLabel={t("title")}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
