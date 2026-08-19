"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Legend } from "./shared/legend";

type MolKey = "h2o" | "co2" | "ch4";

interface Molecule {
  key: MolKey;
  color: string;
  // Absorption band centres as fractions (0..1) across the spectrum.
  bands: number[];
}

const MOLECULES: Molecule[] = [
  { key: "h2o", color: "var(--cyan)", bands: [0.16, 0.44, 0.82] },
  { key: "co2", color: "var(--amber)", bands: [0.3, 0.66] },
  { key: "ch4", color: "var(--magenta)", bands: [0.54, 0.74, 0.92] },
];

const CX = 50;
const STAR_R = 30;
const PLANET_R = 11;

export default function TransmissionSpectroscopy() {
  const t = useTranslations("viz.transmission-spectroscopy");
  // Planet position across the stellar disk, 0 = entering, 1 = leaving.
  const [transit, setTransit] = useState(0.5);
  const [active, setActive] = useState<Record<MolKey, boolean>>({
    h2o: true,
    co2: true,
    ch4: false,
  });

  const toggle = (k: MolKey) => setActive((a) => ({ ...a, [k]: !a[k] }));

  const planetX = 12 + transit * 76;
  // In transit when the planet disk overlaps the star.
  const inTransit = planetX > CX - STAR_R && planetX < CX + STAR_R;

  const lines = useMemo(
    () =>
      MOLECULES.filter((m) => active[m.key]).flatMap((m) =>
        m.bands.map((b) => ({ x: b, color: m.color })),
      ),
    [active],
  );

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      aspectRatio="16/10"
      caption={
        <span style={{ color: inTransit ? "var(--teal)" : "var(--muted)" }}>
          {inTransit ? t("transit") : t("out")}
        </span>
      }
    >
      <div className="flex h-full w-full flex-col gap-3 p-4 pt-16">
        {/* Stellar disk with transiting planet + atmospheric ring */}
        <div className="relative flex-1">
          <svg
            viewBox="0 0 100 70"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={t("title")}
          >
            <defs>
              <radialGradient id="ts-star" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff6e0" />
                <stop offset="60%" stopColor="var(--amber)" />
                <stop offset="100%" stopColor="#a85f1c" />
              </radialGradient>
            </defs>

            <circle cx={CX} cy={35} r={STAR_R + 4} fill="var(--amber)" opacity="0.12" />
            <circle cx={CX} cy={35} r={STAR_R} fill="url(#ts-star)" />

            {/* atmosphere annulus — the sliver starlight strains through */}
            <circle
              cx={planetX}
              cy={35}
              r={PLANET_R + 2.5}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="2"
              opacity={inTransit ? 0.7 : 0.3}
            />
            {/* planet silhouette */}
            <circle cx={planetX} cy={35} r={PLANET_R} fill="var(--void)" />
            <circle
              cx={planetX}
              cy={35}
              r={PLANET_R}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Transmission spectrum with absorption fingerprint lines */}
        <div className="relative h-12 w-full overflow-hidden rounded-lg border border-border/40 bg-void/70">
          <div className="absolute inset-0 bg-gradient-to-r from-magenta/20 via-amber/15 to-cyan/20" />
          {lines.map((line, i) => (
            <div
              key={`${line.x}-${i}`}
              className="absolute top-0 h-full w-[3px]"
              style={{
                left: `${line.x * 100}%`,
                background: inTransit ? line.color : "var(--border-strong)",
                boxShadow: inTransit ? `0 0 8px ${line.color}` : "none",
                opacity: inTransit ? 1 : 0.4,
              }}
            />
          ))}
          <span className="absolute bottom-1 left-2 font-mono text-[8px] uppercase tracking-wider text-muted">
            {t("spectrum")}
          </span>
        </div>

        {/* Transit-position slider drives the planet across the disk */}
        <ControlSlider
          label={t("title")}
          value={transit}
          min={0}
          max={1}
          step={0.01}
          onChange={setTransit}
          display={inTransit ? t("transit") : t("out")}
          thumb="teal"
        />

        {/* Molecule toggles + legend */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {MOLECULES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => toggle(m.key)}
                className={`rounded-md border px-2 py-1 font-mono text-[10px] transition-colors ${
                  active[m.key]
                    ? "text-foreground"
                    : "border-border/40 text-muted opacity-50"
                }`}
                style={active[m.key] ? { borderColor: m.color, color: m.color } : undefined}
              >
                {t(m.key)}
              </button>
            ))}
          </div>
          <Legend
            items={MOLECULES.filter((m) => active[m.key]).map((m) => ({
              color: m.color,
              label: t(m.key),
            }))}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
