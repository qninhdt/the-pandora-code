"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  DEFAULT_SEGMENTS,
  SEGMENT_KM,
  type World,
  runRecycling,
} from "./moisture-recycling-cascade-model";

// A forest standing upwind of its own rain. Air comes off the ocean at the left
// edge, rains a share of itself out over each stretch of canopy, and the canopy
// hands most of that water straight back to the sky — so the rain falling deep
// inland is mostly water that has already fallen. Each bar splits into the part
// that is still original ocean vapour and the part that has been through a leaf.
// Slide the clearing in and the bars downwind of it collapse: the interior does
// not dry because it was cut, it dries because its supplier was.
// The bookkeeping lives in moisture-recycling-cascade-model.ts.

const W = 340;
const H = 210;
const PAD = { l: 34, r: 12, t: 14, b: 34 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

// Fixed vertical scale in mm of column so bars stay comparable as the reader
// changes fetch, clearing, and world.
const Y_MAX = 8;
const yOf = (mm: number) => PAD.t + (1 - Math.min(mm, Y_MAX) / Y_MAX) * plotH;
const BASE_Y = PAD.t + plotH;

const VERDICT_TONE = { intact: "teal", thinning: "amber", broken: "magenta" } as const;

export function MoistureRecyclingCascade({
  caption,
  className,
}: { caption?: string; className?: string }) {
  const t = useTranslations("viz.moistureRecyclingCascade");
  const uid = useId();
  const [world, setWorld] = useState<World>("pandora");
  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  // 0 means "no clearing"; otherwise the first cleared segment, counting inland.
  const [clearAt, setClearAt] = useState(0);

  const cleared = clearAt >= 1 && clearAt <= segments ? clearAt : null;
  const result = useMemo(() => runRecycling(world, segments, cleared), [world, segments, cleared]);
  const tone = VERDICT_TONE[result.verdict];
  const toneVar = `var(--${tone})`;

  const barW = Math.min(26, (plotW / segments) * 0.62);
  const xOf = (i: number) => PAD.l + (plotW / segments) * (i - 0.5);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      hint={t(`verdict.${result.verdict}`)}
      tone={tone}
      className={className}
      controls={
        <div className="flex w-40 flex-col gap-2 sm:w-52">
          <SegmentedToggle<World>
            ariaLabel={t("worldLabel")}
            value={world}
            onChange={setWorld}
            options={[
              { value: "earth", label: t("earth"), tone: "var(--muted)" },
              { value: "pandora", label: t("pandora"), tone: "var(--teal)" },
            ]}
          />
          <VizSlider
            label={t("controls.fetch")}
            display={t("kmValue", { km: segments * SEGMENT_KM })}
            min={3}
            max={10}
            step={1}
            value={segments}
            onChange={setSegments}
            tone="var(--cyan)"
          />
          <VizSlider
            label={t("controls.clearing")}
            display={
              cleared === null ? t("noClearing") : t("kmValue", { km: (cleared - 1) * SEGMENT_KM })
            }
            min={0}
            max={segments}
            step={1}
            value={clearAt}
            onChange={setClearAt}
            tone="var(--magenta)"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            rho: Math.round(result.recyclingRatio * 100),
            interior: result.interiorRainMm.toFixed(1),
          })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {/* the ocean the column starts over, at the left edge */}
          <rect
            x={0}
            y={BASE_Y}
            width={PAD.l}
            height={H - BASE_Y}
            fill="var(--cyan)"
            opacity={0.16}
          />
          <VizText x={4} y={H - 6} size="micro" tone="cyan">
            {t("ocean")}
          </VizText>

          {/* ground line */}
          <line
            x1={PAD.l}
            y1={BASE_Y}
            x2={PAD.l + plotW}
            y2={BASE_Y}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
          />

          {/* y axis: mm of column rained out per segment */}
          <VizTick x={PAD.l - 6} y={BASE_Y + 3} anchor="end">
            0
          </VizTick>
          <VizTick x={PAD.l - 6} y={yOf(4) + 3} anchor="end">
            4
          </VizTick>
          <VizTick x={PAD.l - 6} y={yOf(8) + 3} anchor="end">
            8
          </VizTick>

          {result.steps.map((s) => {
            const x = xOf(s.index) - barW / 2;
            const marineMm = s.rainMm - s.recycledMm;
            const topY = yOf(s.rainMm);
            const marineTopY = yOf(marineMm);
            return (
              <g key={s.index}>
                {/* canopy stripe under each segment: living teal, or dead grey if cut */}
                <rect
                  x={xOf(s.index) - (plotW / segments) * 0.46}
                  y={BASE_Y + 2}
                  width={(plotW / segments) * 0.92}
                  height={5}
                  rx={1.5}
                  fill={s.forested ? "var(--teal)" : "var(--magenta)"}
                  opacity={s.forested ? 0.7 : 0.45}
                />
                {/* recycled portion sits on top of the marine portion */}
                <rect
                  x={x}
                  y={topY}
                  width={barW}
                  height={Math.max(0, marineTopY - topY)}
                  rx={2}
                  fill="var(--teal)"
                  opacity={0.9}
                  filter={glowUrl(uid, "bloom")}
                />
                <rect
                  x={x}
                  y={marineTopY}
                  width={barW}
                  height={Math.max(1, BASE_Y - marineTopY)}
                  rx={2}
                  fill="var(--cyan)"
                  opacity={0.55}
                />
              </g>
            );
          })}

          {/* where the chainsaws stop, if anywhere */}
          {cleared !== null ? (
            <g>
              <line
                x1={PAD.l + (plotW / segments) * (cleared - 1)}
                y1={PAD.t - 2}
                x2={PAD.l + (plotW / segments) * (cleared - 1)}
                y2={BASE_Y + 9}
                stroke="var(--magenta)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <VizText
                x={PAD.l + (plotW / segments) * (cleared - 1) + 3}
                y={PAD.t + 6}
                size="micro"
                tone="magenta"
              >
                {t("clearingMark")}
              </VizText>
            </g>
          ) : null}

          <VizText x={PAD.l} y={H - 6} size="micro" tone="var(--subtle)">
            {t("inland")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.recycled")}
            value={`${Math.round(result.recyclingRatio * 100)}%`}
            note={t("readout.recycledNote")}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.interior")}
            value={t("mmValue", { mm: result.interiorRainMm.toFixed(1) })}
            note={t("readout.interiorNote", { km: segments * SEGMENT_KM })}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.cost")}
            value={cleared === null ? "—" : `−${Math.round(result.interiorShortfall * 100)}%`}
            note={cleared === null ? t("readout.costNone") : t("readout.costNote")}
            tone={toneVar}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("footnote")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
