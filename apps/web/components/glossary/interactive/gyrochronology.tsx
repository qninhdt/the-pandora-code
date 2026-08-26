"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const CX = 50;
const CY = 44;
const STAR_R = 26;

// Three starspots fixed in the star's own rotating frame (angle, latitude band).
const SPOTS = [
  { ang: 0.4, rad: 14, size: 4 },
  { ang: 2.5, rad: 19, size: 2.6 },
  { ang: 4.3, rad: 9, size: 3.2 },
];

// Young stars spin fast; rotation period grows ~ sqrt(age) (Skumanich-like).
// age in Gyr (0.1..10) -> angular speed (rad/s) for the figure.
function spinSpeed(ageGyr: number) {
  return 2.6 / Math.sqrt(ageGyr);
}
function periodDays(ageGyr: number) {
  // illustrative: ~3 days young -> ~30 days old
  return 3 + Math.sqrt(ageGyr) * 8.5;
}

export default function Gyrochronology() {
  const t = useTranslations("viz.gyrochronology");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [age, setAge] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  const phaseRef = useRef(0);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      phaseRef.current = (phaseRef.current + spinSpeed(age) * dt) % (Math.PI * 2);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const phase = phaseRef.current;
  // Hotter (younger) -> brighter amber-white; older -> cooler amber.
  const youthFrac = 1 - Math.min(1, Math.sqrt(age / 10));
  const glow = 0.35 + youthFrac * 0.55;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        phaseRef.current = 0;
        setAge(1);
      }}
      caption={
        <span style={{ color: youthFrac > 0.5 ? "var(--amber)" : "var(--cyan)" }}>
          {youthFrac > 0.5 ? t("young") : t("old")}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 88"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="gyro-star" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#fff3d6" />
              <stop offset="55%" stopColor="var(--amber)" />
              <stop offset="100%" stopColor="#7a3f12" />
            </radialGradient>
            <radialGradient id="gyro-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--amber)" stopOpacity={glow} />
              <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
            </radialGradient>
            <clipPath id="gyro-disk">
              <circle cx={CX} cy={CY} r={STAR_R} />
            </clipPath>
          </defs>

          <circle cx={CX} cy={CY} r={STAR_R + 12} fill="url(#gyro-glow)" />
          <circle cx={CX} cy={CY} r={STAR_R} fill="url(#gyro-star)" />

          {/* starspots ride the rotating frame; project onto the disk by cos(angle) */}
          <g clipPath="url(#gyro-disk)">
            {SPOTS.map((s, i) => {
              const a = s.ang + phase;
              const px = CX + Math.cos(a) * s.rad;
              const py = CY + Math.sin(s.ang * 1.7) * 6 - 1;
              const front = Math.sin(a) > -0.2;
              const foreshorten = Math.abs(Math.cos(a));
              return (
                <ellipse
                  key={i}
                  cx={px}
                  cy={py}
                  rx={s.size * (0.3 + foreshorten * 0.7)}
                  ry={s.size}
                  fill="#5a2c0a"
                  opacity={front ? 0.7 : 0.12}
                />
              );
            })}
          </g>

          {/* equator hint */}
          <ellipse
            cx={CX}
            cy={CY}
            rx={STAR_R}
            ry={STAR_R * 0.32}
            fill="none"
            stroke="#ffe7bf"
            strokeWidth="0.4"
            opacity="0.3"
          />
        </svg>

        <div className="absolute right-3 top-16 flex flex-col gap-1.5">
          <Readout label={t("age")} value={`${age.toFixed(1)} Gyr`} accent="amber" />
          <Readout label={t("period")} value={`${periodDays(age).toFixed(0)}d`} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("age")}
            value={age}
            min={0.1}
            max={10}
            step={0.1}
            onChange={setAge}
            display={`${age.toFixed(1)} Gyr`}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
