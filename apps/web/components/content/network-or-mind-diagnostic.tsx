"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  GATES,
  type Grade,
  SPECIMEN_GRADES,
  type SpecimenId,
  reachedGate,
  verdictFor,
} from "./network-or-mind-model";
import { CheckCards, SpecimenPicker } from "./network-or-mind-panels";

// The chapter's argument is that you cannot settle "network or mind?" by watching
// the behaviour, because a brainless network counterfeits purpose perfectly. So
// this figure hands the reader the actual instrument instead of the conclusion:
// four checks in series — competence, recurrent integration (IIT), a global
// workspace that ignites (GWT), and evidence of experience — and five specimens
// to run through them. A signal enters at the left and stalls at the first check
// the specimen fails. The slime mould and the bee swarm stall early. The
// cerebellum, four-fifths of a brain, stalls immediately, which is what proves
// the instrument is not just counting parts. The cortex runs the whole chain.
// Then Eywa: through competence, stalled at integration, and honest about the
// last check being unanswerable from outside. Grades live in
// network-or-mind-model.ts; the HTML panels in network-or-mind-panels.tsx.

const W = 360;
const H = 150;
const TRACK_Y = 58;
const X0 = 22;
const X1 = 338;
const GATE_XS = GATES.map((_, i) => X0 + 40 + i * ((X1 - X0 - 56) / (GATES.length - 1)));

const GRADE_TONE: Record<Grade, string> = {
  yes: "var(--teal)",
  partial: "var(--amber)",
  no: "var(--magenta)",
  unknown: "var(--subtle)",
};

const VERDICT_TONE = {
  network: "var(--amber)",
  candidate: "var(--cyan)",
  mind: "var(--teal)",
} as const;

export function NetworkOrMindDiagnostic({
  caption,
  className,
}: { caption?: string; className?: string }) {
  const uid = useId();
  const t = useTranslations("viz.networkOrMind");
  const [picked, setPicked] = useState<SpecimenId>("eywa");

  const grades = SPECIMEN_GRADES[picked];
  const reached = reachedGate(picked);
  const verdict = verdictFor(picked);
  const stalled = reached < GATES.length;

  // Travelling signal: it only ever runs as far as the last check that passed,
  // so a stalled specimen visibly piles up against the gate that stopped it.
  const { phase } = usePhaseLoop({ period: 2.8, playing: true, initial: 0 });
  const stopX = stalled ? GATE_XS[reached] - 9 : X1;
  const signalX = X0 + (stopX - X0) * phase;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={verdict === "mind" ? "teal" : verdict === "candidate" ? "cyan" : "amber"}
      hint={t(`hint.${picked}`)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
        <GlowDefs idBase={uid} tones={["teal", "amber", "magenta", "cyan"]} />

        {/* the bench: signal enters left, exits right only if every check passes */}
        <line
          x1={X0}
          y1={TRACK_Y}
          x2={X1}
          y2={TRACK_Y}
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={X0}
          y1={TRACK_Y}
          x2={stopX}
          y2={TRACK_Y}
          stroke={stalled ? GRADE_TONE[grades[GATES[reached]]] : "var(--teal)"}
          strokeWidth={2.4}
          strokeLinecap="round"
          filter={glowUrl(uid, "bloom")}
          style={{ transition: "all 0.35s ease" }}
        />
        <circle
          cx={signalX}
          cy={TRACK_Y}
          r={3.6}
          fill={stalled ? GRADE_TONE[grades[GATES[reached]]] : "var(--teal)"}
          filter={glowUrl(uid, "bloom")}
        />
        <VizText x={X0} y={TRACK_Y - 16} size="micro" tone="subtle">
          {t("enters")}
        </VizText>
        <VizText
          x={X1}
          y={TRACK_Y - 16}
          anchor="end"
          size="micro"
          tone={stalled ? "subtle" : "teal"}
        >
          {stalled ? t("blocked") : t("clears")}
        </VizText>

        {GATES.map((gate, i) => {
          const grade = grades[gate];
          const tone = GRADE_TONE[grade];
          const passed = i < reached;
          const x = GATE_XS[i];
          return (
            <g key={gate}>
              {/* each check is a doorway: open when cleared, barred when not */}
              <rect
                x={x - 7}
                y={TRACK_Y - 22}
                width={14}
                height={44}
                rx={5}
                fill={passed ? "color-mix(in oklab, var(--teal) 16%, var(--void))" : "var(--void)"}
                stroke={tone}
                strokeWidth={1.6}
                filter={passed ? glowUrl(uid, "bloom") : undefined}
                style={{ transition: "all 0.3s ease" }}
              />
              {!passed && (
                <line
                  x1={x - 7}
                  y1={TRACK_Y - 22}
                  x2={x + 7}
                  y2={TRACK_Y + 22}
                  stroke={tone}
                  strokeWidth={1.6}
                />
              )}
              <VizText
                x={x}
                y={TRACK_Y + 38}
                anchor="middle"
                size="micro"
                tone={passed ? "teal" : tone}
                weight={600}
              >
                {t(`short.${gate}`)}
              </VizText>
              <VizText x={x} y={TRACK_Y + 48} anchor="middle" size="micro" tone="subtle">
                {t(`grade.${grade}`)}
              </VizText>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <VizReadout
          label={t("reachedLabel")}
          value={`${reached} / ${GATES.length}`}
          note={t("reachedNote")}
          tone={stalled ? "var(--amber)" : "var(--teal)"}
        />
        <VizReadout
          label={t("verdictLabel")}
          value={t(`verdict.${verdict}`)}
          tone={VERDICT_TONE[verdict]}
          tinted
        />
      </div>

      <SpecimenPicker picked={picked} onPick={setPicked} />
      <CheckCards picked={picked} />
    </VizFigure>
  );
}
