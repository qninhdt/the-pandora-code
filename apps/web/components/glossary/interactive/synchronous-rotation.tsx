"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Legend } from "./shared/legend";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const CX = 50;
const CY = 50;
const ORBIT_R = 30;
const GIANT_R = 11;
const MOON_R = 6;

type ModeKey = "sync" | "async";

export default function SynchronousRotation() {
  const t = useTranslations("viz.synchronous-rotation");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [mode, setMode] = useState<ModeKey>("sync");
  const [isPlaying, setIsPlaying] = useState(true);

  const orbitRef = useRef(0);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      orbitRef.current += dt * 0.55;
      force((n) => (n + 1) % 1000000);
    },
    { active: isPlaying && inView },
  );

  const orbitAng = orbitRef.current;
  const moonX = CX + Math.cos(orbitAng) * ORBIT_R;
  const moonY = CY + Math.sin(orbitAng) * ORBIT_R * 0.92;

  // In sync mode the spin matches the orbit so the near-face marker always points
  // at the planet. In async mode the moon spins independently (here: not at all
  // relative to the stars), so the same hemisphere does NOT stay planet-facing.
  const spinAng = mode === "sync" ? orbitAng + Math.PI : 0;

  // Near-side patch (always faces planet in sync) drawn as a colored cap.
  const nearX = moonX + Math.cos(spinAng) * (MOON_R * 0.5);
  const nearY = moonY + Math.sin(spinAng) * (MOON_R * 0.5);
  // Far-side marker, opposite.
  const farX = moonX - Math.cos(spinAng) * (MOON_R * 0.5);
  const farY = moonY - Math.sin(spinAng) * (MOON_R * 0.5);

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
      caption={<span>{t("lit")}</span>}
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
            <radialGradient id="syncrot-giant" cx="50%" cy="50%" r="50%">
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
          <circle cx={CX} cy={CY} r={GIANT_R} fill="url(#syncrot-giant)" />

          {/* sightline from moon near-face to planet */}
          <line
            x1={nearX}
            y1={nearY}
            x2={CX}
            y2={CY}
            stroke="var(--cyan)"
            strokeWidth="0.3"
            strokeDasharray="2 2"
            opacity="0.4"
          />

          {/* moon body */}
          <circle
            cx={moonX}
            cy={moonY}
            r={MOON_R}
            fill="#243247"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
          />
          {/* near side (faces planet) */}
          <circle cx={nearX} cy={nearY} r="2" fill="var(--cyan)" />
          {/* far side (hidden hemisphere) */}
          <circle cx={farX} cy={farY} r="1.6" fill="var(--magenta)" opacity="0.85" />
        </svg>

        <div className="absolute left-3 top-16">
          <Legend
            vertical
            items={[
              { color: "var(--cyan)", label: t("near") },
              { color: "var(--magenta)", label: t("far") },
            ]}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <ControlTabs<ModeKey>
            ariaLabel={t("title")}
            value={mode}
            onChange={setMode}
            options={[
              { value: "sync", label: t("sync") },
              { value: "async", label: t("async") },
            ]}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
