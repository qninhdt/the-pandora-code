"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";

interface HabitableZoneExplorerProps {
  caption?: string;
  locale?: "vi" | "en";
  className?: string;
}

// Plot geometry in SVG user units; a fixed viewBox stays crisp at any width.
const VIEW_W = 460;
const VIEW_H = 200;
const PAD = { left: 16, right: 16, top: 28, bottom: 34 };
const MAX_AU = 3; // distance axis runs 0..3 Earth-distances (AU)

// Conservative habitable-zone edges scale with the square root of stellar
// luminosity (flux ∝ L / d²), the same √L rule the chapter prose describes.
// Coefficients are the runaway-greenhouse / maximum-greenhouse limits.
const HZ_INNER_COEFF = 0.95;
const HZ_OUTER_COEFF = 1.37;

// Deterministic defaults so the server-rendered frame is meaningful and matches
// the chapter: Alpha Centauri A is a shade brighter than the Sun, and canon
// parks Polyphemus a little past one Earth-distance.
const DEFAULT_L = 1.5; // stellar luminosity, relative to the Sun
const DEFAULT_D = 1.25; // orbital distance, in AU

const STRINGS = {
  vi: {
    luminosity: "Độ sáng của sao (so với Mặt Trời)",
    distance: "Khoảng cách quỹ đạo (AU)",
    status: "Trạng thái",
    flux: "Ánh sáng nhận được (Trái Đất = 1)",
    tooHot: "Quá nóng — đại dương sôi cạn",
    justRight: "Vừa đủ — nước lỏng tồn tại",
    tooCold: "Quá lạnh — nước đóng băng",
    scorched: "Cháy sém",
    temperate: "Ôn đới",
    frozen: "Băng giá",
    sun: "Mặt Trời",
    star: "Sao",
    pandora: "Pandora",
    hint: "Kéo độ sáng của sao và khoảng cách để tìm vành đai nước lỏng.",
  },
  en: {
    luminosity: "Star brightness (relative to the Sun)",
    distance: "Orbital distance (AU)",
    status: "Status",
    flux: "Starlight received (Earth = 1)",
    tooHot: "Too hot — oceans boil away",
    justRight: "Just right — liquid water survives",
    tooCold: "Too cold — water freezes solid",
    scorched: "Scorched",
    temperate: "Temperate",
    frozen: "Frozen",
    sun: "Sun",
    star: "Star",
    pandora: "Pandora",
    hint: "Drag the star's brightness and the distance to find the liquid-water band.",
  },
} as const;

// Map a distance in AU to an SVG x-coordinate.
function ax(au: number): number {
  return PAD.left + (au / MAX_AU) * (VIEW_W - PAD.left - PAD.right);
}

// An interactive habitable-zone diagram. The reader sets how bright the star is
// and how far out a world orbits; the temperate band (where flux lands near
// Earth's) shifts with √L, and the world's marker reports too-hot / just-right /
// too-cold. SVG-only so it renders identically on the server; the controls are
// plain range inputs, so it needs no motion and works under reduced-motion.
export function HabitableZoneExplorer({
  caption,
  locale = "en",
  className,
}: HabitableZoneExplorerProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const uid = useId();
  const [luminosity, setLuminosity] = useState(DEFAULT_L);
  const [distance, setDistance] = useState(DEFAULT_D);

  const inner = HZ_INNER_COEFF * Math.sqrt(luminosity);
  const outer = HZ_OUTER_COEFF * Math.sqrt(luminosity);
  const flux = luminosity / (distance * distance); // relative to Earth (=1)

  const state = distance < inner ? "hot" : distance > outer ? "cold" : "ok";
  const statusText = state === "hot" ? t.tooHot : state === "cold" ? t.tooCold : t.justRight;
  const statusTone = state === "hot" ? "--amber" : state === "cold" ? "--cyan" : "--teal";

  const trackY = PAD.top + 44;
  const bandH = 34;

  return (
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full"
          role="img"
          aria-label={`${t.distance} ${distance.toFixed(2)} AU, ${t.status}: ${statusText}`}
        >
          <defs>
            <linearGradient id={`${uid}-band`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.55" />
              <stop
                offset={`${(inner / MAX_AU) * 100}%`}
                stopColor="var(--amber)"
                stopOpacity="0.18"
              />
              <stop
                offset={`${((inner + outer) / 2 / MAX_AU) * 100}%`}
                stopColor="var(--teal)"
                stopOpacity="0.5"
              />
              <stop
                offset={`${(outer / MAX_AU) * 100}%`}
                stopColor="var(--cyan)"
                stopOpacity="0.18"
              />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {/* the distance track, coloured scorched → temperate → frozen */}
          <rect
            x={ax(0)}
            y={trackY}
            width={ax(MAX_AU) - ax(0)}
            height={bandH}
            rx={6}
            fill={`url(#${uid}-band)`}
          />

          {/* temperate-band outline — the survivable ring */}
          <rect
            x={ax(inner)}
            y={trackY - 3}
            width={ax(outer) - ax(inner)}
            height={bandH + 6}
            rx={6}
            fill="none"
            style={{
              stroke: "var(--teal)",
              filter: "drop-shadow(0 0 6px var(--teal))",
            }}
            strokeWidth={1.5}
          />
          <text
            x={(ax(inner) + ax(outer)) / 2}
            y={trackY - 8}
            textAnchor="middle"
            style={{ fill: "var(--teal)", fontSize: 10 }}
            className="font-sans"
          >
            {t.temperate}
          </text>

          {/* zone labels */}
          <text
            x={ax(inner / 2)}
            y={trackY + bandH + 14}
            textAnchor="middle"
            style={{ fill: "var(--amber)", fontSize: 9 }}
            className="font-sans"
          >
            {t.scorched}
          </text>
          <text
            x={ax((outer + MAX_AU) / 2)}
            y={trackY + bandH + 14}
            textAnchor="middle"
            style={{ fill: "var(--cyan)", fontSize: 9 }}
            className="font-sans"
          >
            {t.frozen}
          </text>

          {/* the star at the origin */}
          <circle
            cx={ax(0)}
            cy={trackY + bandH / 2}
            r={9}
            style={{
              fill: "var(--amber)",
              filter: "drop-shadow(0 0 8px var(--amber))",
            }}
          />

          {/* Earth=1 AU reference tick */}
          <line
            x1={ax(1)}
            y1={trackY - 6}
            x2={ax(1)}
            y2={trackY + bandH + 6}
            style={{ stroke: "var(--border-strong)" }}
            strokeWidth={1}
            strokeDasharray="2 3"
          />
          <text
            x={ax(1)}
            y={VIEW_H - 16}
            textAnchor="middle"
            style={{ fill: "var(--subtle)", fontSize: 9 }}
            className="font-sans"
          >
            1 AU
          </text>

          {/* the world marker */}
          <g transform={`translate(${ax(distance)} ${trackY + bandH / 2})`}>
            <circle
              r={7}
              style={{
                fill: `var(${statusTone})`,
                filter: `drop-shadow(0 0 6px var(${statusTone}))`,
              }}
            />
            <text
              x={0}
              y={-13}
              textAnchor="middle"
              style={{ fill: `var(${statusTone})`, fontSize: 10 }}
              className="font-sans"
            >
              {t.pandora}
            </text>
          </g>
        </svg>

        {/* readouts */}
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Readout label={t.status} value={statusText} tone={statusTone} small />
          <Readout label={t.flux} value={`${flux.toFixed(2)}×`} tone="--amber" />
          <Readout label={t.distance} value={`${distance.toFixed(2)} AU`} tone="--teal" />
        </div>

        {/* controls */}
        <div className="mt-4 space-y-3">
          <Slider
            id={`${uid}-l`}
            label={t.luminosity}
            min={0.2}
            max={2}
            step={0.01}
            value={luminosity}
            display={`${luminosity.toFixed(2)} L☉`}
            tone="--amber"
            onChange={setLuminosity}
          />
          <Slider
            id={`${uid}-d`}
            label={t.distance}
            min={0.2}
            max={MAX_AU}
            step={0.01}
            value={distance}
            display={`${distance.toFixed(2)} AU`}
            tone="--teal"
            onChange={setDistance}
          />
        </div>

        {!reduced && <p className="mt-3 font-sans text-xs text-subtle">{t.hint}</p>}
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 font-serif text-sm italic leading-relaxed text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
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

function Readout({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: string;
  tone: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-void/30 px-2 py-1.5">
      <p className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">{label}</p>
      <p
        className={cn(
          "font-display font-700 tabular-nums",
          small ? "text-xs leading-tight" : "text-sm",
        )}
        style={{ color: `var(${tone})` }}
      >
        {value}
      </p>
    </div>
  );
}
