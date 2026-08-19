"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const CX = 50;
const CY = 50;
const TURNS = 3.4; // full spiral turns from centre (now) to rim (4.5 Gyr ago)
const MAX_GYR = 4.54;

// A logarithmic spiral compresses the near-empty recent past and stretches deep
// time, so 4.5 Gyr fits in one frame without the last few million years vanishing.
function spiralPoint(frac: number) {
  // frac 0 = present (centre), 1 = origin of the world (outer rim)
  const theta = frac * TURNS * Math.PI * 2;
  const r = 4 + frac ** 0.72 * 42;
  return {
    x: CX + Math.cos(theta - Math.PI / 2) * r,
    y: CY + Math.sin(theta - Math.PI / 2) * r,
  };
}

// Fraction of the way back into deep time (0 = now). gyr = billions of yr ago.
const EVENTS = [
  { key: "now", gyr: 0.0 },
  { key: "humans", gyr: 0.0003 },
  { key: "cambrian", gyr: 0.539 },
  { key: "oxygen", gyr: 2.4 },
  { key: "luca", gyr: 3.8 },
  { key: "firstLife", gyr: 4.1 },
  { key: "earth", gyr: 4.54 },
] as const;

export default function DeepTime() {
  const t = useTranslations("viz.deep-time");
  // Travel: 0 = present at centre, 1 = 4.54 Gyr at the rim.
  const [travel, setTravel] = useState(0.12);

  const path = useMemo(() => {
    let d = "";
    for (let i = 0; i <= 240; i++) {
      const f = i / 240;
      const p = spiralPoint(f);
      d += `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
    }
    return d;
  }, []);

  const gyr = travel * MAX_GYR;
  // Nearest event to the current travel head, for the readout label.
  const near = EVENTS.reduce((a, b) => (Math.abs(b.gyr - gyr) < Math.abs(a.gyr - gyr) ? b : a));
  const head = spiralPoint(travel);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setTravel(0.12)}
      caption={
        <span>
          {gyr < 0.001 ? t("present") : `${gyr.toFixed(2)} ${t("gyrAgo")}`} · {t(`ev_${near.key}`)}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="dt-bg" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#0d1424" />
              <stop offset="100%" stopColor="#060812" />
            </radialGradient>
            <linearGradient id="dt-spiral" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--cyan)" />
              <stop offset="100%" stopColor="var(--teal)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#dt-bg)" />

          {/* the deep-time spiral track */}
          <path
            d={path}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
            opacity="0.55"
          />
          <path
            d={path}
            fill="none"
            stroke="url(#dt-spiral)"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.85"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: 300 * (1 - travel),
            }}
          />

          {/* event nodes glow as the travel head passes them */}
          {EVENTS.map((e) => {
            const f = e.gyr / MAX_GYR;
            const p = spiralPoint(f);
            const active = Math.abs(f - travel) < 0.05;
            return (
              <g key={e.key}>
                {active && <circle cx={p.x} cy={p.y} r="3.6" fill="var(--amber)" opacity="0.25" />}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? 1.8 : 1.1}
                  fill={active ? "var(--amber)" : "var(--teal)"}
                  stroke="var(--void)"
                  strokeWidth="0.3"
                />
              </g>
            );
          })}

          {/* travel head */}
          <circle cx={head.x} cy={head.y} r="2.2" fill="var(--cyan)" />
          <circle cx={head.x} cy={head.y} r="4" fill="var(--cyan)" opacity="0.2" />
        </svg>

        <div className="absolute left-3 top-16">
          <Readout label={t("depth")} value={gyr.toFixed(2)} unit={t("gyr")} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("travel")}
            value={travel}
            min={0}
            max={1}
            step={0.001}
            onChange={setTravel}
            display={gyr < 0.001 ? t("present") : `${gyr.toFixed(2)} ${t("gyr")}`}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
