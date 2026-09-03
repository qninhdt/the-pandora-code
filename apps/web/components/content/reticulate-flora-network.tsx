"use client";

import {
  CLADES,
  DESCENT_EDGES,
  EDGES,
  EDGE_KINDS,
  type Layer,
  lateralArc,
  layoutFor,
  statsFor,
  toneForKind,
} from "@/components/content/reticulate-flora-model";
import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { branchCurve } from "@/components/content/viz/tree";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// The proposed Pandoran floral groups drawn first as an ordinary branching tree,
// then with the lateral channels added. The moment the second layer appears the
// diagram gains closed loops, and a diagram with a loop in it is not a tree — it
// is a network. That is the chapter's structural claim, made visible.

const W = 340;
const H = 168;

interface ReticulateFloraNetworkProps {
  caption?: string;
  className?: string;
}

export function ReticulateFloraNetwork({ caption, className }: ReticulateFloraNetworkProps) {
  const uid = useId();
  const t = useTranslations("viz.reticulateFlora");
  const [layer, setLayer] = useState<Layer>("tree");

  const pos = useMemo(() => layoutFor(W, H), []);
  const stats = useMemo(() => statsFor(layer), [layer]);
  const webbed = layer === "network";
  const tone = webbed ? "var(--magenta)" : "var(--cyan)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={webbed ? "magenta" : "cyan"}
      caption={caption}
      hint={t(`hint.${layer}`)}
      controls={
        <SegmentedToggle
          options={[
            { value: "tree", label: t("layer.tree"), tone: "var(--cyan)" },
            { value: "network", label: t("layer.network"), tone: "var(--magenta)" },
          ]}
          value={layer}
          onChange={setLayer}
          ariaLabel={t("layerLabel")}
        />
      }
      className={className}
    >
      <div className="flex flex-col gap-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={t(`aria.${layer}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          {/* descent: the ordinary branching tree */}
          {DESCENT_EDGES.map((e) => (
            <path
              key={`d-${e.child}`}
              d={branchCurve(pos[e.parent], pos[e.child])}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth={1.4}
            />
          ))}

          {/* the lateral channels a tree cannot express */}
          {webbed
            ? EDGES.map((e) => {
                const kindTone = `var(--${toneForKind(e.kind)})`;
                return (
                  <path
                    key={`l-${e.from}-${e.to}`}
                    d={lateralArc(pos[e.from], pos[e.to])}
                    fill="none"
                    stroke={kindTone}
                    strokeWidth={1.2}
                    strokeDasharray={e.tier === "inference" ? "4 3" : undefined}
                    strokeOpacity={0.9}
                    filter={glowUrl(uid, "bloom")}
                  />
                );
              })
            : null}

          {/* the clades themselves */}
          {CLADES.map((c) => {
            const nodeTone = c.tier === "canon" ? "var(--teal)" : "var(--cyan)";
            const isStem = c.parent === null;
            return (
              <g key={c.key}>
                <circle
                  cx={pos[c.key].x}
                  cy={pos[c.key].y}
                  r={isStem ? 5 : 3.6}
                  fill={`color-mix(in oklab, ${nodeTone} 34%, var(--void))`}
                  stroke={nodeTone}
                  strokeWidth={1.1}
                  filter={glowUrl(uid, "soft-shadow")}
                />
                <VizText
                  x={pos[c.key].x + (c.depth === 3 ? -8 : 8)}
                  y={pos[c.key].y + 3}
                  size="micro"
                  anchor={c.depth === 3 ? "end" : "start"}
                  tone={c.tier === "canon" ? "teal" : undefined}
                  weight={c.tier === "canon" ? 600 : 400}
                >
                  {t(`clade.${c.key}`)}
                </VizText>
              </g>
            );
          })}
        </svg>

        {webbed ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {EDGE_KINDS.map((kind) => (
              <li key={kind} className="flex items-center gap-1.5 font-sans text-xs text-subtle">
                <span
                  aria-hidden
                  className="inline-block h-0.5 w-4 rounded-full"
                  style={{ background: `var(--${toneForKind(kind)})` }}
                />
                {t(`edge.${kind}`)}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-3">
          <VizReadout
            label={t("readout.descent")}
            value={stats.descentEdges}
            note={t("readout.descentNote")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.lateral")}
            value={stats.lateralEdges}
            note={t("readout.lateralNote")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.shape")}
            value={stats.cycles > 0 ? t("readout.network") : t("readout.tree")}
            note={t("readout.shapeNote", { cycles: stats.cycles })}
            tone={tone}
            tinted
          />
        </div>

        <p className="font-sans text-xs leading-relaxed text-muted">{t(`verdict.${layer}`)}</p>
      </div>
    </VizFigure>
  );
}
