"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Two chains explain the same fact. Count the assumption links; cut the waste.
// Occam does not crown truth — it assigns the burden of proof to extra miracles.
const LEAN = 3;
const BLOATED = 7;

export default function OccamsRazor() {
  const t = useTranslations("viz.occams-razor");
  const [cut, setCut] = useState(false);
  const bloatedLen = cut ? LEAN + 1 : BLOATED;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCut(false)}
      allowFullscreen={false}
      caption={
        <span className={cut ? "text-teal" : "text-muted"}>
          {cut ? t("lean") : t("bloated")}
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
          {/* lean chain — left */}
          <text
            x="28"
            y="22"
            textAnchor="middle"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            {t("lean")}
          </text>
          {Array.from({ length: LEAN }, (_, i) => {
            const y = 32 + i * 14;
            return (
              <g key={`l-${i}`}>
                <circle cx="28" cy={y} r="4" fill="var(--teal)" opacity="0.85" />
                {i < LEAN - 1 && (
                  <line
                    x1="28"
                    y1={y + 4}
                    x2="28"
                    y2={y + 10}
                    stroke="var(--teal)"
                    strokeWidth="1.2"
                  />
                )}
              </g>
            );
          })}

          {/* bloated chain — right */}
          <text
            x="72"
            y="22"
            textAnchor="middle"
            style={{
              fontSize: 2.6,
              fontFamily: "monospace",
              fill: cut ? "var(--muted)" : "var(--magenta)",
            }}
          >
            {t("bloated")}
          </text>
          {Array.from({ length: bloatedLen }, (_, i) => {
            const y = 30 + i * (cut ? 12 : 8);
            const extra = i >= LEAN;
            return (
              <g key={`b-${i}`}>
                <circle
                  cx="72"
                  cy={y}
                  r={extra ? 3.2 : 4}
                  fill={extra ? "var(--magenta)" : "var(--cyan)"}
                  opacity={extra && cut ? 0.25 : 0.85}
                />
                {i < bloatedLen - 1 && (
                  <line
                    x1="72"
                    y1={y + (extra ? 3.2 : 4)}
                    x2="72"
                    y2={y + (cut ? 9 : 5)}
                    stroke={extra ? "var(--magenta)" : "var(--cyan)"}
                    strokeWidth="1"
                    opacity={extra && cut ? 0.25 : 0.8}
                  />
                )}
              </g>
            );
          })}

          {/* razor beam */}
          {cut && (
            <line
              x1="48"
              y1="18"
              x2="48"
              y2="88"
              stroke="var(--cyan)"
              strokeWidth="0.7"
              strokeDasharray="2 2"
              opacity="0.7"
            />
          )}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col gap-1">
          <Readout label={t("lean")} value={LEAN} accent="teal" />
          <Readout
            label={t("assumptions")}
            value={bloatedLen}
            accent={cut ? "cyan" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setCut((c) => !c)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md"
            style={{
              borderColor: cut ? "var(--teal)" : "var(--magenta)",
              color: cut ? "var(--teal)" : "var(--magenta)",
              background: "var(--void)",
            }}
          >
            {cut ? t("restore") : t("cut")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
