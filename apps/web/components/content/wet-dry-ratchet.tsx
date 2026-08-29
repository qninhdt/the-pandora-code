"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  CYCLE_COUNT,
  CYCLE_PERIOD_SECONDS,
  LAB_CEILING,
  direction,
  phaseOf,
  ratchetTrace,
  waterActivity,
} from "./wet-dry-ratchet-model";

// Bulk water is where polymers go to die: joining two monomers expels a water
// molecule, so a chain in a full ocean falls apart as fast as it forms. The way
// out is to keep drying the pool. Watch the water level fall and the reaction flip
// to condensing, then watch the refill hydrolyse most of what was made — but not
// all. The survivors carry forward, so the trace climbs while the permanently
// submerged control stays pinned at the floor. That is the whole reason a
// shoreline can do something a vent cannot. Model in wet-dry-ratchet-model.ts.

const W = 340;
const H = 200;
const POOL_X = 16;
const POOL_W = 128;
const POOL_TOP = 26;
const POOL_H = 122;
const PLOT_X0 = 176;
const PLOT_X1 = 328;
const PLOT_Y0 = 30;
const PLOT_Y1 = 148;
const PLOT_L_MAX = 60;

const xForCycle = (n: number) => PLOT_X0 + (n / CYCLE_COUNT) * (PLOT_X1 - PLOT_X0);
const yForLength = (l: number) =>
  PLOT_Y1 - (Math.min(l, PLOT_L_MAX) / PLOT_L_MAX) * (PLOT_Y1 - PLOT_Y0);

type Setting = "cycled" | "submerged";

export function WetDryRatchet({ caption, className }: { caption?: string; className?: string }) {
  const uid = useId();
  const t = useTranslations("viz.wetDryRatchet");

  const [setting, setSetting] = useState<Setting>("cycled");
  const submerged = setting === "submerged";
  const { phase } = usePhaseLoop({ period: CYCLE_PERIOD_SECONDS, playing: true, initial: 0 });

  const activity = waterActivity(phase, submerged);
  const dir = direction(activity);
  const cyclePhase = submerged ? "wet" : phaseOf(phase);
  const trace = ratchetTrace(CYCLE_COUNT);
  const reached = submerged ? trace[0].submerged : trace[trace.length - 1].cycled;
  const tone = dir === "condensing" ? "var(--teal)" : "var(--magenta)";

  const waterY = POOL_TOP + (1 - activity) * (POOL_H * 0.72);
  const path = (key: Setting) =>
    trace
      .map(
        (s, i) =>
          `${i === 0 ? "M" : "L"} ${xForCycle(s.cycle).toFixed(1)} ${yForLength(key === "cycled" ? s.cycled : s.submerged).toFixed(1)}`,
      )
      .join(" ");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={dir === "condensing" ? "teal" : "magenta"}
      hint={t(`hint.${setting}`)}
      controls={
        <SegmentedToggle
          options={[
            { value: "cycled" as Setting, label: t("setting.cycled"), tone: "var(--teal)" },
            {
              value: "submerged" as Setting,
              label: t("setting.submerged"),
              tone: "var(--magenta)",
            },
          ]}
          value={setting}
          onChange={setSetting}
          ariaLabel={t("settingLabel")}
        />
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={t("aria", { n: reached })}
      >
        <GlowDefs idBase={uid} tones={["teal", "magenta", "cyan", "amber"]} />

        {/* the rock pool, drying and refilling */}
        <rect
          x={POOL_X}
          y={POOL_TOP}
          width={POOL_W}
          height={POOL_H}
          rx={4}
          fill="color-mix(in oklab, var(--void) 60%, transparent)"
          stroke="var(--border)"
          strokeWidth={0.8}
        />
        <rect
          x={POOL_X + 1}
          y={waterY}
          width={POOL_W - 2}
          height={POOL_TOP + POOL_H - waterY - 1}
          rx={3}
          fill="color-mix(in oklab, var(--cyan) 26%, var(--void))"
          style={{ transition: "y 120ms linear, height 120ms linear" }}
        />
        {/* monomers linking or breaking at the drying margin */}
        {Array.from({ length: 7 }, (_, i) => {
          const linked = dir === "condensing";
          const x = POOL_X + 18 + i * 15;
          const y = POOL_TOP + POOL_H - 22;
          return (
            <g key={`unit-${uid}-${i}`}>
              <circle
                cx={x}
                cy={y}
                r={3.2}
                fill={linked ? "var(--teal)" : "var(--magenta)"}
                filter={glowUrl(uid, "bloom")}
              />
              {i < 6 ? (
                <line
                  x1={x + 3.2}
                  y1={y}
                  x2={x + 11.8}
                  y2={y}
                  stroke={linked ? "var(--teal)" : "var(--border-strong)"}
                  strokeWidth={linked ? 1.6 : 0.8}
                  strokeDasharray={linked ? undefined : "1 3"}
                />
              ) : null}
            </g>
          );
        })}
        <VizText
          x={POOL_X}
          y={POOL_TOP - 8}
          size="small"
          tone={dir === "condensing" ? "teal" : "magenta"}
          weight={700}
        >
          {t(`phase.${cyclePhase}`)}
        </VizText>
        <VizText x={POOL_X} y={POOL_TOP + POOL_H + 14} size="micro" tone="subtle">
          {t(`direction.${dir}`)}
        </VizText>

        {/* chain length across cycles: the ratchet against the flat control */}
        <rect
          x={PLOT_X0}
          y={yForLength(LAB_CEILING)}
          width={PLOT_X1 - PLOT_X0}
          height={3}
          fill="color-mix(in oklab, var(--cyan) 40%, transparent)"
        />
        <VizText x={PLOT_X1} y={yForLength(LAB_CEILING) - 5} anchor="end" size="micro" tone="cyan">
          {t("labCeiling")}
        </VizText>
        <path
          d={path("submerged")}
          fill="none"
          stroke="var(--magenta)"
          strokeWidth={1.4}
          strokeOpacity={submerged ? 1 : 0.4}
          strokeDasharray="3 3"
        />
        <path
          d={path("cycled")}
          fill="none"
          stroke="var(--teal)"
          strokeWidth={1.8}
          strokeOpacity={submerged ? 0.3 : 1}
          filter={submerged ? undefined : glowUrl(uid, "bloom")}
        />
        <line
          x1={PLOT_X0}
          y1={PLOT_Y1}
          x2={PLOT_X1}
          y2={PLOT_Y1}
          stroke="var(--border)"
          strokeWidth={0.8}
        />
        {[0, 20, 40, 60].map((l) => (
          <VizTick key={l} x={PLOT_X0 - 5} y={yForLength(l) + 3} anchor="end">
            {l}
          </VizTick>
        ))}
        <VizText x={PLOT_X0 - 5} y={PLOT_Y0 - 6} anchor="end" size="micro" tone="subtle">
          {t("yAxis")}
        </VizText>
        <VizText x={PLOT_X1} y={H - 6} anchor="end" size="micro" tone="subtle">
          {t("xAxis")}
        </VizText>
      </svg>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("activityLabel")}
          value={activity.toFixed(2)}
          note={t("activityNote")}
          tone={tone}
          tinted
        />
        <VizReadout
          label={t("reachedLabel")}
          value={t("unitsValue", { n: reached })}
          note={t("reachedNote")}
          tone={submerged ? "var(--magenta)" : "var(--teal)"}
        />
        <VizReadout
          label={t("cyclesLabel")}
          value={submerged ? t("noneValue") : String(CYCLE_COUNT)}
          note={t("cyclesNote")}
          tone="var(--cyan)"
        />
      </div>
    </VizFigure>
  );
}
