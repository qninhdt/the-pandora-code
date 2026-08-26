"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  DIVER_PROFILES,
  aerobicDiveLimit,
  divingMetabolicRate,
  totalStore,
} from "./dive-oxygen-budget-model";

// The maths lives in ./dive-oxygen-budget-model.ts, including the note on which
// numbers are measured and which are back-derived from the ADL table.

const PROFILE_IDS = ["untrainedHuman", "eliteApneist", "weddellSeal"] as const;
type ProfileId = (typeof PROFILE_IDS)[number];

const COMPARTMENTS = [
  { key: "lung", tone: "var(--amber)" },
  { key: "blood", tone: "var(--magenta)" },
  { key: "muscle", tone: "var(--cyan)" },
] as const;

const W = 320;
const H = 250;
const BAR = { x: 44, y: 20, w: 260, h: 18 };
const PLOT = { l: 44, r: 16, t: 74, b: 40 };
const plotW = W - PLOT.l - PLOT.r;
const plotH = H - PLOT.t - PLOT.b;

const MASS_MIN = 50;
const MASS_MAX = 40_000;
const LOG_MASS_MIN = Math.log10(MASS_MIN);
const LOG_MASS_SPAN = Math.log10(MASS_MAX) - LOG_MASS_MIN;

const ADL_MIN = 0.5; // min
const ADL_MAX = 120; // min
const LOG_ADL_MIN = Math.log10(ADL_MIN);
const LOG_ADL_SPAN = Math.log10(ADL_MAX) - LOG_ADL_MIN;

const xOf = (mass: number) => PLOT.l + ((Math.log10(mass) - LOG_MASS_MIN) / LOG_MASS_SPAN) * plotW;
const yOf = (min: number) => {
  const clamped = Math.max(ADL_MIN, Math.min(min, ADL_MAX));
  return PLOT.t + plotH * (1 - (Math.log10(clamped) - LOG_ADL_MIN) / LOG_ADL_SPAN);
};

function adlPath(store: number, suppression: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 90; i += 1) {
    const mass = 10 ** (LOG_MASS_MIN + (LOG_MASS_SPAN * i) / 90);
    pts.push(
      `${i === 0 ? "M" : "L"}${xOf(mass).toFixed(1)},${yOf(aerobicDiveLimit(mass, store, suppression)).toFixed(1)}`,
    );
  }
  return pts.join(" ");
}

interface DiveOxygenBudgetProps {
  caption?: string;
  className?: string;
}

// Pick a body, set how hard it brakes its metabolism, and name the dive you want
// to hold. The bar on top shows where that body keeps its oxygen — and the reason
// "take a bigger breath" is the wrong lever, since a seal keeps almost none of it
// in the lungs.
export function DiveOxygenBudget({ caption, className }: DiveOxygenBudgetProps) {
  const uid = useId();
  const t = useTranslations("viz.diveOxygenBudget");
  const [profileId, setProfileId] = useState<ProfileId>("untrainedHuman");
  const [mass, setMass] = useState(70); // the untrained human the figure opens on
  const [suppression, setSuppression] = useState(1);
  const [target, setTarget] = useState(2);

  const profile = DIVER_PROFILES.find((p) => p.id === profileId) ?? DIVER_PROFILES[0];

  const stores = totalStore(mass, profile.store);
  const burn = divingMetabolicRate(mass, suppression);
  const adl = aerobicDiveLimit(mass, profile.store, suppression);
  const aerobic = adl >= target;

  const state = aerobic ? "aerobic" : "anaerobic";
  const tone = aerobic ? "var(--teal)" : "var(--magenta)";
  const figureTone = aerobic ? "teal" : "magenta";

  // Choosing a body sets its chemistry and its mass together; the mass slider
  // then lets the reader ask what a differently sized animal would manage.
  function selectProfile(id: ProfileId) {
    setProfileId(id);
    const next = DIVER_PROFILES.find((p) => p.id === id);
    if (next) setMass(next.mass);
  }

  let barOffset = 0;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${state}`)}
      caption={caption}
      tone={figureTone}
      className={className}
      controls={
        <SegmentedToggle
          options={PROFILE_IDS.map((id) => ({ value: id, label: t(`profile.${id}`) }))}
          value={profileId}
          onChange={selectProfile}
          ariaLabel={t("profileControl")}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", { minutes: adl.toFixed(1) })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />

          {/* where this body keeps its oxygen */}
          <VizText x={BAR.x} y={BAR.y - 6} size="micro" tone="var(--muted)">
            {t("barTitle")}
          </VizText>
          {COMPARTMENTS.map((c) => {
            const pct = profile.split[c.key];
            const width = (pct / 100) * BAR.w;
            const x = BAR.x + barOffset;
            barOffset += width;
            return (
              <g key={c.key}>
                <rect
                  x={x}
                  y={BAR.y}
                  width={Math.max(1, width)}
                  height={BAR.h}
                  fill={c.tone}
                  opacity={0.85}
                />
                <VizText
                  x={x + width / 2}
                  y={BAR.y + BAR.h + 11}
                  size="micro"
                  anchor="middle"
                  tone={c.tone}
                >
                  {t("percentValue", { n: pct })}
                </VizText>
              </g>
            );
          })}

          {/* the allometric curve: dive limit against body mass */}
          <rect x={PLOT.l} y={PLOT.t} width={plotW} height={plotH} fill={glowUrl(uid, "grid")} />

          {/* the dive the reader is trying to hold */}
          <line
            x1={PLOT.l}
            y1={yOf(target)}
            x2={PLOT.l + plotW}
            y2={yOf(target)}
            stroke="var(--foreground)"
            strokeWidth={1.2}
            strokeOpacity={0.4}
            strokeDasharray="4 3"
          />
          <VizText x={PLOT.l + 4} y={yOf(target) - 4} size="micro" tone="var(--muted)">
            {t("targetLabel")}
          </VizText>

          <path
            d={adlPath(profile.store, suppression)}
            fill="none"
            stroke={tone}
            strokeWidth={2.4}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "d 0.35s ease" }}
          />

          {/* the measured limits of the five bodies in the table */}
          {DIVER_PROFILES.map((p) => (
            <circle
              key={p.id}
              cx={xOf(p.mass)}
              cy={yOf((p.adl[0] + p.adl[1]) / 2)}
              r={2.6}
              fill="var(--subtle)"
              opacity={0.8}
            />
          ))}

          <circle
            cx={xOf(mass)}
            cy={yOf(adl)}
            r={4.8}
            fill={tone}
            filter={glowUrl(uid, "bloom-strong")}
            style={{ transition: "cx 0.2s ease, cy 0.3s ease" }}
          />

          <VizTick x={PLOT.l - 6} y={yOf(60) + 3} anchor="end">
            60
          </VizTick>
          <VizTick x={PLOT.l - 6} y={yOf(5) + 3} anchor="end">
            5
          </VizTick>
          <VizTick x={PLOT.l} y={PLOT.t + plotH + 13} anchor="start">
            {MASS_MIN}
          </VizTick>
          <VizTick x={PLOT.l + plotW} y={PLOT.t + plotH + 13} anchor="end">
            {MASS_MAX / 1000}k
          </VizTick>
          <VizText
            x={PLOT.l + plotW / 2}
            y={H - 6}
            size="small"
            anchor="middle"
            tone="var(--muted)"
          >
            {t("axis.mass")}
          </VizText>
          <VizText
            x={11}
            y={PLOT.t + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 11 ${PLOT.t + plotH / 2})`}
          >
            {t("axis.adl")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.stores")}
            value={t("litreValue", { n: (stores / 1000).toFixed(1) })}
            note={t("readout.storesNote", { n: profile.store })}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.burn")}
            value={t("perMinValue", { n: Math.round(burn) })}
            note={t("readout.burnNote")}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("readout.adl")}
            value={t("minuteValue", { n: adl < 10 ? adl.toFixed(1) : Math.round(adl) })}
            note={t(`verdict.${state}`)}
            tone={tone}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("derivedNote")}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <VizSlider
          label={t("slider.mass")}
          display={t("kgValue", { n: Math.round(mass) })}
          min={MASS_MIN}
          max={MASS_MAX}
          step={10}
          value={mass}
          onChange={setMass}
          tone="var(--cyan)"
        />
        <VizSlider
          label={t("slider.suppression")}
          display={t("percentValue", { n: Math.round(suppression * 100) })}
          min={0.2}
          max={1}
          step={0.01}
          value={suppression}
          onChange={setSuppression}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("slider.target")}
          display={t("minuteValue", { n: target.toFixed(1) })}
          min={0.5}
          max={30}
          step={0.5}
          value={target}
          onChange={setTarget}
          tone={tone}
        />
      </div>
    </VizFigure>
  );
}
