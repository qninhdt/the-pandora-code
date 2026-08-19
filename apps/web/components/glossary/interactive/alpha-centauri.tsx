"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

type StarId = "A" | "B" | "M";

interface StarDef {
  id: StarId;
  color: string;
  glow: string;
  baseRadius: number;
  // Orbit params for the A/B binary; Proxima sits fixed far out.
  orbitR: number;
  phase: number;
  fixed?: { x: number; y: number };
}

const STARS: StarDef[] = [
  { id: "A", color: "#fff2cc", glow: "#ffd66e", baseRadius: 26, orbitR: 70, phase: 0 },
  { id: "B", color: "#ff9a52", glow: "#ff7a2e", baseRadius: 17, orbitR: 118, phase: Math.PI },
  { id: "M", color: "#ff5d5d", glow: "#ff3b3b", baseRadius: 6, orbitR: 0, phase: 0, fixed: { x: 86, y: 84 } },
];

const VIEW = { w: 100, h: 100, cx: 42, cy: 46 };

export default function AlphaCentauri() {
  const t = useTranslations("viz.alpha-centauri");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [selected, setSelected] = useState<StarId | null>(null);
  const angleRef = useRef(0);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      angleRef.current += dt * 0.12;
      force((n) => (n + 1) % 1000);
    },
    { active: isPlaying && inView },
  );

  const reset = () => {
    angleRef.current = 0;
    setSelected(null);
    force((n) => n + 1);
  };

  const a = angleRef.current;
  const positions = STARS.map((s) => {
    if (s.fixed) return { ...s, x: s.fixed.x, y: s.fixed.y };
    // A and B orbit a shared barycentre near the canvas centre.
    const x = VIEW.cx + Math.cos(a + s.phase) * s.orbitR * 0.5;
    const y = VIEW.cy + Math.sin(a + s.phase) * s.orbitR * 0.32;
    return { ...s, x, y };
  });

  const cardKey = selected === "A" ? "classG" : selected === "B" ? "classK" : "classM";
  const nameKey = selected === "A" ? "starA" : selected === "B" ? "starB" : "proxima";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={reset}
      aspectRatio="square"
    >
      <div ref={ref} className="relative h-full w-full">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          style={{ background: "radial-gradient(circle at 42% 46%, #0c1224, #05060d 75%)" }}
          role="img"
          aria-label={t("title")}
        >
          <defs>
            {STARS.map((s) => (
              <radialGradient key={s.id} id={`ac-${s.id}`}>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor={s.color} />
                <stop offset="100%" stopColor={s.glow} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* faint starfield */}
          {STARFIELD.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#9fb4d8" opacity={p.o} />
          ))}

          {/* A-B orbit guide */}
          <ellipse
            cx={VIEW.cx}
            cy={VIEW.cy}
            rx={35}
            ry={22}
            fill="none"
            stroke="#36c5d9"
            strokeOpacity={0.12}
            strokeDasharray="2 3"
          />

          {positions.map((s) => {
            const isSel = selected === s.id;
            const r = s.baseRadius;
            return (
              <g
                key={s.id}
                className="cursor-pointer"
                onClick={() => setSelected(s.id)}
                role="button"
                aria-label={t(s.id === "A" ? "starA" : s.id === "B" ? "starB" : "proxima")}
              >
                <circle cx={s.x} cy={s.y} r={r} fill={`url(#ac-${s.id})`} />
                <circle cx={s.x} cy={s.y} r={r * 0.42} fill={s.color} />
                {isSel && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={r * 0.7}
                    fill="none"
                    stroke="#36c5d9"
                    strokeWidth={0.6}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* spectral card */}
        {selected && (
          <div className="absolute bottom-3 left-3 rounded-lg border border-cyan/40 bg-void/85 px-3 py-2 backdrop-blur-md">
            <div className="font-mono text-xs font-semibold text-cyan">{t(nameKey)}</div>
            <div className="font-mono text-[10px] text-muted">{t(cardKey)}</div>
          </div>
        )}
        {!selected && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-wider text-muted">
            {t("hint")}
          </div>
        )}
      </div>
    </GlossaryFrame>
  );
}

const STARFIELD = Array.from({ length: 60 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  const rnd = seed / 233280;
  const seed2 = (i * 4021 + 12345) % 233280;
  const rnd2 = seed2 / 233280;
  const seed3 = (i * 7919 + 104729) % 233280;
  const rnd3 = seed3 / 233280;
  return { x: rnd * 100, y: rnd2 * 100, r: 0.2 + rnd3 * 0.4, o: 0.15 + rnd3 * 0.4 };
});
