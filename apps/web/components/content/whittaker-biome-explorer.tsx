"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { ReferenceMarker } from "@/components/content/viz/reference-marker";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";

interface WhittakerBiomeExplorerProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 460;
const VIEW_H = 300;
const PAD = { left: 50, right: 16, top: 18, bottom: 40 };
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;

const T_MIN = -15;
const T_MAX = 30; // mean annual temperature, °C
const P_MIN = 0;
const P_MAX = 450; // annual precipitation, cm

type BiomeKey =
  | "tundra"
  | "boreal"
  | "grassland"
  | "tempForest"
  | "tempRainforest"
  | "desert"
  | "savanna"
  | "tropicalRainforest";

const BIOMES: Record<BiomeKey, { color: string }> = {
  tundra: {
    color: "color-mix(in oklab, var(--cyan) 32%, var(--void))",
  },
  boreal: {
    color: "color-mix(in oklab, var(--teal) 45%, var(--void))",
  },
  grassland: {
    color: "color-mix(in oklab, var(--amber) 50%, var(--void))",
  },
  tempForest: {
    color: "color-mix(in oklab, var(--teal) 75%, var(--cyan))",
  },
  tempRainforest: {
    color: "color-mix(in oklab, var(--cyan) 78%, var(--void))",
  },
  desert: {
    color: "var(--amber)",
  },
  savanna: {
    color: "color-mix(in oklab, var(--amber) 62%, var(--teal))",
  },
  tropicalRainforest: {
    color: "var(--teal)",
  },
};

// A simplified Whittaker classification: which biome a climate of mean
// temperature T (°C) and annual precipitation P (cm) supports. Boundaries are
// teaching approximations, not field-survey polygons — enough to make the
// temperature × rainfall logic legible.
function classify(temp: number, precip: number): BiomeKey {
  if (temp < -5) return "tundra";
  if (temp < 4) return precip < 20 ? "tundra" : "boreal";
  if (temp < 20) {
    if (precip < 32) return "grassland";
    if (precip < 130) return "tempForest";
    return "tempRainforest";
  }
  // tropical
  if (precip < 40) return "desert";
  if (precip < 150) return "savanna";
  return "tropicalRainforest";
}

function tx(temp: number): number {
  return PAD.left + ((temp - T_MIN) / (T_MAX - T_MIN)) * PLOT_W;
}
function ty(precip: number): number {
  return PAD.top + (1 - (precip - P_MIN) / (P_MAX - P_MIN)) * PLOT_H;
}

const GRID_NX = 23;
const GRID_NY = 13;

// Reference worlds plotted on the diagram.
const EARTH = { temp: 25, precip: 300 };
const PANDORA = { temp: 27, precip: 360 };
const DEFAULT = { temp: 27, precip: 360 }; // deterministic SSR default = Pandora

// An interactive Whittaker diagram. The reader places a climate on the
// temperature × rainfall plane and reads off the biome it supports, with Earth's
// tropics and Pandora's Australis rainforest marked for comparison — making the
// chapter's point that Pandora's warm, wet air grows rainforest across a far
// wider band than Earth's. SVG-only and deterministic for SSR; sliders keep it
// keyboard-accessible, with optional pointer-drag on the plane.
export function WhittakerBiomeExplorer({ caption, className }: WhittakerBiomeExplorerProps) {
  const t = useTranslations("viz.whittaker");
  const uid = useId();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [temp, setTemp] = useState(DEFAULT.temp);
  const [precip, setPrecip] = useState(DEFAULT.precip);
  const [dragging, setDragging] = useState(false);

  const biome = classify(temp, precip);

  // Convert a pointer event to (temp, precip), clamped to the plotted ranges.
  function pointTo(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const sy = ((e.clientY - rect.top) / rect.height) * VIEW_H;
    const tt = T_MIN + ((sx - PAD.left) / PLOT_W) * (T_MAX - T_MIN);
    const pp = P_MIN + (1 - (sy - PAD.top) / PLOT_H) * (P_MAX - P_MIN);
    setTemp(Math.max(T_MIN, Math.min(T_MAX, Math.round(tt))));
    setPrecip(Math.max(P_MIN, Math.min(P_MAX, Math.round(pp / 5) * 5)));
  }

  const cellW = PLOT_W / GRID_NX;
  const cellH = PLOT_H / GRID_NY;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      hint={t("hint")}
      tone="teal"
      className={className}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full touch-none"
        role="img"
        aria-label={`${t("biome")}: ${t(`biomes.${biome}`)} — ${temp}°C, ${precip} cm`}
        onPointerDown={(e) => {
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          pointTo(e);
        }}
        onPointerMove={(e) => {
          if (dragging) pointTo(e);
        }}
        onPointerUp={(e) => {
          setDragging(false);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
      >
        <GlowDefs idBase={uid} />

        {/* biome field */}
        {Array.from({ length: GRID_NX }, (_, i) =>
          Array.from({ length: GRID_NY }, (_, j) => {
            const cellT = T_MIN + ((i + 0.5) / GRID_NX) * (T_MAX - T_MIN);
            const cellP = P_MIN + (1 - (j + 0.5) / GRID_NY) * (P_MAX - P_MIN);
            const key = classify(cellT, cellP);
            return (
              <rect
                key={`${i}-${j}`}
                x={PAD.left + i * cellW}
                y={PAD.top + j * cellH}
                width={cellW + 0.5}
                height={cellH + 0.5}
                fill={BIOMES[key].color}
                opacity={key === biome ? 0.95 : 0.5}
              />
            );
          }),
        )}

        {/* grid overlay for legibility */}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={PLOT_W}
          height={PLOT_H}
          fill={glowUrl(uid, "grid")}
          opacity={0.4}
        />

        {/* axes */}
        <line
          x1={PAD.left}
          y1={PAD.top + PLOT_H}
          x2={PAD.left + PLOT_W}
          y2={PAD.top + PLOT_H}
          style={{ stroke: "var(--border-strong)" }}
          strokeWidth={1.5}
        />
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + PLOT_H}
          style={{ stroke: "var(--border-strong)" }}
          strokeWidth={1.5}
        />
        <VizText x={PAD.left + PLOT_W / 2} y={VIEW_H - 20} size="small" anchor="middle">
          {t("tempAxis")}
        </VizText>
        <VizText
          x={14}
          y={PAD.top + PLOT_H / 2}
          size="small"
          anchor="middle"
          transform={`rotate(-90 14 ${PAD.top + PLOT_H / 2})`}
        >
          {t("precipAxis")}
        </VizText>
        {/* a few axis ticks */}
        {[-10, 0, 10, 20, 30].map((v) => (
          <VizTick key={v} x={tx(v)} y={PAD.top + PLOT_H + 16}>
            {v}
          </VizTick>
        ))}
        {[0, 150, 300, 450].map((v) => (
          <VizTick key={v} x={PAD.left - 6} y={ty(v) + 3} anchor="end">
            {v}
          </VizTick>
        ))}

        {/* reference markers */}
        <ReferenceMarker
          x={tx(EARTH.temp)}
          y={ty(EARTH.precip)}
          label={t("earth")}
          tone="var(--muted)"
        />
        <ReferenceMarker
          x={tx(PANDORA.temp)}
          y={ty(PANDORA.precip)}
          label={t("pandora")}
          tone="var(--cyan)"
        />

        {/* the draggable climate point */}
        <g transform={`translate(${tx(temp)} ${ty(precip)})`} style={{ cursor: "grab" }}>
          <circle r={8} style={{ fill: "var(--magenta)" }} filter={glowUrl(uid, "bloom-strong")} />
          <circle
            r={13}
            fill="none"
            style={{ stroke: "var(--magenta)", opacity: 0.5 }}
            strokeWidth={1.5}
          />
        </g>
      </svg>

      {/* readout — the classified biome is the figure's answer, so it gets the
          tinted "result" treatment */}
      <VizReadout
        className="mt-2"
        label={t("biome")}
        tone="var(--teal)"
        tinted
        value={
          <span className="flex items-center gap-2">
            <span
              className="inline-block size-3 rounded-full"
              style={{
                background: BIOMES[biome].color,
                boxShadow: `0 0 8px -1px ${BIOMES[biome].color}`,
              }}
            />
            <span>{t(`biomes.${biome}`)}</span>
          </span>
        }
      />

      {/* controls */}
      <div className="mt-3 space-y-3">
        <VizSlider
          label={t("tempLabel")}
          min={T_MIN}
          max={T_MAX}
          step={1}
          value={temp}
          display={`${temp} °C`}
          tone="var(--amber)"
          onChange={setTemp}
        />
        <VizSlider
          label={t("precipLabel")}
          min={P_MIN}
          max={P_MAX}
          step={5}
          value={precip}
          display={`${precip} cm`}
          tone="var(--cyan)"
          onChange={setPrecip}
        />
      </div>
    </VizFigure>
  );
}
