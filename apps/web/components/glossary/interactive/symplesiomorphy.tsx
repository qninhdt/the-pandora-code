"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Shared ancestral trait used (wrongly) to group. Light the old mark on every tip
// and draw a false bracket — it collapses into paraphyly, not a clade.
const TIPS = [20, 36, 52, 68, 84];

export default function Symplesiomorphy() {
  const t = useTranslations("viz.symplesiomorphy");
  const [group, setGroup] = useState(false);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setGroup(false)}
      allowFullscreen={false}
      caption={
        <span className={group ? "text-magenta" : "text-muted"}>
          {group ? t("trap") : t("hint")}
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
          <line x1="52" y1="84" x2="52" y2="70" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="20" y1="70" x2="84" y2="70" stroke="var(--border-strong)" strokeWidth="1" />
          {TIPS.map((x) => (
            <line
              key={`s-${x}`}
              x1={x}
              y1="70"
              x2={x}
              y2="34"
              stroke="var(--border-strong)"
              strokeWidth="1"
            />
          ))}

          {group && (
            <path
              d="M16 24 H88 Q92 24 92 28 V40 Q92 44 88 44 H16 Q12 44 12 40 V28 Q12 24 16 24 Z"
              fill="none"
              stroke="var(--magenta)"
              strokeWidth="0.8"
              strokeDasharray="2 1.5"
              opacity="0.75"
            />
          )}

          {TIPS.map((x, i) => (
            <g key={x}>
              <circle
                cx={x}
                cy="34"
                r="2.8"
                fill="var(--surface)"
                stroke="var(--border-strong)"
                strokeWidth="0.5"
              />
              {/* ancestral mark on all */}
              <rect
                x={x - 2.2}
                y="26"
                width="4.4"
                height="2.6"
                rx="0.4"
                fill="var(--teal)"
                opacity={group ? 0.9 : 0.45}
              />
              <text
                x={x}
                y="18"
                textAnchor="middle"
                style={{
                  fontSize: 2.4,
                  fontFamily: "monospace",
                  fill: group ? "var(--magenta)" : "var(--muted)",
                }}
              >
                {String.fromCharCode(65 + i)}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={group ? t("falseGroup") : t("sharedAncestral")}
            value={group ? t("trap") : "5/5"}
            accent={group ? "magenta" : "teal"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setGroup((g) => !g)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md"
            style={{
              borderColor: group ? "var(--magenta)" : "var(--border-strong)",
              color: group ? "var(--magenta)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("hint")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
