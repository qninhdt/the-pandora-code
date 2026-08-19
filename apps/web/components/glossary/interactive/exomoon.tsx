"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlossaryFrame } from "./shared/frame";
import { ControlSlider } from "./shared/control-slider";
import { Readout } from "./shared/readout";
import { useRafLoop } from "./shared/use-raf-loop";
import { useInView } from "./shared/use-in-view";

// Exomoon: a small moon orbits a banded gas giant. As the user shrinks the
// orbital radius, tidal flexing intensifies — the moon's core glow climbs from
// frozen blue → temperate teal → molten amber. The moon also orbits live.
export default function Exomoon() {
  const t = useTranslations("viz.exomoon");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [playing, setPlaying] = useState(true);
  const [radius, setRadius] = useState(0.62); // 0..1 normalized orbital radius
  const [angle, setAngle] = useState(0.3);

  useRafLoop(
    (dt) => {
      // Closer orbits move faster (Kepler-ish): angular speed ~ r^-1.5.
      const speed = 0.35 / Math.max(0.18, radius) ** 1.5;
      setAngle((a) => (a + dt * speed) % (Math.PI * 2));
    },
    { active: playing && inView },
  );

  // Heat rises sharply as radius shrinks (tidal heating ∝ r^-7.5, softened here).
  const heat = Math.min(1, (0.42 / Math.max(0.16, radius)) ** 3.4 * 0.5);
  const cx = 50;
  const cy = 52;
  const orbitR = 14 + radius * 26;
  const moonX = cx + Math.cos(angle) * orbitR;
  const moonY = cy + Math.sin(angle) * orbitR * 0.42; // tilted orbit

  // Core glow color by heat.
  const coreColor =
    heat < 0.33 ? "var(--cyan)" : heat < 0.66 ? "var(--teal)" : "var(--amber)";
  const stateLabel = heat < 0.33 ? t("cold") : heat < 0.66 ? t("warm") : t("molten");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={playing}
      onPlayPause={() => setPlaying((p) => !p)}
      onReset={() => {
        setRadius(0.62);
        setAngle(0.3);
        setPlaying(true);
      }}
      caption={
        <span>
          {t("radius")}: {(radius * 100).toFixed(0)}% · {stateLabel}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="exo-giant" cx="62%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#3a4a7a" />
              <stop offset="45%" stopColor="#202a4a" />
              <stop offset="100%" stopColor="#0b0f1e" />
            </radialGradient>
            <radialGradient id="exo-moon-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={coreColor} stopOpacity="0.95" />
              <stop offset="60%" stopColor={coreColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Starfield */}
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="var(--foreground)"
              opacity={s.o}
            />
          ))}

          {/* Gas giant — large, banded, fills upper-right */}
          <g>
            <circle cx="74" cy="40" r="34" fill="url(#exo-giant)" />
            {GIANT_BANDS.map((b, i) => (
              <ellipse
                key={i}
                cx="74"
                cy={40 + b.dy}
                rx={Math.sqrt(Math.max(0, 34 * 34 - b.dy * b.dy))}
                ry={b.h}
                fill={b.color}
                opacity={b.op}
              />
            ))}
            {/* terminator shadow */}
            <circle cx="74" cy="40" r="34" fill="#070912" opacity="0.34" transform="translate(-7 4)" />
          </g>

          {/* Orbit path */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={orbitR}
            ry={orbitR * 0.42}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
            strokeDasharray="1.5 1.5"
            opacity="0.5"
          />

          {/* Moon with heat halo */}
          <circle cx={moonX} cy={moonY} r="9" fill="url(#exo-moon-core)" opacity={0.3 + heat * 0.7} />
          <circle
            cx={moonX}
            cy={moonY}
            r="3.4"
            fill="#16324a"
            stroke={coreColor}
            strokeWidth={0.4 + heat * 0.8}
          />
          {/* molten cracks at high heat */}
          {heat > 0.45 && (
            <g stroke={coreColor} strokeWidth={0.4} opacity={(heat - 0.45) * 1.8} fill="none">
              <path d={`M${moonX - 2},${moonY - 1} L${moonX},${moonY} L${moonX + 1.5},${moonY - 1.8}`} />
              <path d={`M${moonX - 1},${moonY + 2} L${moonX + 0.5},${moonY + 0.5}`} />
            </g>
          )}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-2">
          <Readout
            label={t("heat")}
            value={`${(heat * 100).toFixed(0)}%`}
            accent={heat < 0.33 ? "cyan" : heat < 0.66 ? "teal" : "amber"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("radius")}
            value={radius}
            min={0.16}
            max={1}
            step={0.01}
            onChange={setRadius}
            display={`${(radius * 100).toFixed(0)}%`}
            thumb={heat < 0.33 ? "cyan" : heat < 0.66 ? "teal" : "amber"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

const STARS = [
  { x: 12, y: 18, r: 0.4, o: 0.7 },
  { x: 28, y: 72, r: 0.3, o: 0.5 },
  { x: 8, y: 54, r: 0.5, o: 0.8 },
  { x: 44, y: 12, r: 0.3, o: 0.6 },
  { x: 90, y: 82, r: 0.4, o: 0.7 },
  { x: 18, y: 88, r: 0.3, o: 0.5 },
  { x: 60, y: 90, r: 0.35, o: 0.6 },
];

const GIANT_BANDS = [
  { dy: -16, h: 2.4, color: "#c8b89a", op: 0.5 },
  { dy: -9, h: 3, color: "#9a6a4a", op: 0.45 },
  { dy: -2, h: 3.4, color: "#c8b89a", op: 0.4 },
  { dy: 6, h: 3, color: "#7a4a3a", op: 0.5 },
  { dy: 14, h: 2.6, color: "#b89a7a", op: 0.4 },
];
