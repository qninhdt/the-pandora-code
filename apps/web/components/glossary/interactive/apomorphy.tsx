"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A novelty appears at one internal node and lights every descendant branch.
// That is the raw apomorphy before we ask whether it is shared (syn) or unique (aut).
const NODES = [
  { key: "nodeA", x: 22, y: 30, kids: [] as string[] },
  { key: "nodeB", x: 42, y: 30, kids: [] as string[] },
  { key: "nodeC", x: 62, y: 30, kids: [] as string[] },
  { key: "nodeD", x: 82, y: 30, kids: [] as string[] },
];

// Internal split points the user can click: left clade (A+B), right (C+D), root (all).
const SPLITS = [
  { id: "left", x: 32, y: 52, tips: [0, 1], label: "L" },
  { id: "right", x: 72, y: 52, tips: [2, 3], label: "R" },
  { id: "root", x: 52, y: 74, tips: [0, 1, 2, 3], label: "●" },
];

export default function Apomorphy() {
  const t = useTranslations("viz.apomorphy");
  const [split, setSplit] = useState<string | null>("left");

  const active = SPLITS.find((s) => s.id === split);
  const lit = new Set(active?.tips ?? []);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSplit("left")}
      allowFullscreen={false}
      caption={<span className="text-muted">{split ? t("derived") : t("hint")}</span>}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* scaffold */}
          <line x1="52" y1="82" x2="52" y2="74" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="32" y1="74" x2="72" y2="74" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="32" y1="74" x2="32" y2="52" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="72" y1="74" x2="72" y2="52" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="22" y1="52" x2="42" y2="52" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="62" y1="52" x2="82" y2="52" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="22" y1="52" x2="22" y2="30" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="42" y1="52" x2="42" y2="30" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="62" y1="52" x2="62" y2="30" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="82" y1="52" x2="82" y2="30" stroke="var(--border-strong)" strokeWidth="1" />

          {/* lit descendant stems */}
          {active?.tips.map((ti) => {
            const n = NODES[ti];
            return (
              <line
                key={`lit-${ti}`}
                x1={n.x}
                y1={n.y}
                x2={n.x}
                y2="52"
                stroke="var(--cyan)"
                strokeWidth="1.4"
                opacity="0.85"
              />
            );
          })}

          {SPLITS.map((s) => {
            const on = s.id === split;
            return (
              <g key={s.id} onClick={() => setSplit(s.id)} style={{ cursor: "pointer" }}>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={on ? 4 : 3}
                  fill={on ? "var(--cyan)" : "var(--surface)"}
                  stroke="var(--border-strong)"
                  strokeWidth="0.6"
                />
                {on && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="7"
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth="0.4"
                    opacity="0.5"
                  />
                )}
              </g>
            );
          })}

          {NODES.map((n, i) => {
            const on = lit.has(i);
            return (
              <g key={n.key}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={on ? 3.4 : 2.4}
                  fill={on ? "var(--cyan)" : "var(--surface)"}
                  stroke="var(--border-strong)"
                  strokeWidth="0.5"
                />
                <text
                  x={n.x}
                  y={n.y - 6}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.6,
                    fontFamily: "monospace",
                    fill: on ? "var(--cyan)" : "var(--muted)",
                  }}
                >
                  {t(n.key)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("derived")}
            value={active ? `${active.tips.length}` : "—"}
            accent="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
