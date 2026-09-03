"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  FEATURES,
  type Fidelity,
  MAX_SCORE,
  SCENARIOS,
  SCENARIO_SPECS,
  type ScenarioKey,
  informationScore,
  signatureFeature,
} from "./burial-window-comparator-model";

// Three burial machines, side by side, answering the only question that matters
// at the outcrop: what would you actually hold in your hand? The grid is the
// argument — no column dominates. Ash gives you the shape of an animal and none
// of its substance; sulfidic mud gives you muscle and gut in brassy mineral and
// eats the bone; the forest floor gives you nothing at all. A reader who expects
// "better preservation" to be one axis should come away seeing it as several,
// and should notice that Pandora happens to own two of the good ones. Fidelity
// ratings and their Earth exemplars live in ./burial-window-comparator-model.ts.

const DOTS: Record<Fidelity, number> = { none: 0, trace: 1, good: 2, exceptional: 3 };

function toneFor(f: Fidelity): string {
  if (f === "exceptional") return "var(--teal)";
  if (f === "good") return "var(--cyan)";
  if (f === "trace") return "var(--amber)";
  return "var(--subtle)";
}

interface BurialWindowComparatorProps {
  caption?: string;
  className?: string;
}

export function BurialWindowComparator({ caption, className }: BurialWindowComparatorProps) {
  const t = useTranslations("viz.burialWindowComparator");
  const [focus, setFocus] = useState<ScenarioKey>("ash");

  const spec = SCENARIO_SPECS[focus];
  const score = informationScore(spec);
  const signature = signatureFeature(focus);
  const tone = focus === "subaerial" ? "var(--magenta)" : "var(--teal)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={focus === "subaerial" ? "magenta" : "teal"}
      hint={t(`hint.${focus}`)}
      caption={caption}
      className={className}
      controls={
        <SegmentedToggle<ScenarioKey>
          ariaLabel={t("scenarioControl")}
          value={focus}
          onChange={setFocus}
          options={SCENARIOS.map((s) => ({
            value: s,
            label: t(`scenario.${s}`),
            tone: s === "subaerial" ? "var(--magenta)" : "var(--teal)",
          }))}
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{t("tableCaption")}</caption>
          <thead>
            <tr>
              <th scope="col" className="pb-2 pr-2 font-sans text-xs font-400 text-subtle">
                {t("featureHeading")}
              </th>
              {SCENARIOS.map((s) => (
                <th
                  key={s}
                  scope="col"
                  className="pb-2 px-1.5 font-sans text-xs font-700"
                  style={{ color: s === focus ? "var(--foreground)" : "var(--subtle)" }}
                >
                  {t(`scenario.${s}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature) => (
              <tr key={feature} className="border-t border-border/50">
                <th
                  scope="row"
                  className="py-2 pr-2 font-sans text-xs font-400"
                  style={{
                    color: feature === signature ? "var(--teal)" : "var(--muted)",
                  }}
                >
                  {t(`feature.${feature}`)}
                </th>
                {SCENARIOS.map((s) => {
                  const f = SCENARIO_SPECS[s].features[feature];
                  const dots = DOTS[f];
                  const dim = s !== focus;
                  return (
                    <td key={s} className="py-2 px-1.5" style={{ opacity: dim ? 0.45 : 1 }}>
                      <span className="flex items-center gap-1" title={t(`fidelity.${f}`)}>
                        {dots === 0 ? (
                          <span className="font-sans text-xs text-subtle">{t("fidelity.none")}</span>
                        ) : (
                          Array.from({ length: dots }, (_, i) => (
                            <span
                              key={i}
                              aria-hidden
                              className="inline-block h-2 w-2 rounded-full"
                              style={{
                                background: toneFor(f),
                                boxShadow:
                                  f === "exceptional" && !dim
                                    ? `0 0 6px color-mix(in oklab, ${toneFor(f)} 80%, transparent)`
                                    : undefined,
                              }}
                            />
                          ))
                        )}
                        <span className="sr-only">{t(`fidelity.${f}`)}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("readout.recovered")}
          value={t(`recovered.${spec.mechanism}`)}
          note={t(`exemplar.${focus}`)}
          tone={tone}
          tinted
        />
        <VizReadout
          label={t("readout.burialTime")}
          value={
            spec.burialTime < 0.01
              ? t("hoursValue", { n: Math.max(1, Math.round(spec.burialTime * 8760)) })
              : spec.burialTime < 1
                ? t("daysValue", { n: Math.round(spec.burialTime * 365) })
                : t("yrValue", { n: Math.round(spec.burialTime) })
          }
          note={t("readout.burialTimeNote")}
          tone="var(--amber)"
        />
        <VizReadout
          label={t("readout.information")}
          value={t("scoreValue", { n: score, max: MAX_SCORE })}
          note={
            signature ? t("readout.signature", { feature: t(`feature.${signature}`) }) : t("readout.noSignature")
          }
          tone="var(--cyan)"
        />
      </div>

      <p className="mt-3 font-sans text-xs leading-relaxed text-subtle">{t("modelNote")}</p>
    </VizFigure>
  );
}
