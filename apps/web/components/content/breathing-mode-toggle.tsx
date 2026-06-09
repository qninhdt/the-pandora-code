"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface BreathingModeToggleProps {
  caption?: string;
  className?: string;
}

type Mode = "tidal" | "unidirectional";

const W = 380;
const H = 184;
const CX = 190;
const CY = 90;

export function BreathingModeToggle({ caption, className }: BreathingModeToggleProps) {
  const t = useTranslations("viz.breathingMode");
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [mode, setMode] = useState<Mode>("unidirectional");
  const oneWay = mode === "unidirectional";
  const accent = oneWay ? "var(--teal)" : "var(--amber)";

  // Tidal air oscillates in/out the one door; one-way streams straight through.
  const tidalX = reduced ? [110] : [70, 150, 70];
  const flowX = reduced ? [CX] : [80, 300];

  return (
    <VizFigure
      title={t("title")}
      caption={caption}
      tone={oneWay ? "teal" : "amber"}
      className={className}
      hint={oneWay ? t("unidirectionalNote") : t("tidalNote")}
      controls={
        <SegmentedToggle<Mode>
          ariaLabel={t("title")}
          value={mode}
          onChange={setMode}
          options={[
            { value: "tidal", label: t("tidal"), tone: "var(--amber)" },
            { value: "unidirectional", label: t("unidirectional"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={oneWay ? t("unidirectional") : t("tidal")}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "amber"]} />
          {/* lung body — faintly tinted by the active mode so it reads as a living organ */}
          <ellipse
            cx={CX}
            cy={CY}
            rx={104}
            ry={46}
            fill={`color-mix(in oklab, ${accent} 7%, var(--surface-overlay))`}
            stroke={`color-mix(in oklab, ${accent} 30%, var(--border-strong))`}
            strokeWidth={2}
          />

          {oneWay ? (
            <>
              {/* always-fresh exchange band */}
              <motion.rect
                x={CX - 84}
                y={CY + 24}
                height={6}
                rx={3}
                fill="var(--teal)"
                filter={glowUrl(uid, "bloom")}
                initial={false}
                animate={{ opacity: reduced ? 0.8 : [0.45, 0.9, 0.45], width: 168 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
                }
              />
              {/* rear intake → front vent, single direction */}
              <circle cx={84} cy={CY} r={6} fill="var(--cyan)" filter={glowUrl(uid, "bloom")} />
              <circle cx={296} cy={CY} r={6} fill="var(--teal)" filter={glowUrl(uid, "bloom")} />
              {[0, 1, 2, 3].map((i) => (
                <motion.circle
                  key={`f${i}`}
                  cy={CY}
                  r={4}
                  fill="var(--cyan)"
                  filter={glowUrl(uid, "bloom")}
                  initial={{ cx: flowX[0], opacity: 0 }}
                  animate={{ cx: flowX, opacity: reduced ? 1 : [0, 1, 1, 0] }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: 2.4,
                          delay: i * 0.6,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }
                  }
                />
              ))}
            </>
          ) : (
            <>
              {/* single door + trapped stale pocket at the blind end */}
              <circle cx={84} cy={CY} r={6} fill="var(--amber)" filter={glowUrl(uid, "bloom")} />
              <ellipse cx={CX + 62} cy={CY} rx={30} ry={26} fill="var(--amber)" opacity={0.16} />
              <VizText x={CX + 62} y={CY + 4} size="small" tone="amber" anchor="middle">
                {t("deadSpace")}
              </VizText>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={`tdl${i}`}
                  cy={CY}
                  r={4}
                  fill="var(--amber)"
                  filter={glowUrl(uid, "bloom")}
                  initial={{ cx: tidalX[0] }}
                  animate={{ cx: tidalX, opacity: reduced ? 1 : [0.3, 1, 0.3] }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: 2.8,
                          delay: i * 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }
                  }
                />
              ))}
            </>
          )}
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <div className="grid grid-cols-2 gap-2">
            <VizReadout
              label={t("freshLabel")}
              value={oneWay ? t("fresh") : t("stale")}
              tone={accent}
              tinted
            />
            <VizReadout
              label={t("costLabel")}
              value={oneWay ? t("costNone") : t("costHigh")}
              tone={accent}
            />
          </div>
          {oneWay && (
            <p
              className="rounded-lg border px-3 py-1.5 font-sans text-xs"
              style={{
                borderColor: "color-mix(in oklab, var(--cyan) 40%, transparent)",
                background: "color-mix(in oklab, var(--cyan) 9%, transparent)",
                color: "var(--accent-soft)",
              }}
            >
              {t("ram")}
            </p>
          )}
        </div>
      </div>
    </VizFigure>
  );
}
