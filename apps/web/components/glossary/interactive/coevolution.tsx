"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The arms race that never ends. Each side is a selective force on the other:
// faster prey select for faster hunters, which select for faster prey still.
// Push the prey's escape trait and the predator's pursuit climbs to answer it —
// an escalating spiral that settles into no winner, because the race itself is the
// equilibrium. Here a hexapede flees a viperwolf around a closed loop: raise the
// prey trait and it pulls ahead, but the pursuer always claws the gap back toward
// the knife-edge where neither can quit.
export default function Coevolution() {
  const t = useTranslations("viz.coevolution");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [prey, setPrey] = useState(0.4); // imposed prey escape trait

  const predator = useRef(0.4); // pursuit trait, chases prey
  const preyPhase = useRef(0); // angular position on the loop
  const predPhase = useRef(0.9);
  const spark = useRef<number[]>([]); // recent |gap| history for the tension bar
  const sparkTick = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      // pursuit trait climbs toward the prey's, always lagging a beat behind
      predator.current += (prey - predator.current) * Math.min(1, dt * 0.9);

      // both run the loop; speed scales with trait. prey opens a lead when its
      // trait exceeds the pursuer's, the pursuer closes it when it catches up.
      const base = 0.55;
      preyPhase.current = (preyPhase.current + dt * (base + prey * 1.4)) % (Math.PI * 2);
      predPhase.current =
        (predPhase.current + dt * (base + predator.current * 1.4)) % (Math.PI * 2);

      sparkTick.current += dt;
      if (sparkTick.current > 0.06) {
        sparkTick.current = 0;
        spark.current.push(Math.abs(prey - predator.current));
        if (spark.current.length > 46) spark.current.shift();
      }
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const gap = prey - predator.current;
  const escalation = Math.round(((prey + predator.current) / 2) * 100);

  // closed racetrack: an ellipse the two bodies run around
  const cx = 50;
  const cy = 48;
  const rx = 30;
  const ry = 21;
  const onTrack = (ph: number) => ({
    x: cx + Math.cos(ph) * rx,
    y: cy + Math.sin(ph) * ry,
  });
  const preyP = onTrack(preyPhase.current);
  const predP = onTrack(predPhase.current);
  // arc separation between the two around the loop (0..π), small = close chase
  let sep = Math.abs(preyPhase.current - predPhase.current) % (Math.PI * 2);
  if (sep > Math.PI) sep = Math.PI * 2 - sep;
  const closing = sep < 0.9;

  // heading (tangent) so each body leans into its motion
  const heading = (ph: number) =>
    (Math.atan2(Math.cos(ph) * ry, -Math.sin(ph) * rx) * 180) / Math.PI;

  const sparkPath = spark.current
    .map((g, i) => `${i === 0 ? "M" : "L"}${18 + (i / 45) * 64} ${90 - g * 20}`)
    .join(" ");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setPrey(0.4);
        predator.current = 0.4;
        preyPhase.current = 0;
        predPhase.current = 0.9;
        spark.current = [];
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("escalation")}: <span className="text-amber">{escalation}%</span> ·{" "}
          <span className="text-muted">{t("noWinner")}</span>
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="coev-floor" cx="50%" cy="42%" r="72%">
              <stop offset="0%" stopColor="#132038" />
              <stop offset="70%" stopColor="#0b1220" />
              <stop offset="100%" stopColor="#070912" />
            </radialGradient>
            <linearGradient id="coev-track" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--teal)" />
              <stop offset="100%" stopColor="var(--magenta)" />
            </linearGradient>
            <filter id="coev-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="100" height="100" fill="url(#coev-floor)" />

          {/* the closed loop they race around */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="url(#coev-track)"
            strokeWidth="0.7"
            opacity="0.32"
            strokeDasharray="1.4 2.2"
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.3"
            opacity="0.4"
          />

          {/* tension arc between the two runners — the gap made visible */}
          <line
            x1={preyP.x}
            y1={preyP.y}
            x2={predP.x}
            y2={predP.y}
            stroke={closing ? "var(--magenta)" : "var(--teal)"}
            strokeWidth="0.5"
            strokeDasharray="1 1.4"
            opacity={closing ? 0.75 : 0.35}
          />

          {/* PREDATOR — viperwolf: lean, forward-raked, magenta */}
          <g transform={`translate(${predP.x} ${predP.y}) rotate(${heading(predPhase.current)})`}>
            <ellipse
              cx="0"
              cy="0"
              rx="6"
              ry="2.6"
              fill="var(--magenta)"
              opacity="0.16"
              filter="url(#coev-glow)"
            />
            <path
              d="M-4.5 0 Q -1 -2.4 4.2 -1.1 Q 5.6 0 4.2 1.1 Q -1 2.4 -4.5 0 Z"
              fill="#2a1526"
              stroke="var(--magenta)"
              strokeWidth="0.55"
            />
            {/* raked limbs mid-stride */}
            <line
              x1="-1.5"
              y1="1.6"
              x2="-3.2"
              y2="3.4"
              stroke="var(--magenta)"
              strokeWidth="0.5"
              opacity="0.8"
            />
            <line
              x1="1.8"
              y1="1.6"
              x2="0.4"
              y2="3.6"
              stroke="var(--magenta)"
              strokeWidth="0.5"
              opacity="0.8"
            />
            <circle cx="3.4" cy="-0.5" r="0.7" fill="var(--foreground)" />
          </g>

          {/* PREY — hexapede: rounder, fanned crest, teal */}
          <g transform={`translate(${preyP.x} ${preyP.y}) rotate(${heading(preyPhase.current)})`}>
            <ellipse
              cx="0"
              cy="0"
              rx="5.4"
              ry="2.8"
              fill="var(--teal)"
              opacity="0.16"
              filter="url(#coev-glow)"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="3.8"
              ry="2.4"
              fill="#0f2a26"
              stroke="var(--teal)"
              strokeWidth="0.55"
            />
            {/* alarm fan flares when the pursuer is closing */}
            <path
              d="M2.6 0 L5.4 -2 M3 0 L6 0 M2.6 0 L5.4 2"
              stroke="var(--cyan)"
              strokeWidth="0.5"
              opacity={closing ? 0.9 : 0.4}
            />
            <line
              x1="-1.4"
              y1="1.8"
              x2="-2.8"
              y2="3.6"
              stroke="var(--teal)"
              strokeWidth="0.5"
              opacity="0.8"
            />
            <line
              x1="1.2"
              y1="1.8"
              x2="0"
              y2="3.7"
              stroke="var(--teal)"
              strokeWidth="0.5"
              opacity="0.8"
            />
            <circle cx="2.6" cy="-0.6" r="0.6" fill="var(--cyan)" />
          </g>

          {/* trait pillars — two rising bars showing where each side sits */}
          <g>
            <rect
              x="9"
              y={64 - prey * 42}
              width="3.4"
              height={prey * 42}
              rx="0.6"
              fill="var(--teal)"
              opacity="0.85"
            />
            <rect
              x="87.5"
              y={64 - predator.current * 42}
              width="3.4"
              height={predator.current * 42}
              rx="0.6"
              fill="var(--magenta)"
              opacity="0.85"
            />
          </g>

          {/* tension spark trail along the base — |gap| over time */}
          {spark.current.length > 1 && (
            <path
              d={sparkPath}
              fill="none"
              stroke="var(--amber)"
              strokeWidth="0.7"
              opacity="0.65"
            />
          )}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout
            label={t("gap")}
            value={gap >= 0 ? `+${(gap * 100).toFixed(0)}` : `${(gap * 100).toFixed(0)}`}
            accent={Math.abs(gap) < 0.05 ? "teal" : "amber"}
          />
          <Readout
            label={t("predator")}
            value={`${Math.round(predator.current * 100)}%`}
            accent="magenta"
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("preyTrait")}
            value={prey}
            min={0}
            max={1}
            step={0.01}
            onChange={setPrey}
            display={`${Math.round(prey * 100)}%`}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
