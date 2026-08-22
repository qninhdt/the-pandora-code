"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Mode = "fluctuating" | "armsRace";
type Genotype = "a" | "b" | "c";

const GENOTYPES: Genotype[] = ["a", "b", "c"];
const TONES: Record<Genotype, string> = {
  a: "var(--cyan)",
  b: "var(--magenta)",
  c: "var(--amber)",
};

interface RedQueenRaceProps {
  caption?: string;
  className?: string;
}

// A deterministic twelve-generation thought experiment. Fluctuating selection
// rewards the rare matching type in turn; an arms race instead raises one shared
// defence and attack level. The contrast is conceptual, not a fitted population
// model, so the figure never pretends its illustrative values are field data.
export function RedQueenRace({ caption, className }: RedQueenRaceProps) {
  const t = useTranslations("viz.redQueenRace");
  const [mode, setMode] = useState<Mode>("fluctuating");
  const [generation, setGeneration] = useState(4);

  const common = GENOTYPES[Math.floor(generation / 2) % GENOTYPES.length];
  const previous = GENOTYPES[(GENOTYPES.indexOf(common) + 2) % GENOTYPES.length];
  const rare = GENOTYPES[(GENOTYPES.indexOf(common) + 1) % GENOTYPES.length];
  const defence = Math.min(10, generation + 2);
  const attack = Math.min(10, generation + 1);

  const options = [
    { value: "fluctuating" as const, label: t("mode.fluctuating"), tone: "var(--magenta)" },
    { value: "armsRace" as const, label: t("mode.armsRace"), tone: "var(--amber)" },
  ];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${mode}`)}
      caption={caption}
      tone="magenta"
      className={className}
      controls={
        <SegmentedToggle
          options={options}
          value={mode}
          onChange={setMode}
          ariaLabel={t("modeLabel")}
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-xl border border-border/70 bg-void/30 p-4">
          <VizSlider
            label={t("generationLabel")}
            display={t("generation", { n: generation + 1 })}
            min={0}
            max={11}
            step={1}
            value={generation}
            onChange={setGeneration}
            tone={mode === "fluctuating" ? "var(--magenta)" : "var(--amber)"}
          />

          {mode === "fluctuating" ? (
            <div className="mt-5 space-y-4">
              <PopulationRow
                label={t("hostRow")}
                values={{ [common]: 9, [rare]: 3, [previous]: 5 } as Record<Genotype, number>}
                highlighted={common}
                labels={GENOTYPES.map((id) => t(`genotype.${id}`))}
              />
              <div className="flex items-center justify-center gap-2 font-sans text-xs text-subtle">
                <span aria-hidden>↓</span>
                <span>{t("tracking")}</span>
                <span aria-hidden>↓</span>
              </div>
              <PopulationRow
                label={t("pathogenRow")}
                values={{ [common]: 8, [rare]: 2, [previous]: 4 } as Record<Genotype, number>}
                highlighted={common}
                labels={GENOTYPES.map((id) => t(`pathogen.${id}`))}
              />
            </div>
          ) : (
            <div className="mt-6 space-y-5" aria-label={t("armsAria")}>
              <EscalationBar label={t("defence")} value={defence} tone="var(--cyan)" />
              <EscalationBar label={t("attack")} value={attack} tone="var(--amber)" />
              <p className="font-sans text-xs leading-relaxed text-subtle">
                {t("armsExplanation")}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {mode === "fluctuating" ? (
            <>
              <VizReadout
                label={t("readout.common")}
                value={t(`genotype.${common}`)}
                tone={TONES[common]}
              />
              <VizReadout
                label={t("readout.target")}
                value={t(`pathogen.${common}`)}
                tone={TONES[common]}
              />
              <VizReadout
                label={t("readout.advantage")}
                value={t(`genotype.${rare}`)}
                note={t("rareVerdict")}
                tone={TONES[rare]}
                tinted
              />
            </>
          ) : (
            <>
              <VizReadout label={t("readout.defence")} value={`${defence}/10`} tone="var(--cyan)" />
              <VizReadout label={t("readout.attack")} value={`${attack}/10`} tone="var(--amber)" />
              <VizReadout
                label={t("readout.outcome")}
                value={t("escalation")}
                note={t("armsVerdict")}
                tone="var(--amber)"
                tinted
              />
            </>
          )}
        </div>
      </div>
    </VizFigure>
  );
}

function PopulationRow({
  label,
  values,
  highlighted,
  labels,
}: {
  label: string;
  values: Record<Genotype, number>;
  highlighted: Genotype;
  labels: string[];
}) {
  return (
    <div>
      <p className="mb-2 font-sans text-xs font-600 text-muted">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {GENOTYPES.map((id, index) => (
          <div
            key={id}
            className={cn(
              "flex min-h-20 flex-col items-center justify-end rounded-lg border border-border/60 bg-surface/30 p-2",
              id === highlighted && "border-transparent",
            )}
            style={
              id === highlighted
                ? { boxShadow: `inset 0 0 0 1px ${TONES[id]}, 0 0 22px -12px ${TONES[id]}` }
                : undefined
            }
          >
            <div className="flex h-12 items-end gap-0.5" aria-hidden>
              {Array.from({ length: values[id] }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full"
                  style={{ height: `${10 + (i % 4) * 7}px`, backgroundColor: TONES[id] }}
                />
              ))}
            </div>
            <span className="mt-1 font-sans text-xs" style={{ color: TONES[id] }}>
              {labels[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EscalationBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between font-sans text-xs text-muted">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-border/70">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${value * 10}%`, backgroundColor: tone }}
        />
      </div>
    </div>
  );
}
