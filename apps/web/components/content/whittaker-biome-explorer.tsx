"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import { useId, useRef, useState } from "react";

interface WhittakerBiomeExplorerProps {
  caption?: string;
  locale?: "vi" | "en";
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

const BIOMES: Record<BiomeKey, { vi: string; en: string; color: string }> = {
  tundra: {
    vi: "Đài nguyên",
    en: "Tundra",
    color: "color-mix(in oklab, var(--cyan) 32%, var(--void))",
  },
  boreal: {
    vi: "Rừng taiga (phương bắc)",
    en: "Boreal forest",
    color: "color-mix(in oklab, var(--teal) 45%, var(--void))",
  },
  grassland: {
    vi: "Đồng cỏ ôn đới",
    en: "Temperate grassland",
    color: "color-mix(in oklab, var(--amber) 50%, var(--void))",
  },
  tempForest: {
    vi: "Rừng ôn đới",
    en: "Temperate forest",
    color: "color-mix(in oklab, var(--teal) 75%, var(--cyan))",
  },
  tempRainforest: {
    vi: "Rừng mưa ôn đới",
    en: "Temperate rainforest",
    color: "color-mix(in oklab, var(--cyan) 78%, var(--void))",
  },
  desert: {
    vi: "Sa mạc cận nhiệt",
    en: "Subtropical desert",
    color: "var(--amber)",
  },
  savanna: {
    vi: "Xavan nhiệt đới",
    en: "Tropical savanna",
    color: "color-mix(in oklab, var(--amber) 62%, var(--teal))",
  },
  tropicalRainforest: {
    vi: "Rừng mưa nhiệt đới",
    en: "Tropical rainforest",
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

const STRINGS = {
  vi: {
    tempAxis: "Nhiệt độ trung bình năm (°C) →",
    precipAxis: "Lượng mưa năm (cm) →",
    biome: "Quần xã sinh vật",
    tempLabel: "Nhiệt độ",
    precipLabel: "Lượng mưa",
    earth: "Nhiệt đới Trái Đất",
    pandora: "Pandora (Australis)",
    hint: "Kéo điểm — hoặc dùng thanh trượt — để xem khí hậu nào nuôi quần xã nào. Pandora ấm và ẩm: rừng mưa trải rộng.",
  },
  en: {
    tempAxis: "Mean annual temperature (°C) →",
    precipAxis: "Annual precipitation (cm) →",
    biome: "Biome",
    tempLabel: "Temperature",
    precipLabel: "Precipitation",
    earth: "Earth tropics",
    pandora: "Pandora (Australis)",
    hint: "Drag the point — or use the sliders — to see which climate grows which biome. Pandora is warm and wet: rainforest runs wide.",
  },
} as const;

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
export function WhittakerBiomeExplorer({
  caption,
  locale = "en",
  className,
}: WhittakerBiomeExplorerProps) {
  const reduced = useReducedMotionSafe();
  void reduced;
  const t = STRINGS[locale];
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
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full touch-none"
          role="img"
          aria-label={`${t.biome}: ${BIOMES[biome][locale]} — ${temp}°C, ${precip} cm`}
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
          <text
            x={PAD.left + PLOT_W / 2}
            y={VIEW_H - 22}
            textAnchor="middle"
            style={{ fill: "var(--subtle)", fontSize: 10 }}
            className="font-sans"
          >
            {t.tempAxis}
          </text>
          <text
            x={14}
            y={PAD.top + PLOT_H / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${PAD.top + PLOT_H / 2})`}
            style={{ fill: "var(--subtle)", fontSize: 10 }}
            className="font-sans"
          >
            {t.precipAxis}
          </text>
          {/* a few axis ticks */}
          {[-10, 0, 10, 20, 30].map((v) => (
            <text
              key={v}
              x={tx(v)}
              y={PAD.top + PLOT_H + 14}
              textAnchor="middle"
              style={{ fill: "var(--subtle)", fontSize: 8 }}
              className="font-sans tabular-nums"
            >
              {v}
            </text>
          ))}
          {[0, 150, 300, 450].map((v) => (
            <text
              key={v}
              x={PAD.left - 6}
              y={ty(v) + 3}
              textAnchor="end"
              style={{ fill: "var(--subtle)", fontSize: 8 }}
              className="font-sans tabular-nums"
            >
              {v}
            </text>
          ))}

          {/* reference markers */}
          <Marker x={tx(EARTH.temp)} y={ty(EARTH.precip)} label={t.earth} tone="--muted" hollow />
          <Marker
            x={tx(PANDORA.temp)}
            y={ty(PANDORA.precip)}
            label={t.pandora}
            tone="--cyan"
            hollow
          />

          {/* the draggable climate point */}
          <g transform={`translate(${tx(temp)} ${ty(precip)})`} style={{ cursor: "grab" }}>
            <circle
              r={8}
              style={{ fill: "var(--magenta)", filter: "drop-shadow(0 0 6px var(--magenta))" }}
            />
            <circle
              r={13}
              fill="none"
              style={{ stroke: "var(--magenta)", opacity: 0.5 }}
              strokeWidth={1.5}
            />
          </g>
        </svg>

        {/* readout */}
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-border bg-void/30 px-3 py-2">
          <span className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
            {t.biome}
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block size-3 rounded-full"
              style={{ background: BIOMES[biome].color }}
            />
            <span className="font-display text-sm font-700" style={{ color: "var(--foreground)" }}>
              {BIOMES[biome][locale]}
            </span>
          </span>
        </div>

        {/* controls */}
        <div className="mt-3 space-y-3">
          <Slider
            id={`${uid}-t`}
            label={`${t.tempLabel}`}
            min={T_MIN}
            max={T_MAX}
            step={1}
            value={temp}
            display={`${temp} °C`}
            tone="--amber"
            onChange={setTemp}
          />
          <Slider
            id={`${uid}-p`}
            label={`${t.precipLabel}`}
            min={P_MIN}
            max={P_MAX}
            step={5}
            value={precip}
            display={`${precip} cm`}
            tone="--cyan"
            onChange={setPrecip}
          />
        </div>

        <p className="mt-3 font-sans text-xs text-subtle">{t.hint}</p>
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 font-serif text-sm italic leading-relaxed text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function Marker({
  x,
  y,
  label,
  tone,
  hollow,
}: {
  x: number;
  y: number;
  label: string;
  tone: string;
  hollow?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        r={5}
        fill={hollow ? "var(--void)" : `var(${tone})`}
        style={{ stroke: `var(${tone})` }}
        strokeWidth={2}
      />
      <text x={8} y={-7} style={{ fill: `var(${tone})`, fontSize: 9 }} className="font-sans">
        {label}
      </text>
    </g>
  );
}

function Slider({
  id,
  label,
  min,
  max,
  step,
  value,
  display,
  tone,
  onChange,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  tone: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-sans text-[0.7rem] text-muted">
          {label}
        </label>
        <span
          className="font-display text-xs font-700 tabular-nums"
          style={{ color: `var(${tone})` }}
        >
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, var(${tone}) ${pct}%, var(--border) ${pct}%)`,
        }}
      />
    </div>
  );
}
