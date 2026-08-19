"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The environment imposing one answer on many starts. Pick a job and distant
// lineages converge on the same form: water forces a streamlined torso on a
// dolphin, an ichthyosaur and a shark alike, three separate branches arriving at
// one fishlike shape. Convergence explains simple, environment-dictated traits —
// but not complex arbitrary ones, which point to shared inheritance instead. Pick
// a function and watch five unrelated lineages slide toward a single silhouette.
const FUNCTIONS = [
  { key: "swim", target: { rx: 15, ry: 5 } },
  { key: "fly", target: { rx: 13, ry: 8 } },
  { key: "run", target: { rx: 7, ry: 11 } },
];

// five lineages start at scattered body proportions
const LINEAGES = [
  { key: "l1", color: "var(--teal)", start: { rx: 6, ry: 10 } },
  { key: "l2", color: "var(--cyan)", start: { rx: 13, ry: 4 } },
  { key: "l3", color: "var(--teal)", start: { rx: 9, ry: 9 } },
  { key: "l4", color: "var(--cyan)", start: { rx: 4, ry: 12 } },
  { key: "l5", color: "var(--amber)", start: { rx: 14, ry: 7 } },
];

export default function ConvergentEvolution() {
  const t = useTranslations("viz.convergent-evolution");
  const [fn, setFn] = useState(0);
  const target = FUNCTIONS[fn].target;

  // convergence factor: how close each lineage has been pulled to the target
  const CONVERGE = 0.78;

  const positions = [
    { x: 24, y: 40 },
    { x: 50, y: 32 },
    { x: 76, y: 40 },
    { x: 34, y: 66 },
    { x: 66, y: 66 },
  ];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setFn(0)}
      allowFullscreen={false}
      caption={
        <span>
          {t("function")}: <span className="text-cyan">{t(FUNCTIONS[fn].key)}</span> ·{" "}
          <span className="text-teal">{t("converged")}</span>
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
          {/* target-shape ghost at centre */}
          <ellipse
            cx="50"
            cy="50"
            rx={target.rx}
            ry={target.ry}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            opacity="0.3"
          />

          {LINEAGES.map((l, i) => {
            const pos = positions[i];
            // interpolate this lineage's shape toward the target
            const rx = l.start.rx + (target.rx - l.start.rx) * CONVERGE;
            const ry = l.start.ry + (target.ry - l.start.ry) * CONVERGE;
            return (
              <g key={l.key} transform={`translate(${pos.x} ${pos.y})`}>
                {/* faint line back to origin shape to show it moved */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx={l.start.rx}
                  ry={l.start.ry}
                  fill="none"
                  stroke={l.color}
                  strokeWidth="0.3"
                  opacity="0.2"
                />
                <ellipse
                  cx="0"
                  cy="0"
                  rx={rx}
                  ry={ry}
                  fill={l.color}
                  opacity="0.35"
                  stroke={l.color}
                  strokeWidth="0.6"
                />
                <text
                  x="0"
                  y={ry + 5}
                  textAnchor="middle"
                  style={{ fontSize: 2.6, fontFamily: "monospace", fill: l.color }}
                >
                  {t(l.key)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("solution")} value={t(FUNCTIONS[fn].key)} accent="cyan" />
        </div>

        {/* function selector */}
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {FUNCTIONS.map((f, i) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFn(i)}
              className="rounded-lg border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md transition-colors"
              style={{
                borderColor: fn === i ? "var(--cyan)" : "var(--border-strong)",
                color: fn === i ? "var(--cyan)" : "var(--muted)",
                background:
                  fn === i ? "color-mix(in oklab, var(--cyan) 12%, transparent)" : "var(--void)",
              }}
            >
              {t(f.key)}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
