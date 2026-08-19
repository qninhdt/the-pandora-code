"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Drag a parcel of air up the slope and watch it cool. Dry ascent sheds heat
// fast (~9.8°C/km on Earth); once it hits its dew point a cloud forms and the
// remaining climb cools more gently along the saturated rate. Pandora's weaker
// gravity + heavy, heat-rich air flatten both rates — which is exactly why its
// floating mountains stay green where an Earth peak would be bald ice.
type World = "earth" | "pandora";
const WORLDS = {
  earth: { dry: 9.8, moist: 6.0, base: 26, dew: 12 },
  pandora: { dry: 5.5, moist: 3.4, base: 28, dew: 15 },
} as const;

const MAX_ALT = 3; // km

function tempColor(c: number): string {
  if (c >= 18) return "var(--amber)";
  if (c >= 6) return "var(--teal)";
  return "var(--cyan)";
}

export default function AdiabaticLapseRate() {
  const t = useTranslations("viz.adiabatic-lapse-rate");
  const [world, setWorld] = useState<World>("earth");
  const [alt, setAlt] = useState(0.5);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const w = WORLDS[world];
  const lcl = Math.max(0.15, (w.base - w.dew) / w.dry); // cloud base (km)
  const temp = alt <= lcl ? w.base - w.dry * alt : w.base - w.dry * lcl - w.moist * (alt - lcl);
  const raining = alt > lcl;

  const frac = alt / MAX_ALT;
  const px = 22 + frac * 32;
  const py = 90 - frac * 78;
  const cloudY = 90 - (lcl / MAX_ALT) * 78;

  const setFromPointer = (clientY: number) => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vy = ((clientY - rect.top) / rect.height) * 100;
    const f = (90 - vy) / 78;
    setAlt(Math.min(MAX_ALT, Math.max(0, f * MAX_ALT)));
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setAlt(0.5);
        setWorld("earth");
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t(alt <= lcl ? "dryRate" : "moistRate")}:{" "}
          <span className="text-cyan">{(alt <= lcl ? w.dry : w.moist).toFixed(1)}</span>{" "}
          {t("perKm")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-full w-full touch-none"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromPointer(e.clientY);
          }}
          onPointerMove={(e) => {
            if (dragging.current) setFromPointer(e.clientY);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
        >
          <defs>
            <linearGradient id="alr-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1428" />
              <stop offset="100%" stopColor="#070a14" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#alr-sky)" />

          {/* mountain slope */}
          <path d="M18 90 L58 12 L100 12 L100 100 L0 100 L0 96 Z" fill="#0d1526" opacity="0.9" />
          <path d="M18 90 L58 12" stroke="var(--border-strong)" strokeWidth="0.5" opacity="0.7" />
          {/* green flanks near the summit (Pandora keeps them alive) */}
          {world === "pandora" &&
            Array.from({ length: 9 }, (_, i) => {
              const f = i / 8;
              return (
                <circle
                  key={i}
                  cx={22 + f * 34 + (i % 2 ? 3 : -3)}
                  cy={90 - f * 78 + 4}
                  r="1.3"
                  fill="var(--teal)"
                  opacity={0.25 + f * 0.35}
                />
              );
            })}

          {/* cloud base / dew point line */}
          <line
            x1="6"
            y1={cloudY}
            x2="94"
            y2={cloudY}
            stroke="var(--cyan)"
            strokeWidth="0.4"
            strokeDasharray="2 1.5"
            opacity="0.4"
          />
          <text
            x="7"
            y={cloudY - 1.5}
            className="fill-cyan"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("cloudBase")}
          </text>

          {/* the cloud, once the parcel is above condensation level */}
          {raining && (
            <g>
              <ellipse cx={px + 2} cy={py - 3} rx="9" ry="4" fill="var(--cyan)" opacity="0.18" />
              {Array.from({ length: 5 }, (_, i) => (
                <line
                  key={i}
                  x1={px - 5 + i * 2.6}
                  y1={py - 1}
                  x2={px - 6 + i * 2.6}
                  y2={py + 4}
                  stroke="var(--cyan)"
                  strokeWidth="0.4"
                  opacity="0.5"
                />
              ))}
            </g>
          )}

          {/* the air parcel */}
          <circle cx={px} cy={py} r="4.4" fill={tempColor(temp)} opacity="0.22" />
          <circle cx={px} cy={py} r="2.6" fill={tempColor(temp)} />
          <circle
            cx={px}
            cy={py}
            r="6.5"
            fill="none"
            stroke={tempColor(temp)}
            strokeWidth="0.4"
            opacity="0.5"
          />
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("parcelTemp")} value={`${temp.toFixed(1)}°C`} accent="amber" />
          <Readout label={t("altitude")} value={alt.toFixed(2)} unit={t("km")} accent="cyan" />
        </div>

        <div className="pointer-events-none absolute left-3 top-16 font-mono text-[10px] uppercase tracking-wider text-muted">
          {t("dragHint")}
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <ControlTabs
            ariaLabel={t("world")}
            options={[
              { value: "earth", label: t("earth") },
              { value: "pandora", label: t("pandora") },
            ]}
            value={world}
            onChange={(v) => setWorld(v as World)}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
