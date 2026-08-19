"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A clade is an ancestor plus every descendant. Click a node: the unbroken limb
// lights cyan. Toggle a non-monophyletic cut that leaves a tip out — truncated family.
const TIPS = [
  { id: 0, x: 18 },
  { id: 1, x: 36 },
  { id: 2, x: 54 },
  { id: 3, x: 72 },
  { id: 4, x: 90 },
];

const CUTS = [
  { id: "full", tips: [0, 1, 2, 3, 4], mono: true, node: { x: 54, y: 78 } },
  { id: "left", tips: [0, 1], mono: true, node: { x: 27, y: 54 } },
  { id: "mid", tips: [2, 3, 4], mono: true, node: { x: 72, y: 54 } },
  { id: "broken", tips: [0, 1, 2, 4], mono: false, node: { x: 54, y: 66 } },
] as const;

export default function Clade() {
  const t = useTranslations("viz.clade");
  const [cut, setCut] = useState(0);
  const active = CUTS[cut];
  const lit = new Set<number>(active.tips);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCut(0)}
      allowFullscreen={false}
      caption={
        <span className={active.mono ? "text-cyan" : "text-magenta"}>
          {active.mono ? t("complete") : t("truncated")}
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
          <line x1="54" y1="88" x2="54" y2="78" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="27" y1="78" x2="72" y2="78" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="27" y1="78" x2="27" y2="54" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="72" y1="78" x2="72" y2="54" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="18" y1="54" x2="36" y2="54" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="54" y1="54" x2="90" y2="54" stroke="var(--border-strong)" strokeWidth="1" />
          {TIPS.map((tip) => (
            <line
              key={`s-${tip.id}`}
              x1={tip.x}
              y1="54"
              x2={tip.x}
              y2="30"
              stroke={lit.has(tip.id) ? "var(--cyan)" : "var(--border-strong)"}
              strokeWidth={lit.has(tip.id) ? 1.5 : 1}
              opacity={lit.has(tip.id) ? 0.95 : 0.5}
            />
          ))}

          {/* active cut glow */}
          <circle
            cx={active.node.x}
            cy={active.node.y}
            r="5"
            fill="none"
            stroke={active.mono ? "var(--cyan)" : "var(--magenta)"}
            strokeWidth="0.7"
            opacity="0.7"
          />
          <circle
            cx={active.node.x}
            cy={active.node.y}
            r="2.5"
            fill={active.mono ? "var(--cyan)" : "var(--magenta)"}
          />

          {TIPS.map((tip) => {
            const on = lit.has(tip.id);
            return (
              <circle
                key={tip.id}
                cx={tip.x}
                cy="30"
                r={on ? 3.4 : 2.4}
                fill={on ? (active.mono ? "var(--cyan)" : "var(--magenta)") : "var(--surface)"}
                stroke="var(--border-strong)"
                strokeWidth="0.5"
                opacity={on ? 0.95 : 0.45}
              />
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={active.mono ? t("mono") : t("nonMono")}
            value={`${active.tips.length}/5`}
            accent={active.mono ? "cyan" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {CUTS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCut(i)}
              className="rounded-lg border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md transition-colors"
              style={{
                borderColor: cut === i ? (c.mono ? "var(--cyan)" : "var(--magenta)") : "var(--border-strong)",
                color: cut === i ? (c.mono ? "var(--cyan)" : "var(--magenta)") : "var(--muted)",
                background:
                  cut === i
                    ? `color-mix(in oklab, ${c.mono ? "var(--cyan)" : "var(--magenta)"} 12%, transparent)`
                    : "var(--void)",
              }}
            >
              {c.mono ? t("mono") : t("nonMono")}
              {c.id === "left" ? " L" : c.id === "mid" ? " R" : c.id === "full" ? " Σ" : " ✗"}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
