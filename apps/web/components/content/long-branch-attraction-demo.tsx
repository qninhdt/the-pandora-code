"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Long-branch attraction, the classic failure mode of morphology-only parsimony.
// Two fast-evolving flyers (ikran, toruk) sit on genuinely separate lineages in
// the true tree, but their many independent flight autapomorphies pile up as
// chance look-alikes; parsimony misreads the noise as shared signal and wrongly
// yokes the two long branches together near the base. Branch LENGTH encodes
// evolutionary rate. Creature names stay in code (scientific data).
interface Tip {
  id: string;
  y: number; // fraction of height
  long: boolean; // long (fast) branch?
}

// True tree: A (short) sister to long B; C (short) sister to long D. The two
// long branches (B, D) are on opposite sides of the root — NOT relatives.
const TRUE_TIPS: Tip[] = [
  { id: "a", y: 0.16, long: false },
  { id: "b", y: 0.4, long: true },
  { id: "c", y: 0.64, long: false },
  { id: "d", y: 0.88, long: true },
];

// Inferred tree: the two long flyers (B, D) wrongly grouped together at the base.
const INFERRED_TIPS: Tip[] = [
  { id: "a", y: 0.16, long: false },
  { id: "c", y: 0.4, long: false },
  { id: "b", y: 0.66, long: true },
  { id: "d", y: 0.9, long: true },
];

const W = 340;
const H = 220;

function TreePanel({
  inferred,
  uid,
  ariaLabel,
  attractedLabel,
}: {
  inferred: boolean;
  uid: string;
  ariaLabel: string;
  attractedLabel: string;
}) {
  const t = useTranslations("viz.longBranch");
  const tips = inferred ? INFERRED_TIPS : TRUE_TIPS;
  const rootX = 0.08 * W;
  const yPx = (f: number) => f * (H - 50) + 28;

  // Two internal nodes, one per sister-pair.
  const nodeAX = inferred ? 0.46 * W : 0.34 * W;
  const pairTopY = (yPx(tips[0].y) + yPx(tips[1].y)) / 2;
  const pairBotY = (yPx(tips[2].y) + yPx(tips[3].y)) / 2;
  const baseX = 0.26 * W;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel}>
      <GlowDefs idBase={uid} tones={["amber"]} />

      {/* root backbone */}
      <path
        d={`M ${rootX} ${(pairTopY + pairBotY) / 2} H ${baseX} M ${baseX} ${pairTopY} V ${pairBotY} M ${baseX} ${pairTopY} H ${nodeAX} M ${baseX} ${pairBotY} H ${nodeAX}`}
        fill="none"
        stroke="var(--subtle)"
        strokeWidth={2.5}
        strokeOpacity={0.55}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* On the inferred tree the bottom pair is the false long-branch clade —
          bloom its junction node so the spurious grouping reads at a glance. */}
      {inferred ? (
        <circle
          cx={nodeAX}
          cy={pairBotY}
          r={6}
          fill="var(--magenta)"
          filter={glowUrl(uid, "bloom")}
        />
      ) : null}

      {tips.map((tp, i) => {
        const pairNodeY = i < 2 ? pairTopY : pairBotY;
        const by = yPx(tp.y);
        // Long branches reach further right (more change); colour by rate.
        const endX = tp.long ? 0.86 * W : 0.72 * W;
        const stroke = tp.long ? "var(--amber)" : "var(--teal)";
        return (
          <g key={tp.id}>
            <path
              d={`M ${nodeAX} ${pairNodeY} V ${by} H ${endX}`}
              fill="none"
              stroke={stroke}
              strokeWidth={tp.long ? 4.5 : 2.5}
              strokeOpacity={tp.long ? 0.9 : 0.7}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={tp.long ? glowUrl(uid, "bloom") : undefined}
            />
            <circle cx={endX} cy={by} r={11} fill={stroke} fillOpacity={0.12} />
            <circle
              cx={endX}
              cy={by}
              r={tp.long ? 4.5 : 3.5}
              fill={stroke}
              filter={glowUrl(uid, tp.long ? "bloom" : "soft-shadow")}
            />
            <VizText x={endX + 9} y={by + 4} size="small" tone="foreground" weight={700}>
              {t(`tips.${tp.id}`)}
            </VizText>
          </g>
        );
      })}

      {/* the "attracted!" marker on the inferred tree's false clade */}
      {inferred ? (
        <VizText
          x={nodeAX - 10}
          y={(yPx(INFERRED_TIPS[2].y) + yPx(INFERRED_TIPS[3].y)) / 2 + 4}
          size="small"
          tone="magenta"
          anchor="end"
          weight={700}
        >
          ◄ {attractedLabel}
        </VizText>
      ) : null}
    </svg>
  );
}

interface LongBranchAttractionDemoProps {
  caption?: string;
  className?: string;
}

type View = "true" | "inferred";

export function LongBranchAttractionDemo({ caption, className }: LongBranchAttractionDemoProps) {
  const uid = useId();
  const t = useTranslations("viz.longBranch");
  // Deterministic initial render → SSR-safe.
  const [view, setView] = useState<View>("true");
  const inferred = view === "inferred";

  return (
    <VizFigure
      title={t("title")}
      caption={caption}
      className={className}
      tone={inferred ? "magenta" : "teal"}
      controls={
        <SegmentedToggle
          ariaLabel={t("title")}
          value={view}
          onChange={setView}
          options={[
            { value: "true", label: t("trueTree"), tone: "var(--teal)" },
            { value: "inferred", label: t("inferredTree"), tone: "var(--magenta)" },
          ]}
        />
      }
      hint={t("hint")}
    >
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-lg border p-2 transition-colors"
          style={{
            borderColor: inferred
              ? "var(--border)"
              : "color-mix(in oklab, var(--teal) 50%, transparent)",
            background: inferred
              ? "transparent"
              : "color-mix(in oklab, var(--teal) 8%, transparent)",
            opacity: inferred ? 0.6 : 1,
          }}
        >
          <p className="mb-1 font-display text-xs font-700 text-teal">{t("trueTree")}</p>
          <TreePanel
            inferred={false}
            uid={`${uid}-true`}
            ariaLabel={t("ariaTrue")}
            attractedLabel={t("attracted")}
          />
        </div>

        <div
          className="rounded-lg border p-2 transition-colors"
          style={{
            borderColor: inferred
              ? "color-mix(in oklab, var(--magenta) 50%, transparent)"
              : "var(--border)",
            background: inferred
              ? "color-mix(in oklab, var(--magenta) 8%, transparent)"
              : "transparent",
            opacity: inferred ? 1 : 0.6,
          }}
        >
          <p className="mb-1 font-display text-xs font-700 text-magenta">{t("inferredTree")}</p>
          <TreePanel
            inferred={true}
            uid={`${uid}-inf`}
            ariaLabel={t("ariaInferred")}
            attractedLabel={t("attracted")}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 font-sans text-xs text-subtle">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1 w-5 rounded-full bg-amber" /> {t("fast")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-5 rounded-full bg-teal" /> {t("slow")}
        </span>
      </div>

      <p className="mt-2 font-sans text-xs text-subtle">
        {inferred ? t("inferredNote") : t("trueNote")}
      </p>
    </VizFigure>
  );
}
