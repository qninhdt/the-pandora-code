"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Stability and agility are the same dial turned opposite ways. A flyer whose
// centre of mass sits ahead of its neutral point - the point where an added gust
// of lift acts - is self-righting: knock the nose up and the geometry pushes it
// back down. That is comfortable, and it is exactly what fights every deliberate
// input the animal makes. Slide the mass rearward and the restoring moment fades,
// then reverses: the airframe now pitches faster than any stable one could, and
// pays for it by needing continuous correction to keep pointing anywhere.
//
//   static margin SM = (x_np - x_cg) / chord
//   pitch response ~ 1 / (SM + small)     (slow when stable, explosive near zero)
//
// Fighters made this trade deliberately (relaxed static stability); the claim the
// chapter is testing is that a clutter-hunting predator makes the same one.
// The maths stays in code; strings translate.

const W = 380;
const H = 220;

const BODY_Y = 92;
const NOSE_X = 52;
const CHORD_PX = 210; // one mean chord, drawn end to end
const NEUTRAL_FRAC = 0.42; // neutral point sits at 42% of chord

interface Zone {
  tone: string;
  fig: "cyan" | "teal" | "amber" | "magenta";
}
const ZONES: Record<"stable" | "neutral" | "relaxed", Zone> = {
  stable: { tone: "var(--cyan)", fig: "cyan" },
  neutral: { tone: "var(--teal)", fig: "teal" },
  relaxed: { tone: "var(--magenta)", fig: "magenta" },
};

function zoneOf(sm: number): "stable" | "neutral" | "relaxed" {
  if (sm > 0.08) return "stable";
  if (sm > -0.02) return "neutral";
  return "relaxed";
}

// Time to swing the nose one degree, arbitrary units - the point is the shape,
// not the absolute value: it blows up as the margin grows and collapses near zero.
function pitchResponse(sm: number): number {
  return 0.35 + Math.max(0, sm) * 9;
}

// Trim drag rises with margin too: a stable airframe holds its tail loaded just
// to stay level.
function trimPenalty(sm: number): number {
  return Math.max(0, sm) * 100 * 0.9;
}

interface StaticMarginTradeProps {
  caption?: string;
  className?: string;
}

export function StaticMarginTrade({ caption, className }: StaticMarginTradeProps) {
  const t = useTranslations("viz.static-margin");
  const uid = useId();
  // Centre of gravity as a fraction of chord from the nose.
  const [cgFrac, setCgFrac] = useState(0.28);

  const sm = NEUTRAL_FRAC - cgFrac;
  const zone = zoneOf(sm);
  const { tone, fig } = ZONES[zone];

  const cgX = NOSE_X + cgFrac * CHORD_PX;
  const npX = NOSE_X + NEUTRAL_FRAC * CHORD_PX;

  const response = pitchResponse(sm);
  const trim = trimPenalty(sm);

  // The body tilts to show which way a disturbance sends it.
  const tilt = zone === "relaxed" ? 9 : zone === "neutral" ? 2 : -5;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${zone}`)}
      caption={caption}
      tone={fig}
      className={className}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full md:w-3/5"
          role="img"
          aria-label={t(`aria.${zone}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta"]} />

          <g transform={`rotate(${tilt} ${(NOSE_X + CHORD_PX / 2).toFixed(1)} ${BODY_Y})`}>
            {/* the airframe, nose at left */}
            <path
              d={`M ${NOSE_X} ${BODY_Y} L ${NOSE_X + CHORD_PX * 0.18} ${BODY_Y - 11} L ${
                NOSE_X + CHORD_PX * 0.86
              } ${BODY_Y - 9} L ${NOSE_X + CHORD_PX} ${BODY_Y - 2} L ${NOSE_X + CHORD_PX} ${BODY_Y + 5} L ${NOSE_X + CHORD_PX * 0.2} ${BODY_Y + 9} Z`}
              fill="var(--surface-raised)"
              stroke="var(--border-strong)"
              strokeWidth={1}
            />

            {/* neutral point - where an added gust of lift acts */}
            <line
              x1={npX}
              y1={BODY_Y - 40}
              x2={npX}
              y2={BODY_Y + 22}
              stroke="var(--foreground)"
              strokeOpacity={0.3}
              strokeDasharray="3 4"
              strokeWidth={1}
            />
            <circle
              cx={npX}
              cy={BODY_Y}
              r={4}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={1.5}
            />
            <VizText x={npX} y={BODY_Y - 46} size="micro" tone="subtle" anchor="middle">
              {t("neutralPoint")}
            </VizText>

            {/* centre of gravity */}
            <circle cx={cgX} cy={BODY_Y} r={6} fill={tone} filter={glowUrl(uid, "bloom")} />
            <VizText x={cgX} y={BODY_Y + 34} size="micro" tone={tone} anchor="middle">
              {t("centreOfMass")}
            </VizText>

            {/* the restoring (or diverging) moment arrow */}
            {Math.abs(sm) > 0.015 && (
              <path
                d={
                  sm > 0
                    ? `M ${npX + 26} ${BODY_Y - 26} Q ${npX + 44} ${BODY_Y - 12}, ${npX + 26} ${BODY_Y + 2}`
                    : `M ${npX + 26} ${BODY_Y + 2} Q ${npX + 44} ${BODY_Y - 12}, ${npX + 26} ${BODY_Y - 26}`
                }
                fill="none"
                stroke={tone}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )}
          </g>

          <VizText x={W / 2} y={BODY_Y + 62} size="micro" tone={tone} anchor="middle">
            {t(`disturbance.${zone}`)}
          </VizText>

          {/* the margin scale: stable band, neutral notch, relaxed band */}
          {(() => {
            const trackY = H - 32;
            const x0 = 30;
            const x1 = W - 30;
            const smMin = -0.16;
            const smMax = 0.24;
            const at = (v: number) => x0 + ((v - smMin) / (smMax - smMin)) * (x1 - x0);
            return (
              <g>
                <rect
                  x={at(0.08)}
                  y={trackY - 5}
                  width={at(smMax) - at(0.08)}
                  height={10}
                  rx={3}
                  fill="var(--cyan)"
                  fillOpacity={0.18}
                />
                <rect
                  x={at(-0.02)}
                  y={trackY - 5}
                  width={at(0.08) - at(-0.02)}
                  height={10}
                  rx={3}
                  fill="var(--teal)"
                  fillOpacity={0.2}
                />
                <rect
                  x={at(smMin)}
                  y={trackY - 5}
                  width={at(-0.02) - at(smMin)}
                  height={10}
                  rx={3}
                  fill="var(--magenta)"
                  fillOpacity={0.18}
                />
                <line
                  x1={at(0)}
                  y1={trackY - 10}
                  x2={at(0)}
                  y2={trackY + 10}
                  stroke="var(--foreground)"
                  strokeOpacity={0.4}
                  strokeWidth={1}
                />
                <circle cx={at(sm)} cy={trackY} r={5} fill={tone} filter={glowUrl(uid, "bloom")} />
                <VizText x={x0} y={trackY + 22} size="micro" tone="subtle">
                  {t("scale.relaxed")}
                </VizText>
                <VizText x={x1} y={trackY + 22} size="micro" tone="subtle" anchor="end">
                  {t("scale.stable")}
                </VizText>
              </g>
            );
          })()}
        </svg>

        <div className="flex w-full flex-col gap-2 md:w-2/5">
          <VizSlider
            label={t("cgLabel")}
            display={`${Math.round(cgFrac * 100)}%`}
            min={0.14}
            max={0.6}
            step={0.01}
            value={cgFrac}
            onChange={setCgFrac}
            tone={tone}
          />
          <VizReadout
            label={t("readout.margin")}
            value={sm.toFixed(3)}
            note={t(`marginNote.${zone}`)}
            tone={tone}
          />
          <VizReadout label={t("readout.trim")} value={`${Math.round(trim)}%`} tone={tone} />
          <VizReadout
            label={t("readout.response")}
            value={t("relativeTime", { n: response.toFixed(2) })}
            note={t(`verdict.${zone}`)}
            tone={tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
