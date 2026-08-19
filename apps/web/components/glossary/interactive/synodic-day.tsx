"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const CX = 50;
const CY = 50;
const ORBIT_R = 28;
const GIANT_R = 10;
const MOON_R = 5;
const SUN_X = 92;
const SUN_Y = 50;

export default function SynodicDay() {
  const t = useTranslations("viz.synodic-day");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [isPlaying, setIsPlaying] = useState(true);

  // For a tidally locked moon the sidereal spin equals the orbital period, so we
  // track a single orbital angle. The solar day is slightly longer: the moon must
  // sweep a bit past one full orbit for the sun to return overhead, because it has
  // moved along its own orbit meanwhile.
  const orbitRef = useRef(0);
  const siderealRef = useRef(0);
  const solarRef = useRef(0);
  const eclipseFlashRef = useRef(0);
  const prevAngRef = useRef(0);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      const prev = orbitRef.current;
      orbitRef.current += dt * 0.5;
      const ang = orbitRef.current;

      // Sidereal day completes every 2π of orbit (locked: one spin per orbit).
      siderealRef.current = Math.floor(ang / (Math.PI * 2));
      // Solar day is ~slightly longer; approximate with a 0.92 factor so it lags.
      solarRef.current = Math.floor((ang * 0.92) / (Math.PI * 2));

      // Eclipse: moon passes directly between the giant and the sun — i.e. on the
      // sun-facing side, angle near 0. The giant blocks the sun from the moon.
      const wrappedPrev = prev % (Math.PI * 2);
      const wrapped = ang % (Math.PI * 2);
      if (wrappedPrev > wrapped) {
        // crossed the 0 mark this frame → eclipse alignment
        eclipseFlashRef.current = 1;
      } else {
        eclipseFlashRef.current = Math.max(0, eclipseFlashRef.current - dt * 1.5);
      }
      prevAngRef.current = wrapped;
      force((n) => (n + 1) % 1000000);
    },
    { active: isPlaying && inView },
  );

  const ang = orbitRef.current;
  const moonX = CX + Math.cos(ang) * ORBIT_R;
  const moonY = CY + Math.sin(ang) * ORBIT_R * 0.92;
  const flash = eclipseFlashRef.current;
  const inEclipse = flash > 0.5;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        orbitRef.current = 0;
        siderealRef.current = 0;
        solarRef.current = 0;
        eclipseFlashRef.current = 0;
      }}
      caption={
        <span style={{ color: inEclipse ? "var(--magenta)" : "var(--muted)" }}>
          {inEclipse ? t("eclipse") : t("sunrise")}
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
            <radialGradient id="synod-giant" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3a5fa8" />
              <stop offset="70%" stopColor="#1d2f5a" />
              <stop offset="100%" stopColor="var(--void)" />
            </radialGradient>
            <radialGradient id="synod-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff6e0" />
              <stop offset="60%" stopColor="var(--amber)" />
              <stop offset="100%" stopColor="#a85f1c" />
            </radialGradient>
          </defs>

          {/* sun off to the right */}
          <circle cx={SUN_X} cy={SUN_Y} r="9" fill="var(--amber)" opacity="0.15" />
          <circle cx={SUN_X} cy={SUN_Y} r="5" fill="url(#synod-sun)" />

          {/* sunlight direction */}
          <line
            x1={SUN_X - 6}
            y1={SUN_Y}
            x2={CX + GIANT_R}
            y2={CY}
            stroke="var(--amber)"
            strokeWidth="0.3"
            strokeDasharray="2 2"
            opacity="0.3"
          />

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
          <circle cx={CX} cy={CY} r={GIANT_R} fill="url(#synod-giant)" />

          {/* eclipse flash: giant's shadow cone toward the sun */}
          {inEclipse && (
            <circle cx={CX} cy={CY} r={GIANT_R + 6} fill="none" stroke="var(--magenta)" strokeWidth="0.6" opacity={flash * 0.7} />
          )}

          {/* moon */}
          <circle cx={moonX} cy={moonY} r={MOON_R} fill="#243247" stroke="var(--border-strong)" strokeWidth="0.4" />
          {/* lit half of moon toward the sun */}
          <circle cx={moonX + 1.4} cy={moonY} r="2.2" fill="var(--amber)" opacity={inEclipse ? 0.1 : 0.55} />
        </svg>

        <div className="absolute right-3 top-16 flex flex-col gap-1.5">
          <Readout label={t("sidereal")} value={`${siderealRef.current}`} accent="cyan" />
          <Readout label={t("solar")} value={`${solarRef.current}`} accent="amber" />
          <Readout label={t("marker")} value={inEclipse ? "●" : "—"} accent={inEclipse ? "magenta" : "foreground"} />
        </div>
      </div>
    </GlossaryFrame>
  );
}
