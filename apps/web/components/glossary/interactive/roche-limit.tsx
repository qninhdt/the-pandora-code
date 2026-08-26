"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Roche limit: drag the moon's approach distance inward. Beyond the limit the
// planet's tidal gradient overpowers the moon's self-gravity and it shears into
// a debris ring. Distance is normalized; the limit sits at 0.4.
const LIMIT = 0.4;

export default function RocheLimit() {
  const t = useTranslations("viz.roche-limit");
  const [distance, setDistance] = useState(0.78);

  // 0 = intact, 1 = fully disrupted. Ramps up once inside the limit.
  const disruption = distance >= LIMIT ? 0 : Math.min(1, (LIMIT - distance) / LIMIT);

  const planetX = 30;
  const planetY = 50;
  const moonX = planetX + 12 + distance * 52;
  const moonY = 50;

  // Debris particles: spread along an arc as disruption increases.
  const debris = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => {
        const seed = ((i * 2654435761) % 1000) / 1000;
        const seed2 = ((i * 40503) % 997) / 997;
        return { a: seed * Math.PI * 2, spread: 0.3 + seed2 * 0.7, size: 0.3 + seed2 * 0.7 };
      }),
    [],
  );

  const stateLabel =
    disruption === 0 ? t("intact") : disruption < 0.6 ? t("shedding") : t("disrupted");
  const accent = disruption === 0 ? "teal" : disruption < 0.6 ? "amber" : "magenta";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setDistance(0.78)}
      caption={
        <span>
          {t("distance")}: {(distance * 100).toFixed(0)}% · {stateLabel}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="roche-planet" cx="45%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#46568a" />
              <stop offset="55%" stopColor="#263054" />
              <stop offset="100%" stopColor="#0a0e1c" />
            </radialGradient>
            <radialGradient id="roche-moon" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#5a6e8a" />
              <stop offset="100%" stopColor="#1a2438" />
            </radialGradient>
          </defs>

          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="var(--foreground)" opacity={s.o} />
          ))}

          {/* Roche-limit ring marker */}
          <circle
            cx={planetX}
            cy={planetY}
            r={12 + LIMIT * 52}
            fill="none"
            stroke="var(--magenta)"
            strokeWidth="0.3"
            strokeDasharray="1 1.4"
            opacity="0.55"
          />
          <text
            x={planetX + 12 + LIMIT * 52}
            y={planetY - 3}
            fill="var(--magenta)"
            fontSize="2.6"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            {t("limit")}
          </text>

          {/* Gas giant */}
          <circle cx={planetX} cy={planetY} r="14" fill="url(#roche-planet)" />
          {[-6, -1, 4, 8].map((dy, i) => (
            <ellipse
              key={i}
              cx={planetX}
              cy={planetY + dy}
              rx={Math.sqrt(Math.max(0, 196 - dy * dy))}
              ry={1.3}
              fill={i % 2 ? "#7a8ab0" : "#36406a"}
              opacity="0.4"
            />
          ))}

          {/* Intact moon (fades as it disrupts) */}
          <circle cx={moonX} cy={moonY} r={5.5} fill="url(#roche-moon)" opacity={1 - disruption} />

          {/* Debris stream (grows with disruption) — sheared into an arc toward planet */}
          {disruption > 0 &&
            debris.map((d, i) => {
              const t01 = i / debris.length;
              // particles trail from the moon toward and around the planet
              const along = moonX - (moonX - planetX) * t01 * disruption;
              const ang = d.a + t01 * 4;
              const arc = d.spread * disruption * 10;
              return (
                <circle
                  key={i}
                  cx={along + Math.cos(ang) * arc}
                  cy={moonY + Math.sin(ang) * arc * 0.7}
                  r={d.size}
                  fill={i % 3 === 0 ? "var(--amber)" : "var(--cyan)"}
                  opacity={0.3 + disruption * 0.5}
                />
              );
            })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label="state" value={stateLabel} accent={accent} />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("distance")}
            value={distance}
            min={0.1}
            max={1}
            step={0.01}
            onChange={setDistance}
            display={`${(distance * 100).toFixed(0)}%`}
            thumb={accent === "magenta" ? "magenta" : accent === "amber" ? "amber" : "teal"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

const STARS = [
  { x: 70, y: 16, r: 0.4, o: 0.7 },
  { x: 88, y: 60, r: 0.3, o: 0.5 },
  { x: 56, y: 84, r: 0.4, o: 0.6 },
  { x: 82, y: 30, r: 0.3, o: 0.5 },
  { x: 64, y: 44, r: 0.3, o: 0.4 },
  { x: 94, y: 78, r: 0.35, o: 0.6 },
];
