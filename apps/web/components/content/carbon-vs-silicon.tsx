"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface CarbonVsSiliconProps {
  caption?: string;
  className?: string;
}

type Element = "carbon" | "silicon";

// The breath that decides it. An element toggle runs a small metabolism loop in a
// schematic airway: burn carbon and the exhaust is CO₂, a gas — it animates up and
// out on every breath, the airway stays clear. Burn silicon and the exhaust is
// SiO₂, a solid — quartz grains pile up in the airway, breath by breath, until they
// brick it shut. Side readouts carry the two facts that force the result: the bond
// strength (carbon's ~348 vs silicon's ~222 kJ/mol) and the max stable chain length
// (carbon strings thousands; silicon falls apart past a few). The numbers are the
// chapter's; every visible string flows from translations.

const W = 340;
const H = 200;
const AIRWAY = { x: 150, top: 24, w: 56, h: 150 };

const TONE: Record<Element, "teal" | "magenta"> = {
  carbon: "teal",
  silicon: "magenta",
};

export function CarbonVsSilicon({ caption, className }: CarbonVsSiliconProps) {
  const uid = useId();
  const t = useTranslations("viz.carbonSilicon");
  const reduced = useReducedMotionSafe();
  const [element, setElement] = useState<Element>("carbon");

  // one breath cycle; the gas plume rides this phase outward, the quartz uses it to
  // accumulate another grain each loop.
  const { phase } = usePhaseLoop({ period: 2.4, playing: true, initial: 0 });

  const isCarbon = element === "carbon";
  const tone = TONE[element];
  const toneVar = `var(--${tone})`;

  // carbon: CO₂ bubbles rise from the airway base and leave the frame.
  // silicon: SiO₂ grains stack up from the base; with motion the pile "breathes"
  // higher, capped — reduced motion shows it near-full (the steady-state verdict).
  const fillFrac = reduced ? 0.78 : 0.45 + 0.4 * phase;
  const quartzH = AIRWAY.h * fillFrac;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      hint={isCarbon ? t("carbonNote") : t("siliconNote")}
      tone={tone}
      controls={
        <SegmentedToggle<Element>
          ariaLabel={t("elementLabel")}
          value={element}
          onChange={setElement}
          options={[
            { value: "carbon", label: t("carbon"), tone: "var(--teal)" },
            { value: "silicon", label: t("silicon"), tone: "var(--magenta)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={isCarbon ? t("carbonNote") : t("siliconNote")}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "cyan"]} />

          {/* the airway — a schematic respiratory channel */}
          <rect
            x={AIRWAY.x - AIRWAY.w / 2}
            y={AIRWAY.top}
            width={AIRWAY.w}
            height={AIRWAY.h}
            rx={14}
            fill="color-mix(in oklab, var(--foreground) 4%, var(--void))"
            stroke="var(--border-strong)"
            strokeWidth={1.5}
          />
          <VizText x={AIRWAY.x} y={H - 6} size="micro" tone="subtle" anchor="middle">
            {t("airwayLabel")}
          </VizText>

          {/* burn site at the base */}
          <circle
            cx={AIRWAY.x}
            cy={AIRWAY.top + AIRWAY.h - 10}
            r={6}
            fill={toneVar}
            filter={glowUrl(uid, "bloom")}
          />

          {isCarbon ? (
            // ── CO₂ leaves as gas: bubbles rising up and out of the airway ──
            <g>
              {[0, 1, 2, 3, 4].map((i) => {
                const local = reduced ? (i % 5) / 5 : (phase + i * 0.2) % 1;
                const y = AIRWAY.top + AIRWAY.h - 16 - local * (AIRWAY.h + 10);
                const x = AIRWAY.x + Math.sin((local + i) * Math.PI * 2) * 12;
                const op = local > 0.85 ? (1 - local) / 0.15 : 0.7;
                return (
                  <g key={i} opacity={op}>
                    <circle
                      cx={x}
                      cy={y}
                      r={7}
                      fill="none"
                      stroke="var(--teal)"
                      strokeWidth={1.5}
                    />
                    <VizText x={x} y={y + 3} size="micro" tone="teal" anchor="middle">
                      CO₂
                    </VizText>
                  </g>
                );
              })}
              <VizText x={AIRWAY.x} y={AIRWAY.top - 8} size="small" tone="teal" anchor="middle">
                {t("exhaled")}
              </VizText>
            </g>
          ) : (
            // ── SiO₂ stays as solid: quartz grains stacking up, bricking the airway ──
            <g>
              <clipPath id={`${uid}-airway-clip`}>
                <rect
                  x={AIRWAY.x - AIRWAY.w / 2}
                  y={AIRWAY.top}
                  width={AIRWAY.w}
                  height={AIRWAY.h}
                  rx={14}
                />
              </clipPath>
              <g clipPath={`url(#${uid}-airway-clip)`}>
                <rect
                  x={AIRWAY.x - AIRWAY.w / 2}
                  y={AIRWAY.top + AIRWAY.h - quartzH}
                  width={AIRWAY.w}
                  height={quartzH}
                  fill="color-mix(in oklab, var(--magenta) 18%, var(--void))"
                  style={{ transition: reduced ? undefined : "y 0.2s linear, height 0.2s linear" }}
                />
                {/* quartz crystal facets */}
                {[...Array(7)].map((_, i) => {
                  const gx = AIRWAY.x - AIRWAY.w / 2 + 8 + ((i * 13) % (AIRWAY.w - 12));
                  const gy = AIRWAY.top + AIRWAY.h - 8 - ((i * 11) % Math.max(8, quartzH - 8));
                  return (
                    <path
                      key={i}
                      d={`M ${gx} ${gy - 7} L ${gx + 5} ${gy} L ${gx} ${gy + 7} L ${gx - 5} ${gy} Z`}
                      fill="color-mix(in oklab, var(--magenta) 40%, var(--surface))"
                      stroke="var(--magenta)"
                      strokeWidth={0.75}
                      strokeOpacity={0.6}
                    />
                  );
                })}
              </g>
              <VizText x={AIRWAY.x} y={AIRWAY.top - 8} size="small" tone="magenta" anchor="middle">
                {fillFrac > 0.7 ? t("blocked") : t("accumulating")}
              </VizText>
            </g>
          )}
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout
            label={t("exhaustLabel")}
            value={isCarbon ? "CO₂" : "SiO₂"}
            tone={toneVar}
            note={isCarbon ? t("gas") : t("solid")}
            tinted
          />
          <VizReadout
            label={t("bondLabel")}
            value={isCarbon ? "~348" : "~222"}
            tone={toneVar}
            note={t("bondUnit")}
          />
          <VizReadout
            label={t("chainLabel")}
            value={isCarbon ? t("chainCarbon") : t("chainSilicon")}
            tone={toneVar}
          />
        </div>
      </div>
    </VizFigure>
  );
}
