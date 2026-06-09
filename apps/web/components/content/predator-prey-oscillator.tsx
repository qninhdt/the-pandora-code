"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  MODELS,
  type Model,
  STEPS,
  equilibrium,
  integrate,
  shockedStart,
} from "./predator-prey-model";

interface PredatorPreyOscillatorProps {
  caption?: string;
  className?: string;
}

type View = "time" | "phase";

// The chapter's whole arc made interactive. The model toggle walks from the naive
// Lotka-Volterra wheel (neutral, fragile) through the density-dependent "real
// forest" (spirals back after a shock) to the "enriched" world (orbits swing wider
// toward zero — the paradox of enrichment). The nudge button shocks the system so
// the three responses to the *same* perturbation can be compared directly. The
// dynamics live in predator-prey-model.ts; every visible string is translated.

const W = 320;
const H = 200;
const PAD_L = 20;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 22;
const PW = W - PAD_L - PAD_R;
const PH = H - PAD_T - PAD_B;

const SWEEP_PERIOD = 16;
const PREY_TONE = "var(--teal)";
const PRED_TONE = "var(--magenta)";

const MODEL_TONE: Record<Model, "teal" | "cyan" | "amber"> = {
  naive: "cyan",
  real: "teal",
  enriched: "amber",
};

// Plot mappings — pure functions of value + scale so the path memos depend only
// on the data, not on closed-over component state.
const tx = (i: number) => PAD_L + (i / (STEPS - 1)) * PW;
const px = (n: number, nMax: number) => PAD_L + (n / nMax) * PW;
const py = (v: number, max: number) => PAD_T + (1 - v / max) * PH;

export function PredatorPreyOscillator({ caption, className }: PredatorPreyOscillatorProps) {
  const uid = useId();
  const t = useTranslations("viz.predatorPrey");
  const reduced = useReducedMotionSafe();
  const [view, setView] = useState<View>("time");
  const [model, setModel] = useState<Model>("naive");
  const [kick, setKick] = useState(0);
  const [playing, setPlaying] = useState(false);

  const start = useMemo(() => shockedStart(model, kick), [model, kick]);
  const series = useMemo(() => integrate(MODELS[model], start.n, start.p), [model, start]);
  const eq = useMemo(() => equilibrium(MODELS[model]), [model]);

  const { nMax, pMax } = useMemo(() => {
    let nm = eq.n;
    let pm = eq.p;
    for (const pt of series) {
      if (pt.n > nm) nm = pt.n;
      if (pt.p > pm) pm = pt.p;
    }
    return { nMax: nm * 1.12, pMax: pm * 1.12 };
  }, [series, eq]);

  const { phase, setPhase } = usePhaseLoop({ period: SWEEP_PERIOD, playing, initial: 0 });
  const cursor = Math.min(STEPS - 1, Math.floor(phase * STEPS));
  const here = series[cursor];

  const preyPath = useMemo(
    () => series.map((pt, i) => `${i === 0 ? "M" : "L"} ${tx(i)} ${py(pt.n, nMax)}`).join(" "),
    [series, nMax],
  );
  const predPath = useMemo(
    () => series.map((pt, i) => `${i === 0 ? "M" : "L"} ${tx(i)} ${py(pt.p, pMax)}`).join(" "),
    [series, pMax],
  );
  const phasePath = useMemo(
    () =>
      series.map((pt, i) => `${i === 0 ? "M" : "L"} ${px(pt.n, nMax)} ${py(pt.p, pMax)}`).join(" "),
    [series, nMax, pMax],
  );

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      hint={t(`note.${model}`)}
      tone={MODEL_TONE[model]}
      controls={
        <div className="flex items-center gap-2">
          <SegmentedToggle<View>
            ariaLabel={t("viewLabel")}
            value={view}
            onChange={setView}
            options={[
              { value: "time", label: t("timeTab"), tone: PREY_TONE },
              { value: "phase", label: t("phaseTab"), tone: "var(--cyan)" },
            ]}
          />
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t("pause") : t("play")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-all hover:border-cyan/60 hover:bg-void/70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={view === "time" ? t("ariaTime") : t("ariaPhase")}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "cyan", "amber"]} />
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + PH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD_L}
            y1={PAD_T + PH}
            x2={PAD_L + PW}
            y2={PAD_T + PH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {view === "time" ? (
            <>
              {/* equilibrium guide for the prey — the level the real model returns to */}
              {Number.isFinite(eq.n) && (
                <line
                  x1={PAD_L}
                  y1={py(eq.n, nMax)}
                  x2={PAD_L + PW}
                  y2={py(eq.n, nMax)}
                  stroke={PREY_TONE}
                  strokeOpacity={0.25}
                  strokeDasharray="3 3"
                />
              )}
              <path
                d={preyPath}
                fill="none"
                stroke={PREY_TONE}
                strokeWidth={2.2}
                filter={glowUrl(uid, "bloom")}
              />
              <path
                d={predPath}
                fill="none"
                stroke={PRED_TONE}
                strokeWidth={2.2}
                filter={glowUrl(uid, "bloom")}
              />
              <line
                x1={tx(cursor)}
                y1={PAD_T}
                x2={tx(cursor)}
                y2={PAD_T + PH}
                stroke="var(--foreground)"
                strokeOpacity={0.25}
                strokeWidth={1}
              />
              <circle
                cx={tx(cursor)}
                cy={py(here.n, nMax)}
                r={4}
                fill={PREY_TONE}
                filter={glowUrl(uid, "bloom")}
              />
              <circle
                cx={tx(cursor)}
                cy={py(here.p, pMax)}
                r={4}
                fill={PRED_TONE}
                filter={glowUrl(uid, "bloom")}
              />
              <VizText x={PAD_L + PW / 2} y={H - 4} size="micro" tone="subtle" anchor="middle">
                {t("timeAxis")}
              </VizText>
            </>
          ) : (
            <>
              {/* equilibrium point: the focus the orbit spirals into or circles */}
              {Number.isFinite(eq.n) && (
                <circle
                  cx={px(eq.n, nMax)}
                  cy={py(eq.p, pMax)}
                  r={3}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeOpacity={0.4}
                  strokeWidth={1.2}
                  strokeDasharray="2 2"
                />
              )}
              <path
                d={phasePath}
                fill="none"
                stroke={`var(--${MODEL_TONE[model]})`}
                strokeWidth={2}
                filter={glowUrl(uid, "bloom")}
              />
              <circle
                cx={px(here.n, nMax)}
                cy={py(here.p, pMax)}
                r={5}
                fill={`var(--${MODEL_TONE[model]})`}
                filter={glowUrl(uid, "bloom")}
              />
              <VizText x={PAD_L + PW / 2} y={H - 4} size="micro" tone="subtle" anchor="middle">
                {t("preyAxis")}
              </VizText>
              <VizText
                x={10}
                y={PAD_T + PH / 2}
                size="micro"
                tone="subtle"
                anchor="middle"
                transform={`rotate(-90 10 ${PAD_T + PH / 2})`}
              >
                {t("predAxis")}
              </VizText>
            </>
          )}
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout label={t("preyLabel")} value={Math.round(here.n)} tone={PREY_TONE} />
          <VizReadout label={t("predLabel")} value={Math.round(here.p)} tone={PRED_TONE} />
          <SegmentedToggle<Model>
            ariaLabel={t("modelLabel")}
            value={model}
            onChange={(m) => {
              setModel(m);
              setKick(0);
            }}
            options={[
              { value: "naive", label: t("naiveTab"), tone: "var(--cyan)" },
              { value: "real", label: t("realTab"), tone: PREY_TONE },
              { value: "enriched", label: t("enrichedTab"), tone: "var(--amber)" },
            ]}
            className="mt-1"
          />
          <button
            type="button"
            onClick={() => {
              setKick((k) => (k + 1) % 4);
              setPhase(0);
            }}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-void/40 px-3 py-2 font-sans text-xs font-600 text-foreground transition-all hover:border-cyan/60 hover:bg-void/70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <Zap size={13} /> {t("nudge")}
          </button>
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
            <Legend tone={PREY_TONE} label={t("prey")} />
            <Legend tone={PRED_TONE} label={t("pred")} />
          </div>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={phase}
        onChange={(e) => {
          setPlaying(false);
          setPhase(Number(e.target.value));
        }}
        aria-label={t("scrubLabel")}
        className="viz-range mt-4 w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        style={{
          background: `linear-gradient(to right, var(--teal) ${phase * 100}%, var(--border) ${phase * 100}%)`,
          ["--viz-thumb" as string]: "var(--teal)",
        }}
      />
    </VizFigure>
  );
}

function Legend({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-sans text-xs">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: tone }} />
      <span className="text-muted">{label}</span>
    </span>
  );
}
