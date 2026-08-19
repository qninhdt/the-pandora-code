"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const W = 100;
const H = 56;
const PLOT_TOP = 6;
const PLOT_BOT = 50;

// time axis: 4 (Gyr ago) -> 0 (today), mapped left->right.
function xAt(gyrAgo: number) {
  return ((4 - gyrAgo) / 4) * (W - 12) + 8;
}
function yAt(norm: number) {
  // norm 0..1 (cold..hot) -> bottom..top
  return PLOT_BOT - norm * (PLOT_BOT - PLOT_TOP);
}

// Solar luminosity rose ~0.7 -> 1.0 over 4 Gyr (normalized to 0..1 band here).
function luminosity(gyrAgo: number) {
  const freshFrac = (4 - gyrAgo) / 4; // 0 at 4Gyr ago, 1 today
  return 0.2 + freshFrac * 0.55;
}

export default function FaintYoungSunParadox() {
  const t = useTranslations("viz.faint-young-sun-paradox");
  const [gyr, setGyr] = useState(4);
  const [thermostat, setThermostat] = useState(true);

  const lum = luminosity(gyr);
  // Without the CO2 thermostat surface tracks luminosity and dives below freezing
  // early on. With it, a thicker early greenhouse holds the world above freezing.
  const surface = thermostat
    ? Math.max(0.32, lum + (gyr / 4) * 0.38)
    : lum - 0.18;

  const frozen = surface <= 0.3;

  const lumPath = useMemo(() => {
    const pts: string[] = [];
    for (let g = 4; g >= 0; g -= 0.25) {
      pts.push(`${xAt(g).toFixed(1)},${yAt(luminosity(g)).toFixed(1)}`);
    }
    return `M ${pts.join(" L ")}`;
  }, []);

  const tempPath = useMemo(() => {
    const pts: string[] = [];
    for (let g = 4; g >= 0; g -= 0.25) {
      const l = luminosity(g);
      const s = thermostat ? Math.max(0.32, l + (g / 4) * 0.38) : l - 0.18;
      pts.push(`${xAt(g).toFixed(1)},${yAt(s).toFixed(1)}`);
    }
    return `M ${pts.join(" L ")}`;
  }, [thermostat]);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      aspectRatio="16/10"
      caption={
        <span style={{ color: frozen ? "var(--cyan)" : "var(--teal)" }}>
          {frozen ? t("frozen") : t("liquid")}
        </span>
      }
    >
      <div className="flex h-full w-full flex-col gap-3 p-4 pt-16">
        <div className="relative flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={t("title")}
          >
            {/* freezing band */}
            <rect
              x="8"
              y={yAt(0.3)}
              width={W - 12}
              height={PLOT_BOT - yAt(0.3)}
              fill="var(--cyan)"
              opacity="0.08"
            />
            <line
              x1="8"
              y1={yAt(0.3)}
              x2={W - 4}
              y2={yAt(0.3)}
              stroke="var(--cyan)"
              strokeWidth="0.4"
              strokeDasharray="2 2"
              opacity="0.5"
            />

            <path d={lumPath} fill="none" stroke="var(--amber)" strokeWidth="1.2" opacity="0.85" />
            <path
              d={tempPath}
              fill="none"
              stroke={frozen ? "var(--cyan)" : "var(--teal)"}
              strokeWidth="1.5"
            />

            {/* scrubber */}
            <line
              x1={xAt(gyr)}
              y1={PLOT_TOP - 2}
              x2={xAt(gyr)}
              y2={PLOT_BOT}
              stroke="var(--foreground)"
              strokeWidth="0.5"
              opacity="0.4"
            />
            <circle cx={xAt(gyr)} cy={yAt(lum)} r="2" fill="var(--amber)" />
            <circle
              cx={xAt(gyr)}
              cy={yAt(surface)}
              r="2.4"
              fill={frozen ? "var(--cyan)" : "var(--teal)"}
            />

            {/* young dim sun, top-left */}
            <circle
              cx="14"
              cy={PLOT_TOP + 1}
              r={1.6 + lum * 2.4}
              fill="var(--amber)"
              opacity={0.4 + lum * 0.5}
            />
          </svg>

          <div className="absolute right-2 top-14 flex flex-col gap-1.5">
            <Readout label={t("luminosity")} value={`${(lum * 130 + 70).toFixed(0)}%`} accent="amber" />
            <Readout
              label={t("temperature")}
              value={frozen ? "❄" : "≈"}
              accent={frozen ? "cyan" : "teal"}
            />
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <ControlSlider
            label={t("time")}
            value={gyr}
            min={0}
            max={4}
            step={0.05}
            onChange={setGyr}
            display={`${gyr.toFixed(2)}`}
            thumb="amber"
            className="flex-1"
          />
          <ControlButton
            variant={thermostat ? "active" : "default"}
            onClick={() => setThermostat((v) => !v)}
          >
            {t("thermostat")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
