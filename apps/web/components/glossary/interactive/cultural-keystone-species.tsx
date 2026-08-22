"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// One species threaded through a whole culture. Remove it and the loss is not
// only material: the words, the crafts and the calendar lose what they attached to.
type Layer = "material" | "language" | "ceremony";

const LAYERS: Layer[] = ["material", "language", "ceremony"];
const TONE: Record<Layer, string> = {
  material: "var(--teal)",
  language: "var(--cyan)",
  ceremony: "var(--amber)",
};

export default function CulturalKeystoneSpecies() {
  const t = useTranslations("viz.cultural-keystone-species");
  const [present, setPresent] = useState(true);

  const tone = present ? "var(--cyan)" : "var(--magenta)";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPresent(true)}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{present ? t("verdictPresent") : t("verdictGone")}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 78" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* the species at the centre, or its absence */}
          {present ? (
            <g>
              <line x1="50" y1="52" x2="50" y2="28" stroke={tone} strokeWidth="2.6" strokeLinecap="round" opacity={0.9}
                style={{ filter: `drop-shadow(0 0 4px ${tone})` }} />
              <ellipse cx="50" cy="26" rx="9" ry="5" fill={tone} opacity={0.32} />
            </g>
          ) : (
            <path d="M46 52 L47 47 L53 47 L54 52 Z" fill="var(--muted)" opacity={0.55} />
          )}
          <line x1="14" y1="52" x2="86" y2="52" stroke="var(--border-strong)" strokeWidth="0.5" opacity={0.6} />

          {/* the three cultural layers hanging off it */}
          {LAYERS.map((layer, i) => {
            const y = 20 + i * 11;
            const x = i % 2 === 0 ? 20 : 72;
            const lt = TONE[layer];
            return (
              <g key={layer} opacity={present ? 1 : 0.3}>
                <circle cx={x} cy={y} r="4.2" fill={lt} opacity={present ? 0.75 : 0.2} />
                <line
                  x1={x + (i % 2 === 0 ? 4.5 : -4.5)}
                  y1={y}
                  x2={50 + (i % 2 === 0 ? -3 : 3)}
                  y2={30 + i * 5}
                  stroke={present ? lt : "var(--magenta)"}
                  strokeWidth="0.5"
                  strokeDasharray={present ? undefined : "1.5 1.5"}
                  opacity={present ? 0.7 : 0.5}
                />
                <text
                  x={i % 2 === 0 ? x : x}
                  y={y + 9}
                  textAnchor="middle"
                  style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
                >
                  {t(`layers.${layer}`)}
                </text>
              </g>
            );
          })}
          <text x="50" y="70" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>{t("axis")}</text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("intact")} value={present ? `3/3` : `0/3`} accent={present ? "cyan" : "magenta"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlTabs
            options={[
              { value: "yes", label: t("modes.present") },
              { value: "no", label: t("modes.gone") },
            ]}
            value={present ? "yes" : "no"}
            onChange={(v) => setPresent(v === "yes")}
            ariaLabel={t("title")}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
