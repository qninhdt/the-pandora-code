"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface ChiralityHandednessProps {
  caption?: string;
  className?: string;
}

type Hand = "left" | "right";

// The glove lesson made tactile. An amino acid is drawn as a central carbon with
// four distinct groups; a hand toggle reflects it into its mirror form. A fixed
// left-handed enzyme pocket grips only the matching hand — flip the substrate to
// the mirror form and the four groups no longer line up with their sockets, so the
// bind visibly fails (the mirror-meal-starves-you point). The splice readout maps
// the same fact onto the avatar: same hand → strands interlock; opposite hand → a
// smear. All chemistry is geometry in code; every visible string is translated.

const W = 340;
const H = 210;
const POCKET = { cx: 92, cy: 105, r: 58 };
const SUB = { cx: 240, cy: 105 };

// The four groups around the central carbon, at the canonical L arrangement.
// Each socket in the enzyme expects one specific group at one specific angle; a
// right-handed substrate swaps two of them, so two sockets are left unmatched.
const GROUPS = [
  { id: "R", angle: -90, tone: "var(--cyan)" },
  { id: "H", angle: 30, tone: "var(--teal)" },
  { id: "N", angle: 150, tone: "var(--amber)" },
  { id: "C", angle: 270 + 90, tone: "var(--magenta)" }, // carboxyl, placed opposite H
] as const;

function groupPos(cx: number, cy: number, angleDeg: number, r: number, mirror: boolean) {
  // mirror flips the x component about the central vertical axis
  const a = (angleDeg * Math.PI) / 180;
  const x = Math.cos(a) * r * (mirror ? -1 : 1);
  const y = Math.sin(a) * r;
  return { x: cx + x, y: cy + y };
}

export function ChiralityHandedness({ caption, className }: ChiralityHandednessProps) {
  const uid = useId();
  const t = useTranslations("viz.chirality");
  const [hand, setHand] = useState<Hand>("left");

  const mirror = hand === "right";
  const fits = hand === "left"; // the enzyme pocket is left-handed

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      hint={fits ? t("fitsNote") : t("failsNote")}
      tone={fits ? "teal" : "magenta"}
      controls={
        <SegmentedToggle<Hand>
          ariaLabel={t("handLabel")}
          value={hand}
          onChange={setHand}
          options={[
            { value: "left", label: t("leftHand"), tone: "var(--teal)" },
            { value: "right", label: t("rightHand"), tone: "var(--magenta)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={fits ? t("fitsNote") : t("failsNote")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />

          {/* ── the enzyme pocket: a fixed left-handed lock with shaped sockets ── */}
          <path
            d={`M ${POCKET.cx} ${POCKET.cy - POCKET.r}
                A ${POCKET.r} ${POCKET.r} 0 1 0 ${POCKET.cx} ${POCKET.cy + POCKET.r}
                L ${POCKET.cx + 18} ${POCKET.cy + POCKET.r}
                A ${POCKET.r - 18} ${POCKET.r - 18} 0 1 1 ${POCKET.cx + 18} ${POCKET.cy - POCKET.r} Z`}
            fill="color-mix(in oklab, var(--teal) 12%, var(--void))"
            stroke="color-mix(in oklab, var(--teal) 50%, transparent)"
            strokeWidth={1.5}
          />
          {/* sockets — where each group must land for a left-handed substrate */}
          {GROUPS.map((g) => {
            const p = groupPos(POCKET.cx + 2, POCKET.cy, g.angle, POCKET.r - 26, false);
            return (
              <circle
                key={`socket-${g.id}`}
                cx={p.x}
                cy={p.y}
                r={11}
                fill="none"
                stroke={g.tone}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                strokeOpacity={0.6}
              />
            );
          })}
          <VizText
            x={POCKET.cx}
            y={POCKET.cy + POCKET.r + 18}
            size="micro"
            tone="teal"
            anchor="middle"
          >
            {t("enzymeLabel")}
          </VizText>

          {/* ── the substrate molecule (slides toward the pocket if it fits) ── */}
          <g
            transform={`translate(${fits ? POCKET.cx + 2 - SUB.cx : 0} 0)`}
            style={{ transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }}
          >
            {/* bonds from central carbon to each group */}
            {GROUPS.map((g) => {
              const p = groupPos(SUB.cx, SUB.cy, g.angle, 42, mirror);
              return (
                <line
                  key={`bond-${g.id}`}
                  x1={SUB.cx}
                  y1={SUB.cy}
                  x2={p.x}
                  y2={p.y}
                  stroke="var(--border-strong)"
                  strokeWidth={2}
                />
              );
            })}
            {/* central carbon */}
            <circle
              cx={SUB.cx}
              cy={SUB.cy}
              r={9}
              fill="var(--stone)"
              stroke="var(--border-strong)"
              strokeWidth={1}
            />
            <VizText x={SUB.cx} y={SUB.cy + 4} size="micro" tone="muted" anchor="middle">
              C
            </VizText>
            {/* the four groups */}
            {GROUPS.map((g) => {
              const p = groupPos(SUB.cx, SUB.cy, g.angle, 42, mirror);
              return (
                <g key={`grp-${g.id}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={11}
                    fill={g.tone}
                    fillOpacity={0.9}
                    filter={glowUrl(uid, "bloom")}
                  />
                  <VizText
                    x={p.x}
                    y={p.y + 4}
                    size="micro"
                    tone="var(--void)"
                    anchor="middle"
                    weight={700}
                  >
                    {g.id}
                  </VizText>
                </g>
              );
            })}
          </g>

          {/* mismatch X marks — only when the mirror form fails to seat */}
          {!fits && (
            <g opacity={0.9}>
              <VizText
                x={POCKET.cx + 2}
                y={POCKET.cy - 2}
                size="base"
                tone="magenta"
                anchor="middle"
                weight={700}
              >
                ✕
              </VizText>
            </g>
          )}
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout
            label={t("bindLabel")}
            value={fits ? t("binds") : t("rejected")}
            tone={fits ? "var(--teal)" : "var(--magenta)"}
            tinted
          />
          <div
            className="mt-1 rounded-lg border px-3 py-3"
            style={{
              borderColor: `color-mix(in oklab, ${fits ? "var(--teal)" : "var(--magenta)"} 45%, transparent)`,
              background: `color-mix(in oklab, ${fits ? "var(--teal)" : "var(--magenta)"} 10%, var(--void))`,
            }}
          >
            <p className="font-sans text-xs uppercase tracking-wider text-subtle">
              {t("spliceLabel")}
            </p>
            <p className="mt-1 font-display text-sm font-700 text-foreground">
              {fits ? t("spliceClean") : t("spliceSmear")}
            </p>
            <p className="mt-2 font-sans text-xs text-muted">
              {fits ? t("spliceCleanWhy") : t("spliceSmearWhy")}
            </p>
          </div>
        </div>
      </div>
    </VizFigure>
  );
}
