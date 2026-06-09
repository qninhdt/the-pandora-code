"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

type Zone = "pectoralA" | "pectoralB" | "pelvic";
type Localized = { vi: string; en: string };

// Scientific data stays in code: zone names + the creature each configuration
// maps onto. The Na'vi case (Pectoral-B off, the other two on) is the chapter's
// punchline — limb loss, not limb fusion.
const ZONE_NAMES: Record<Zone, Localized> = {
  pectoralA: { vi: "Vùng ngực-A", en: "Pectoral-A field" },
  pectoralB: { vi: "Vùng ngực-B", en: "Pectoral-B field" },
  pelvic: { vi: "Vùng chậu", en: "Pelvic field" },
};

const CREATURES = {
  thanator: { vi: "Thanator — sáu chân chạy", en: "Thanator — six running legs" },
  banshee: {
    vi: "Ikran — đôi cánh, chi sau tiêu giảm",
    en: "Mountain banshee — wings, reduced hindlimbs",
  },
  navi: { vi: "Na'vi — vùng ngực-B bị im lặng", en: "Na'vi — Pectoral-B silenced" },
  novel: { vi: "một sơ đồ cơ thể chưa từng thấy", en: "a body plan never seen" },
  legless: { vi: "một dạng thân không chi", en: "a limbless body form" },
} as const;

interface ZoneState {
  pectoralA: boolean;
  pectoralB: boolean;
  pelvic: boolean;
}

const DEFAULT_STATE: ZoneState = { pectoralA: true, pectoralB: true, pelvic: true };

// Map a zone configuration to the nearest canonical Pandoran creature.
function creatureFor(s: ZoneState, locale: "vi" | "en") {
  const { pectoralA, pectoralB, pelvic } = s;
  let key: keyof typeof CREATURES = "novel";
  if (pectoralA && pectoralB && pelvic) key = "thanator";
  else if (pectoralA && pectoralB && !pelvic) key = "banshee";
  else if (pectoralA && !pectoralB && pelvic) key = "navi";
  else if (!pectoralA && !pectoralB && !pelvic) key = "legless";
  return CREATURES[key][locale];
}

const W = 360;
const H = 200;
const SPINE_Y = 96;
// Where each limb pair attaches along the spine (x), and the body span.
const ZONE_X: Record<Zone, number> = { pectoralA: 132, pectoralB: 186, pelvic: 250 };
const BODY_X0 = 110;
const BODY_X1 = 270;

// A single limb pair (up + down stroke from the spine). Drawn solid and blooming
// when the field is active, faint and stubby when silenced — the vestigial state.
function LimbPair({
  x,
  active,
  reduced,
  glow,
}: {
  x: number;
  active: boolean;
  reduced: boolean;
  glow: string;
}) {
  const len = active ? 56 : 14;
  const color = active ? "var(--cyan)" : "var(--subtle)";
  const op = active ? 0.95 : 0.4;
  const tr = reduced ? undefined : "all 0.35s ease";
  return (
    <g style={{ transition: tr }} filter={active ? glow : undefined}>
      <line
        x1={x}
        y1={SPINE_Y}
        x2={x - 10}
        y2={SPINE_Y + len}
        stroke={color}
        strokeWidth={active ? 5 : 4}
        strokeLinecap="round"
        strokeOpacity={op}
        style={{ transition: tr }}
      />
      <line
        x1={x}
        y1={SPINE_Y}
        x2={x - 10}
        y2={SPINE_Y - len}
        stroke={color}
        strokeWidth={active ? 5 : 4}
        strokeLinecap="round"
        strokeOpacity={op}
        style={{ transition: tr }}
      />
    </g>
  );
}

interface LimbFieldToggleProps {
  caption?: string;
  className?: string;
}

export function LimbFieldToggle({ caption, className }: LimbFieldToggleProps) {
  const uid = useId();
  const reduced = useReducedMotionSafe();
  const t = useTranslations("viz.limbField");
  const locale = useLocale() as "vi" | "en";
  const [state, setState] = useState<ZoneState>(DEFAULT_STATE);

  const zones: Zone[] = ["pectoralA", "pectoralB", "pelvic"];
  const limbPairs = zones.filter((z) => state[z]).length;
  const resultName = creatureFor(state, locale);

  return (
    <VizFigure title={t("title")} caption={caption} className={className} hint={t("hint")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-1/2"
          role="img"
          aria-label={`${t("resultLabel")} ${resultName}`}
        >
          <GlowDefs idBase={uid} tones={["cyan"]} />
          {/* spine + body */}
          <line
            x1={BODY_X0}
            y1={SPINE_Y}
            x2={BODY_X1}
            y2={SPINE_Y}
            stroke="var(--border-strong)"
            strokeWidth={10}
            strokeLinecap="round"
          />
          {/* head */}
          <circle
            cx={BODY_X1 + 18}
            cy={SPINE_Y}
            r={16}
            fill="var(--surface-overlay)"
            stroke="var(--border-strong)"
            strokeWidth={2}
          />
          {/* eyes — paired, a nod to the four-eyed lattice */}
          <circle cx={BODY_X1 + 24} cy={SPINE_Y - 5} r={2.4} fill="var(--cyan)" />
          <circle cx={BODY_X1 + 24} cy={SPINE_Y + 5} r={2.4} fill="var(--cyan)" />

          {zones.map((z) => (
            <LimbPair
              key={z}
              x={ZONE_X[z]}
              active={state[z]}
              reduced={reduced}
              glow={glowUrl(uid, "bloom")}
            />
          ))}
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/2">
          {zones.map((z) => (
            <div key={z} className="flex items-center justify-between gap-2">
              <span
                className="font-sans text-sm"
                style={{ color: state[z] ? "var(--cyan)" : "var(--subtle)" }}
              >
                {ZONE_NAMES[z][locale]}
              </span>
              <SegmentedToggle
                ariaLabel={ZONE_NAMES[z][locale]}
                value={state[z] ? "on" : "off"}
                onChange={(v) => setState((s) => ({ ...s, [z]: v === "on" }))}
                options={[
                  { value: "on", label: t("on") },
                  { value: "off", label: t("off"), tone: "var(--subtle)" },
                ]}
              />
            </div>
          ))}

          <VizReadout
            label={t("limbCount")}
            value={limbPairs}
            tone="var(--teal)"
            note={t("resultLabel")}
            className="mt-1"
          />
          <p className="font-display text-sm font-700 text-foreground">{resultName}</p>
        </div>
      </div>
    </VizFigure>
  );
}
