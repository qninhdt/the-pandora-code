"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText } from "@/components/content/viz/viz-svg-text";

// The terrain cross-section drawn for RainShadowTransect: ocean on the left, a
// windward flank with its cloud deck and rain, a crest whose height the reader
// sets, and the lee plain where the spent air comes back down. Split out of the
// component so both files stay small. The picture is the argument — cloud sitting
// on the windward slope, nothing at all on the far side — and the readouts merely
// put numbers to what the reader can already see.

export const SCENE_W = 440;
export const SCENE_H = 210;
const SEA_X = 62; // shoreline
const CREST_X = 232;
const GROUND_Y = 168; // plain level
const SKY_TOP = 26;
/** Vertical pixels per kilometre of relief. */
const KM_PX = 26;

export interface SceneLabels {
  sea: string;
  windward: string;
  lee: string;
  crest: string;
  cloudBase: string;
  wind: string;
  descent: string;
  rainUnit: string;
}

interface SceneProps {
  uid: string;
  /** Crest height above the plains, km. */
  ridgeKm: number;
  /** Height where cloud forms, km — clamped to the crest when it sits higher. */
  cloudBaseKm: number;
  /** Annual rainfall on the windward flank, cm. */
  windwardCm: number;
  /** Annual rainfall on the lee plain, cm. */
  leeCm: number;
  /** Air temperature on the lee plain, °C. */
  leeC: number;
  /** Token hue reflecting how dry the lee has become. */
  tone: string;
  labels: SceneLabels;
}

/** Rain streak count scales with the rainfall it stands for. */
function streaks(cm: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(cm / 40)));
}

export function RainShadowScene({
  uid,
  ridgeKm,
  cloudBaseKm,
  windwardCm,
  leeCm,
  leeC,
  tone,
  labels,
}: SceneProps) {
  const crestY = GROUND_Y - ridgeKm * KM_PX;
  const cloudY = GROUND_Y - Math.min(cloudBaseKm, ridgeKm) * KM_PX;
  const cloudForms = cloudBaseKm < ridgeKm;
  const toneVar = `var(--${tone})`;

  // A single ridge: gentle windward ramp, steeper lee face, then flat plain.
  const terrain = `M 0 ${GROUND_Y} L ${SEA_X} ${GROUND_Y} Q ${(SEA_X + CREST_X) / 2} ${
    GROUND_Y - (GROUND_Y - crestY) * 0.45
  } ${CREST_X} ${crestY} Q ${CREST_X + 34} ${crestY + (GROUND_Y - crestY) * 0.7} ${
    CREST_X + 62
  } ${GROUND_Y} L ${SCENE_W} ${GROUND_Y} L ${SCENE_W} ${SCENE_H} L 0 ${SCENE_H} Z`;

  return (
    <>
      <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

      {/* sea */}
      <rect
        x={0}
        y={GROUND_Y}
        width={SEA_X}
        height={SCENE_H - GROUND_Y}
        fill="color-mix(in oklab, var(--cyan) 26%, var(--void))"
      />
      <VizText x={SEA_X / 2} y={GROUND_Y + 22} size="micro" tone="cyan" anchor="middle">
        {labels.sea}
      </VizText>

      {/* onshore wind arrow */}
      <g stroke="var(--cyan)" strokeWidth={1.4} strokeLinecap="round" opacity={0.85}>
        <line x1={6} y1={SKY_TOP + 16} x2={SEA_X + 22} y2={SKY_TOP + 16} />
        <path
          d={`M ${SEA_X + 14} ${SKY_TOP + 12} L ${SEA_X + 22} ${SKY_TOP + 16} L ${
            SEA_X + 14
          } ${SKY_TOP + 20}`}
          fill="none"
        />
      </g>
      <VizText x={6} y={SKY_TOP + 8} size="micro" tone="cyan">
        {labels.wind}
      </VizText>

      {/* windward cloud deck, sitting on the slope from cloud base to crest */}
      {cloudForms ? (
        <>
          <path
            d={`M ${SEA_X + 6} ${cloudY} Q ${(SEA_X + CREST_X) / 2} ${
              cloudY - 26
            } ${CREST_X} ${crestY - 8} L ${CREST_X} ${crestY} Q ${(SEA_X + CREST_X) / 2} ${
              cloudY + 6
            } ${SEA_X + 6} ${cloudY + 10} Z`}
            fill="color-mix(in oklab, var(--cyan) 34%, var(--void))"
            filter={glowUrl(uid, "bloom")}
          />
          <line
            x1={SEA_X}
            y1={cloudY}
            x2={CREST_X}
            y2={cloudY}
            stroke="var(--cyan)"
            strokeWidth={0.7}
            strokeDasharray="3 3"
            opacity={0.6}
          />
          <VizText x={SEA_X + 2} y={cloudY - 6} size="micro" tone="cyan">
            {labels.cloudBase}
          </VizText>
        </>
      ) : null}

      {/* windward rain */}
      {Array.from({ length: streaks(windwardCm, 9) }, (_, i) => {
        const x = SEA_X + 14 + i * 17;
        const top = cloudForms ? cloudY + 10 : SKY_TOP + 30;
        return (
          <line
            key={`w-${i}`}
            x1={x}
            y1={top}
            x2={x - 4}
            y2={top + 26}
            stroke="var(--cyan)"
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0.8}
          />
        );
      })}

      {/* lee rain — usually nothing at all, which is the point */}
      {Array.from({ length: streaks(leeCm, 5) }, (_, i) => (
        <line
          key={`l-${i}`}
          x1={CREST_X + 84 + i * 24}
          y1={SKY_TOP + 44}
          x2={CREST_X + 80 + i * 24}
          y2={SKY_TOP + 68}
          stroke={toneVar}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.7}
        />
      ))}

      {/* descending, warming air on the lee face */}
      <g stroke={toneVar} strokeWidth={1.3} strokeLinecap="round" opacity={0.9}>
        <path
          d={`M ${CREST_X + 8} ${crestY + 6} Q ${CREST_X + 52} ${
            crestY + (GROUND_Y - crestY) * 0.55
          } ${CREST_X + 96} ${GROUND_Y - 14}`}
          fill="none"
        />
        <path
          d={`M ${CREST_X + 86} ${GROUND_Y - 20} L ${CREST_X + 97} ${GROUND_Y - 13} L ${
            CREST_X + 85
          } ${GROUND_Y - 8}`}
          fill="none"
        />
      </g>
      <VizText x={CREST_X + 102} y={GROUND_Y - 16} size="micro" tone={tone}>
        {labels.descent}
      </VizText>

      {/* terrain body */}
      <path
        d={terrain}
        fill="color-mix(in oklab, var(--surface-raised) 88%, var(--void))"
        stroke="var(--border-strong)"
        strokeWidth={1}
      />

      {/* vegetation cue: a wet windward flank and a lee flank tinted by verdict */}
      <path
        d={`M ${SEA_X} ${GROUND_Y - 3} Q ${(SEA_X + CREST_X) / 2} ${
          GROUND_Y - (GROUND_Y - crestY) * 0.45 - 3
        } ${CREST_X} ${crestY - 3}`}
        fill="none"
        stroke="var(--teal)"
        strokeWidth={3.5}
        strokeLinecap="round"
        opacity={0.85}
      />
      <line
        x1={CREST_X + 62}
        y1={GROUND_Y - 3}
        x2={SCENE_W - 4}
        y2={GROUND_Y - 3}
        stroke={toneVar}
        strokeWidth={3.5}
        strokeLinecap="round"
        opacity={0.85}
      />

      <VizText x={(SEA_X + CREST_X) / 2} y={GROUND_Y + 22} size="micro" tone="teal" anchor="middle">
        {`${labels.windward} · ${Math.round(windwardCm)} ${labels.rainUnit}`}
      </VizText>
      <VizText x={SCENE_W - 88} y={GROUND_Y + 22} size="micro" tone={tone} anchor="middle">
        {`${labels.lee} · ${Math.round(leeCm)} ${labels.rainUnit}`}
      </VizText>
      <VizText
        x={SCENE_W - 88}
        y={GROUND_Y + 34}
        size="micro"
        tone="subtle"
        anchor="middle"
        numeric
      >
        {`${leeC.toFixed(0)} °C`}
      </VizText>
      <VizText x={CREST_X} y={crestY - 14} size="micro" tone="muted" anchor="middle" numeric>
        {`${labels.crest} ${ridgeKm.toFixed(1)} km`}
      </VizText>
    </>
  );
}
