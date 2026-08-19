"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Ancestor + some descendants, not all. Exclude the "bird" tip and reptiles
// go paraphyletic; toggle it back and the clade is whole again.
const TIPS = [
  { id: 0, x: 22, excludable: false },
  { id: 1, x: 40, excludable: false },
  { id: 2, x: 58, excludable: false },
  { id: 3, x: 76, excludable: true }, // the omitted descendant
];

export default function Paraphyly() {
  const t = useTranslations("viz.paraphyly");
  const [include, setInclude] = useState(false);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setInclude(false)}
      allowFullscreen={false}
      caption={
        <span className={include ? "text-cyan" : "text-magenta"}>
          {include ? t("mono") : t("para")}
          {!include && ` · ${t("missing")}`}
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
          <line x1="50" y1="84" x2="50" y2="68" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="22" y1="68" x2="76" y2="68" stroke="var(--border-strong)" strokeWidth="1" />
          {TIPS.map((tip) => {
            const lit = include || !tip.excludable;
            const col = lit
              ? include
                ? "var(--cyan)"
                : tip.excludable
                  ? "var(--muted)"
                  : "var(--magenta)"
              : "var(--muted)";
            return (
              <g key={tip.id}>
                <line
                  x1={tip.x}
                  y1="68"
                  x2={tip.x}
                  y2="32"
                  stroke={col}
                  strokeWidth={lit && !tip.excludable ? 1.4 : 1}
                  opacity={lit ? 0.95 : 0.35}
                  strokeDasharray={tip.excludable && !include ? "2 2" : undefined}
                />
                <circle
                  cx={tip.x}
                  cy="32"
                  r={tip.excludable ? 3.6 : 2.8}
                  fill={
                    tip.excludable
                      ? include
                        ? "var(--cyan)"
                        : "var(--surface)"
                      : include
                        ? "var(--cyan)"
                        : "var(--magenta)"
                  }
                  stroke="var(--border-strong)"
                  strokeWidth="0.5"
                  opacity={tip.excludable && !include ? 0.4 : 0.95}
                />
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={include ? t("mono") : t("para")}
            value={include ? "4/4" : "3/4"}
            accent={include ? "cyan" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setInclude((v) => !v)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md"
            style={{
              borderColor: include ? "var(--cyan)" : "var(--magenta)",
              color: include ? "var(--cyan)" : "var(--magenta)",
              background: "var(--void)",
            }}
          >
            {include ? t("exclude") : t("include")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
