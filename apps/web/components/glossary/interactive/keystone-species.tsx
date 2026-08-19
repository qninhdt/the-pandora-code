"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Simple food web: keystone predator P, two prey H1/H2, basal plant V.
// Remove P → prey explode → V collapses. Remove peripheral H2 → mild shift.
type Mode = "intact" | "noKey" | "noOther";

interface Node {
  id: string;
  x: number;
  y: number;
  r: number;
  keystone?: boolean;
}

const BASE: Node[] = [
  { id: "P", x: 50, y: 24, r: 5, keystone: true },
  { id: "H1", x: 32, y: 48, r: 4.5 },
  { id: "H2", x: 68, y: 48, r: 4.5 },
  { id: "V", x: 50, y: 72, r: 6 },
];

export default function KeystoneSpecies() {
  const t = useTranslations("viz.keystone-species");
  const [mode, setMode] = useState<Mode>("intact");

  const state = useMemo(() => {
    // biomass multipliers by mode
    if (mode === "intact") {
      return { P: 1, H1: 1, H2: 1, V: 1, cascade: false };
    }
    if (mode === "noKey") {
      return { P: 0, H1: 2.2, H2: 2.0, V: 0.25, cascade: true };
    }
    // remove peripheral herbivore H2
    return { P: 0.95, H1: 1.25, H2: 0, V: 0.9, cascade: false };
  }, [mode]);

  const nodes = BASE.map((n) => {
    const m = state[n.id as keyof typeof state] as number;
    return { ...n, m, alive: m > 0.05 };
  });

  const edges: [string, string][] = [
    ["P", "H1"],
    ["P", "H2"],
    ["H1", "V"],
    ["H2", "V"],
  ];

  const nodeOf = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("intact")}
      allowFullscreen={false}
      caption={
        <span className={state.cascade ? "text-magenta" : "text-teal"}>
          {state.cascade ? t("cascade") : t("stable")}
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
          {edges.map(([a, b]) => {
            const A = nodeOf(a);
            const B = nodeOf(b);
            const show = A.alive && B.alive;
            return (
              <line
                key={`${a}-${b}`}
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke={show ? "var(--border-strong)" : "var(--magenta)"}
                strokeWidth={show ? 0.7 : 0.4}
                strokeDasharray={show ? undefined : "2 2"}
                opacity={show ? 0.7 : 0.35}
              />
            );
          })}

          {nodes.map((n) => {
            const fill = n.keystone
              ? "var(--amber)"
              : n.id === "V"
                ? "var(--teal)"
                : "var(--cyan)";
            const r = n.r * Math.sqrt(Math.max(n.m, 0.08));
            return (
              <g key={n.id} opacity={n.alive ? 1 : 0.25}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r}
                  fill={fill}
                  opacity={n.alive ? 0.8 : 0.3}
                  stroke={n.keystone ? "var(--amber)" : "var(--border-strong)"}
                  strokeWidth={n.keystone ? 1 : 0.4}
                />
                <text
                  x={n.x}
                  y={n.y + 1.2}
                  textAnchor="middle"
                  style={{
                    fontSize: 3,
                    fontFamily: "monospace",
                    fill: "var(--foreground)",
                  }}
                >
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout
            label={state.cascade ? t("cascade") : t("stable")}
            value={`V×${state.V.toFixed(2)}`}
            accent={state.cascade ? "magenta" : "teal"}
          />
        </div>

        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <ControlButton
            variant={mode === "noKey" ? "active" : "default"}
            onClick={() => setMode(mode === "noKey" ? "intact" : "noKey")}
            className="px-2.5 py-1.5"
          >
            {t("removeKey")}
          </ControlButton>
          <ControlButton
            variant={mode === "noOther" ? "active" : "default"}
            onClick={() => setMode(mode === "noOther" ? "intact" : "noOther")}
            className="px-2.5 py-1.5"
          >
            {t("removeOther")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
