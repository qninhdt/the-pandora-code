"use client";

import {
  GAITS,
  type GaitKey,
  LIMBS,
  MID_PHASE_MAX,
  contactsAt,
  limbPhases,
  supportProfile,
} from "@/components/content/hexapod-gait-sequencer-model";
import { ContactPlanView, FootfallChart } from "@/components/content/hexapod-gait-sequencer-panels";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface HexapodGaitSequencerProps {
  caption?: string;
  className?: string;
}

// The pa'li's six legs only make sense as a timing problem. This figure runs the
// stride and shows both halves of it at once: the footfall chart (when each foot
// is down) and the animal from above (which feet are down right now). The control
// that matters is where the short middle pair lands — slide it into the gap the
// stride pairs leave and the brace is planted whenever a turn arrives; slide it
// into unison with them and the animal spends part of every stride with nothing
// to push sideways against. Timing maths lives in the model file; the two SVG
// panels live beside this file.

const DEFAULT_MID_PHASE = 0.3;

export function HexapodGaitSequencer({ caption, className }: HexapodGaitSequencerProps) {
  const uid = useId();
  const t = useTranslations("viz.hexapodGaitSequencer");
  const reduced = useReducedMotionSafe();

  const [gaitKey, setGaitKey] = useState<GaitKey>("gallop");
  const [midPhase, setMidPhase] = useState(DEFAULT_MID_PHASE);
  const [playing, setPlaying] = useState(false);

  const gait = GAITS[gaitKey];
  const { phase, setPhase } = usePhaseLoop({ period: 2.6, playing: playing && !reduced });

  const phases = useMemo(() => limbPhases(gait, midPhase), [gait, midPhase]);
  const profile = useMemo(() => supportProfile(gait, midPhase), [gait, midPhase]);
  const contacts = useMemo(() => contactsAt(gait, midPhase, phase), [gait, midPhase, phase]);
  const feetDown = LIMBS.filter((l) => contacts[l]).length;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone={profile.verdict === "unbraced" ? "magenta" : "cyan"}
      className={className}
      hint={t(`verdict.${profile.verdict}`)}
      controls={
        <div className="flex items-center gap-2">
          <SegmentedToggle<GaitKey>
            ariaLabel={t("gaitLabel")}
            value={gaitKey}
            onChange={setGaitKey}
            options={[
              { value: "walk", label: t("gait.walk"), tone: "var(--cyan)" },
              { value: "trot", label: t("gait.trot"), tone: "var(--teal)" },
              { value: "gallop", label: t("gait.gallop"), tone: "var(--amber)" },
            ]}
          />
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t("pause") : t("play")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-teal transition-all hover:border-teal/60 hover:bg-void/70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <FootfallChart
          gait={gait}
          phases={phases}
          contacts={contacts}
          playhead={phase}
          idBase={uid}
          limbLabel={(limb) => t(`limbs.${limb}`)}
          labels={{
            aria: t("ariaChart"),
            strideStart: t("strideStart"),
            strideEnd: t("strideEnd"),
            legend: t("stanceLegend"),
          }}
        />
        <ContactPlanView
          contacts={contacts}
          aria={t("ariaBody", { feet: feetDown })}
          idBase={`${uid}-body`}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <VizSlider
          className="flex-1"
          label={t("midPhaseLabel")}
          display={t("midPhaseValue", { pct: Math.round(midPhase * 100) })}
          min={0}
          max={MID_PHASE_MAX}
          step={0.02}
          value={midPhase}
          onChange={setMidPhase}
          tone="var(--amber)"
        />
        <VizSlider
          className="flex-1"
          label={t("scrubLabel")}
          display={t("scrubValue", { pct: Math.round(phase * 100) })}
          min={0}
          max={0.99}
          step={0.01}
          value={phase}
          onChange={(v) => {
            setPlaying(false);
            setPhase(v);
          }}
          tone="var(--cyan)"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <VizReadout label={t("readout.feetNow")} value={`${feetDown} / 6`} tone="var(--cyan)" />
        <VizReadout
          label={t("readout.brace")}
          value={`${Math.round(profile.braceScore * 100)}%`}
          tone="var(--amber)"
          note={t("readout.braceNote")}
        />
        <VizReadout
          label={t("readout.suspension")}
          value={
            profile.suspensionShare > 0
              ? `${Math.round(profile.suspensionShare * 100)}%`
              : t("readout.suspensionNone")
          }
          tone={profile.suspensionShare > 0 ? "var(--teal)" : "var(--subtle)"}
          note={t("readout.suspensionNote")}
          tinted
        />
      </div>
    </VizFigure>
  );
}
