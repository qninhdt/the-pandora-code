"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { branchCurve, tipYs } from "@/components/content/viz/tree";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId } from "react";

// Scientific data (taxon names, trait glosses, branch notes) stays in code.
// The bilateral lattice as a cladogram: one ancestral hexapod radiates into the
// whole bestiary, every branch keeping the shared synapomorphies — except the
// prolemuris→Na'vi branch, where limbs, eyes and queues are *reduced* (not
// fused). The shape is the argument: a single clade with one aberrant tip.
interface Leaf {
  id: string;
  tier: "canon" | "inference";
  /** Whether the leaf has a short annotation on the branch. */
  hasNote?: boolean;
}

const LEAVES: Leaf[] = [
  { id: "thanator", tier: "canon" },
  { id: "ikran", tier: "canon" },
  { id: "tulkun", tier: "canon" },
  { id: "prolemuris", tier: "inference", hasNote: true },
  { id: "navi", tier: "inference", hasNote: true },
];

interface BilateralLatticeTreeProps {
  caption?: string;
  className?: string;
}

const W = 760;
const H = 420;

function tierColor(tier: "canon" | "inference") {
  return tier === "inference" ? "var(--inference)" : "var(--canon)";
}

export function BilateralLatticeTree({ caption, className }: BilateralLatticeTreeProps) {
  const uid = useId();
  const t = useTranslations("viz.bilateralTree");

  const ancestor = { x: 0.07 * W, y: H / 2 };
  const split = { x: 0.32 * W, y: H / 2 };
  const leafX = 0.92 * W;
  const ys = tipYs(LEAVES.length, 48, H - 48);

  return (
    <VizFigure title={t("title")} caption={caption} className={className}>
      <div className="rounded-xl border border-border bg-void/30 p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("ariaLabel")}>
          <GlowDefs idBase={uid} />

          {/* ancestor → split backbone */}
          <path
            d={branchCurve(ancestor, split)}
            fill="none"
            stroke="var(--canon)"
            strokeWidth={3.5}
            strokeOpacity={0.65}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <VizText x={split.x + 6} y={split.y - 14} size="small" tone="subtle">
            {t("rootNote")}
          </VizText>

          {/* split → each leaf */}
          {LEAVES.map((leaf, i) => {
            const child = { x: leafX, y: ys[i] };
            const color = tierColor(leaf.tier);
            // The inference tips (prolemuris→Na'vi) carry the chapter's argument:
            // the aberrant reduced clade. Glow those branches; keep canon quiet.
            const aberrant = leaf.tier === "inference";
            return (
              <g key={leaf.id}>
                <path
                  d={branchCurve(split, child)}
                  fill="none"
                  stroke={color}
                  strokeWidth={aberrant ? 3.5 : 2.5}
                  strokeOpacity={aberrant ? 0.9 : 0.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={aberrant ? glowUrl(uid, "bloom") : undefined}
                />
                {leaf.hasNote ? (
                  <VizText x={split.x + 16} y={child.y - 8} size="small" tone="subtle">
                    {t(`leaves.${leaf.id}.note`)}
                  </VizText>
                ) : null}
                {/* faint disc behind the tip node for depth */}
                <circle cx={child.x} cy={child.y} r={15} fill={color} fillOpacity={0.12} />
                <circle
                  cx={child.x}
                  cy={child.y}
                  r={5.5}
                  fill={color}
                  filter={glowUrl(uid, aberrant ? "bloom-strong" : "bloom")}
                />
                <VizText
                  x={child.x - 14}
                  y={child.y - 1}
                  size="base"
                  tone="foreground"
                  anchor="end"
                  weight={700}
                >
                  {t(`leaves.${leaf.id}.label`)}
                </VizText>
                <VizText x={child.x - 14} y={child.y + 16} size="small" tone="muted" anchor="end">
                  {t(`leaves.${leaf.id}.sub`)}
                </VizText>
              </g>
            );
          })}

          {/* ancestor node + label */}
          <circle cx={ancestor.x} cy={ancestor.y} r={20} fill="var(--canon)" fillOpacity={0.14} />
          <circle
            cx={ancestor.x}
            cy={ancestor.y}
            r={7}
            fill="var(--canon)"
            filter={glowUrl(uid, "bloom-strong")}
          />
          <VizText
            x={ancestor.x + 12}
            y={ancestor.y - 1}
            size="base"
            tone="foreground"
            weight={700}
          >
            {t("ancestor")}
          </VizText>
          <VizText x={ancestor.x + 12} y={ancestor.y + 15} size="small" tone="muted">
            {t("ancestorSub")}
          </VizText>

          {/* split junction dot */}
          <circle
            cx={split.x}
            cy={split.y}
            r={4}
            fill="var(--canon)"
            filter={glowUrl(uid, "bloom")}
          />
        </svg>
      </div>
    </VizFigure>
  );
}
