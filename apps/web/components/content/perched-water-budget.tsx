"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  DEFAULT_INPUTS,
  FOG_REFERENCES,
  type PerchedInputs,
  runPerchedBudget,
  sustainableDischarge,
} from "./perched-water-budget-model";

// The chapter's argument, made checkable. A floating massif has no watershed
// above it, so every litre leaving its rim must have been captured from the air.
// Set the fog the wind carries, how much of it the rock actually catches, and how
// big a cataract you are trying to feed, and the two columns either meet or they
// do not.
//
// They mostly do not. At any discharge that looks like the waterfalls on screen,
// fog interception falls short by more than an order of magnitude — and the
// figure says so in plain numbers rather than making the reader take it on trust.
// The venturi switch is the one lever that closes the gap, and it is labelled as
// the speculation it is: nothing in canon establishes that the gaps between
// massifs accelerate the wind.
//
// Ledger in perched-water-budget-model.ts.

const W = 300;
const H = 220;
const PAD = { l: 46, r: 14, t: 16, b: 44 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

// Log scale: the whole point is that the two columns differ by orders of
// magnitude, and a linear axis would flatten the capture bar to nothing.
const Q_MIN = 0.05;
const Q_MAX = 300;
const yOfQ = (q: number) =>
  PAD.t +
  (1 -
    (Math.log10(Math.max(q, Q_MIN)) - Math.log10(Q_MIN)) /
      (Math.log10(Q_MAX) - Math.log10(Q_MIN))) *
    plotH;
const BASE_Y = PAD.t + plotH;

const VERDICT_TONE = {
  solvent: "teal",
  marginal: "cyan",
  shortfall: "amber",
  impossible: "magenta",
} as const;

export function PerchedWaterBudget({
  caption,
  className,
}: { caption?: string; className?: string }) {
  const t = useTranslations("viz.perchedWaterBudget");
  const uid = useId();
  const [input, setInput] = useState<PerchedInputs>(DEFAULT_INPUTS);

  const set = <K extends keyof PerchedInputs>(key: K, value: PerchedInputs[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => runPerchedBudget(input), [input]);
  const sustainable = useMemo(() => sustainableDischarge(input), [input]);
  const tone = VERDICT_TONE[result.verdict];
  const toneVar = `var(--${tone})`;

  // Capture splits into face impaction and plateau-surface deposition; demand
  // splits into the visible cataract and the forest's own transpiration.
  const captureX = PAD.l + plotW * 0.28;
  const demandX = PAD.l + plotW * 0.72;
  const barW = 44;

  const shortfallFactor = result.coverage > 0 ? 1 / result.coverage : 0;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      hint={t(`verdict.${result.verdict}`)}
      tone={tone}
      className={className}
      controls={
        <div className="flex w-40 flex-col gap-2 sm:w-56">
          <VizSlider
            label={t("controls.diameter")}
            display={t("kmValue", { km: input.diameterKm })}
            min={1}
            max={16}
            step={1}
            value={input.diameterKm}
            onChange={(v) => set("diameterKm", v)}
            tone="var(--teal)"
          />
          <VizSlider
            label={t("controls.lwc")}
            display={t("lwcValue", { g: input.lwcGm3.toFixed(2) })}
            min={0.05}
            max={1}
            step={0.05}
            value={input.lwcGm3}
            onChange={(v) => set("lwcGm3", v)}
            tone="var(--cyan)"
          />
          <VizSlider
            label={t("controls.wind")}
            display={t("msValue", { v: input.windMs })}
            min={1}
            max={20}
            step={1}
            value={input.windMs}
            onChange={(v) => set("windMs", v)}
            tone="var(--cyan)"
          />
          <VizSlider
            label={t("controls.efficiency")}
            display={`${Math.round(input.efficiency * 100)}%`}
            min={0.02}
            max={0.6}
            step={0.02}
            value={input.efficiency}
            onChange={(v) => set("efficiency", v)}
            tone="var(--amber)"
          />
          <VizSlider
            label={t("controls.discharge")}
            display={t("q3sValue", { q: input.dischargeM3s })}
            min={0.5}
            max={120}
            step={0.5}
            value={input.dischargeM3s}
            onChange={(v) => set("dischargeM3s", v)}
            tone="var(--magenta)"
          />
          <label className="mt-1 flex items-start gap-2 font-sans text-xs text-muted">
            <input
              type="checkbox"
              checked={input.enhanced}
              onChange={(e) => set("enhanced", e.target.checked)}
              className="mt-0.5 accent-[var(--magenta)]"
            />
            <span>{t("controls.venturi")}</span>
          </label>
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            capture: result.captureM3s.toFixed(1),
            demand: result.demandM3s.toFixed(1),
          })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          <line
            x1={PAD.l}
            y1={BASE_Y}
            x2={PAD.l + plotW}
            y2={BASE_Y}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
          />

          {[0.1, 1, 10, 100].map((q) => (
            <g key={q}>
              <line
                x1={PAD.l}
                y1={yOfQ(q)}
                x2={PAD.l + plotW}
                y2={yOfQ(q)}
                stroke="var(--border)"
                strokeWidth={0.5}
                strokeOpacity={0.5}
              />
              <VizTick x={PAD.l - 6} y={yOfQ(q) + 3} anchor="end">
                {q}
              </VizTick>
            </g>
          ))}

          {/* capture: face impaction stacked under plateau-surface deposition */}
          <g>
            <rect
              x={captureX - barW / 2}
              y={yOfQ(result.captureM3s)}
              width={barW}
              height={Math.max(1, BASE_Y - yOfQ(result.captureM3s))}
              rx={2}
              fill="var(--cyan)"
              opacity={0.85}
              filter={glowUrl(uid, "bloom")}
            />
            <line
              x1={captureX - barW / 2}
              y1={yOfQ(result.surfaceCaptureM3s)}
              x2={captureX + barW / 2}
              y2={yOfQ(result.surfaceCaptureM3s)}
              stroke="var(--void)"
              strokeWidth={1.5}
              strokeOpacity={0.7}
            />
            <VizText x={captureX} y={H - 26} size="small" anchor="middle" tone="cyan">
              {t("bar.capture")}
            </VizText>
            <VizText x={captureX} y={H - 14} size="micro" anchor="middle" tone="var(--subtle)">
              {t("bar.captureNote")}
            </VizText>
          </g>

          {/* demand: the visible cataract plus the plateau's own thirst */}
          <g>
            <rect
              x={demandX - barW / 2}
              y={yOfQ(result.demandM3s)}
              width={barW}
              height={Math.max(1, BASE_Y - yOfQ(result.demandM3s))}
              rx={2}
              fill="var(--magenta)"
              opacity={0.8}
            />
            <line
              x1={demandX - barW / 2}
              y1={yOfQ(result.transpirationM3s)}
              x2={demandX + barW / 2}
              y2={yOfQ(result.transpirationM3s)}
              stroke="var(--void)"
              strokeWidth={1.5}
              strokeOpacity={0.7}
            />
            <VizText x={demandX} y={H - 26} size="small" anchor="middle" tone="magenta">
              {t("bar.demand")}
            </VizText>
            <VizText x={demandX} y={H - 14} size="micro" anchor="middle" tone="var(--subtle)">
              {t("bar.demandNote")}
            </VizText>
          </g>

          {/* the gap, drawn as the thing it is */}
          {result.coverage < 1 ? (
            <g>
              <line
                x1={captureX + barW / 2 + 4}
                y1={yOfQ(result.captureM3s)}
                x2={demandX - barW / 2 - 4}
                y2={yOfQ(result.demandM3s)}
                stroke={toneVar}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.9}
              />
              <VizText
                x={(captureX + demandX) / 2}
                y={(yOfQ(result.captureM3s) + yOfQ(result.demandM3s)) / 2 - 6}
                size="small"
                anchor="middle"
                tone={toneVar}
              >
                {t("gapMark", { factor: shortfallFactor.toFixed(0) })}
              </VizText>
            </g>
          ) : null}

          <VizText
            x={10}
            y={PAD.t + plotH / 2}
            size="micro"
            anchor="middle"
            tone="var(--subtle)"
            transform={`rotate(-90 10 ${PAD.t + plotH / 2})`}
          >
            {t("axis.flow")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.coverage")}
            value={`${Math.round(result.coverage * 100)}%`}
            note={t(`verdictShort.${result.verdict}`)}
            tone={toneVar}
            tinted
          />
          <VizReadout
            label={t("readout.sustainable")}
            value={t("q3sValue", { q: sustainable.toFixed(1) })}
            note={t("readout.sustainableNote")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.asRate")}
            value={t("mmDayValue", { mm: result.captureMmDay.toFixed(1) })}
            note={t("readout.asRateNote", {
              lo: FOG_REFERENCES[0].mmDay,
              hi: FOG_REFERENCES[FOG_REFERENCES.length - 1].mmDay,
            })}
            tone="var(--teal)"
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("footnote")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
