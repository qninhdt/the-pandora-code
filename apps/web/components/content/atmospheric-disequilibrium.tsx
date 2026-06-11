"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface AtmosphericDisequilibriumProps {
  caption?: string;
  className?: string;
}

// Lovelock's biosignature, made playable: how you tell a living planet from a
// dead one without landing. Pick a dead world (Mars/Venus — >95% CO₂, settled in
// chemical equilibrium) or a living one (Earth — reactive O₂ and CH₄ coexisting
// impossibly), then drive the biological "pump". On a dead world the pump does
// nothing; on a living world it holds two gases that should annihilate each other
// far from where chemistry wants them. The readout is the disequilibrium itself —
// the thing telescopes hunt for — not any single molecule. Deterministic, SSR-safe.

type World = "mars" | "venus" | "earth";

interface WorldDef {
  key: World;
  // CO₂ fraction of the atmosphere (the equilibrium gas).
  co2: number;
  // Whether life is present to pump reactive gases.
  living: boolean;
}

const WORLDS: Record<World, WorldDef> = {
  mars: { key: "mars", co2: 0.95, living: false },
  venus: { key: "venus", co2: 0.965, living: false },
  earth: { key: "earth", co2: 0.0004, living: true },
};

const VIEW_W = 360;
const VIEW_H = 200;

export function AtmosphericDisequilibrium({
  caption,
  className,
}: AtmosphericDisequilibriumProps) {
  const t = useTranslations("viz.atmosphericDisequilibrium");
  const uid = useId();
  const [world, setWorld] = useState<World>("earth");
  // Strength of the biological pump (0..1). Only matters on a living world.
  const [pump, setPump] = useState(0.8);

  const def = WORLDS[world];
  // On a living world the pump holds reactive O₂ + CH₄ aloft against chemistry;
  // on a dead world there is nothing to pump, so the air is just settled CO₂.
  const effectivePump = def.living ? pump : 0;
  const o2 = def.living ? 0.21 * effectivePump : 0;
  const ch4 = def.living ? 0.0002 * effectivePump : 0;
  // Reactive gases coexisting = disequilibrium. Map to a 0..100 index: the
  // product of two gases that should destroy each other, scaled to read well.
  const disequilibrium = Math.round(Math.min(100, o2 * (ch4 * 1e6) * 480));
  const alive = disequilibrium > 8;
  const tone = alive ? "teal" : "amber";

  // Three stacked gas bars: CO₂, O₂, CH₄ (CH₄ exaggerated for visibility).
  const bars = [
    { label: t("co2"), frac: def.co2, color: "var(--border-strong)" },
    { label: t("o2"), frac: o2, color: "var(--teal)" },
    { label: t("ch4"), frac: Math.min(0.18, ch4 * 600), color: "var(--magenta)" },
  ];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone={tone}
      className={className}
      hint={alive ? t("hintAlive") : t("hintDead")}
      controls={
        <SegmentedToggle<World>
          ariaLabel={t("worldLabel")}
          value={world}
          onChange={setWorld}
          options={[
            { value: "mars", label: t("mars"), tone: "var(--amber)" },
            { value: "venus", label: t("venus"), tone: "var(--amber)" },
            { value: "earth", label: t("earth"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", { value: disequilibrium })}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "amber"]} />

          {/* the atmosphere column — stacked gas fractions */}
          {bars.map((b, i) => {
            const x = 30 + i * 105;
            const h = Math.max(2, b.frac * 150);
            const reactive = b.color !== "var(--border-strong)";
            return (
              <g key={b.label}>
                <rect
                  x={x}
                  y={VIEW_H - 30 - h}
                  width={70}
                  height={h}
                  rx={4}
                  fill={b.color}
                  opacity={reactive ? 0.9 : 0.5}
                  filter={reactive && b.frac > 0 ? glowUrl(uid, "bloom") : undefined}
                  style={{ transition: "height 0.25s, y 0.25s" }}
                />
                <VizText x={x + 35} y={VIEW_H - 14} size="micro" tone="subtle" anchor="middle">
                  {b.label}
                </VizText>
                <VizText x={x + 35} y={VIEW_H - 36 - h} size="micro" tone="subtle" anchor="middle" numeric>
                  {b.frac >= 0.01 ? `${Math.round(b.frac * 100)}%` : b.frac > 0 ? "trace" : "—"}
                </VizText>
              </g>
            );
          })}

          {/* the biological pump, rising from the surface on a living world */}
          {def.living && effectivePump > 0 && (
            <VizText x={VIEW_W / 2} y={18} size="small" tone="teal" anchor="middle">
              {t("pumpFlux")}
            </VizText>
          )}
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("disequilibriumLabel")}
            value={alive ? `${disequilibrium}` : t("none")}
            tone={`var(--${tone})`}
            tinted
            note={t("disequilibriumNote")}
          />
          <VizReadout
            label={t("verdictLabel")}
            value={alive ? t("living") : t("dead")}
            tone={`var(--${tone})`}
            tinted
          />
          <VizSlider
            label={t("pumpSlider")}
            display={def.living ? `${Math.round(pump * 100)}%` : t("noLife")}
            min={0}
            max={1}
            step={0.01}
            value={pump}
            onChange={setPump}
            tone="var(--teal)"
            className="mt-1"
          />
          {!def.living && (
            <p className="font-sans text-[0.7rem] uppercase tracking-wider text-subtle">
              {t("deadPumpHint")}
            </p>
          )}
        </div>
      </div>
    </VizFigure>
  );
}
