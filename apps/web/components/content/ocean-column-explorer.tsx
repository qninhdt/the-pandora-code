"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type Regime = "stratified" | "upwelling";

interface OceanColumnExplorerProps {
  caption?: string;
  className?: string;
}

function profileAt(depth: number, regime: Regime) {
  const z = depth / 100;
  const light = Math.max(0, Math.round(100 * Math.exp(-5.2 * z)));
  const stratifiedTemperature = Math.round(92 - 60 / (1 + Math.exp(-12 * (z - 0.32))));
  const temperature =
    regime === "upwelling" ? Math.max(30, stratifiedTemperature - 14) : stratifiedTemperature;
  const nutrients = Math.min(
    100,
    Math.round((regime === "upwelling" ? 26 : 8) + 82 / (1 + Math.exp(-11 * (z - 0.43)))),
  );
  const oxygen = Math.max(20, Math.round(94 - 52 * Math.exp(-(((z - 0.58) / 0.23) ** 2))));
  return { light, temperature, nutrients, oxygen };
}

export function OceanColumnExplorer({ caption, className }: OceanColumnExplorerProps) {
  const t = useTranslations("viz.oceanColumnExplorer");
  const uid = useId();
  const [regime, setRegime] = useState<Regime>("stratified");
  const [depth, setDepth] = useState(22);
  const state = profileAt(depth, regime);
  const markerY = 36 + depth * 2.25;
  const pycnoclineTop = regime === "stratified" ? 86 : 108;
  const pycnoclineHeight = regime === "stratified" ? 74 : 108;

  const zone = depth < 18 ? "surface" : depth < 48 ? "transition" : "deep";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${regime}`)}
      caption={caption}
      tone="cyan"
      className={className}
      controls={
        <SegmentedToggle
          options={[
            { value: "stratified", label: t("regime.stratified"), tone: "var(--cyan)" },
            { value: "upwelling", label: t("regime.upwelling"), tone: "var(--teal)" },
          ]}
          value={regime}
          onChange={setRegime}
          ariaLabel={t("regimeLabel")}
        />
      }
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)]">
        <svg
          viewBox="0 0 560 290"
          className="min-h-64 w-full rounded-xl border border-border/60 bg-void/50"
          role="img"
          aria-label={t("aria", { regime: t(`regime.${regime}`), depth })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />
          <defs>
            <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--cyan)" stopOpacity="0.48" />
              <stop offset="0.36" stopColor="var(--surface-raised)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--abyss)" stopOpacity="0.98" />
            </linearGradient>
            <linearGradient id={`${uid}-light`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--foreground)" stopOpacity="0.65" />
              <stop offset="0.48" stopColor="var(--cyan)" stopOpacity="0.12" />
              <stop offset="1" stopColor="var(--cyan)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect x="14" y="14" width="532" height="262" rx="20" fill={`url(#${uid}-water)`} />
          <path
            d="M14 45 Q78 34 146 45 T280 45 T414 45 T546 45"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="2"
            opacity="0.8"
          />
          <path d="M64 45 L176 214 L286 45Z" fill={`url(#${uid}-light)`} opacity="0.46" />

          <rect
            x="14"
            y={pycnoclineTop}
            width="532"
            height={pycnoclineHeight}
            fill="var(--magenta)"
            opacity={regime === "stratified" ? 0.08 : 0.045}
          />
          <path
            d={
              regime === "stratified"
                ? "M22 124 C144 103 264 145 386 119 C456 104 500 110 538 118"
                : "M22 157 C134 129 234 191 350 151 C431 123 489 129 538 143"
            }
            fill="none"
            stroke="var(--magenta)"
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity="0.8"
          />

          {[92, 134, 176, 218, 252].map((y, index) => (
            <g key={y} opacity={0.25 + index * 0.12}>
              <circle
                cx={360 + ((index * 37) % 126)}
                cy={y}
                r={index < 2 ? 2.5 : 4}
                fill="var(--teal)"
              />
              <path
                d={`M${360 + ((index * 37) % 126)} ${y + 5} l${index % 2 ? 8 : -7} 12`}
                stroke="var(--teal)"
                strokeWidth="1"
              />
            </g>
          ))}

          {regime === "upwelling" ? (
            <g filter={glowUrl(uid, "bloom")}>
              <path
                d="M470 250 C450 215 454 178 478 145 C495 121 496 90 486 64"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="7"
                opacity="0.58"
              />
              <path d="M486 64 l-10 18 h20Z" fill="var(--teal)" opacity="0.9" />
              {[99, 116, 132].map((y, index) => (
                <circle key={y} cx={463 + index * 18} cy={y} r="3" fill="var(--teal)" />
              ))}
            </g>
          ) : null}

          <line
            x1="22"
            y1={markerY}
            x2="538"
            y2={markerY}
            stroke="var(--amber)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="298" cy={markerY} r="6" fill="var(--amber)" filter={glowUrl(uid, "bloom")} />

          <VizText x={28} y={35} size="small" tone="var(--foreground)">
            {t("layer.surface")}
          </VizText>
          <VizText x={28} y={115} size="small" tone="var(--magenta)">
            {t("layer.pycnocline")}
          </VizText>
          <VizText x={28} y={258} size="small" tone="var(--muted)">
            {t("layer.deep")}
          </VizText>
          <VizText x={306} y={markerY - 8} size="small" tone="var(--amber)">
            {t(`zone.${zone}`)}
          </VizText>
        </svg>

        <div className="flex flex-col gap-3">
          <VizSlider
            label={t("depth")}
            display={t("depthValue", { depth })}
            min={0}
            max={100}
            step={1}
            value={depth}
            onChange={setDepth}
            tone="var(--amber)"
          />
          <div className="grid grid-cols-2 gap-2">
            <VizReadout
              label={t("readout.light")}
              value={`${state.light}%`}
              tone="var(--foreground)"
            />
            <VizReadout
              label={t("readout.warmth")}
              value={`${state.temperature}%`}
              tone="var(--amber)"
            />
            <VizReadout
              label={t("readout.nutrients")}
              value={`${state.nutrients}%`}
              tone="var(--teal)"
            />
            <VizReadout label={t("readout.oxygen")} value={`${state.oxygen}%`} tone="var(--cyan)" />
          </div>
          <VizReadout
            label={t("readout.zone")}
            value={t(`zone.${zone}`)}
            note={t(`zoneNote.${zone}`)}
            tone={
              zone === "surface"
                ? "var(--cyan)"
                : zone === "transition"
                  ? "var(--magenta)"
                  : "var(--teal)"
            }
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
