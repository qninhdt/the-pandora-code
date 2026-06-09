"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface SquareCubeScalerProps {
  caption?: string;
  className?: string;
}

// The chapter's conceptual keystone. Drag the linear size up and watch the three
// quantities diverge: length scales as k, surface/bone-area as k², and
// volume/mass as k³. Bone stress is weight over cross-section — k³/k² = k — so a
// body that doubles in length doubles the stress on every bone. This is why size
// is never free, and why big animals must change shape rather than just scale up.
const W = 220;
const H = 180;

function fmt(n: number): string {
  return n >= 10 ? n.toFixed(0) : n.toFixed(1);
}

export function SquareCubeScaler({ caption, className }: SquareCubeScalerProps) {
  const t = useTranslations("viz.squareCube");
  const uid = useId();
  // Deterministic initial render → SSR-safe.
  const [k, setK] = useState(1);
  const area = k * k;
  const volume = k * k * k;
  const stress = k; // volume / area = k³ / k² = k

  // A simple creature box scaled by k, anchored to the ground line, capped so the
  // largest size still fits the viewBox.
  const base = 34;
  const size = base * k;
  const groundY = H - 16;
  const boxX = W / 2 - size / 2;
  const boxY = groundY - size;
  const legW = Math.max(2, k * 1.6);

  const rows = [
    { label: t("area"), val: area, note: t("areaNote"), tone: "var(--cyan)", tinted: false },
    { label: t("volume"), val: volume, note: t("volumeNote"), tone: "var(--teal)", tinted: false },
    // The stress row is the chapter's punchline (why size needs shape change),
    // so it gets the highlighted result treatment.
    { label: t("stress"), val: stress, note: t("stressNote"), tone: "var(--amber)", tinted: true },
  ];

  return (
    <VizFigure
      title={t("title")}
      hint={t("hint")}
      caption={caption}
      tone="teal"
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-1/2"
          role="img"
          aria-label={t("title")}
        >
          <GlowDefs idBase={uid} tones={["teal"]} />
          <defs>
            {/* top-lit face gradient so the body reads as a solid volume, not a flat outline */}
            <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="color-mix(in oklab, var(--teal) 34%, transparent)" />
              <stop offset="100%" stopColor="color-mix(in oklab, var(--teal) 12%, transparent)" />
            </linearGradient>
          </defs>
          {/* radial wash behind the growing body adds depth as it scales */}
          <ellipse
            cx={W / 2}
            cy={groundY - size / 2}
            rx={size * 0.9}
            ry={size * 0.7}
            fill={glowUrl(uid, "wash-teal")}
            opacity={0.5}
          />
          {/* contact shadow grounding the body so it sits on the floor, not floats */}
          <ellipse
            cx={W / 2}
            cy={groundY + 2}
            rx={size * 0.55}
            ry={5}
            fill="var(--void)"
            opacity={0.5}
            style={{ filter: "blur(2px)" }}
          />
          {/* ground line */}
          <line
            x1={10}
            y1={groundY}
            x2={W - 10}
            y2={groundY}
            stroke="var(--border-strong)"
            strokeWidth={2}
            strokeOpacity={0.6}
          />
          {/* the scaling body — gradient face + bloom for volume */}
          <rect
            x={boxX}
            y={boxY}
            width={size}
            height={size}
            rx={6}
            fill={`url(#${uid}-face)`}
            stroke="var(--teal)"
            strokeWidth={2}
            filter={glowUrl(uid, "bloom")}
          />
          {/* top highlight edge — the lit rim of the volume */}
          <line
            x1={boxX + 5}
            y1={boxY + 2.5}
            x2={boxX + size - 5}
            y2={boxY + 2.5}
            stroke="color-mix(in oklab, var(--teal) 70%, var(--foreground))"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeOpacity={0.7}
          />
          {/* legs to suggest a standing animal */}
          <line
            x1={boxX + size * 0.25}
            y1={groundY}
            x2={boxX + size * 0.25}
            y2={boxY + size}
            stroke="var(--teal)"
            strokeWidth={legW}
            strokeLinecap="round"
          />
          <line
            x1={boxX + size * 0.75}
            y1={groundY}
            x2={boxX + size * 0.75}
            y2={boxY + size}
            stroke="var(--teal)"
            strokeWidth={legW}
            strokeLinecap="round"
          />
          <VizText
            x={W / 2}
            y={boxY - 6}
            size="small"
            tone="teal"
            anchor="middle"
            numeric
            weight={700}
          >
            {t("multiple", { n: fmt(k) })}
          </VizText>
        </svg>

        <div className="flex flex-col gap-3 sm:w-1/2">
          <VizSlider
            label={t("sizeLabel")}
            display={t("multiple", { n: fmt(k) })}
            min={1}
            max={3}
            step={0.1}
            value={k}
            onChange={setK}
            tone="var(--teal)"
          />

          {rows.map((r) => (
            <VizReadout
              key={r.label}
              label={r.label}
              value={t("multiple", { n: fmt(r.val) })}
              note={r.note}
              tone={r.tone}
              tinted={r.tinted}
            />
          ))}
        </div>
      </div>
    </VizFigure>
  );
}
