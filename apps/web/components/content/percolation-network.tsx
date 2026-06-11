"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  type AttackMode,
  H,
  NODE_COUNT,
  W,
  buildNetwork,
  giantComponentCurve,
  removedSet,
} from "./percolation-model";

interface PercolationNetworkProps {
  caption?: string;
  className?: string;
}

// Why burning a network fails — until it doesn't. A scale-free graph (a few hubs,
// many leaves) is drawn as glowing nodes and links; the reader removes a fraction
// of it and watches the giant connected component (the part still wired into one
// whole) survive or shatter. Under RANDOM removal the giant component clings on
// far past intuition and only collapses near total annihilation — the percolation
// cliff shoved toward 1. Switch to TARGETED and hubs fall first: the same network
// fragments after only a handful of removals. All curves are precomputed and
// deterministic (percolation-model.ts) so dragging the slider never jitters.
export function PercolationNetwork({ caption, className }: PercolationNetworkProps) {
  const uid = useId();
  const t = useTranslations("viz.percolationNetwork");
  const reduced = useReducedMotionSafe();

  const nodes = useMemo(buildNetwork, []);
  const [mode, setMode] = useState<AttackMode>("random");
  // How many nodes are removed (0..NODE_COUNT). Slider exposes it as a fraction.
  const [removedCount, setRemovedCount] = useState(0);

  const curve = useMemo(() => giantComponentCurve(nodes, mode), [nodes, mode]);
  const removed = useMemo(
    () => removedSet(nodes, mode, removedCount),
    [nodes, mode, removedCount],
  );

  const giant = curve[removedCount];
  const removedPct = Math.round((removedCount / NODE_COUNT) * 100);
  // "Shattered" once the largest surviving cluster is a small minority of the net.
  const shattered = giant <= 25;
  const verdict = removedCount === 0 ? t("intact") : shattered ? t("shattered") : t("connected");

  const verdictTone = shattered ? "var(--magenta)" : "var(--cyan)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={shattered ? "magenta" : "cyan"}
      hint={
        removedCount === 0
          ? t("prompt")
          : shattered
            ? t("shatteredNote")
            : mode === "random"
              ? t("randomNote")
              : t("targetedNote")
      }
      controls={
        <SegmentedToggle<AttackMode>
          ariaLabel={t("modeLabel")}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setRemovedCount(0);
          }}
          options={[
            { value: "random", label: t("modeRandom"), tone: "var(--cyan)" },
            { value: "targeted", label: t("modeTargeted"), tone: "var(--magenta)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "magenta"]} />

          {/* edges — drawn once; faded out when either endpoint has fallen */}
          {nodes.map((node) =>
            node.neighbours
              .filter((n) => n > node.id)
              .map((n) => {
                const other = nodes[n];
                const dead = removed.has(node.id) || removed.has(n);
                return (
                  <line
                    key={`${node.id}-${n}`}
                    x1={node.x}
                    y1={node.y}
                    x2={other.x}
                    y2={other.y}
                    stroke={dead ? "var(--border)" : "var(--cyan)"}
                    strokeWidth={dead ? 0.5 : 1}
                    strokeOpacity={dead ? 0.12 : 0.4}
                  />
                );
              }),
          )}

          {/* nodes — surviving nodes glow by mode tone; fallen ones go dark */}
          {nodes.map((node) => {
            const dead = removed.has(node.id);
            // Size by degree so hubs read as bigger targets.
            const r = 3 + Math.min(node.degree, 12) * 0.45;
            const liveFill = mode === "targeted" ? "var(--magenta)" : "var(--cyan)";
            return (
              <circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r={r}
                fill={dead ? "color-mix(in oklab, var(--void) 60%, var(--border))" : liveFill}
                stroke={dead ? "var(--border)" : "var(--border-strong)"}
                strokeWidth={0.8}
                opacity={dead ? 0.4 : 1}
                filter={dead ? undefined : glowUrl(uid, "bloom")}
              />
            );
          })}

          {!reduced && removedCount === 0 && (
            <VizText x={W / 2} y={H - 8} size="micro" tone="cyan" anchor="middle">
              {t("hubHint")}
            </VizText>
          )}
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout
            label={t("removedLabel")}
            value={`${removedPct}%`}
            tone="var(--magenta)"
            tinted={removedCount > 0}
          />
          <VizReadout
            label={t("giantLabel")}
            value={`${giant}%`}
            tone={verdictTone}
            tinted={removedCount > 0}
            note={t("giantNote")}
          />
          <VizReadout
            label={t("verdictLabel")}
            value={verdict}
            tone={verdictTone}
            tinted={removedCount > 0}
          />
          <VizSlider
            label={t("removeSlider")}
            display={`${removedPct}%`}
            min={0}
            max={NODE_COUNT}
            step={1}
            value={removedCount}
            onChange={setRemovedCount}
            tone={mode === "targeted" ? "var(--magenta)" : "var(--cyan)"}
            className="mt-1"
          />
          <p className="font-sans text-[0.7rem] uppercase tracking-wider text-subtle">
            {mode === "targeted" ? t("targetedHint") : t("randomHint")}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
