"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const CX = 50;
const CY = 50;
const ORBIT_R = 30;
const BODY_R = 5;

type RatioKey = "lock" | "mercury" | "fast";

// spins per orbit for each resonance state.
const SPINS: Record<RatioKey, number> = {
  lock: 1, // 1:1 tidal lock
  mercury: 1.5, // 3:2
  fast: 2, // 2:1
};

export default function SpinOrbitResonance() {
  const t = useTranslations("viz.spin-orbit-resonance");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [ratio, setRatio] = useState<RatioKey>("mercury");
  const [isPlaying, setIsPlaying] = useState(true);

  const orbitRef = useRef(0);
  const [, force] = useState(0);

  const spins = SPINS[ratio];

  useRafLoop(
    (dt) => {
      orbitRef.current += dt * 0.5;
      force((n) => (n + 1) % 1000000);
    },
    { active: isPlaying && inView },
  );

  const orbitAng = orbitRef.current;
  const bodyX = CX + Math.cos(orbitAng) * ORBIT_R;
  const bodyY = CY + Math.sin(orbitAng) * ORBIT_R * 0.92;

  // Spin angle accumulates `spins` rotations per orbit.
  const spinAng = orbitAng * spins;
  // Surface marker on the body's equator.
  const mx = bodyX + Math.cos(spinAng) * BODY_R;
  const my = bodyY + Math.sin(spinAng) * BODY_R;
  // The sub-marker direction relative to the star: shows where the marker points.
  const markDirX = bodyX + Math.cos(spinAng) * (BODY_R + 4);
  const markDirY = bodyY + Math.sin(spinAng) * (BODY_R + 4);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        orbitRef.current = 0;
      }}
      caption={
        <span>
          {ratio === "lock"
            ? t("locked")
            : ratio === "mercury"
              ? t("mercury")
              : t("fast")}
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
            <radialGradient id="sor-star" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff6e0" />
              <stop offset="55%" stopColor="var(--amber)" />
              <stop offset="100%" stopColor="#a85f1c" />
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

          {/* central star */}
          <circle cx={CX} cy={CY} r="11" fill="var(--amber)" opacity="0.12" />
          <circle cx={CX} cy={CY} r="7" fill="url(#sor-star)" />

          {/* body */}
          <circle cx={bodyX} cy={bodyY} r={BODY_R} fill="#2a5b6e" />
          <circle cx={bodyX} cy={bodyY} r={BODY_R} fill="none" stroke="var(--cyan)" strokeWidth="0.4" />

          {/* spin marker + pointer */}
          <line x1={bodyX} y1={bodyY} x2={markDirX} y2={markDirY} stroke="var(--magenta)" strokeWidth="1" />
          <circle cx={mx} cy={my} r="1.6" fill="var(--magenta)" />
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("spins")}
            value={ratio === "lock" ? "1" : ratio === "mercury" ? "1.5" : "2"}
            accent="magenta"
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <ControlTabs<RatioKey>
            ariaLabel={t("ratio")}
            value={ratio}
            onChange={setRatio}
            options={[
              { value: "lock", label: "1:1" },
              { value: "mercury", label: "3:2" },
              { value: "fast", label: "2:1" },
            ]}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
