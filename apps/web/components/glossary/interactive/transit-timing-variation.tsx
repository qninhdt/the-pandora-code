"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const CX = 50;
const STAR_R = 16;

// A moon tugs the planet around their shared barycentre, so the planet reaches
// transit early or late depending on the moon's mass. We map mass (0..1) to a
// timing offset in arbitrary "minutes" and slide the lightcurve dip to match.
export default function TransitTimingVariation() {
  const t = useTranslations("viz.transit-timing-variation");
  // Hidden moon mass, -1..1 — sign sets whether the planet is pulled ahead or
  // behind; magnitude sets how far the transit slips.
  const [moon, setMoon] = useState(0.4);

  // Timing offset: positive moon → late transit, negative → early.
  const offsetMin = moon * 22;
  const dipCenter = 50 + moon * 24; // shift dip across the lightcurve panel
  const state = Math.abs(moon) < 0.06 ? t("onTime") : moon > 0 ? t("late") : t("early");

  // Barycentre wobble: planet sits off-centre opposite the moon.
  const planetOffset = -moon * 8;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      aspectRatio="16/10"
      caption={
        <span style={{ color: Math.abs(moon) < 0.06 ? "var(--muted)" : "var(--amber)" }}>
          {state}
        </span>
      }
    >
      <div className="flex h-full w-full flex-col gap-3 p-4 pt-16">
        {/* Star + planet + hidden moon orbiting barycentre */}
        <div className="relative flex-1">
          <svg
            viewBox="0 0 100 60"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={t("title")}
          >
            <defs>
              <radialGradient id="ttv-star" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff6e0" />
                <stop offset="60%" stopColor="var(--amber)" />
                <stop offset="100%" stopColor="#a85f1c" />
              </radialGradient>
            </defs>

            <circle cx={CX} cy={30} r={STAR_R + 4} fill="var(--amber)" opacity="0.12" />
            <circle cx={CX} cy={30} r={STAR_R} fill="url(#ttv-star)" />

            {/* barycentre marker */}
            <circle cx={CX} cy={30} r="0.8" fill="var(--border-strong)" />

            {/* planet — pulled off the barycentre line opposite the moon */}
            <circle cx={CX + planetOffset} cy={30} r="5" fill="var(--cyan)" />
            <circle
              cx={CX + planetOffset}
              cy={30}
              r="5"
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="0.5"
            />

            {/* hidden moon — faint, sits opposite the planet, scales with mass */}
            <circle
              cx={CX - planetOffset * 2}
              cy={30}
              r={1.5 + Math.abs(moon) * 3.5}
              fill="var(--magenta)"
              opacity={0.25 + Math.abs(moon) * 0.5}
            />
            <text
              x={CX - planetOffset * 2}
              y={42}
              textAnchor="middle"
              fontSize="3.4"
              fill="var(--magenta)"
              opacity="0.7"
              fontFamily="monospace"
            >
              ?
            </text>
          </svg>
        </div>

        {/* Lightcurve panel — dip slides with the timing offset */}
        <div className="relative h-14 w-full overflow-hidden rounded-lg border border-border/40 bg-void/70">
          <svg
            viewBox="0 0 100 30"
            className="h-full w-full"
            preserveAspectRatio="none"
            aria-hidden={true}
          >
            <title>{t("lightcurve")}</title>
            {/* on-time reference dip */}
            <path
              d="M0 6 H42 L48 20 H52 L58 6 H100"
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              opacity="0.5"
            />
            {/* shifted observed dip */}
            <path
              d={`M0 6 H${dipCenter - 8} L${dipCenter - 2} 22 H${dipCenter + 2} L${dipCenter + 8} 6 H100`}
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="1.4"
            />
          </svg>
          <span className="absolute bottom-1 left-2 font-mono text-[8px] uppercase tracking-wider text-muted">
            {t("lightcurve")}
          </span>
        </div>

        {/* Hidden-moon mass slider + timing readout */}
        <div className="flex items-end gap-3">
          <ControlSlider
            className="flex-1"
            label={t("moonMass")}
            value={moon}
            min={-1}
            max={1}
            step={0.01}
            onChange={setMoon}
            display={`${(Math.abs(moon) * 100).toFixed(0)}%`}
            thumb="magenta"
          />
          <Readout
            label={t("shift")}
            value={`${offsetMin > 0 ? "+" : ""}${offsetMin.toFixed(0)}`}
            unit="min"
            accent={Math.abs(moon) < 0.06 ? "foreground" : "amber"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
