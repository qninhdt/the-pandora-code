"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { formatTransit, freight } from "./sugar-freight-line-model";

interface SugarFreightLineProps {
  caption?: string;
  className?: string;
}

// Sugar leaving a sunlit leaf for a root has no pump and no engine — only a
// pressure difference between a loading end and an unloading end, and a very long
// pipe. The reader sets the pressure raised at the top, the width of the pores the
// stream must squeeze through, and the height of the tree, then reads how fast the
// stream moves and how long one shipment takes end to end. The trap is in the
// geometry: doubling the height doubles the distance and halves the driving
// gradient, so transit time grows with the square of height. An Earth redwood's
// canopy-to-root run already takes days; a 460 m Hometree's takes weeks unless its
// plumbing is nothing like ours.
// Transport math lives in sugar-freight-line-model.ts; all strings i18n.

const W = 200;
const H = 240;
const TRUNK_X = 92;
const TRUNK_W = 30;
const TOP_Y = 26;
const BASE_Y = 208;

/** Landmark heights, in metres, drawn as reference ticks on the trunk. */
const LANDMARKS = [
  { m: 116, key: "redwood" as const },
  { m: 150, key: "hometree" as const },
  { m: 460, key: "giant" as const },
];
const H_MAX = 480;

export function SugarFreightLine({ caption, className }: SugarFreightLineProps) {
  const uid = useId();
  const t = useTranslations("viz.sugarFreight");
  const reduced = useReducedMotionSafe();
  const [height, setHeight] = useState(150);
  const [turgor, setTurgor] = useState(2.5);
  const [poreRadius, setPoreRadius] = useState(0.9);

  const result = freight(height, turgor, poreRadius);
  const transit = formatTransit(result.transitHours);
  const tone = result.slowFreight ? "magenta" : "teal";
  const toneVar = `var(--${tone})`;

  // The drawn trunk fills the frame; the height slider changes what that frame
  // represents, so the landmark ticks move rather than the trunk.
  const yForMetres = (m: number) => BASE_Y - (m / height) * (BASE_Y - TOP_Y);

  // One shipment's travel time sets the animation period, compressed into a few
  // seconds of screen time so slow freight visibly crawls.
  const period = Math.min(14, Math.max(1.6, result.transitHours / 60));

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone={tone}
      className={className}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mx-auto w-2/3 max-w-[200px] lg:w-[40%]"
          role="img"
          aria-label={t("trunkLabel")}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "cyan", "amber"]} />

          {/* Canopy: the loading end, where sugar is made and pressure is raised. */}
          <ellipse
            cx={TRUNK_X + TRUNK_W / 2}
            cy={TOP_Y - 6}
            rx={62}
            ry={18}
            fill={glowUrl(uid, "wash-teal")}
          />
          <VizText x={TRUNK_X + TRUNK_W / 2} y={12} size="micro" tone="teal" anchor="middle">
            {t("source")}
          </VizText>

          {/* The trunk, with the transport channel running down it. */}
          <rect
            x={TRUNK_X}
            y={TOP_Y}
            width={TRUNK_W}
            height={BASE_Y - TOP_Y}
            fill="color-mix(in oklab, var(--surface-raised) 85%, transparent)"
            stroke="var(--border)"
            strokeWidth={0.8}
          />
          <line
            x1={TRUNK_X + TRUNK_W / 2}
            y1={TOP_Y}
            x2={TRUNK_X + TRUNK_W / 2}
            y2={BASE_Y}
            stroke={toneVar}
            strokeWidth={Math.max(2, poreRadius * 4)}
            strokeOpacity={0.4}
          />

          {/* Sugar packets descending. Each dot is one parcel of loaded sap; the
              period is the real transit time, compressed for the screen. */}
          {[0, 0.25, 0.5, 0.75].map((offset) => (
            <circle
              key={offset}
              cx={TRUNK_X + TRUNK_W / 2}
              r={Math.max(2, poreRadius * 2.6)}
              fill={toneVar}
              filter={glowUrl(uid, "bloom")}
              cy={reduced ? TOP_Y + offset * (BASE_Y - TOP_Y) : TOP_Y}
            >
              {reduced ? null : (
                <animate
                  attributeName="cy"
                  from={TOP_Y}
                  to={BASE_Y}
                  dur={`${period}s`}
                  begin={`${-offset * period}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}

          {/* Landmark heights on the trunk, so the reader keeps a sense of scale. */}
          {LANDMARKS.filter((l) => l.m <= height).map((l) => (
            <g key={l.key}>
              <line
                x1={TRUNK_X - 8}
                y1={yForMetres(l.m)}
                x2={TRUNK_X}
                y2={yForMetres(l.m)}
                stroke="var(--border-strong)"
                strokeWidth={1}
              />
              <VizText x={TRUNK_X - 11} y={yForMetres(l.m) + 3} size="micro" anchor="end">
                {t(`landmark.${l.key}`)}
              </VizText>
            </g>
          ))}

          {/* Roots: the unloading end, where the pressure falls again. */}
          <path
            d={`M ${TRUNK_X - 26} ${BASE_Y + 22} Q ${TRUNK_X + TRUNK_W / 2} ${BASE_Y - 2} ${
              TRUNK_X + TRUNK_W + 26
            } ${BASE_Y + 22}`}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={1.6}
          />
          <VizText
            x={TRUNK_X + TRUNK_W / 2}
            y={BASE_Y + 34}
            size="micro"
            tone="amber"
            anchor="middle"
          >
            {t("sink")}
          </VizText>
        </svg>

        <div className="flex flex-col gap-3 lg:w-[60%]">
          <VizSlider
            label={t("heightLabel")}
            display={`${height} m`}
            min={30}
            max={H_MAX}
            step={10}
            value={height}
            onChange={setHeight}
            tone={toneVar}
          />
          <VizSlider
            label={t("turgorLabel")}
            display={`${turgor.toFixed(1)} MPa`}
            min={1.5}
            max={3}
            step={0.1}
            value={turgor}
            onChange={setTurgor}
            tone="var(--teal)"
          />
          <VizSlider
            label={t("poreLabel")}
            display={`${poreRadius.toFixed(1)} µm`}
            min={0.3}
            max={1.6}
            step={0.1}
            value={poreRadius}
            onChange={setPoreRadius}
            tone="var(--cyan)"
          />
          <div className="grid grid-cols-2 gap-2">
            <VizReadout
              label={t("velocityLabel")}
              value={result.velocity.toFixed(2)}
              note={t("velocityNote")}
              tone={toneVar}
            />
            <VizReadout
              label={t("gradientLabel")}
              value={result.gradient.toFixed(4)}
              note={t("gradientNote")}
              tone="var(--cyan)"
            />
          </div>
          <VizReadout
            label={t("transitLabel")}
            value={`${transit.value} ${t(`unit.${transit.unit}`)}`}
            note={t("transitNote")}
            tone={toneVar}
            tinted
          />
          <p className="font-sans text-xs leading-relaxed text-subtle">
            {result.slowFreight ? t("verdictSlow") : t("verdictWorkable")}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
