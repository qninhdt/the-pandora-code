"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const CX = 50;
const CY = 50;
const ORBIT_R = 30;
const GIANT_R = 11;
const MOON_R = 8;

export default function TidalLocking() {
  const t = useTranslations("viz.tidal-locking");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [isPlaying, setIsPlaying] = useState(true);
  // User-set spin rate (spins per orbit). The moon brakes toward 1.0 over time.
  const [spinRate, setSpinRate] = useState(3);

  const orbitRef = useRef(0);
  const spinRef = useRef(0);
  const rateRef = useRef(3);
  const [, force] = useState(0);

  rateRef.current = spinRate;

  useRafLoop(
    (dt) => {
      orbitRef.current += dt * 0.4;
      // Tidal friction brakes the spin toward synchronous (1 spin per orbit).
      // The further from 1, the stronger the drag — friction in the bulge.
      const r = rateRef.current;
      const braked = r + (1 - r) * Math.min(1, dt * 0.25);
      rateRef.current = braked;
      setSpinRate((prev) => {
        // keep React state loosely in sync without fighting the slider mid-drag
        if (Math.abs(prev - braked) > 0.02) return braked;
        return prev;
      });
      spinRef.current += dt * 0.4 * braked;
      force((n) => (n + 1) % 1000000);
    },
    { active: isPlaying && inView },
  );

  const orbitAng = orbitRef.current;
  const moonX = CX + Math.cos(orbitAng) * ORBIT_R;
  const moonY = CY + Math.sin(orbitAng) * ORBIT_R * 0.92;

  const rate = rateRef.current;
  const locked = Math.abs(rate - 1) < 0.08;
  const spinAng = spinRef.current;

  // Direction from moon to giant (the bulge should point along this when locked).
  const toGiant = Math.atan2(CY - moonY, CX - moonX);
  // The tidal bulge's long axis. When unlocked the spin drags it ahead of the
  // moon-giant line by a lag angle; when locked it points straight at the giant.
  const lagAngle = locked ? 0 : spinAng * 0.6;
  const bulgeAng = toGiant + lagAngle;

  // Near-side surface marker tracks the moon's own spin.
  const markAng = spinAng;
  const markX = moonX + Math.cos(markAng) * (MOON_R - 2);
  const markY = moonY + Math.sin(markAng) * (MOON_R - 2);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        orbitRef.current = 0;
        spinRef.current = 0;
        rateRef.current = 3;
        setSpinRate(3);
      }}
      caption={
        <span style={{ color: locked ? "var(--teal)" : "var(--amber)" }}>
          {locked ? t("locked") : rate > 1.5 ? t("unlocked") : t("locking")}
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
            <radialGradient id="lock-giant" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3a5fa8" />
              <stop offset="70%" stopColor="#1d2f5a" />
              <stop offset="100%" stopColor="var(--void)" />
            </radialGradient>
          </defs>

          {/* orbit ring */}
          <ellipse
            cx={CX}
            cy={CY}
            rx={ORBIT_R}
            ry={ORBIT_R * 0.92}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
            opacity="0.5"
          />

          {/* central gas giant */}
          <circle cx={CX} cy={CY} r={GIANT_R + 4} fill="var(--cyan)" opacity="0.05" />
          <circle cx={CX} cy={CY} r={GIANT_R} fill="url(#lock-giant)" />

          {/* moon as an egg stretched along the bulge axis */}
          <g transform={`translate(${moonX} ${moonY}) rotate(${(bulgeAng * 180) / Math.PI})`}>
            <ellipse
              rx={MOON_R + 2}
              ry={MOON_R - 1}
              fill="#243247"
              stroke={locked ? "var(--teal)" : "var(--amber)"}
              strokeWidth="0.5"
            />
            {/* bulge tips highlighted */}
            <circle
              cx={MOON_R + 1}
              cy="0"
              r="1.6"
              fill={locked ? "var(--teal)" : "var(--amber)"}
              opacity="0.7"
            />
            <circle
              cx={-(MOON_R + 1)}
              cy="0"
              r="1.6"
              fill={locked ? "var(--teal)" : "var(--amber)"}
              opacity="0.7"
            />
          </g>

          {/* line from moon center to giant (reference) */}
          <line
            x1={moonX}
            y1={moonY}
            x2={CX}
            y2={CY}
            stroke="var(--foreground)"
            strokeWidth="0.2"
            strokeDasharray="1 1"
            opacity="0.25"
          />

          {/* near-side surface marker */}
          <circle cx={markX} cy={markY} r="1.4" fill="var(--magenta)" />
        </svg>

        <div className="absolute right-3 top-16 flex flex-col gap-1.5">
          <Readout
            label={t("orbit")}
            value={locked ? "1×" : `${rate.toFixed(1)}×`}
            accent={locked ? "teal" : "amber"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("spin")}
            value={spinRate}
            min={1}
            max={5}
            step={0.1}
            onChange={(v) => {
              setSpinRate(v);
              rateRef.current = v;
            }}
            display={`${spinRate.toFixed(1)}×`}
            thumb={locked ? "teal" : "amber"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
