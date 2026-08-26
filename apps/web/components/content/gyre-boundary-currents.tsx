"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  BASIN,
  LIMBS,
  type Limb,
  buildGyreLoop,
  limbSpeed,
  limbWidth,
  positionAt,
} from "./gyre-boundary-currents-model";

// A basin-scale loop the reader can watch go lopsided. Turn off the latitude
// gradient in rotation and the gyre is a fair racetrack: both long margins the
// same width, drifters evenly spread. Turn it up and the western margin
// narrows and accelerates while the eastern margin spreads and slows — the same
// water, the same wind, two completely different places to be a migrating
// animal. Geometry and timing live in gyre-boundary-currents-model.ts.

const W = 312;
const H = 224;
const DRIFTERS = 14;
const TONES: Record<Limb, string> = {
  equatorward: "var(--cyan)",
  west: "var(--magenta)",
  poleward: "var(--cyan)",
  east: "var(--teal)",
};

interface GyreBoundaryCurrentsProps {
  caption?: string;
  className?: string;
}

export function GyreBoundaryCurrents({ caption, className }: GyreBoundaryCurrentsProps) {
  const uid = useId();
  const t = useTranslations("viz.gyreBoundaryCurrents");
  const reduced = useReducedMotionSafe();
  const [asymmetry, setAsymmetry] = useState(0.72);
  const [north, setNorth] = useState(true);
  const [playing, setPlaying] = useState(true);
  const { phase } = usePhaseLoop({ period: 9, playing: playing && !reduced, initial: 0 });

  const loop = useMemo(() => buildGyreLoop(asymmetry, north), [asymmetry, north]);
  const westSpeed = limbSpeed("west", asymmetry);
  const eastSpeed = limbSpeed("east", asymmetry);
  const lopsided = asymmetry > 0.15;
  const tone = lopsided ? "magenta" : "cyan";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(lopsided ? "hint.intensified" : "hint.symmetric")}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <div className="flex items-center gap-2">
          <SegmentedToggle
            options={[
              { value: "north", label: t("hemisphere.north"), tone: "var(--cyan)" },
              { value: "south", label: t("hemisphere.south"), tone: "var(--teal)" },
            ]}
            value={north ? "north" : "south"}
            onChange={(v) => setNorth(v === "north")}
            ariaLabel={t("hemisphereLabel")}
          />
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t("pause") : t("play")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-all hover:border-cyan/60 hover:bg-void/70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-xl border border-border/60 bg-void/50 sm:w-3/5"
          role="img"
          aria-label={t("aria", { west: westSpeed.toFixed(1) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta"]} />

          {/* the two landmasses that close the basin */}
          <rect x={0} y={0} width={26} height={H} fill="var(--muted)" opacity={0.45} />
          <rect x={W - 26} y={0} width={26} height={H} fill="var(--muted)" opacity={0.45} />
          <VizText x={13} y={H / 2} size="micro" anchor="middle" tone="var(--foreground)">
            {t("coastWest")}
          </VizText>
          <VizText x={W - 13} y={H / 2} size="micro" anchor="middle" tone="var(--foreground)">
            {t("coastEast")}
          </VizText>

          {LIMBS.map((limb) => (
            <path
              key={limb}
              d={loop.limbPaths[limb]}
              fill="none"
              stroke={TONES[limb]}
              strokeWidth={limbWidth(limb, asymmetry)}
              strokeOpacity={0.32}
              strokeLinecap="round"
            />
          ))}

          {/* drifters spaced by equal transit time, so crowding reads as slowness */}
          {Array.from({ length: DRIFTERS }, (_, i) => {
            const p = positionAt(loop, phase + i / DRIFTERS);
            return (
              <circle
                key={`drifter-${i}`}
                cx={p.x}
                cy={p.y}
                r={2.6}
                fill="var(--foreground)"
                opacity={0.9}
                filter={glowUrl(uid, "bloom")}
              />
            );
          })}

          <VizText
            x={BASIN.cx - BASIN.a - 4}
            y={BASIN.cy - 12}
            size="small"
            anchor="middle"
            tone="var(--magenta)"
            transform={`rotate(-90 ${BASIN.cx - BASIN.a - 4} ${BASIN.cy - 12})`}
            weight={700}
          >
            {t("limb.west")}
          </VizText>
          <VizText
            x={BASIN.cx + BASIN.a + 6}
            y={BASIN.cy + 12}
            size="small"
            anchor="middle"
            tone="var(--teal)"
            transform={`rotate(90 ${BASIN.cx + BASIN.a + 6} ${BASIN.cy + 12})`}
            weight={700}
          >
            {t("limb.east")}
          </VizText>
          <VizText x={BASIN.cx} y={BASIN.cy + 4} size="small" anchor="middle" tone="var(--subtle)">
            {t("interior")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.west")}
            value={`×${westSpeed.toFixed(1)}`}
            note={t("readout.westNote")}
            tone="var(--magenta)"
          />
          <VizReadout
            label={t("readout.east")}
            value={`×${eastSpeed.toFixed(1)}`}
            note={t("readout.eastNote")}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.dwell")}
            value={`${Math.round(loop.limbShare.east * 100)}% / ${Math.round(loop.limbShare.west * 100)}%`}
            note={t(lopsided ? "verdict.intensified" : "verdict.symmetric")}
            tone={lopsided ? "var(--magenta)" : "var(--cyan)"}
            tinted
          />
        </div>
      </div>

      <div className="mt-4">
        <VizSlider
          label={t("slider.gradient")}
          display={t(
            asymmetry < 0.15 ? "slider.none" : asymmetry < 0.6 ? "slider.mild" : "slider.strong",
          )}
          min={0}
          max={1}
          step={0.02}
          value={asymmetry}
          onChange={setAsymmetry}
          tone={lopsided ? "var(--magenta)" : "var(--cyan)"}
        />
      </div>
    </VizFigure>
  );
}
