"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  BODIES,
  BONUS_AXIS_MAX,
  type BodyKey,
  RUNGS,
  curves,
  formatPpm,
  ppmFraction,
  ppmFromFraction,
  runSulfide,
} from "./sulfide-electron-model";

const W = 336;
const H = 216;
const PAD_L = 38;
const PAD_R = 16;
const PAD_T = 22;
const PAD_B = 44;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const BODY_TONE: Record<BodyKey, string> = {
  human: "var(--magenta)",
  exopack: "var(--amber)",
  sulfideSpringFish: "var(--teal)",
  pandoranNative: "var(--cyan)",
};

const BODY_FIGURE_TONE: Record<BodyKey, "cyan" | "teal" | "magenta" | "amber"> = {
  human: "magenta",
  exopack: "amber",
  sulfideSpringFish: "teal",
  pandoranNative: "cyan",
};

const FATE_TONE = {
  trace: "var(--subtle)",
  supplement: "var(--cyan)",
  nearCapacity: "var(--amber)",
  arrest: "var(--magenta)",
} as const;

// Concentration runs across on a log axis spanning the whole clinical ladder. The
// solid line is how much of Complex IV is still turning over; the dashed one is how
// much energy the same molecule is providing. The shape is the argument: for any
// body, sulfide is food right up to the point where its disposal cascade saturates,
// and then it is a poison, with almost nothing in between.
//
// Nothing about the native mitochondrion is exotic. A human already runs every enzyme
// in this cascade. The difference is capacity — where the cliff sits — and Pandora
// simply put the cliff above the concentration its own air delivers.
export function SulfideElectronLedger({
  caption,
  className,
}: {
  caption?: string;
  className?: string;
}) {
  const uid = useId();
  const t = useTranslations("viz.sulfideElectron");
  const [body, setBody] = useState<BodyKey>("human");
  const [axisPos, setAxisPos] = useState(ppmFraction(1000));

  const ppm = ppmFromFraction(axisPos);
  const out = useMemo(() => runSulfide(body, ppm), [body, ppm]);
  const series = useMemo(() => curves(body), [body]);
  const tone = BODY_TONE[body];

  const xOf = (fraction: number) => PAD_L + fraction * plotW;
  const yOf = (value: number) => PAD_T + (1 - value) * plotH;

  const capacityPath = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.x)} ${yOf(p.capacity)}`)
    .join(" ");
  const bonusPath = series
    .map(
      (p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.x)} ${yOf(Math.min(1, p.bonus / BONUS_AXIS_MAX))}`,
    )
    .join(" ");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${body}`)}
      caption={caption}
      tone={BODY_FIGURE_TONE[body]}
      className={className}
      controls={
        <div className="flex w-full flex-col items-end gap-2">
          <SegmentedToggle<BodyKey>
            options={BODIES.map((key) => ({
              value: key,
              label: t(`body.${key}`),
              tone: BODY_TONE[key],
            }))}
            value={body}
            onChange={setBody}
            ariaLabel={t("controls.body")}
          />
          <div className="w-40 sm:w-52">
            <VizSlider
              label={t("controls.exposure")}
              display={t("ppmValue", { n: formatPpm(ppm) })}
              min={0}
              max={1}
              step={0.005}
              value={axisPos}
              onChange={setAxisPos}
              tone="var(--cyan)"
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t(`aria.${out.fate}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

          <rect
            x={PAD_L}
            y={PAD_T}
            width={plotW}
            height={plotH}
            fill={glowUrl(uid, "grid")}
            fillOpacity={0.5}
          />

          {/* the rungs of the human clinical ladder */}
          {RUNGS.map((rung) => (
            <g key={rung.key}>
              <line
                x1={xOf(ppmFraction(rung.ppm))}
                y1={PAD_T}
                x2={xOf(ppmFraction(rung.ppm))}
                y2={PAD_T + plotH}
                stroke="var(--border-strong)"
                strokeWidth={0.75}
                strokeOpacity={0.6}
                strokeDasharray="2 4"
              />
              <VizText
                x={xOf(ppmFraction(rung.ppm))}
                y={PAD_T + plotH + 12}
                size="micro"
                anchor="middle"
                tone={rung.key === "pandoraTrace" ? "cyan" : "var(--subtle)"}
              >
                {t(`rung.${rung.key}`)}
              </VizText>
            </g>
          ))}

          {/* what is left of the respiratory chain, and what sulfide is paying for */}
          <path d={capacityPath} fill="none" stroke={tone} strokeWidth={1.9} />
          <path
            d={bonusPath}
            fill="none"
            stroke="var(--teal)"
            strokeWidth={1.4}
            strokeDasharray="4 3"
            strokeOpacity={0.85}
          />

          <circle
            cx={xOf(axisPos)}
            cy={yOf(out.complexIvCapacity)}
            r={13}
            fill={glowUrl(uid, "wash-cyan")}
          />
          <circle
            cx={xOf(axisPos)}
            cy={yOf(out.complexIvCapacity)}
            r={4.2}
            fill={FATE_TONE[out.fate]}
            filter={glowUrl(uid, "bloom")}
          />

          <VizText x={PAD_L} y={PAD_T - 9} size="micro" tone={tone}>
            {t("legend.capacity")}
          </VizText>
          <VizText x={PAD_L + plotW} y={PAD_T - 9} size="micro" anchor="end" tone="teal">
            {t("legend.bonus")}
          </VizText>
          <VizText
            x={PAD_L + plotW / 2}
            y={PAD_T + plotH + 30}
            size="small"
            anchor="middle"
            tone="var(--muted)"
          >
            {t("axis.exposure")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.fate")}
            value={t(`fate.${out.fate}`)}
            note={t(`fateNote.${out.fate}`)}
            tone={FATE_TONE[out.fate]}
            tinted
          />
          <VizReadout
            label={t("readout.chain")}
            value={t("pctValue", { n: Math.round(out.complexIvCapacity * 100) })}
            note={t("chainNote")}
            tone={out.complexIvCapacity > 0.8 ? "var(--teal)" : "var(--magenta)"}
          />
          <VizReadout
            label={t("readout.cascade")}
            value={t("pctValue", { n: Math.min(999, Math.round(out.load * 100)) })}
            note={out.load >= 1 ? t("cascadeNote.over") : t("cascadeNote.under")}
            tone={out.load >= 0.75 ? "var(--amber)" : "var(--teal)"}
          />
          <VizReadout
            label={t("readout.energy")}
            value={t("pctValue", { n: Number((out.energyBonus * 100).toFixed(1)) })}
            note={out.netGain ? t("energyNote.gain") : t("energyNote.none")}
            tone={out.netGain ? "var(--cyan)" : "var(--subtle)"}
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("modelNote")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
