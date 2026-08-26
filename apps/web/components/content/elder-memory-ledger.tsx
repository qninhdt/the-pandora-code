"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { POD_AGES, podLedger, witnessChance } from "./elder-memory-ledger-model";

// Take animals off the old end of a pod and watch two numbers separate: the
// head count, which a census records, and the pod's accumulated lived
// experience, which nothing records. The reader should come away feeling that
// "we only took a few" is an accounting error. Maths in
// elder-memory-ledger-model.ts.

const W = 320;
const H = 152;
const BASE_Y = 108;
const LEFT = 24;
const SPAN = W - LEFT - 20;
const STEP = SPAN / (POD_AGES.length - 1);
const OLDEST = POD_AGES[POD_AGES.length - 1];

interface ElderMemoryLedgerProps {
  caption?: string;
  className?: string;
}

export function ElderMemoryLedger({ caption, className }: ElderMemoryLedgerProps) {
  const uid = useId();
  const t = useTranslations("viz.elderMemoryLedger");
  const [recurrence, setRecurrence] = useState(150); // mean years between lean years
  const [removed, setRemoved] = useState(3); // taken from the oldest end

  const ledger = useMemo(() => podLedger(removed, recurrence), [removed, recurrence]);
  const tone =
    ledger.regime === "asymmetric"
      ? "var(--magenta)"
      : ledger.regime === "buffered"
        ? "var(--amber)"
        : "var(--teal)";
  const figureTone =
    ledger.regime === "asymmetric" ? "magenta" : ledger.regime === "buffered" ? "amber" : "teal";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${ledger.regime}`)}
      caption={caption}
      tone={figureTone}
      className={className}
      controls={
        <div className="w-40 sm:w-52">
          <VizSlider
            label={t("controls.removed")}
            display={t("controls.removedValue", { n: removed })}
            min={0}
            max={5}
            step={1}
            value={removed}
            onChange={setRemoved}
            tone={tone}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-xl border border-border/60 bg-void/50 sm:w-3/5"
          role="img"
          aria-label={t("aria", { pct: Math.round(ledger.retention * 100) })}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "cyan"]} />
          <line
            x1={LEFT - 10}
            y1={BASE_Y}
            x2={W - 12}
            y2={BASE_Y}
            stroke="var(--border-strong)"
            strokeWidth={1}
            strokeOpacity={0.6}
          />

          {POD_AGES.map((age, index) => {
            const gone = index >= ledger.kept.length;
            const p = witnessChance(age, recurrence);
            const x = LEFT + index * STEP;
            const r = 3.5 + (age / OLDEST) * 7;
            const cy = BASE_Y - r - 3;
            return (
              <g key={age}>
                <circle
                  cx={x}
                  cy={cy}
                  r={r}
                  fill={gone ? "var(--surface-raised)" : "var(--teal)"}
                  fillOpacity={gone ? 0.5 : 0.2 + p * 0.75}
                  stroke={gone ? "var(--magenta)" : "var(--teal)"}
                  strokeOpacity={gone ? 0.8 : 1}
                  strokeWidth={1}
                  filter={!gone && p > 0.5 ? glowUrl(uid, "bloom") : undefined}
                />
                {gone ? (
                  <path
                    d={`M ${x - r * 0.7} ${cy - r * 0.7} L ${x + r * 0.7} ${cy + r * 0.7} M ${x + r * 0.7} ${cy - r * 0.7} L ${x - r * 0.7} ${cy + r * 0.7}`}
                    stroke="var(--magenta)"
                    strokeWidth={1.2}
                  />
                ) : null}
                <VizText x={x} y={BASE_Y + 13} size="micro" anchor="middle" tone="var(--subtle)">
                  {age}
                </VizText>
              </g>
            );
          })}

          <VizText x={LEFT - 10} y={BASE_Y + 30} size="micro" tone="var(--muted)">
            {t("ageAxis")}
          </VizText>
          <VizText x={LEFT - 10} y={18} size="small" tone="var(--teal)">
            {t("glowNote")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.bodies")}
            value={`−${Math.round(ledger.bodyLoss * 100)}%`}
            note={t("readout.bodiesNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.experience")}
            value={`−${Math.round(ledger.experienceLoss * 100)}%`}
            note={t("readout.experienceNote")}
            tone={tone}
          />
          <VizReadout
            label={t("readout.retained")}
            value={`${Math.round(ledger.retention * 100)}%`}
            note={t(ledger.retention < 0.75 ? "verdict.lost" : "verdict.held")}
            tone={tone}
            tinted
          />
          <VizSlider
            label={t("controls.recurrence")}
            display={t("controls.recurrenceValue", { n: recurrence })}
            min={20}
            max={400}
            step={10}
            value={recurrence}
            onChange={setRecurrence}
            tone="var(--cyan)"
          />
        </div>
      </div>
    </VizFigure>
  );
}
