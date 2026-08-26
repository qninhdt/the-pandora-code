"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bx: number;
  by: number;
  bf: number;
};

// fitness landscape: two peaks
function fitness(x: number, y: number) {
  const p1 = Math.exp(-((x - 30) ** 2 + (y - 35) ** 2) / 120);
  const p2 = Math.exp(-((x - 70) ** 2 + (y - 55) ** 2) / 90) * 1.25;
  return p1 + p2;
}

function seed(n = 18): Particle[] {
  return Array.from({ length: n }, () => {
    const x = 10 + Math.random() * 80;
    const y = 15 + Math.random() * 60;
    const f = fitness(x, y);
    return { x, y, vx: 0, vy: 0, bx: x, by: y, bf: f };
  });
}

export default function SwarmIntelligence() {
  const t = useTranslations("viz.swarm-intelligence");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [inertia, setInertia] = useState(0.7);
  const [social, setSocial] = useState(1.2);
  const [playing, setPlaying] = useState(true);
  const parts = useRef(seed());
  const gBest = useRef({ x: 70, y: 55, f: fitness(70, 55) });
  const [, bump] = useState(0);

  useRafLoop(
    (dt) => {
      const ps = parts.current;
      let gx = gBest.current.x;
      let gy = gBest.current.y;
      let gf = gBest.current.f;
      const next = ps.map((p) => {
        const r1 = Math.random();
        const r2 = Math.random();
        const cog = 1.1;
        let vx = inertia * p.vx + cog * r1 * (p.bx - p.x) + social * r2 * (gx - p.x);
        let vy = inertia * p.vy + cog * r1 * (p.by - p.y) + social * r2 * (gy - p.y);
        const sp = Math.hypot(vx, vy);
        if (sp > 40) {
          vx = (vx / sp) * 40;
          vy = (vy / sp) * 40;
        }
        const x = Math.max(5, Math.min(95, p.x + vx * dt));
        const y = Math.max(12, Math.min(80, p.y + vy * dt));
        const f = fitness(x, y);
        let bx = p.bx;
        let by = p.by;
        let bf = p.bf;
        if (f > bf) {
          bx = x;
          by = y;
          bf = f;
        }
        if (f > gf) {
          gx = x;
          gy = y;
          gf = f;
        }
        return { x, y, vx, vy, bx, by, bf };
      });
      gBest.current = { x: gx, y: gy, f: gf };
      parts.current = next;
      bump((n) => (n + 1) % 1_000_000);
    },
    { active: inView && playing },
  );

  // heatmap samples
  const heat: { x: number; y: number; f: number }[] = [];
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 8; j++) {
      const x = 8 + i * 7.5;
      const y = 16 + j * 8;
      heat.push({ x, y, f: fitness(x, y) });
    }
  }

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        parts.current = seed();
        gBest.current = { x: 50, y: 48, f: 0 };
        setInertia(0.7);
        setSocial(1.2);
      }}
      onPlayPause={() => setPlaying((p) => !p)}
      isPlaying={playing}
      allowFullscreen={false}
      caption={
        <span>
          {t("best")}: <span className="text-amber">{gBest.current.f.toFixed(2)}</span>
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {heat.map((h, i) => (
            <circle key={i} cx={h.x} cy={h.y} r={3.5} fill="var(--teal)" opacity={h.f * 0.45} />
          ))}
          {/* peaks */}
          <circle
            cx="30"
            cy="35"
            r="3"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={0.5}
            opacity={0.5}
          />
          <circle
            cx="70"
            cy="55"
            r="3.5"
            fill="none"
            stroke="var(--amber)"
            strokeWidth={0.6}
            opacity={0.7}
          />
          {parts.current.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={1.8} fill="var(--magenta)" opacity={0.9} />
          ))}
          <circle
            cx={gBest.current.x}
            cy={gBest.current.y}
            r={2.6}
            fill="var(--amber)"
            opacity={0.95}
          />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("best")} value={gBest.current.f.toFixed(2)} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1">
          <ControlSlider
            label={t("inertia")}
            value={inertia}
            min={0.1}
            max={1}
            step={0.05}
            display={inertia.toFixed(2)}
            onChange={setInertia}
            thumb="cyan"
          />
          <ControlSlider
            label={t("social")}
            value={social}
            min={0.2}
            max={2.5}
            step={0.05}
            display={social.toFixed(2)}
            onChange={setSocial}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
