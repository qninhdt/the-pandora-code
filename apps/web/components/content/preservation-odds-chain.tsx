"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useState } from "react";
import { PreservationChainBars } from "./preservation-odds-chain-bars";
import {
  BODIES,
  FACTORS,
  SETTINGS,
  type FactorKey,
  type FactorSet,
  evaluate,
  formatOneIn,
  presetFor,
} from "./preservation-odds-chain-model";

// A fossil needs five separate strokes of luck, and they multiply. The reader
// picks a body and a place, watches the five terms populate, then discovers the
// thing the multiplication does: the answer belongs to the smallest factor. Push
// four of them to near-certainty and leave the rainforest's chemistry where it
// is, and the chain still says never. The Hallelujah mountains make the point
// even harder — nothing accumulates there, so there is no rock to hold anything,
// and no amount of durable tissue rescues it. Scoring and its sourcing live in
// ./preservation-odds-chain-model.ts.

interface PreservationOddsChainProps {
  caption?: string;
  className?: string;
}

export function PreservationOddsChain({ caption, className }: PreservationOddsChainProps) {
  const uid = useId();
  const t = useTranslations("viz.preservationOddsChain");

  const [bodyId, setBodyId] = useState(BODIES[2].id); // the thanator: big and rare
  const [settingId, setSettingId] = useState(SETTINGS[0].id); // rainforest floor
  const [override, setOverride] = useState<Partial<FactorSet>>({});

  const body = BODIES.find((b) => b.id === bodyId) ?? BODIES[0];
  const setting = SETTINGS.find((s) => s.id === settingId) ?? SETTINGS[0];

  // Changing the scenario clears any hand-tuned factors so the preset reads clean.
  useEffect(() => {
    setOverride({});
  }, [bodyId, settingId]);

  const factors = useMemo<FactorSet>(() => {
    const preset = presetFor(body, setting);
    return { ...preset, ...override };
  }, [body, setting, override]);

  const result = useMemo(() => evaluate(factors), [factors]);
  const oneIn = formatOneIn(result.oneIn);

  const tone = result.effectivelyNever ? "var(--magenta)" : "var(--teal)";
  const touched = Object.keys(override).length > 0;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={result.effectivelyNever ? "magenta" : "teal"}
      hint={t(`hint.${result.bottleneck}`)}
      caption={caption}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("bodyControl")}
          value={bodyId}
          onChange={setBodyId}
          options={BODIES.map((b) => ({ value: b.id, label: t(`body.${b.id}`) }))}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="sm:w-3/5">
          <PreservationChainBars
            uid={uid}
            factors={factors}
            bottleneck={result.bottleneck}
            labels={{
              aria: t("aria", {
                body: t(`body.${body.id}`),
                setting: t(`setting.${setting.id}`),
                oneIn: oneIn.value,
              }),
              factor: FACTORS.reduce(
                (acc, key) => ({ ...acc, [key]: t(`factor.${key}`) }),
                {} as Record<FactorKey, string>,
              ),
              axis: t("axis"),
            }}
          />
        </div>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.odds")}
            value={
              oneIn.scale === "plain"
                ? t("oneIn", { n: oneIn.value })
                : t(`oneIn_${oneIn.scale}`, { n: oneIn.value })
            }
            note={t(result.effectivelyNever ? "verdict.never" : "verdict.possible")}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("readout.bottleneck")}
            value={t(`factor.${result.bottleneck}`)}
            note={t("readout.bottleneckNote")}
            tone="var(--magenta)"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 font-sans text-xs text-muted">{t("settingControl")}</p>
        <div className="flex flex-wrap gap-1.5">
          {SETTINGS.map((s) => {
            const active = s.id === settingId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSettingId(s.id)}
                aria-pressed={active}
                className="rounded-full border px-2.5 py-1 font-sans text-xs transition-colors"
                style={{
                  borderColor: active
                    ? "color-mix(in oklab, var(--cyan) 55%, transparent)"
                    : "var(--border)",
                  background: active
                    ? "color-mix(in oklab, var(--cyan) 12%, transparent)"
                    : "transparent",
                  color: active ? "var(--cyan)" : "var(--muted)",
                }}
              >
                {t(`setting.${s.id}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        {FACTORS.map((key) => (
          <VizSlider
            key={key}
            label={t(`factor.${key}`)}
            display={factors[key] < 0.01 ? factors[key].toExponential(1) : factors[key].toFixed(2)}
            min={0}
            max={1}
            step={0.01}
            value={factors[key]}
            onChange={(v) => setOverride((o) => ({ ...o, [key]: v }))}
            tone={key === result.bottleneck ? "var(--magenta)" : "var(--teal)"}
          />
        ))}
      </div>

      {touched ? (
        <button
          type="button"
          onClick={() => setOverride({})}
          className="mt-3 font-sans text-xs text-cyan underline decoration-dotted underline-offset-2"
        >
          {t("reset")}
        </button>
      ) : null}

      <p className="mt-3 font-sans text-xs leading-relaxed text-subtle">{t("modelNote")}</p>
    </VizFigure>
  );
}
