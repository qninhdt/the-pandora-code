"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { branchCurve, tipYs } from "@/components/content/viz/tree";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";

type Localized = { vi: string; en: string };

// Scientific data (taxon names, trait glosses, branch notes) stays in code.
// The bilateral lattice as a cladogram: one ancestral hexapod radiates into the
// whole bestiary, every branch keeping the shared synapomorphies — except the
// prolemuris→Na'vi branch, where limbs, eyes and queues are *reduced* (not
// fused). The shape is the argument: a single clade with one aberrant tip.
interface Leaf {
  id: string;
  label: Localized;
  sub: Localized;
  tier: "canon" | "inference";
  /** A short annotation placed on the branch (the change that happened here). */
  note?: Localized;
}

const LEAVES: Leaf[] = [
  {
    id: "thanator",
    tier: "canon",
    label: { vi: "Thanator", en: "Thanator" },
    sub: { vi: "6 chân chạy", en: "six running legs" },
  },
  {
    id: "ikran",
    tier: "canon",
    label: { vi: "Ikran", en: "Mountain banshee" },
    sub: { vi: "2 cánh + chi sau tiêu giảm", en: "wings + reduced hindlimbs" },
  },
  {
    id: "tulkun",
    tier: "canon",
    label: { vi: "Tulkun", en: "Tulkun" },
    sub: { vi: "6 vây · 4 mắt", en: "six flippers · four eyes" },
  },
  {
    id: "prolemuris",
    tier: "inference",
    label: { vi: "Prolemuris", en: "Prolemuris" },
    sub: { vi: "cẳng tay chẻ đôi · 1 queue", en: "split forearm · single queue" },
    note: { vi: "Mất chi giữa, mắt 4→2", en: "Mid-limb loss, eyes 4→2" },
  },
  {
    id: "navi",
    tier: "inference",
    label: { vi: "Na'vi", en: "Na'vi" },
    sub: { vi: "4 chi · 2 mắt · 1 queue · mũi", en: "4 limbs · 2 eyes · 1 queue · nostrils" },
    note: {
      vi: "Im lặng vùng chi giữa (như rắn mất chân)",
      en: "Mid-limb field silenced (snake-like)",
    },
  },
];

const ANCESTOR: Localized = {
  vi: "Tổ tiên sáu chi",
  en: "Ancestral hexapod",
};
const ANCESTOR_SUB: Localized = {
  vi: "6 chi · 4 mắt · queue đôi · xương sợi-carbon · operculum",
  en: "6 limbs · 4 eyes · paired queues · carbon-fibre bone · opercula",
};
const ROOT_NOTE: Localized = {
  vi: "Đặc điểm chung dẫn xuất → một nhánh duy nhất",
  en: "Shared derived traits → one clade",
};

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
  const locale = useLocale() as "vi" | "en";

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
            {ROOT_NOTE[locale]}
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
                {leaf.note ? (
                  <VizText x={split.x + 16} y={child.y - 8} size="small" tone="subtle">
                    {leaf.note[locale]}
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
                  {leaf.label[locale]}
                </VizText>
                <VizText x={child.x - 14} y={child.y + 16} size="small" tone="muted" anchor="end">
                  {leaf.sub[locale]}
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
            {ANCESTOR[locale]}
          </VizText>
          <VizText x={ancestor.x + 12} y={ancestor.y + 15} size="small" tone="muted">
            {ANCESTOR_SUB[locale]}
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
