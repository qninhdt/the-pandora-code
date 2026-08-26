"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type Mode = "job" | "tells";

interface ConvergenceToggleProps {
  caption?: string;
  className?: string;
}

const W = 200;
const H = 180;
const SPINE_Y = 96;

// A crouched ambush-predator silhouette: the same pounce for both animals (the
// converged role). `tells` draws the Pandoran tells (extra limb pair, second
// eye, flank breathing slits) when the animal is the thanator and Tells mode on.
function Predator({
  accent,
  tells,
  glow,
  tellGlow,
}: { accent: string; tells: boolean; glow?: string; tellGlow?: string }) {
  const headX = 150;
  const tellColor = "var(--amber)";
  return (
    <g>
      {/* spring-loaded back arched into the pounce — the role */}
      <path
        d={`M 40 ${SPINE_Y + 6} Q 100 ${SPINE_Y - 30} 158 ${SPINE_Y - 2}`}
        fill="none"
        stroke={accent}
        strokeWidth={9}
        strokeLinecap="round"
        filter={glow}
      />
      {/* haunch */}
      <circle
        cx={48}
        cy={SPINE_Y + 8}
        r={13}
        fill={`color-mix(in oklab, ${accent} 20%, transparent)`}
        stroke={accent}
        strokeWidth={2}
      />
      {/* head + forward hunting eye(s) — role feature */}
      <circle
        cx={headX}
        cy={SPINE_Y - 6}
        r={13}
        fill="var(--surface-overlay)"
        stroke={accent}
        strokeWidth={2}
      />
      <circle cx={headX + 6} cy={SPINE_Y - 6} r={2.3} fill={accent} />
      {/* grasping forelimb — role feature */}
      <line
        x1={140}
        y1={SPINE_Y}
        x2={150}
        y2={SPINE_Y + 44}
        stroke={accent}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* base hindlimb */}
      <line
        x1={54}
        y1={SPINE_Y + 10}
        x2={48}
        y2={SPINE_Y + 46}
        stroke={accent}
        strokeWidth={5}
        strokeLinecap="round"
      />

      {tells ? (
        <g filter={tellGlow}>
          {/* extra middle limb pair — six limbs */}
          <line
            x1={96}
            y1={SPINE_Y - 4}
            x2={90}
            y2={SPINE_Y + 44}
            stroke={tellColor}
            strokeWidth={5}
            strokeLinecap="round"
          />
          {/* second eye pair */}
          <circle cx={headX + 6} cy={SPINE_Y - 12} r={2.3} fill={tellColor} />
          {/* flank breathing slits */}
          {[78, 96, 114].map((x) => (
            <line
              key={x}
              x1={x}
              y1={SPINE_Y - 16}
              x2={x}
              y2={SPINE_Y - 8}
              stroke={tellColor}
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
        </g>
      ) : null}
    </g>
  );
}

export function ConvergenceToggle({ caption, className }: ConvergenceToggleProps) {
  const uid = useId();
  const t = useTranslations("viz.convergence");
  const [mode, setMode] = useState<Mode>("job");
  const tells = mode === "tells";

  return (
    <VizFigure
      title={t("title")}
      caption={caption}
      className={className}
      tone={tells ? "amber" : "cyan"}
      controls={
        <SegmentedToggle
          ariaLabel={t("title")}
          value={mode}
          onChange={setMode}
          options={[
            { value: "job", label: t("job") },
            { value: "tells", label: t("tells"), tone: "var(--amber)" },
          ]}
        />
      }
      hint={
        <div
          className="rounded-lg border px-3 py-2"
          style={{
            borderColor: tells
              ? "color-mix(in oklab, var(--amber) 40%, transparent)"
              : "color-mix(in oklab, var(--cyan) 40%, transparent)",
            background: tells
              ? "color-mix(in oklab, var(--amber) 9%, transparent)"
              : "color-mix(in oklab, var(--cyan) 9%, transparent)",
          }}
        >
          <p className="font-sans text-xs uppercase tracking-wider text-subtle">
            {tells ? t("inherited") : t("shared")}
          </p>
          <p className="mt-0.5 font-sans text-xs text-muted">
            {tells ? t("tellsHint") : t("jobHint")}
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("panther")}>
            <GlowDefs idBase={`${uid}-a`} tones={["amber"]} />
            <Predator accent="var(--muted)" tells={false} />
          </svg>
          <p className="font-sans text-xs text-subtle">{t("panther")}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("thanator")}>
            <GlowDefs idBase={`${uid}-b`} tones={["cyan", "amber"]} />
            <Predator
              accent="var(--cyan)"
              tells={tells}
              glow={glowUrl(`${uid}-b`, "bloom")}
              tellGlow={glowUrl(`${uid}-b`, "bloom")}
            />
          </svg>
          <p className="font-sans text-xs text-subtle">{t("thanator")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
