"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  ARCH,
  VOUSSOIRS,
  collapseState,
  foodWeb,
  keystoneTransform,
  stoneTransform,
} from "./keystone-arch-geometry";

interface KeystoneCascadeToggleProps {
  caption?: string;
  className?: string;
}

// The chapter's stone-arch metaphor made mechanical. The apex predator is the
// keystone wedge at the crown; a slider pulls it out, and past a tipping fraction
// the whole arch lets go — voussoirs sliding and rotating away — while a coupled
// food-web strip shows grazers ballooning and vegetation crushed, interpolated
// continuously so the cascade reads as causal rather than as two hardcoded states.
// Reduced motion collapses the slider to a present/removed toggle. Geometry + model
// live in keystone-arch-geometry.ts; every string is translated.

const W = 320;
const H = 210;
const TONE: Record<"apex" | "grazer" | "plants", string> = {
  apex: "var(--magenta)",
  grazer: "var(--amber)",
  plants: "var(--teal)",
};

export function KeystoneCascadeToggle({ caption, className }: KeystoneCascadeToggleProps) {
  const uid = useId();
  const t = useTranslations("viz.keystoneCascade");
  const reduced = useReducedMotionSafe();
  const [removal, setRemoval] = useState(0);

  const { collapse, phase } = collapseState(removal);
  const web = foodWeb(removal);
  const ks = keystoneTransform(removal);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      hint={t(`phase.${phase}`)}
      tone={phase === "collapsed" ? "amber" : phase === "tipping" ? "amber" : "teal"}
      controls={
        reduced ? (
          <SegmentedToggle<"present" | "removed">
            ariaLabel={t("title")}
            value={removal < 0.5 ? "present" : "removed"}
            onChange={(v) => setRemoval(v === "present" ? 0 : 1)}
            options={[
              { value: "present", label: t("present"), tone: "var(--teal)" },
              { value: "removed", label: t("removed"), tone: "var(--amber)" },
            ]}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t(`phase.${phase}`)}
        >
          <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />

          {/* ground line the springers rest on */}
          <line
            x1={ARCH.cx - ARCH.ro - 4}
            y1={ARCH.cy + 1}
            x2={ARCH.cx + ARCH.ro + 4}
            y2={ARCH.cy + 1}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
          />

          {/* voussoirs — the trophic stones of the arch */}
          {VOUSSOIRS.map((v) => {
            if (v.isKeystone) {
              return (
                <g
                  key={v.index}
                  transform={`translate(0 ${ks.dy})`}
                  style={{ transition: "transform 0.4s ease, opacity 0.4s ease" }}
                  opacity={ks.opacity}
                >
                  <polygon
                    points={v.points}
                    fill="var(--magenta)"
                    fillOpacity={0.9}
                    stroke="var(--magenta)"
                    strokeWidth={1}
                    filter={glowUrl(uid, "bloom")}
                  />
                </g>
              );
            }
            return (
              <polygon
                key={v.index}
                points={v.points}
                transform={stoneTransform(v, collapse)}
                fill="color-mix(in oklab, var(--teal) 22%, var(--surface))"
                stroke="color-mix(in oklab, var(--teal) 45%, transparent)"
                strokeWidth={1}
                style={{ transition: "transform 0.5s cubic-bezier(0.4, 0, 0.4, 1)" }}
              />
            );
          })}

          {/* keystone label pinned above the crown */}
          <VizText
            x={ARCH.cx}
            y={ARCH.cy - ARCH.ro - 8}
            size="micro"
            tone="magenta"
            anchor="middle"
          >
            {t("keystone")}
          </VizText>
        </svg>

        {/* coupled food-web strip — HTML side panel so labels never clip */}
        <div className="flex flex-col justify-center gap-3 sm:w-2/5">
          {(["apex", "grazer", "plants"] as const).map((k) => (
            <div key={k}>
              <p className="mb-1 font-sans text-xs text-subtle">{t(k)}</p>
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-border bg-void/40">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, web[k] * 100)}%`,
                    background: TONE[k],
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {!reduced && (
        <VizSlider
          label={t("removalLabel")}
          display={`${Math.round(removal * 100)}%`}
          min={0}
          max={1}
          step={0.01}
          value={removal}
          onChange={setRemoval}
          tone="var(--magenta)"
          className="mt-3"
        />
      )}
    </VizFigure>
  );
}
