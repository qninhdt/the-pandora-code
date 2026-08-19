"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Occam on the tree: fewest character changes wins. Three topologies, one matrix
// implied — the minimum step count lights teal.
const TREES = [
  { key: "treeA", steps: 6 },
  { key: "treeB", steps: 3 },
  { key: "treeC", steps: 5 },
] as const;

const TIPS = [20, 40, 60, 80];

export default function MaximumParsimony() {
  const t = useTranslations("viz.maximum-parsimony");
  const [idx, setIdx] = useState(1);
  const active = TREES[idx];
  const min = Math.min(...TREES.map((tr) => tr.steps));
  const isMin = active.steps === min;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setIdx(1)}
      allowFullscreen={false}
      caption={
        <span className={isMin ? "text-teal" : "text-muted"}>
          {isMin ? t("minimum") : t("hint")}
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
          <line
            x1="50"
            y1="82"
            x2="50"
            y2="64"
            stroke={isMin ? "var(--teal)" : "var(--border-strong)"}
            strokeWidth="1"
          />
          <line
            x1="30"
            y1="64"
            x2="70"
            y2="64"
            stroke={isMin ? "var(--teal)" : "var(--border-strong)"}
            strokeWidth="1"
          />
          {/* topology-dependent mid forks */}
          {idx === 0 && (
            <>
              <line x1="30" y1="64" x2="30" y2="40" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="70" y1="64" x2="70" y2="40" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="20" y1="40" x2="40" y2="40" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="60" y1="40" x2="80" y2="40" stroke="var(--border-strong)" strokeWidth="1" />
            </>
          )}
          {idx === 1 && (
            <>
              <line x1="30" y1="64" x2="30" y2="48" stroke="var(--teal)" strokeWidth="1.2" />
              <line x1="70" y1="64" x2="70" y2="48" stroke="var(--teal)" strokeWidth="1.2" />
              <line x1="20" y1="48" x2="40" y2="48" stroke="var(--teal)" strokeWidth="1.2" />
              <line x1="60" y1="48" x2="80" y2="48" stroke="var(--teal)" strokeWidth="1.2" />
            </>
          )}
          {idx === 2 && (
            <>
              <line x1="25" y1="64" x2="25" y2="40" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="50" y1="64" x2="50" y2="40" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="75" y1="64" x2="75" y2="40" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="20" y1="40" x2="40" y2="40" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="60" y1="40" x2="80" y2="40" stroke="var(--border-strong)" strokeWidth="1" />
            </>
          )}

          {TIPS.map((x, i) => (
            <g key={i}>
              <line
                x1={x}
                y1={idx === 1 ? 48 : 40}
                x2={x}
                y2="28"
                stroke={isMin ? "var(--teal)" : "var(--border-strong)"}
                strokeWidth={isMin ? 1.2 : 1}
              />
              <circle
                cx={x}
                cy="28"
                r="2.8"
                fill={isMin ? "var(--teal)" : "var(--surface)"}
                stroke="var(--border-strong)"
                strokeWidth="0.5"
              />
              {/* change tick marks proportional to steps */}
              {Array.from({ length: Math.min(active.steps, 6) }, (_, k) => (
                <circle
                  key={k}
                  cx={14 + k * 4}
                  cy="90"
                  r="1.2"
                  fill={isMin ? "var(--teal)" : "var(--amber)"}
                  opacity="0.8"
                />
              ))}
            </g>
          ))}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("steps")}
            value={active.steps}
            accent={isMin ? "teal" : "amber"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {TREES.map((tr, i) => (
            <button
              key={tr.key}
              type="button"
              onClick={() => setIdx(i)}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md"
              style={{
                borderColor:
                  idx === i
                    ? tr.steps === min
                      ? "var(--teal)"
                      : "var(--amber)"
                    : "var(--border-strong)",
                color:
                  idx === i
                    ? tr.steps === min
                      ? "var(--teal)"
                      : "var(--amber)"
                    : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {t(tr.key)}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}
