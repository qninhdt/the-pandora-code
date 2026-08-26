"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE MODEL — not every death costs the same
//
// For a long-lived, late-maturing animal, the population growth rate lambda is
// overwhelmingly sensitive to adult female survival and barely sensitive to
// fecundity or calf survival. Elasticity analyses of cetacean matrix models put
// e(adult female survival) above 0.8 and e(fecundity) below 0.1.
//
// So the demographic damage of removing an individual scales with its
// reproductive value, not with its body mass. Killing calves is cheap for the
// population; killing breeding females is where the growth rate lives. A hunt
// that deliberately targets nursing mothers has found the most expensive class
// in the matrix.
//
// Recovery horizon is the time for the depleted stock to regrow, approximated as
// the logistic recovery time under the post-harvest growth rate:
//   T ~= ln(target/remaining) / (r_max * (1 - elasticity_loss))
// ─────────────────────────────────────────────────────────────────────

type Target = "calf" | "juvenile" | "male" | "female";

interface Klass {
  id: Target;
  /** Elasticity of lambda with respect to this class's survival. */
  elasticity: number;
  tone: string;
}

// Elasticities from cetacean age-structured matrix models. Adult female survival
// dominates; calf survival and fecundity contribute little.
const CLASSES: Klass[] = [
  { id: "calf", elasticity: 0.07, tone: "var(--cyan)" },
  { id: "juvenile", elasticity: 0.16, tone: "var(--teal)" },
  { id: "male", elasticity: 0.09, tone: "var(--amber)" },
  { id: "female", elasticity: 0.84, tone: "var(--magenta)" },
];

const R_MAX = 0.04; // maximum net productivity for a great whale, per year

// Growth rate left after removing a given share of a class whose survival carries
// the stated elasticity.
function realizedGrowth(elasticity: number, removalFraction: number): number {
  return R_MAX * (1 - elasticity * removalFraction);
}

// Years to climb back from 30% of carrying capacity to 80% at that growth rate.
function recoveryYears(growth: number): number {
  if (growth <= 0.0005) return Number.POSITIVE_INFINITY;
  return Math.log(0.8 / 0.3) / growth;
}

const W = 320;
const H = 210;
const PAD_L = 46;
const PAD_R = 16;
const PAD_T = 20;
const PAD_B = 36;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const BAR_GAP = 10;
const barH = (plotH - BAR_GAP * (CLASSES.length - 1)) / CLASSES.length;

interface ReproductiveValueElasticityProps {
  caption?: string;
  className?: string;
}

// Pick which class a hunt removes and how hard it presses. The bars are the
// elasticity of population growth to each class; the readouts turn that into the
// recovery horizon the stock actually faces.
export function ReproductiveValueElasticity({
  caption,
  className,
}: ReproductiveValueElasticityProps) {
  const uid = useId();
  const t = useTranslations("viz.reproductiveValue");
  const [target, setTarget] = useState<Target>("female");
  const [pressure, setPressure] = useState(45); // % of that class removed

  const active = CLASSES.find((c) => c.id === target) ?? CLASSES[3];
  const fraction = pressure / 100;

  const { growth, years, collapsing } = useMemo(() => {
    const g = realizedGrowth(active.elasticity, fraction);
    const y = recoveryYears(g);
    return { growth: g, years: y, collapsing: g <= 0.0005 };
  }, [active.elasticity, fraction]);

  const xOf = (e: number) => PAD_L + (e / 1) * plotW;
  const worst = active.id === "female";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={worst ? t("hint.female") : t("hint.other")}
      caption={caption}
      tone={worst ? "magenta" : "cyan"}
      className={className}
      controls={
        <div className="flex w-full flex-col items-end gap-2">
          <SegmentedToggle<Target>
            options={CLASSES.map((c) => ({
              value: c.id,
              label: t(`class.${c.id}`),
              tone: c.tone,
            }))}
            value={target}
            onChange={setTarget}
            ariaLabel={t("controls.target")}
          />
          <VizSlider
            className="w-40 sm:w-52"
            label={t("controls.pressure")}
            display={`${pressure}%`}
            min={0}
            max={90}
            step={5}
            value={pressure}
            onChange={setPressure}
            tone={active.tone}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria.chart", { class: t(`class.${active.id}`) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {CLASSES.map((c, i) => {
            const y = PAD_T + i * (barH + BAR_GAP);
            const isActive = c.id === target;
            const w = Math.max(2, xOf(c.elasticity) - PAD_L);
            return (
              <g key={c.id}>
                <rect
                  x={PAD_L}
                  y={y}
                  width={w}
                  height={barH}
                  rx={2}
                  fill={c.tone}
                  opacity={isActive ? 0.95 : 0.3}
                  filter={isActive ? glowUrl(uid, "bloom") : undefined}
                />
                <VizText
                  x={PAD_L - 6}
                  y={y + barH / 2 + 3}
                  size="small"
                  anchor="end"
                  tone={isActive ? c.tone : "var(--subtle)"}
                >
                  {t(`class.${c.id}`)}
                </VizText>
                <VizText
                  x={PAD_L + w + 5}
                  y={y + barH / 2 + 3}
                  size="micro"
                  tone={isActive ? c.tone : "var(--subtle)"}
                  numeric
                >
                  {c.elasticity.toFixed(2)}
                </VizText>
              </g>
            );
          })}

          <VizTick x={PAD_L} y={H - 18}>
            0
          </VizTick>
          <VizTick x={PAD_L + plotW} y={H - 18}>
            1.0
          </VizTick>
          <VizText x={PAD_L + plotW / 2} y={H - 5} size="small" anchor="middle" tone="var(--muted)">
            {t("axis.elasticity")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.growth")}
            value={`${(growth * 100).toFixed(2)}%`}
            tone={active.tone}
          />
          <VizReadout
            label={t("readout.recovery")}
            value={collapsing ? t("readout.never") : `${Math.round(years)} yr`}
            note={collapsing ? t("note.collapse") : t("note.recover")}
            tone={collapsing ? "var(--magenta)" : active.tone}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("units")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
