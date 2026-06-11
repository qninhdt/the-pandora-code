"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  H,
  PER_LAYER,
  W,
  buildCoupled,
  runCascade,
} from "./cascading-failure-model";

interface CascadingFailureProps {
  caption?: string;
  className?: string;
}

// The most insidious way to kill Eywa: never touch the forest. Two coupled layers
// — flora (trees, top) and fauna (pollinators and seed-carriers, bottom) — each
// node depending on a partner in the other. Release a plague that kills only
// fauna and watch the failure ricochet: dead fauna strand the flora that needed
// them, dead flora starve the fauna that needed THOSE, an avalanche bouncing
// between two networks that are each robust alone (Buldyrev et al. 2010). The
// reader sets the plague severity and steps through the cascade rounds; all
// states are precomputed and deterministic so scrubbing never jitters.
export function CascadingFailure({ caption, className }: CascadingFailureProps) {
  const t = useTranslations("viz.cascadingFailure");
  const uid = useId();

  const nodes = useMemo(buildCoupled, []);
  const [plague, setPlague] = useState(0);

  const result = useMemo(() => runCascade(nodes, plague), [nodes, plague]);
  const maxRound = result.rounds.length - 1;
  const [round, setRound] = useState(0);

  // Clamp the viewed round to what this plague severity actually produces.
  const viewRound = Math.min(round, maxRound);
  const alive = result.rounds[viewRound];

  const totalAlive = alive.filter(Boolean).length;
  const totalDead = nodes.length - totalAlive;
  const collapsed = totalAlive <= nodes.length * 0.2;
  const tone = collapsed ? "magenta" : totalDead > 0 ? "amber" : "cyan";
  const verdict = plague === 0 ? t("intact") : collapsed ? t("collapsed") : t("cascading");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={tone}
      hint={
        plague === 0
          ? t("prompt")
          : viewRound < maxRound
            ? t("stepHint")
            : collapsed
              ? t("collapsedNote")
              : t("settledNote")
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", { dead: totalDead, total: nodes.length })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "magenta", "amber"]} />

          <VizText x={10} y={20} size="small" tone="cyan">
            {t("floraLayer")}
          </VizText>
          <VizText x={10} y={H - 8} size="small" tone="amber">
            {t("faunaLayer")}
          </VizText>

          {/* dependency links between the two layers */}
          {nodes
            .filter((n) => n.layer === "flora")
            .map((f) => {
              const partner = nodes[PER_LAYER + f.partner];
              const dead = !alive[f.id] || !alive[partner.id];
              return (
                <line
                  key={`dep-${f.id}`}
                  x1={f.x}
                  y1={f.y}
                  x2={partner.x}
                  y2={partner.y}
                  stroke={dead ? "var(--border)" : "var(--cyan)"}
                  strokeWidth={dead ? 0.5 : 1}
                  strokeOpacity={dead ? 0.12 : 0.3}
                />
              );
            })}

          {/* the nodes — alive glow by layer hue; dead go dark */}
          {nodes.map((n) => {
            const isAlive = alive[n.id];
            const liveFill = n.layer === "flora" ? "var(--cyan)" : "var(--amber)";
            return (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={6}
                fill={isAlive ? liveFill : "color-mix(in oklab, var(--void) 60%, var(--magenta))"}
                stroke={isAlive ? "var(--border-strong)" : "var(--magenta)"}
                strokeWidth={0.8}
                opacity={isAlive ? 1 : 0.5}
                filter={isAlive ? glowUrl(uid, "bloom") : undefined}
                style={{ transition: "opacity 0.2s, fill 0.2s" }}
              />
            );
          })}
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("verdictLabel")}
            value={verdict}
            tone={`var(--${tone})`}
            tinted={plague > 0}
          />
          <VizReadout
            label={t("deadLabel")}
            value={`${totalDead} / ${nodes.length}`}
            tone="var(--magenta)"
            tinted={totalDead > 0}
            note={t("deadNote")}
          />
          <VizReadout
            label={t("roundLabel")}
            value={`${viewRound} / ${maxRound}`}
            tone={`var(--${tone})`}
            note={t("roundNote")}
          />
          <VizSlider
            label={t("plagueSlider")}
            display={`${plague} / ${PER_LAYER}`}
            min={0}
            max={PER_LAYER}
            step={1}
            value={plague}
            onChange={(v) => {
              setPlague(v);
              setRound(0);
            }}
            tone="var(--magenta)"
            className="mt-1"
          />
          <VizSlider
            label={t("roundSlider")}
            display={`${viewRound} / ${maxRound}`}
            min={0}
            max={Math.max(maxRound, 1)}
            step={1}
            value={viewRound}
            onChange={setRound}
            tone={`var(--${tone})`}
          />
        </div>
      </div>
    </VizFigure>
  );
}
