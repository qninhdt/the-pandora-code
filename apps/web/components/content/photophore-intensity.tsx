"use client";

import { VizFigure } from "@/components/content/viz/viz-figure";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useState } from "react";

interface PhotophoreIntensityProps {
  locale?: "vi" | "en";
  caption?: string;
  className?: string;
}

const STRINGS = {
  vi: {
    title: "Đốm sáng Na'vi: theo nhịp cơ thể",
    calm: "Tĩnh tại",
    aroused: "Dồn dập",
    slider: "Trạng thái sinh lý",
    intensity: "Cường độ",
    hue: "Sắc — không đổi",
    note: "Đốm sáng xếp dọc theo các đường mạch máu và thần kinh, đối xứng hai bên. Chúng không chớp tắt — sáng đều, rồi rực lên khi adrenaline dâng (chiến đấu, giao kết) và dịu xuống khi nghỉ.",
    mono: "Ánh sáng đơn sắc xanh lơ-trắng. Cái 'đổi màu' nhiều người tưởng chỉ là ảo giác do cường độ thay đổi, hoặc ánh lửa hắt lên da.",
    monoTag: "Sửa một lầm tưởng",
  },
  en: {
    title: "Na'vi photophores: tuned to the body",
    calm: "Calm",
    aroused: "Aroused",
    slider: "Physiological state",
    intensity: "Intensity",
    hue: "Hue — constant",
    note: "The dots sit along the vascular and neural lines, in bilateral pairs. They do not blink — they glow steadily, then flare as adrenaline rises (combat, bonding) and dim at rest.",
    mono: "The light is monochrome blue-white. The 'colour change' people think they see is an illusion of changing intensity, or firelight reflecting off the skin.",
    monoTag: "Correcting a myth",
  },
} as const;

const W = 150;
const H = 240;
const HUE = "var(--accent-soft)"; // single blue-white photophore colour, never varies

const DOTS: { x: number; y: number; r: number }[] = [
  { x: 75, y: 40, r: 2.2 },
  { x: 75, y: 60, r: 2.6 },
  { x: 75, y: 84, r: 2.4 },
  { x: 75, y: 110, r: 2.6 },
  { x: 75, y: 138, r: 2.3 },
  { x: 56, y: 70, r: 2.4 },
  { x: 52, y: 96, r: 2.6 },
  { x: 54, y: 124, r: 2.3 },
  { x: 60, y: 150, r: 2.1 },
  { x: 94, y: 70, r: 2.4 },
  { x: 98, y: 96, r: 2.6 },
  { x: 96, y: 124, r: 2.3 },
  { x: 90, y: 150, r: 2.1 },
  { x: 68, y: 26, r: 1.8 },
  { x: 82, y: 26, r: 1.8 },
];

function NaviGlow({ level, reduced }: { level: number; reduced: boolean }) {
  const alpha = 0.22 + level * 0.78;
  const blur = 2 + level * 9;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden={true}>
      <path
        d="M75 14 C66 14 60 20 60 30 C60 38 64 43 68 46 L54 60 C44 70 42 96 46 128 C49 152 54 176 58 206 L70 206 C68 176 66 150 66 132 L66 168 L84 168 L84 132 C84 150 82 176 80 206 L92 206 C96 176 101 152 104 128 C108 96 106 70 96 60 L82 46 C86 43 90 38 90 30 C90 20 84 14 75 14 Z"
        fill="color-mix(in oklab, var(--surface-overlay) 80%, transparent)"
        stroke="var(--border-strong)"
        strokeWidth={1.5}
      />
      {["M75 36 L75 142", "M58 64 C50 92 52 124 60 152", "M92 64 C100 92 98 124 90 152"].map(
        (d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="color-mix(in oklab, var(--accent-soft) 18%, transparent)"
            strokeWidth={1}
          />
        ),
      )}
      {DOTS.map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill={HUE}
          initial={false}
          animate={{
            opacity: reduced ? alpha : [alpha, Math.min(1, alpha + 0.12), alpha],
          }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  duration: 2.2 + (i % 4) * 0.3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
          }
          style={{ filter: `drop-shadow(0 0 ${blur}px ${HUE})` }}
        />
      ))}
    </svg>
  );
}

export function PhotophoreIntensity({
  locale = "vi",
  caption,
  className,
}: PhotophoreIntensityProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const [level, setLevel] = useState(0.2);
  const pct = Math.round(level * 100);

  return (
    <VizFigure title={t.title} caption={caption} className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[150px_1fr] sm:items-center">
        <div className="mx-auto w-[150px] rounded-xl border border-border bg-void/40 p-2">
          <NaviGlow level={level} reduced={reduced} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-void/30 px-3 py-2">
              <p className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
                {t.intensity}
              </p>
              <p className="font-display text-2xl font-700" style={{ color: HUE }}>
                {pct}%
              </p>
            </div>
            <div className="rounded-lg border border-border bg-void/30 px-3 py-2">
              <p className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
                {t.hue}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="h-5 w-5 rounded-full"
                  style={{ background: HUE, boxShadow: `0 0 8px ${HUE}` }}
                  aria-hidden
                />
                <span className="font-display text-xs font-700" style={{ color: HUE }}>
                  blue-white
                </span>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="photophore-level"
              className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle"
            >
              {t.slider}
            </label>
            <input
              id="photophore-level"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="mt-1 w-full"
              style={{ accentColor: "var(--accent-soft)" }}
            />
            <div className="flex justify-between font-sans text-[0.65rem] text-subtle">
              <span>{t.calm}</span>
              <span>{t.aroused}</span>
            </div>
          </div>

          <p className="font-sans text-xs leading-relaxed text-muted">{t.note}</p>

          <div
            className="rounded-lg border px-3 py-2"
            style={{
              borderColor: "color-mix(in oklab, var(--amber) 40%, transparent)",
              background: "color-mix(in oklab, var(--amber) 9%, transparent)",
            }}
          >
            <p className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
              {t.monoTag}
            </p>
            <p className="mt-0.5 font-sans text-xs text-muted">{t.mono}</p>
          </div>
        </div>
      </div>
    </VizFigure>
  );
}
