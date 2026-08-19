"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Evolution as a net, not just a tree. Sometimes lineages that split rejoin —
// through horizontal gene transfer, hybridization, endosymbiosis — stitching the
// branches into a web (Latin reticulum, "little net"). The tidy tree is then a
// simplification of something genuinely reticulate. Click a bridge to reveal the
// gene that jumped across it and the lineage that received it. Reticulation
// complicates the tree; it does not abolish it.
const BRIDGES = [
  { key: "hgt", from: { x: 28, y: 44 }, to: { x: 62, y: 40 }, gene: "geneA" },
  { key: "hybrid", from: { x: 44, y: 60 }, to: { x: 76, y: 58 }, gene: "geneB" },
  { key: "endo", from: { x: 20, y: 66 }, to: { x: 52, y: 72 }, gene: "geneC" },
];

export default function ReticulateEvolution() {
  const t = useTranslations("viz.reticulate-evolution");
  const [sel, setSel] = useState<number | null>(null);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSel(null)}
      allowFullscreen={false}
      caption={
        sel != null ? (
          <span className="text-magenta">{t("transferred", { gene: t(BRIDGES[sel].gene) })}</span>
        ) : (
          <span className="text-muted">{t("clickBridge")}</span>
        )
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
          {/* the branching tree (vertical, root at bottom) */}
          <g stroke="var(--teal)" strokeWidth="1" fill="none" opacity="0.8">
            <path d="M50 86 L50 74" />
            <path d="M50 74 L28 60 M50 74 L72 60" />
            <path d="M28 60 L20 40 M28 60 L40 40" />
            <path d="M72 60 L60 40 M72 60 L84 40" />
            <path d="M20 40 L18 24 M40 40 L42 24" />
            <path d="M60 40 L58 24 M84 40 L86 24" />
          </g>

          {/* tips */}
          {[18, 42, 58, 86].map((x, i) => (
            <circle key={i} cx={x} cy={24} r="2.4" fill="var(--teal)" opacity="0.85" />
          ))}

          {/* horizontal transfer bridges — the reticulations */}
          {BRIDGES.map((b, i) => {
            const on = sel === i;
            const midX = (b.from.x + b.to.x) / 2;
            const midY = (b.from.y + b.to.y) / 2 - 6;
            return (
              <g key={b.key}>
                <path
                  d={`M${b.from.x} ${b.from.y} Q ${midX} ${midY} ${b.to.x} ${b.to.y}`}
                  fill="none"
                  stroke="var(--magenta)"
                  strokeWidth={on ? 1.2 : 0.7}
                  strokeDasharray="2 1.5"
                  opacity={on ? 0.9 : 0.5}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={t(b.key)}
                  onClick={() => setSel(i === sel ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSel(i === sel ? null : i);
                    }
                  }}
                />
                {/* transferred-gene marker travelling the bridge when selected */}
                {on && <circle cx={midX} cy={midY + 3} r="2" fill="var(--magenta)" />}
                {on && (
                  <text
                    x={midX}
                    y={midY - 1}
                    textAnchor="middle"
                    style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--magenta)" }}
                  >
                    {t(b.gene)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("bridges")} value={`${BRIDGES.length}`} accent="magenta" />
        </div>

        <div className="absolute inset-x-3 bottom-12 text-center font-mono text-[10px] uppercase tracking-wider text-muted">
          {t("treePlusWeb")}
        </div>
      </div>
    </GlossaryFrame>
  );
}
