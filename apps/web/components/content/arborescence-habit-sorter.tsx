"use client";

import {
  CONSTRUCTIONS,
  type SortMode,
  TRUNK_LAYOUT,
  TRUNK_VIEW_HEIGHT,
  type TrunkSpec,
  crossSectionRings,
  sortedTrunks,
  trunkRowCenterY,
  verdictFor,
} from "@/components/content/arborescence-habit-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// Six trunks in cross-section, three from Pandora and three from Earth. Sort them
// by how tall and tree-shaped they are and they form one meaningless pile. Sort
// them by what actually holds the stem up and they split into three, each pile
// pairing a Pandoran giant with the Earth lineage that solved the same problem
// the same way — which is convergence, and tells you nothing about kinship.

const { width: W, radius: R, columns: COLUMNS, top: ROW_TOP, captionOffsets } = TRUNK_LAYOUT;
const H = TRUNK_VIEW_HEIGHT;

interface ArborescenceHabitSorterProps {
  caption?: string;
  className?: string;
}

export function ArborescenceHabitSorter({ caption, className }: ArborescenceHabitSorterProps) {
  const uid = useId();
  const t = useTranslations("viz.arborescenceHabit");
  const [mode, setMode] = useState<SortMode>("silhouette");

  const order = useMemo(() => sortedTrunks(mode), [mode]);
  const verdict = useMemo(() => verdictFor(mode), [mode]);
  const tone = mode === "construction" ? "var(--teal)" : "var(--amber)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={mode === "construction" ? "teal" : "amber"}
      caption={caption}
      hint={t(`hint.${mode}`)}
      controls={
        <SegmentedToggle
          options={[
            { value: "silhouette", label: t("mode.silhouette"), tone: "var(--amber)" },
            { value: "construction", label: t("mode.construction"), tone: "var(--teal)" },
          ]}
          value={mode}
          onChange={setMode}
          ariaLabel={t("modeLabel")}
        />
      }
      className={className}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full lg:w-[64%]"
          role="img"
          aria-label={t(`aria.${mode}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber"]} />

          {mode === "construction"
            ? CONSTRUCTIONS.map((c, i) => (
                <rect
                  key={c}
                  x={i * (W / COLUMNS) + 3}
                  y={ROW_TOP - 2}
                  width={W / COLUMNS - 6}
                  height={H - ROW_TOP - 2}
                  rx={6}
                  fill="color-mix(in oklab, var(--teal) 6%, transparent)"
                  stroke="color-mix(in oklab, var(--teal) 26%, transparent)"
                  strokeWidth={0.6}
                />
              ))
            : null}

          {order.map((trunk, i) => (
            <TrunkDisc
              key={trunk.key}
              trunk={trunk}
              cx={((i % COLUMNS) + 0.5) * (W / COLUMNS)}
              cy={trunkRowCenterY(i)}
              uid={uid}
              name={t(`taxon.${trunk.key}`)}
              worldLabel={t(`world.${trunk.world}`)}
            />
          ))}
        </svg>

        <div className="flex flex-col gap-2 lg:w-[36%]">
          <VizReadout
            label={t("readout.piles")}
            value={verdict.groups}
            note={t(`readout.pilesNote.${mode}`)}
            tone={tone}
          />
          <VizReadout
            label={t("readout.spread")}
            value={t("readout.spreadValue", { pct: Math.round(verdict.woodSpread * 100) })}
            note={t("readout.spreadNote")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.tells")}
            value={verdict.coherent ? t("readout.kinship") : t("readout.habitat")}
            note={t(`readout.tellsNote.${mode}`)}
            tone={tone}
            tinted
          />
        </div>
      </div>

      <p className="mt-4 font-sans text-xs leading-relaxed text-muted">{t(`verdict.${mode}`)}</p>
    </VizFigure>
  );
}

/** One trunk in cross-section: outer stem wall, its cavities or bundles, and a name. */
function TrunkDisc({
  trunk,
  cx,
  cy,
  uid,
  name,
  worldLabel,
}: {
  trunk: TrunkSpec;
  cx: number;
  cy: number;
  uid: string;
  name: string;
  worldLabel: string;
}) {
  const tone = `var(--${trunk.tone})`;
  const rings = crossSectionRings(trunk.construction, R);
  const hollow = trunk.construction === "anastomosing";

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill={hollow ? "transparent" : `color-mix(in oklab, ${tone} 12%, transparent)`}
        stroke={tone}
        strokeWidth={trunk.construction === "tensile" ? 3 : 1.2}
        strokeOpacity={0.8}
      />
      {rings.map((d, i) => (
        <circle
          key={`${trunk.key}-${i}`}
          cx={cx + d.cx}
          cy={cy + d.cy}
          r={d.r}
          fill={`color-mix(in oklab, ${tone} 26%, transparent)`}
          stroke="var(--border-strong)"
          strokeWidth={0.4}
          filter={trunk.construction === "pneumatic" ? glowUrl(uid, "bloom") : undefined}
        />
      ))}
      <VizText
        x={cx}
        y={cy + R + captionOffsets[0]}
        size="micro"
        anchor="middle"
        tone={trunk.tone}
        weight={600}
      >
        {name}
      </VizText>
      <VizText x={cx} y={cy + R + captionOffsets[1]} size="micro" anchor="middle">
        {`${worldLabel} · ${trunk.height} m`}
      </VizText>
    </g>
  );
}
