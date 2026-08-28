"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  type Basis,
  CHANNELS,
  CHANNEL_TONE,
  TARGET_IDS,
  type TargetId,
  elementsOf,
  provenanceOf,
} from "./nucleosynthesis-ledger-model";

// Pick a sample from the moon and see which astrophysical events actually made
// it. The reader's expected answer is "a supernova" for everything; the figure's
// job is to break that. Ocean water is mostly primordial hydrogen by atom count
// and almost entirely supernova oxygen by mass — the same sample, two honest
// answers — while the ore vein traces almost entirely to neutron-star mergers,
// events that had to happen before the disk ever formed. Strings from i18n.

interface NucleosynthesisLedgerProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 340;
const VIEW_H = 96;
const BAR_X = 8;
const BAR_W = VIEW_W - 16;
const BAR_Y = 30;
const BAR_H = 34;

export function NucleosynthesisLedger({ caption, className }: NucleosynthesisLedgerProps) {
  const t = useTranslations("viz.nucleosynthesisLedger");
  const uid = useId();

  const [target, setTarget] = useState<TargetId>("mantle");
  const [basis, setBasis] = useState<Basis>("mass");

  const { shares, dominant, dominantPct, primordialPct } = provenanceOf(target, basis);

  // Lay the segments end to end; skip anything too thin to render as a band.
  let cursor = 0;
  const segments = shares
    .filter((s) => s.pct > 0.05)
    .map((s) => {
      const x = BAR_X + (cursor / 100) * BAR_W;
      const w = (s.pct / 100) * BAR_W;
      cursor += s.pct;
      return { ...s, x, w };
    });

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint", { channel: t(`channel.${dominant}`), pct: Math.round(dominantPct) })}
      caption={caption}
      tone="magenta"
      controls={
        <SegmentedToggle
          ariaLabel={t("basisLabel")}
          value={basis}
          onChange={setBasis}
          options={[
            { value: "mass", label: t("basis.mass"), tone: "var(--cyan)" },
            { value: "atoms", label: t("basis.atoms"), tone: "var(--magenta)" },
          ]}
        />
      }
      className={className}
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TARGET_IDS.map((id) => {
          const active = id === target;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setTarget(id)}
              className="rounded-md border px-2.5 py-1.5 font-sans text-xs transition-all duration-200"
              style={{
                borderColor: active
                  ? "color-mix(in oklab, var(--magenta) 45%, transparent)"
                  : "var(--border)",
                background: active
                  ? "color-mix(in oklab, var(--magenta) 12%, transparent)"
                  : "transparent",
                color: active ? "var(--magenta)" : "var(--subtle)",
              }}
            >
              {t(`target.${id}`)}
            </button>
          );
        })}
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={`${t("aria")} — ${t(`target.${target}`)}`}
      >
        <GlowDefs idBase={uid} tones={["cyan", "magenta", "teal", "amber"]} />

        <VizText x={BAR_X} y={16} size="small" tone="magenta">
          {t(`target.${target}`)}
        </VizText>
        <VizText x={BAR_X + BAR_W} y={16} size="micro" anchor="end" tone="muted">
          {elementsOf(target)
            .map((symbol) => t(`element.${symbol}`))
            .join(" · ")}
        </VizText>

        {/* the provenance bar — one band per production channel */}
        {segments.map((seg) => (
          <g key={seg.channel}>
            <rect
              x={seg.x}
              y={BAR_Y}
              width={Math.max(1, seg.w)}
              height={BAR_H}
              rx={2}
              style={{ fill: CHANNEL_TONE[seg.channel] }}
              fillOpacity={0.72}
              filter={seg.pct > 12 ? glowUrl(uid, "bloom") : undefined}
            />
            {seg.pct > 9 ? (
              <VizText
                x={seg.x + seg.w / 2}
                y={BAR_Y + BAR_H / 2 + 3}
                size="small"
                anchor="middle"
                tone="var(--void)"
                weight={700}
                numeric
              >
                {`${Math.round(seg.pct)}%`}
              </VizText>
            ) : null}
          </g>
        ))}
        <rect
          x={BAR_X}
          y={BAR_Y}
          width={BAR_W}
          height={BAR_H}
          rx={2}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth={0.8}
        />

        {/* time's arrow: the channels are laid out oldest event first */}
        <line
          x1={BAR_X}
          y1={BAR_Y + BAR_H + 12}
          x2={BAR_X + BAR_W}
          y2={BAR_Y + BAR_H + 12}
          stroke="var(--border)"
          strokeWidth={0.6}
        />
        <VizText x={BAR_X} y={BAR_Y + BAR_H + 26} size="micro" tone="muted">
          {t("axisEarly")}
        </VizText>
        <VizText x={BAR_X + BAR_W} y={BAR_Y + BAR_H + 26} size="micro" anchor="end" tone="muted">
          {t("axisLate")}
        </VizText>
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {CHANNELS.map((channel) => (
          <span key={channel} className="flex items-center gap-1.5 font-sans text-xs text-subtle">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: CHANNEL_TONE[channel], opacity: 0.8 }}
            />
            {t(`channel.${channel}`)}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <VizReadout
          label={t("dominantLabel")}
          value={t(`channel.${dominant}`)}
          note={t("dominantNote", { pct: Math.round(dominantPct) })}
          tone={CHANNEL_TONE[dominant]}
          tinted
        />
        <VizReadout
          label={t("primordialLabel")}
          value={`${primordialPct < 0.5 ? primordialPct.toFixed(1) : Math.round(primordialPct)}%`}
          note={primordialPct < 1 ? t("primordialNone") : t("primordialSome")}
          tone="var(--magenta)"
        />
      </div>
    </VizFigure>
  );
}
