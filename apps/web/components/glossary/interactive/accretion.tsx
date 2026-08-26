"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

interface Particle {
  ang: number;
  rad: number;
  speed: number;
  size: number;
  warm: boolean;
}

const CX = 50;
const CY = 50;
const SEED_RAD = 6;

function makeParticles(n: number): Particle[] {
  return Array.from({ length: n }, (_, i) => {
    const s = ((i * 2654435761) % 1000) / 1000;
    const s2 = ((i * 40503) % 997) / 997;
    return {
      ang: s * Math.PI * 2,
      rad: 14 + s2 * 30,
      speed: 0.4 + s * 0.5,
      size: 0.4 + s2 * 0.9,
      warm: s2 > 0.78,
    };
  });
}

export default function Accretion() {
  const t = useTranslations("viz.accretion");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [rate, setRate] = useState(0.4);
  const [isPlaying, setIsPlaying] = useState(true);

  const particlesRef = useRef<Particle[]>(makeParticles(180));
  const [, force] = useState(0);
  const massRef = useRef(0);

  useRafLoop(
    (dt) => {
      const ps = particlesRef.current;
      let captured = 0;
      for (const p of ps) {
        p.ang += p.speed * dt * (0.6 + rate);
        // inward drift proportional to collapse rate
        p.rad -= rate * dt * 6 * (1 / (p.rad * 0.05 + 0.5));
        if (p.rad < SEED_RAD) {
          // recycle onto the outer disk; counts as captured mass
          p.rad = 38 + ((p.ang * 53) % 8);
          captured += 1;
        }
      }
      massRef.current = Math.min(100, massRef.current + captured * 0.6);
      force((n) => (n + 1) % 1000000);
    },
    { active: isPlaying && inView },
  );

  const ps = particlesRef.current;
  const massPct = massRef.current;
  const protoR = SEED_RAD + (massPct / 100) * 7;
  const stage = massPct < 20 ? t("disk") : massPct < 80 ? t("forming") : t("formed");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        particlesRef.current = makeParticles(180);
        massRef.current = 0;
      }}
      caption={<span>{stage}</span>}
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
            <radialGradient id="accr-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--amber)" />
              <stop offset="50%" stopColor="#c47a3a" />
              <stop offset="100%" stopColor="#3a2a44" />
            </radialGradient>
            <radialGradient id="accr-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* faint disk haze */}
          <ellipse cx={CX} cy={CY} rx="44" ry="40" fill="var(--cyan)" opacity="0.04" />
          <ellipse cx={CX} cy={CY} rx="30" ry="27" fill="var(--cyan)" opacity="0.05" />

          {/* warm core glow scales with mass */}
          <circle
            cx={CX}
            cy={CY}
            r={protoR + 6}
            fill="url(#accr-glow)"
            opacity={0.3 + massPct / 200}
          />

          {/* particles */}
          {ps.map((p, i) => {
            const x = CX + Math.cos(p.ang) * p.rad;
            const y = CY + Math.sin(p.ang) * p.rad * 0.9;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={p.size}
                fill={p.warm ? "var(--amber)" : "var(--cyan)"}
                opacity={0.55}
              />
            );
          })}

          {/* protoplanet */}
          <circle cx={CX} cy={CY} r={protoR} fill="url(#accr-core)" />
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("mass")} value={`${massPct.toFixed(0)}%`} accent="amber" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("rate")}
            value={rate}
            min={0.05}
            max={1}
            step={0.01}
            onChange={setRate}
            display={`${(rate * 100).toFixed(0)}%`}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
